import test from 'node:test';
import assert from 'node:assert/strict';
import { ClaimNormalizer } from '../claim-verification/claimNormalizer';
import { MethodologyAnalyzer } from '../claim-verification/methodologyAnalyzer';
import { BenchmarkComparator } from '../claim-verification/benchmarkComparator';
import { ContradictionDetector } from '../claim-verification/contradictionDetector';
import { VerificationScorer } from '../claim-verification/verificationScorer';
import { JudgeQuestionGenerator } from '../claim-verification/judgeQuestionGenerator';
import { ClaimVerificationPipeline } from '../claim-verification/claimVerificationPipeline';
import { ClaimVerificationRepository } from '../repositories/claimVerificationRepository';
import type { Claim, ClaimParameters, ClaimType } from '../models/claim';

test('Claim Verification Engine - Unit & Integration Suite', async (t) => {
  await t.test('1. Claim Normalizer extracts structured parameters without hallucination', () => {
    const claimText = 'Achieves 95% detection accuracy in road pothole detection on custom test dataset';
    const params = ClaimNormalizer.normalize(claimText, 'ACCURACY');

    assert.equal(params.metric, 'accuracy');
    assert.equal(params.value, '95');
    assert.equal(params.unit, 'percent');
    assert.equal(params.subject, 'Pothole Detection Pipeline');
  });

  await t.test('2. Claim Importance classification correctly flags critical project claims', () => {
    assert.equal(ClaimNormalizer.inferImportance('ACCURACY', '95% detection accuracy'), 'CRITICAL');
    assert.equal(ClaimNormalizer.inferImportance('SPEED', 'Real-time processing at 30 FPS'), 'HIGH');
    assert.equal(ClaimNormalizer.inferImportance('COST', '40% cheaper than existing systems'), 'HIGH');
    assert.equal(ClaimNormalizer.inferImportance('TECHNICAL', 'Uses YOLOv8'), 'MEDIUM');
  });

  await t.test('3. Methodology Completeness evaluates 10 empirical criteria', () => {
    const claim: Claim = {
      id: 'test_clm_1',
      evaluationId: 'test_eval',
      claimText: '95% accuracy in road pothole detection',
      claimType: 'ACCURACY',
      importance: 'CRITICAL',
      status: 'UNVERIFIED',
      confidence: 50,
      createdAt: new Date().toISOString(),
    };

    // No evidence provided
    const emptyResult = MethodologyAnalyzer.analyze(claim, undefined, []);
    assert.equal(emptyResult.score, 0);
    assert.equal(emptyResult.presentElements.length, 0);
    assert.equal(emptyResult.missingElements.length, 10);

    // Evidence with rich methodology
    const richEvidence = [
      {
        content: 'Dataset GRDDC 2022 containing 25000 images split 80/20 train/test. Evaluated using precision, recall, and mAP compared to baseline YOLOv5 running on NVIDIA Jetson Orin Nano with PyTorch 2.1.',
        source_title: 'Methodology Documentation',
        location: 'Section 4',
      },
    ];

    const richResult = MethodologyAnalyzer.analyze(claim, { dataset: 'GRDDC-2022' }, richEvidence);
    assert.ok(richResult.score >= 70, `Expected score >= 70, got ${richResult.score}`);
    assert.ok(richResult.presentElements.includes('Dataset specification'));
    assert.ok(richResult.presentElements.includes('Sample size volume'));
    assert.ok(richResult.presentElements.includes('Data split / partition protocol'));
  });

  await t.test('4. Benchmark Comparator identifies peer research without automatic verification', () => {
    const claim: Claim = {
      id: 'test_clm_acc',
      evaluationId: 'test_eval',
      claimText: '95% detection accuracy in pavement cracks',
      claimType: 'ACCURACY',
      importance: 'CRITICAL',
      status: 'UNVERIFIED',
      confidence: 50,
      createdAt: new Date().toISOString(),
    };

    const benchmarks = BenchmarkComparator.compare(claim, { value: '95', metric: 'accuracy' });
    assert.ok(benchmarks.length >= 1);
    const grddc = benchmarks.find(b => b.benchmarkSource.includes('GRDDC'));
    assert.ok(grddc);
    assert.ok(['DIRECTLY_COMPARABLE', 'PARTIALLY_COMPARABLE'].includes(grddc.comparability));
    assert.ok(grddc.notes.length > 0);
  });

  await t.test('5. Contradiction Detector identifies discrepancies across documents and video', () => {
    const claims: Claim[] = [
      {
        id: 'c1',
        evaluationId: 'eval_smart-road-vision',
        claimText: 'Our system detects potholes with 95% accuracy in real-time road video feeds.',
        claimType: 'ACCURACY',
        importance: 'CRITICAL',
        status: 'UNVERIFIED',
        confidence: 50,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'c2',
        evaluationId: 'eval_smart-road-vision',
        claimText: 'Works in all weather conditions',
        claimType: 'ENVIRONMENTAL',
        importance: 'HIGH',
        status: 'UNVERIFIED',
        confidence: 50,
        createdAt: new Date().toISOString(),
      },
    ];

    const contradictions = ContradictionDetector.detect('eval_smart-road-vision', claims);
    assert.ok(contradictions.length >= 2);

    const splitContra = contradictions.find(c => c.sourceB.includes('Section 4.2'));
    assert.ok(splitContra);
    assert.equal(splitContra.conflictType, 'INTERNAL');

    const weatherContra = contradictions.find(c => c.sourceB.includes('Limitations'));
    assert.ok(weatherContra);
    assert.equal(weatherContra.severity, 'HIGH');
  });

  await t.test('6. Verification Scorer applies deterministic formula and non-accusatory language', () => {
    const claim: Claim = {
      id: 'c_test',
      evaluationId: 'eval_test',
      claimText: 'Reduces municipal road inspection costs by 40%',
      claimType: 'COST',
      importance: 'HIGH',
      status: 'UNVERIFIED',
      confidence: 40,
      createdAt: new Date().toISOString(),
    };

    const result = VerificationScorer.evaluate({
      claim,
      methodology: { score: 10, presentElements: [], missingElements: ['Baseline cost model'] },
      demoSupport: 'NOT_DEMONSTRATED',
      documentSupport: 'PARTIAL',
      codeSupport: 'NONE',
      contradictions: [],
      supportingEvidence: [{ id: 'e1' }],
      contradictingEvidence: [],
    });

    assert.equal(result.status, 'UNVERIFIED');
    assert.ok(result.verificationScore < 40);

    // Non-accusatory language verification
    const textToCheck = `${result.explanation} ${result.missingEvidence.join(' ')}`.toLowerCase();
    assert.ok(!textToCheck.includes('fraud'), 'Must not contain word fraud');
    assert.ok(!textToCheck.includes('cheating'), 'Must not contain word cheating');
    assert.ok(!textToCheck.includes('liar'), 'Must not contain word liar');
    assert.ok(!textToCheck.includes('fake'), 'Must not contain word fake');
  });

  await t.test('7. Judge Question Generator targets exact missing empirical evidence', () => {
    const claim: Claim = {
      id: 'c_acc',
      evaluationId: 'eval_test',
      claimText: '95% detection accuracy in road potholes',
      claimType: 'ACCURACY',
      importance: 'CRITICAL',
      status: 'PARTIALLY_VERIFIED',
      confidence: 60,
      createdAt: new Date().toISOString(),
    };

    const question = JudgeQuestionGenerator.generate(
      claim,
      { numericValue: 95, metric: 'accuracy' },
      { score: 30, presentElements: [], missingElements: ['Sample size / test cohort volume'] },
      1
    );

    assert.ok(question.length > 20);
    assert.ok(/Slide 14|accuracy|test set|variance/i.test(question));
  });

  await t.test('8. Full Pipeline & 7 Smart Road Vision Claims Benchmarks', async () => {
    const summary = await ClaimVerificationPipeline.runPipeline('eval_smart-road-vision');
    assert.ok(summary);
    assert.ok(summary.totalClaims >= 7, `Expected at least 7 claims, found ${summary.totalClaims}`);

    const c1 = summary.claims.find(c => /95% accuracy/i.test(c.claimText));
    assert.ok(c1, 'Claim 1 must exist');
    assert.equal(c1.status, 'PARTIALLY_VERIFIED');

    const c2 = summary.claims.find(c => /real-time/i.test(c.claimText));
    assert.ok(c2, 'Claim 2 must exist');
    assert.equal(c2.status, 'PARTIALLY_VERIFIED');

    const c3 = summary.claims.find(c => /40%/i.test(c.claimText));
    assert.ok(c3, 'Claim 3 must exist');
    assert.equal(c3.status, 'UNVERIFIED');

    const c4 = summary.claims.find(c => /yolov8/i.test(c.claimText));
    assert.ok(c4, 'Claim 4 must exist');
    assert.equal(c4.status, 'VERIFIED');

    const c5 = summary.claims.find(c => /all weather/i.test(c.claimText));
    assert.ok(c5, 'Claim 5 must exist');
    assert.equal(c5.status, 'INSUFFICIENT_EVIDENCE');

    const c6 = summary.claims.find(c => /70%/i.test(c.claimText));
    assert.ok(c6, 'Claim 6 must exist');
    assert.equal(c6.status, 'UNVERIFIED');

    const c7 = summary.claims.find(c => /token-based|access controls|auth/i.test(c.claimText));
    assert.ok(c7, 'Claim 7 must exist');
    assert.equal(c7.status, 'PARTIALLY_VERIFIED');
  });

  await t.test('9. Human Review Override and Audit History Versioning', () => {
    const claimId = 'clm_smart-road-vision_3';
    const originalClaim = ClaimVerificationRepository.getClaimById(claimId);
    assert.ok(originalClaim);

    const initialVersions = ClaimVerificationRepository.getClaimVersions(claimId);
    const initialReviewCount = ClaimVerificationRepository.getHumanReviews(claimId).length;

    // Juror overrides status to PARTIALLY_VERIFIED based on offline interview
    const review = ClaimVerificationRepository.createHumanReview({
      id: `hr_test_${Date.now()}`,
      claimId,
      evaluationId: originalClaim.evaluationId,
      reviewerName: 'Prof. Marcus Vance',
      oldStatus: originalClaim.status,
      newStatus: 'PARTIALLY_VERIFIED',
      reason: 'Team presented signed quote from municipal road agency showing prototype pricing comparison.',
      createdAt: new Date().toISOString(),
    });

    assert.ok(review.id);
    const updatedClaim = ClaimVerificationRepository.getClaimById(claimId);
    assert.equal(updatedClaim?.status, 'PARTIALLY_VERIFIED');

    const updatedVersions = ClaimVerificationRepository.getClaimVersions(claimId);
    assert.equal(updatedVersions.length, initialVersions.length + 1);
    assert.equal(updatedVersions[0].status, 'PARTIALLY_VERIFIED');

    const updatedReviews = ClaimVerificationRepository.getHumanReviews(claimId);
    assert.equal(updatedReviews.length, initialReviewCount + 1);
  });
});
