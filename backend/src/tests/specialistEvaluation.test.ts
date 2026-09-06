import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ProjectTypeRouter } from '../specialist-evaluators/projectTypeRouter';
import { SoftwareEvaluator } from '../specialist-evaluators/softwareEvaluator';
import { HardwareEvaluator } from '../specialist-evaluators/hardwareEvaluator';
import { AIModelEvaluator } from '../specialist-evaluators/aiModelEvaluator';
import { SecurityEvaluator } from '../specialist-evaluators/securityEvaluator';
import { PerformanceEvaluator } from '../specialist-evaluators/performanceEvaluator';
import { ScalabilityEvaluator } from '../specialist-evaluators/scalabilityEvaluator';
import { HardwareSpecialists } from '../specialist-evaluators/hardwareSpecialists';
import { ImpactEvaluator } from '../specialist-evaluators/impactEvaluator';
import { FeasibilityEvaluator } from '../specialist-evaluators/feasibilityEvaluator';
import { RiskEngine } from '../specialist-evaluators/riskEngine';
import { EvidenceGapEngine } from '../specialist-evaluators/evidenceGapEngine';
import { RecommendationEngine } from '../specialist-evaluators/recommendationEngine';
import { AssessmentAggregator } from '../specialist-evaluators/assessmentAggregator';
import { SpecialistEvaluationRepository } from '../repositories/specialistEvaluationRepository';
import type { SpecialistEvaluationContext } from '../specialist-evaluators/types';

describe('Phase 8: Technical + Impact + Feasibility Intelligence Engine Test Suite', () => {

  // 1. Project Type Routing
  test('1. ProjectTypeRouter accurately classifies SOFTWARE, HARDWARE, and HYBRID projects', () => {
    const swClassification = ProjectTypeRouter.classify(
      { name: 'CyberShield Mesh', architectureType: 'SOFTWARE', problemStatement: 'eBPF network security' },
      [{ title: 'eBPF AST', description: 'Linux kernel trace', source: 'src/main.rs' }],
      []
    );
    assert.strictEqual(swClassification, 'SOFTWARE');

    const hwClassification = ProjectTypeRouter.classify(
      { name: 'AgroSense Probe', architectureType: 'HARDWARE', problemStatement: 'Soil probe with LoRa sensor' },
      [{ title: 'Microcontroller PCB', description: 'ISFET sensor schematic and GPIO', source: 'cad/pcb.sch' }],
      []
    );
    assert.strictEqual(hwClassification, 'HARDWARE');

    const hybridClassification = ProjectTypeRouter.classify(
      { name: 'Smart Road Vision', architectureType: 'SOFTWARE', problemStatement: 'Edge camera defect detection' },
      [
        { title: 'YOLOv8 Model', description: 'Python inference engine', source: 'src/model.py' },
        { title: 'Jetson Nano SoM', description: 'NVIDIA Jetson embedded hardware and camera hardware', source: 'docs/bom.txt' }
      ],
      []
    );
    assert.strictEqual(hybridClassification, 'HYBRID');
  });

  // 2. Software Evaluation & Missing Evidence -> NOT_ASSESSED
  test('2. SoftwareEvaluator returns NOT_ASSESSED with INSUFFICIENT_EVIDENCE when evidence is missing', () => {
    const emptyContext: SpecialistEvaluationContext = {
      evaluationId: 'eval_empty_test',
      projectId: 'empty-project',
      projectName: 'Empty Project',
      projectType: 'SOFTWARE',
      evidenceItems: [],
      documents: [],
      videoObservations: [],
      claims: [],
      claimVerifications: [],
      claimContradictions: [],
      researchFindings: [],
      researchSources: [],
    };

    const assessments = SoftwareEvaluator.evaluate(emptyContext);
    const archAssessment = assessments.find(a => a.subCategory === 'ARCHITECTURE');
    const algoAssessment = assessments.find(a => a.subCategory === 'ALGORITHMS');

    assert.ok(archAssessment, 'Architecture assessment must exist');
    assert.strictEqual(archAssessment.status, 'NOT_ASSESSED');
    assert.ok(archAssessment.summary.includes('Insufficient empirical evidence'));

    assert.ok(algoAssessment, 'Algorithm assessment must exist');
    assert.strictEqual(algoAssessment.status, 'NOT_ASSESSED');
    assert.ok(algoAssessment.summary.includes('Insufficient evidence'));
  });

  // 3. AI / ML Model & Dataset Evaluation
  test('3. AIModelEvaluator evaluates problem-model fit and reduces confidence when methodology is unvalidated', () => {
    const unvalidatedContext: SpecialistEvaluationContext = {
      evaluationId: 'eval_ai_test',
      projectId: 'ai-project',
      projectName: 'AI Road Vision',
      projectType: 'SOFTWARE',
      evidenceItems: [
        { id: 'ev_1', title: 'YOLO Model', description: 'Trained model weights', type: 'MODEL' }
      ],
      documents: [],
      videoObservations: [],
      claims: [{ id: 'clm_1', claimText: 'Achieves 98% detection accuracy on potholes' }],
      claimVerifications: [
        { claimId: 'clm_1', status: 'UNVERIFIED', methodologyScore: 20, confidence: 45 }
      ],
      claimContradictions: [],
      researchFindings: [],
      researchSources: [],
    };

    const result = AIModelEvaluator.evaluate(unvalidatedContext);
    assert.ok(result.mlAssessment, 'MLAssessment object must be generated');
    assert.ok(result.mlAssessment.datasetQualityScore > 0);
    // Unvalidated accuracy without methodology must receive lower confidence (<60%)
    assert.ok(result.mlAssessment.reproducibilityConfidence < 60, 'Unvalidated accuracy must have lower confidence');

    const aiAssess = result.assessments.find(a => a.subCategory === 'AI_ML');
    assert.ok(aiAssess);
    assert.strictEqual(aiAssess.status, 'ASSESSED');
    assert.ok(aiAssess.confidence < 60);
  });

  // 4. Security Evaluator: Maturity over Absolute Claims
  test('4. SecurityEvaluator scores maturity without claiming a system is 100% secure', () => {
    const secContext: SpecialistEvaluationContext = {
      evaluationId: 'eval_sec_test',
      projectId: 'sec-project',
      projectName: 'Secure Gate',
      projectType: 'SOFTWARE',
      evidenceItems: [
        { id: 'ev_sec', title: 'JWT Authentication', description: 'Bearer token auth middleware', type: 'CODE_AST' }
      ],
      documents: [],
      videoObservations: [],
      claims: [{ id: 'clm_sec', claimText: 'Enterprise REST API implements secure token auth' }],
      claimVerifications: [],
      claimContradictions: [],
      researchFindings: [],
      researchSources: [],
    };

    const assessment = SecurityEvaluator.evaluate(secContext);
    assert.strictEqual(assessment.subCategory, 'SECURITY');
    assert.strictEqual(assessment.status, 'ASSESSED');
    // Does not claim 100% secure
    assert.ok(!assessment.summary.toLowerCase().includes('100% secure'));
    assert.ok(assessment.summary.includes('Security maturity'));
    assert.ok(assessment.weaknesses.length > 0, 'Must document security gaps/weaknesses');
  });

  // 5. Performance & Scalability Evaluation
  test('5. PerformanceEvaluator and ScalabilityEvaluator detect bottlenecks and enforce comparable conditions', () => {
    const perfContext: SpecialistEvaluationContext = {
      evaluationId: 'eval_perf_test',
      projectId: 'perf-project',
      projectName: 'Fast Edge',
      projectType: 'HYBRID',
      evidenceItems: [
        { id: 'ev_p1', title: 'Latency Log', description: 'Inference latency 18ms on Jetson', type: 'BENCHMARK' }
      ],
      documents: [],
      videoObservations: [],
      claims: [{ id: 'clm_p', claimText: 'Sustains 54 FPS on edge' }],
      claimVerifications: [],
      claimContradictions: [
        {
          id: 'contra_1',
          statementA: 'Claims 100 FPS in pitch deck',
          statementB: 'Logs indicate 30-54 FPS under load',
          difference: 'Numerical divergence in marketing',
          severity: 'HIGH',
          confidence: 0.9,
          claimAId: 'clm_p'
        }
      ],
      researchFindings: [],
      researchSources: [],
    };

    const perfAssessment = PerformanceEvaluator.evaluate(perfContext);
    assert.strictEqual(perfAssessment.status, 'ASSESSED');
    assert.ok(perfAssessment.weaknesses.some(w => w.includes('discrepancy') || w.includes('diverge')));

    const scaleAssessment = ScalabilityEvaluator.evaluate(perfContext);
    assert.strictEqual(scaleAssessment.subCategory, 'SCALABILITY');
    assert.ok(scaleAssessment.recommendations.length > 0);
  });

  // 6. Hardware & Reliability Evaluation (RELIABILITY_EVIDENCE_GAP)
  test('6. HardwareSpecialists marks RELIABILITY_EVIDENCE_GAP when testing is absent without assuming failure', () => {
    const hwContext: SpecialistEvaluationContext = {
      evaluationId: 'eval_hw_test',
      projectId: 'hw-project',
      projectName: 'Bare Sensor Rig',
      projectType: 'HARDWARE',
      evidenceItems: [
        { id: 'ev_hw', title: 'Carrier Board', description: 'Custom PCB design', type: 'HARDWARE' }
      ],
      documents: [],
      videoObservations: [],
      claims: [],
      claimVerifications: [],
      claimContradictions: [],
      researchFindings: [],
      researchSources: [],
    };

    const assessments = HardwareSpecialists.evaluate(hwContext);
    const relAssessment = assessments.find(a => a.subCategory === 'RELIABILITY');
    assert.ok(relAssessment);
    assert.ok(relAssessment.summary.includes('RELIABILITY_EVIDENCE_GAP'));
    // Does not assume failure: score remains moderate baseline
    assert.ok(relAssessment.score >= 50 && relAssessment.score <= 75);
    assert.strictEqual(relAssessment.confidence, 40); // Lower confidence because evidence is absent
  });

  // 7. Impact Evaluator: Social, Economic (LIMITED_MARKET_EVIDENCE), Environmental
  test('7. ImpactEvaluator flags LIMITED_MARKET_EVIDENCE when market validation is weak', () => {
    const impactContext: SpecialistEvaluationContext = {
      evaluationId: 'eval_imp_test',
      projectId: 'imp-project',
      projectName: 'Social Initiative',
      projectType: 'SOFTWARE',
      evidenceItems: [],
      documents: [],
      videoObservations: [],
      claims: [],
      claimVerifications: [],
      claimContradictions: [],
      researchFindings: [],
      researchSources: [],
    };

    const assessments = ImpactEvaluator.evaluate(impactContext);
    const econAssessment = assessments.find(a => a.subCategory === 'ECONOMIC');
    assert.ok(econAssessment);
    assert.ok(econAssessment.summary.includes('LIMITED_MARKET_EVIDENCE'));
    assert.strictEqual(econAssessment.status, 'PARTIALLY_ASSESSED');
  });

  // 8. Feasibility Evaluator, Deployment Readiness & Cost Analysis
  test('8. FeasibilityEvaluator categorizes costs strictly into KNOWN_COST, ESTIMATED_COST, and UNKNOWN', () => {
    const feasContext: SpecialistEvaluationContext = {
      evaluationId: 'eval_feas_test',
      projectId: 'smart-road-vision',
      projectName: 'Smart Road Vision',
      projectType: 'HYBRID',
      evidenceItems: [],
      documents: [],
      videoObservations: [],
      claims: [],
      claimVerifications: [],
      claimContradictions: [],
      researchFindings: [],
      researchSources: [],
    };

    const bundle = FeasibilityEvaluator.evaluate(feasContext);
    assert.strictEqual(bundle.overallMaturity, 'PROTOTYPE');
    assert.ok(bundle.deploymentBlockers.length > 0);

    // Verify Cost Separation
    assert.ok(bundle.costKnown.every(c => c.status === 'KNOWN_COST'));
    assert.ok(bundle.costEstimated.every(c => c.status === 'ESTIMATED_COST'));
    assert.ok(bundle.costUnknown.every(c => c.status === 'UNKNOWN'));
    assert.ok(bundle.costUnknown.some(c => c.amount === 'UNKNOWN'));
  });

  // 9. Unified Risk Engine & Evidence Gap Engine
  test('9. RiskEngine and EvidenceGapEngine produce structured, prioritized issues', () => {
    const context: SpecialistEvaluationContext = {
      evaluationId: 'eval_risk_test',
      projectId: 'smart-road-vision',
      projectName: 'Smart Road Vision',
      projectType: 'HYBRID',
      evidenceItems: [],
      documents: [],
      videoObservations: [],
      claims: [],
      claimVerifications: [],
      claimContradictions: [
        {
          id: 'c1',
          statementA: 'All weather',
          statementB: 'Fails in heavy fog',
          difference: 'Visibility boundary',
          severity: 'HIGH',
          confidence: 0.9,
          claimAId: 'clm_1'
        }
      ],
      researchFindings: [],
      researchSources: [],
    };

    const risks = RiskEngine.extractRisks(context);
    assert.ok(risks.length >= 4);
    assert.ok(risks.some(r => r.category === 'DATA'));
    assert.ok(risks.some(r => r.category === 'SECURITY'));
    assert.ok(risks.every(r => ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(r.severity)));
    assert.ok(risks.every(r => ['HIGH', 'MEDIUM', 'LOW'].includes(r.likelihood)));

    const gaps = EvidenceGapEngine.extractGaps(context);
    assert.ok(gaps.length >= 3);
    assert.ok(gaps.some(g => g.category === 'AI_ML' && g.importance === 'CRITICAL'));
  });

  // 10. Prioritized, Non-Generic Recommendation Engine
  test('10. RecommendationEngine produces actionable, specific recommendations with expected benefits', () => {
    const context: SpecialistEvaluationContext = {
      evaluationId: 'eval_rec_test',
      projectId: 'smart-road-vision',
      projectName: 'Smart Road Vision',
      projectType: 'HYBRID',
      evidenceItems: [],
      documents: [],
      videoObservations: [],
      claims: [],
      claimVerifications: [],
      claimContradictions: [],
      researchFindings: [],
      researchSources: [],
    };

    const recs = RecommendationEngine.generate(context);
    assert.ok(recs.length >= 4);
    assert.ok(recs.some(r => r.priority === 'CRITICAL'));
    // No generic recommendations
    assert.ok(!recs.some(r => r.title.toLowerCase() === 'improve the project'));
    assert.ok(recs.every(r => r.action && r.action.length > 20));
    assert.ok(recs.every(r => r.expectedBenefit && r.expectedBenefit.length > 15));
  });

  // 11. AssessmentAggregator & SQLite Repository Integration
  test('11. AssessmentAggregator generates complete summary and persists cleanly in SQLite', () => {
    const summary = SpecialistEvaluationRepository.getSummary('eval_smart-road-vision');
    assert.ok(summary, 'Pre-seeded smart-road-vision summary must exist');
    assert.strictEqual(summary.evaluationId, 'eval_smart-road-vision');
    assert.ok(summary.technicalScore >= 0 && summary.technicalScore <= 100);
    assert.ok(summary.impactScore >= 0 && summary.impactScore <= 100);
    assert.ok(summary.feasibilityScore >= 0 && summary.feasibilityScore <= 100);
    assert.ok(summary.assessments.length >= 8);
    assert.ok(summary.risks.length >= 4);
    assert.ok(summary.evidenceGaps.length >= 3);
    assert.ok(summary.recommendations.length >= 4);
    assert.ok(summary.whyStrong.length >= 3);
    assert.ok(summary.whatMustFix.length >= 3);
    assert.ok(summary.maturity.overallStage);
  });

  // 12. All 5 Multi-Domain Mock Projects Available in Repository
  test('12. All 5 demo projects (Hybrid, Hardware, Software) possess seeded Specialist Evaluations', () => {
    const projectIds = ['smart-road-vision', 'agrosense', 'cybershield', 'meditrack', 'solarguard'];
    for (const pid of projectIds) {
      const summary = SpecialistEvaluationRepository.getSummary(`eval_${pid}`);
      assert.ok(summary, `Evaluation summary for eval_${pid} must be present`);
      assert.ok(summary.technicalScore > 0, `Technical score for ${pid} must be non-zero`);
      assert.ok(summary.impactScore > 0, `Impact score for ${pid} must be non-zero`);
      assert.ok(summary.feasibilityScore > 0, `Feasibility score for ${pid} must be non-zero`);
    }
  });
});
