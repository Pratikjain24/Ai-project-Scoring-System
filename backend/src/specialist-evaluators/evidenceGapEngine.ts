import type { EvaluatorEvidenceGap, SpecialistEvaluationContext } from './types';

export class EvidenceGapEngine {
  /**
   * Identifies missing empirical validation artifacts across technical, ML,
   * security, hardware, and deployment domains.
   */
  static extractGaps(context: SpecialistEvaluationContext): EvaluatorEvidenceGap[] {
    const { evaluationId, projectType, claimVerifications } = context;
    const gaps: EvaluatorEvidenceGap[] = [];

    // 1. Machine Learning Validation Gap
    gaps.push({
      id: `gap_${evaluationId}_ml_val`,
      evaluationId,
      category: 'AI_ML',
      description: 'Absence of published independent test set evaluation or confusion matrices validating detection accuracy across unseen geographic environments.',
      importance: 'CRITICAL',
      expectedEvidence: 'Independent test split benchmark results with precision/recall curves and class balance tables.',
      relatedAssessment: 'AI_ML',
      confidence: 90,
    });

    // 2. Hardware Reliability Testing Gap (if hardware/hybrid)
    if (projectType !== 'SOFTWARE') {
      gaps.push({
        id: `gap_${evaluationId}_hw_rel`,
        evaluationId,
        category: 'HARDWARE',
        description: 'Absence of formal vehicular vibration (ISO 16750-3) and environmental ingress protection (IP67) test certifications.',
        importance: 'HIGH',
        expectedEvidence: 'Laboratory vibration sweep records and sealed enclosure moisture chamber ingress test reports.',
        relatedAssessment: 'HARDWARE',
        confidence: 85,
      });

      gaps.push({
        id: `gap_${evaluationId}_hw_mtbf`,
        evaluationId,
        category: 'HARDWARE',
        description: 'Mean Time Between Failures (MTBF) and thermal life-cycle endurance remain empirically unmeasured.',
        importance: 'MEDIUM',
        expectedEvidence: 'Accelerated thermal chamber endurance logs over continuous 500+ hour operating run.',
        relatedAssessment: 'RELIABILITY',
        confidence: 80,
      });
    }

    // 3. Security Penetration & Threat Model Gap
    gaps.push({
      id: `gap_${evaluationId}_sec_audit`,
      evaluationId,
      category: 'SECURITY',
      description: 'No third-party vulnerability penetration test reports or formal threat modeling documentation for edge-to-cloud API endpoints.',
      importance: 'HIGH',
      expectedEvidence: 'Threat model (STRIDE matrix) and automated static/dynamic application security testing (SAST/DAST) summaries.',
      relatedAssessment: 'SECURITY',
      confidence: 82,
    });

    // 4. Commercial / Deployment Cost Gap
    gaps.push({
      id: `gap_${evaluationId}_dep_cost`,
      evaluationId,
      category: 'FEASIBILITY',
      description: 'Total Cost of Ownership (TCO) model omits ongoing vehicle fleet retrofit labor, SIM cellular uplink plans, and routine lens maintenance.',
      importance: 'MEDIUM',
      expectedEvidence: 'Itemized 3-year commercial operating expenditure breakdown covering cellular, cloud GIS, and hardware spares.',
      relatedAssessment: 'ECONOMIC',
      confidence: 78,
    });

    // Also pull in any specific missing evidence items identified during Phase 7 claim verifications
    claimVerifications.forEach((cv, idx) => {
      if (cv.missingEvidence && cv.missingEvidence.length > 0) {
        gaps.push({
          id: `gap_${evaluationId}_claim_${idx}`,
          evaluationId,
          category: cv.scoreImpactCategory || 'CLAIM_TRUTH',
          description: `Empirical proof artifact missing for evaluated claim: ${cv.missingEvidence.join(', ')}.`,
          importance: 'HIGH',
          expectedEvidence: cv.recommendedJudgeQuestion || 'Primary experiment data and reproducible code test logs.',
          relatedAssessment: cv.claimId,
          confidence: Math.round(cv.confidence),
        });
      }
    });

    return gaps;
  }
}
