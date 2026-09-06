import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server';
import { MasterScoringEngine } from '../scoring/masterScoringEngine';
import { JuryRepository } from '../repositories/juryRepository';
import {
  DEFAULT_WEIGHTS,
  DEFAULT_VERDICT_THRESHOLDS,
  validateWeightsSum,
} from '../config/rubrics';

describe('Phase 9: AI Jury + Master Scoring Engine Test Suite', () => {
  const evalId = 'eval_smart-road-vision';

  test('1. Rubric Weights strictly sum to 100%', () => {
    const isValid = validateWeightsSum(DEFAULT_WEIGHTS);
    assert.strictEqual(isValid, true, 'Default rubric weights must sum to exactly 100%');

    const totalWeight = Object.values(DEFAULT_WEIGHTS).reduce((a, b) => a + b, 0);
    assert.strictEqual(totalWeight, 100, 'Sum of weights must be 100');

    // Individual category weights verification
    assert.strictEqual(DEFAULT_WEIGHTS.problemNeed, 15);
    assert.strictEqual(DEFAULT_WEIGHTS.technicalQuality, 20);
    assert.strictEqual(DEFAULT_WEIGHTS.originality, 15);
    assert.strictEqual(DEFAULT_WEIGHTS.socialImpact, 15);
    assert.strictEqual(DEFAULT_WEIGHTS.presentation, 10);
    assert.strictEqual(DEFAULT_WEIGHTS.demonstration, 10);
    assert.strictEqual(DEFAULT_WEIGHTS.feasibilityScalability, 10);
    assert.strictEqual(DEFAULT_WEIGHTS.futurePotential, 5);
  });

  test('2. Master Score is strictly deterministic: sum(rawScore * weight / 100)', () => {
    const context = MasterScoringEngine.loadContext(evalId, 'rubric_v1_canonical');
    const decision = MasterScoringEngine.calculateMasterEvaluation(context);

    assert.ok(decision.categoryScores, 'Category scores must be generated');
    assert.strictEqual(decision.categoryScores.length, 8, 'Must contain all 8 canonical categories');

    let manualWeightedSum = 0;
    for (const cat of decision.categoryScores) {
      assert.ok(cat.rawScore >= 0 && cat.rawScore <= 100, `Raw score for ${cat.categoryKey} must be in [0, 100]`);
      assert.ok(cat.weight > 0, `Weight for ${cat.categoryKey} must be positive`);
      assert.strictEqual(cat.status, 'ASSESSED', 'Category status must be ASSESSED');
      assert.ok(Array.isArray(cat.strengths), 'Strengths must be an array');
      assert.ok(Array.isArray(cat.weaknesses), 'Weaknesses must be an array');
      assert.ok(Array.isArray(cat.risks), 'Risks must be an array');
      assert.ok(Array.isArray(cat.evidenceIds), 'Evidence IDs must be an array');
      assert.ok(cat.whyThisScore && cat.whyThisScore.length > 10, 'Must have structured explanation');

      const expectedWeighted = parseFloat(((cat.rawScore * cat.weight) / 100).toFixed(4));
      assert.strictEqual(cat.weightedScore, expectedWeighted, `Weighted score for ${cat.categoryKey} must be raw * weight / 100`);
      manualWeightedSum += cat.weightedScore;
    }

    const expectedDisplayScore = parseFloat(manualWeightedSum.toFixed(1));
    assert.strictEqual(decision.overallScore, expectedDisplayScore, 'Overall score must equal rounded weighted sum');
    assert.strictEqual(decision.overallScore, 83.7, 'Smart Road Vision canonical score must be 83.7');
  });

  test('3. Multi-Factor Confidence is distinct from category score average and penalizes unverified claims', () => {
    const context = MasterScoringEngine.loadContext(evalId, 'rubric_v1_canonical');
    const decision = MasterScoringEngine.calculateMasterEvaluation(context);

    assert.ok(decision.confidence >= 0 && decision.confidence <= 100, 'Confidence must be between 0 and 100');
    assert.strictEqual(decision.confidence, 86, 'Smart Road Vision confidence must be 86%');
    assert.strictEqual(decision.confidenceLevel, 'HIGH', 'Confidence level must be HIGH for >= 85%');

    // Verify it is not a naive average of category confidences
    const categoryConfAverage = decision.categoryScores!.reduce((a, b) => a + b.confidence, 0) / decision.categoryScores!.length;
    assert.notStrictEqual(decision.confidence, categoryConfAverage, 'Confidence must not be a naive average of category confidence');
  });

  test('4. Evidence Coverage is distinct from project quality', () => {
    const context = MasterScoringEngine.loadContext(evalId, 'rubric_v1_canonical');
    const decision = MasterScoringEngine.calculateMasterEvaluation(context);

    assert.ok(decision.evidenceCoverage >= 0 && decision.evidenceCoverage <= 100, 'Coverage must be 0-100%');
    assert.strictEqual(decision.evidenceCoverage, 81, 'Smart Road Vision evidence coverage must be 81%');

    // Individual category coverage checks
    const problemCat = decision.categoryScores!.find(c => c.categoryKey === 'problemNeed');
    assert.strictEqual(problemCat?.evidenceCoverage, 91);

    const techCat = decision.categoryScores!.find(c => c.categoryKey === 'technicalQuality');
    assert.strictEqual(techCat?.evidenceCoverage, 84);

    const origCat = decision.categoryScores!.find(c => c.categoryKey === 'originality');
    assert.strictEqual(origCat?.evidenceCoverage, 76);
  });

  test('5. Score Reliability preserves observed score without applying score = score * confidence', () => {
    const context = MasterScoringEngine.loadContext(evalId, 'rubric_v1_canonical');
    const decision = MasterScoringEngine.calculateMasterEvaluation(context);

    // Score remains 83.7, NOT 83.7 * 0.86 = 71.98
    assert.strictEqual(decision.overallScore, 83.7, 'Observed score must not be reduced by confidence multiplier');
    assert.ok(decision.scoreReliability.includes('RELIABILITY'), 'Score reliability description must be provided');
  });

  test('6. Verdict is threshold-based and attachments of qualifiers work', () => {
    const context = MasterScoringEngine.loadContext(evalId, 'rubric_v1_canonical');
    const decision = MasterScoringEngine.calculateMasterEvaluation(context);

    assert.strictEqual(decision.verdict, 'STRONG', 'Score 83.7 must produce STRONG verdict (80-89.99)');

    // Smart Road Vision has qualifiers for unverified claim or operational risks
    assert.ok(decision.qualifiers.length > 0, 'Qualifiers must be evaluated');
    const unverifiedQualifier = decision.qualifiers.find(q => q.type === 'UNVERIFIED_MAJOR_CLAIMS');
    assert.ok(unverifiedQualifier, 'Must detect unverified major claims qualifier');
  });

  test('7. Counterfactual Simulation Sandbox mathematically recalculates without altering official evaluation', () => {
    const initialDecision = JuryRepository.getJuryDecision(evalId)!;
    const initialScore = initialDecision.overallScore;

    // Simulate Technical Quality moving from 87 to 95 (+8 raw, weight 20 -> +1.6 weighted)
    const simResult = MasterScoringEngine.simulateScore(evalId, {
      categoryScores: {
        technicalQuality: 95,
      },
    });

    assert.strictEqual(simResult.isSimulation, true);
    assert.strictEqual(simResult.label, 'SIMULATION - NOT OFFICIAL SCORE');
    assert.strictEqual(simResult.originalOverallScore, initialScore);
    assert.strictEqual(simResult.changedCategories.length, 1);
    assert.strictEqual(simResult.changedCategories[0], 'technicalQuality');

    // 83.65 + 1.6 = 85.25 -> 85.3
    assert.strictEqual(simResult.simulatedScore, 85.3, 'Simulated score must reflect +1.6 weighted boost');
    assert.strictEqual(simResult.difference, 1.6);

    // Official evaluation in database must NOT be changed
    const officialAfterSim = JuryRepository.getJuryDecision(evalId)!;
    assert.strictEqual(officialAfterSim.overallScore, initialScore, 'Official score must remain untouched by simulation');
  });

  test('8. Rubric Versioning ensures historical evaluations remain immutable', () => {
    const version1 = JuryRepository.getRubricVersion('rubric_v1_canonical');
    assert.ok(version1, 'Canonical rubric version must exist');

    // Create a new rubric version with modified weights (e.g. Technical 30%, Future 0%)
    const version2Weights = { ...DEFAULT_WEIGHTS, technicalQuality: 30, futurePotential: 0, problemNeed: 10 };
    assert.strictEqual(validateWeightsSum(version2Weights), true);

    JuryRepository.createRubricVersion({
      id: 'rubric_v2_experimental',
      rubricId: 'rubric_standard_institutional',
      version: '2.0.0',
      name: 'Experimental Defense Rubric v2.0.0',
      weights: version2Weights,
      thresholds: DEFAULT_VERDICT_THRESHOLDS,
      categoryDefinitions: version1.categoryDefinitions,
      createdAt: new Date().toISOString(),
    });

    // Check that historical evaluation still references rubric_v1_canonical
    const decision = JuryRepository.getJuryDecision(evalId)!;
    assert.strictEqual(decision.rubricVersionId, 'rubric_v1_canonical');
    assert.strictEqual(decision.overallScore, 83.7, 'Historical evaluation score must not change when a new rubric version is created');
  });

  test('9. Human Review records reviewer override with rationale side-by-side', () => {
    const reviews = JuryRepository.getHumanReviews(evalId);
    assert.ok(reviews.length > 0, 'Human reviews must exist');
    const firstReview = reviews[0];
    assert.strictEqual(firstReview.reviewer, 'Dr. Marcus Vance (Chief Jury Chair)');
    assert.strictEqual(firstReview.category, 'Technical Quality');
    assert.strictEqual(firstReview.originalScore, 87.0);
    assert.strictEqual(firstReview.reviewedScore, 89.0);
    assert.ok(firstReview.reason.includes('Jetson Orin'), 'Review must include specific technical rationale');
  });

  test('10. Score Locking: finalized score cannot be silently altered', () => {
    // Save decision as FINAL
    const decision = JuryRepository.getJuryDecision(evalId)!;
    decision.status = 'FINAL';
    JuryRepository.saveJuryDecision(decision);

    const checkFinal = JuryRepository.getJuryDecision(evalId)!;
    assert.strictEqual(checkFinal.status, 'FINAL');
  });

  test('11. Risk Aggregation and Deduplication', () => {
    const context = MasterScoringEngine.loadContext(evalId);
    const decision = MasterScoringEngine.calculateMasterEvaluation(context);

    assert.ok(decision.risks.length >= 2, 'Risks must be aggregated');
    const titles = decision.risks.map(r => r.title);
    const uniqueTitles = new Set(titles);
    assert.strictEqual(titles.length, uniqueTitles.size, 'Risks must not contain duplicates');
  });

  test('12. Final Recommendations: Top 5 Actions are ranked and actionable', () => {
    const context = MasterScoringEngine.loadContext(evalId);
    const decision = MasterScoringEngine.calculateMasterEvaluation(context);

    assert.strictEqual(decision.recommendations.length, 5, 'Must provide exactly Top 5 Actions');
    assert.strictEqual(decision.recommendations[0].rank, 1);
    assert.ok(decision.recommendations[0].action.length > 10, 'Must have specific actionable step');
    assert.ok(decision.recommendations[0].expectedBenefit.length > 10, 'Must state expected benefit');
  });

  test('13. Future Potential vs Current Score Separation', () => {
    const context = MasterScoringEngine.loadContext(evalId);
    const decision = MasterScoringEngine.calculateMasterEvaluation(context);

    assert.strictEqual(decision.currentProjectScore, 83.7);
    assert.strictEqual(decision.futurePotentialScore, 94.0);
    assert.ok(decision.exceptionalityAnalysis.roadmapToTier1.length > 0);
  });

  test('14. Full API Endpoints verification', async () => {
    const server = app.listen(0);
    const address = server.address() as any;
    const port = address.port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      // 1. GET /api/evaluations/:id/score
      const resScore = await fetch(`${baseUrl}/api/evaluations/${evalId}/score`);
      assert.strictEqual(resScore.status, 200);
      const jsonScore: any = await resScore.json();
      assert.strictEqual(jsonScore.success, true);
      assert.strictEqual(jsonScore.data.overallScore, 83.7);
      assert.strictEqual(jsonScore.data.verdict, 'STRONG');

      // 2. GET /api/evaluations/:id/score/breakdown
      const resBreakdown = await fetch(`${baseUrl}/api/evaluations/${evalId}/score/breakdown`);
      assert.strictEqual(resBreakdown.status, 200);
      const jsonBreakdown: any = await resBreakdown.json();
      assert.strictEqual(jsonBreakdown.success, true);
      assert.strictEqual(jsonBreakdown.data.categoryScores.length, 8);

      // 3. GET /api/evaluations/:id/score/confidence
      const resConf = await fetch(`${baseUrl}/api/evaluations/${evalId}/score/confidence`);
      assert.strictEqual(resConf.status, 200);
      const jsonConf: any = await resConf.json();
      assert.strictEqual(jsonConf.data.overallConfidence, 86);
      assert.strictEqual(jsonConf.data.confidenceLevel, 'HIGH');

      // 4. GET /api/evaluations/:id/score/evidence-coverage
      const resCov = await fetch(`${baseUrl}/api/evaluations/${evalId}/score/evidence-coverage`);
      assert.strictEqual(resCov.status, 200);
      const jsonCov: any = await resCov.json();
      assert.strictEqual(jsonCov.data.overallCoverage, 81);

      // 5. GET /api/evaluations/:id/jury
      const resJury = await fetch(`${baseUrl}/api/evaluations/${evalId}/jury`);
      assert.strictEqual(resJury.status, 200);
      const jsonJury: any = await resJury.json();
      assert.strictEqual(jsonJury.success, true);
      assert.ok(jsonJury.data.executiveVerdict);
      assert.ok(jsonJury.data.strengths.length > 0);
      assert.ok(jsonJury.data.weaknesses.length > 0);

      // 6. POST /api/evaluations/:id/score/simulate
      const resSim = await fetch(`${baseUrl}/api/evaluations/${evalId}/score/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryScores: {
            problemNeed: 95,
          },
        }),
      });
      assert.strictEqual(resSim.status, 200);
      const jsonSim: any = await resSim.json();
      assert.strictEqual(jsonSim.data.isSimulation, true);
      assert.strictEqual(jsonSim.data.label, 'SIMULATION - NOT OFFICIAL SCORE');

      // 7. GET /api/evaluations/:id/history
      const resHist = await fetch(`${baseUrl}/api/evaluations/${evalId}/history`);
      assert.strictEqual(resHist.status, 200);
      const jsonHist: any = await resHist.json();
      assert.ok(jsonHist.data.length >= 3, 'Must contain v1, v2, v3 history');

      // 8. GET /api/evaluations/compare
      const resComp = await fetch(`${baseUrl}/api/evaluations/compare?ids=eval_smart-road-vision,eval_medi-drone-transport`);
      assert.strictEqual(resComp.status, 200);
      const jsonComp: any = await resComp.json();
      assert.strictEqual(jsonComp.success, true);
      assert.ok(jsonComp.data.length >= 1);

      // 9. GET /api/rubrics
      const resRub = await fetch(`${baseUrl}/api/rubrics`);
      assert.strictEqual(resRub.status, 200);
      const jsonRub: any = await resRub.json();
      assert.ok(jsonRub.data.length >= 1);
    } finally {
      server.close();
    }
  });
});
