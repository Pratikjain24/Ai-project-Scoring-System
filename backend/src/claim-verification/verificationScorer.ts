import type {
  Claim,
  ClaimStatus,
  ClaimVerificationResult,
  DemoSupportStatus,
  DocumentSupportStatus,
  CodeSupportStatus,
  MethodologyCompleteness,
  PotentialContradiction,
} from '../models/claim';

export interface VerificationScorerInput {
  claim: Claim;
  methodology: MethodologyCompleteness;
  demoSupport: DemoSupportStatus;
  demoTimestamp?: number;
  documentSupport: DocumentSupportStatus;
  codeSupport: CodeSupportStatus;
  contradictions: PotentialContradiction[];
  supportingEvidence: any[];
  contradictingEvidence: any[];
}

export class VerificationScorer {
  /**
   * Deterministically computes verification score (0-100), confidence (0-100),
   * and assigns precise verification status.
   */
  static evaluate(input: VerificationScorerInput): ClaimVerificationResult {
    const {
      claim,
      methodology,
      demoSupport,
      demoTimestamp,
      documentSupport,
      codeSupport,
      contradictions,
      supportingEvidence,
      contradictingEvidence,
    } = input;

    // 1. Evidence Sufficiency Factor (0 - 30 pts)
    let evidenceSufficiencyPts = 0;
    if (supportingEvidence.length >= 3) evidenceSufficiencyPts = 30;
    else if (supportingEvidence.length === 2) evidenceSufficiencyPts = 22;
    else if (supportingEvidence.length === 1) evidenceSufficiencyPts = 12;
    else evidenceSufficiencyPts = 0;

    // 2. Methodology Completeness Factor (0 - 25 pts)
    const methodologyPts = Math.round((methodology.score / 100) * 25);

    // 3. Multimodal Demo Support Factor (0 - 20 pts)
    let demoPts = 0;
    if (demoSupport === 'SUPPORTED_BY_DEMO') demoPts = 20;
    else if (demoSupport === 'PARTIALLY_SUPPORTED_BY_DEMO') demoPts = 12;
    else if (demoSupport === 'UNCERTAIN') demoPts = 5;
    else demoPts = 0;

    // 4. Document & Code Support Factor (0 - 15 pts)
    let docCodePts = 0;
    if (documentSupport === 'FULL') docCodePts += 8;
    else if (documentSupport === 'PARTIAL') docCodePts += 4;

    if (codeSupport === 'SUPPORTED') docCodePts += 7;
    else if (codeSupport === 'PARTIAL') docCodePts += 3;

    // 5. Contradiction & Consistency Penalty (deduct up to 30 pts)
    let contradictionPenalty = 0;
    for (const c of contradictions) {
      if (c.severity === 'CRITICAL') contradictionPenalty += 20;
      else if (c.severity === 'HIGH') contradictionPenalty += 12;
      else if (c.severity === 'MEDIUM') contradictionPenalty += 6;
      else contradictionPenalty += 2;
    }
    contradictionPenalty = Math.min(30, contradictionPenalty);

    // Raw Verification Score (0 - 100)
    const rawScore = evidenceSufficiencyPts + methodologyPts + demoPts + docCodePts - contradictionPenalty;
    const verificationScore = Math.max(0, Math.min(100, rawScore));

    // Consistency Score (100 - contradiction penalty)
    const consistencyScore = Math.max(0, 100 - contradictionPenalty * 3);

    // Confidence Calculation (reflects depth and independence of data)
    let conf = 40; // Base confidence
    if (supportingEvidence.length > 0) conf += Math.min(30, supportingEvidence.length * 8);
    if (methodology.score >= 60) conf += 15;
    if (demoSupport !== 'NOT_DEMONSTRATED') conf += 10;
    if (contradictions.length > 0) conf += 5; // We have clear cross-verification points
    const confidence = Math.min(95, Math.max(30, conf));

    // Determine Verification Status
    let status: ClaimStatus = 'UNVERIFIED';

    const hasCriticalContradiction = contradictions.some(c => c.severity === 'CRITICAL');
    const hasMultipleHighContradictions = contradictions.filter(c => c.severity === 'HIGH' && c.conflictType === 'INTERNAL').length >= 2;

    if (hasCriticalContradiction || hasMultipleHighContradictions || contradictingEvidence.length >= 2) {
      status = 'CONTRADICTED';
    } else if (
      (verificationScore >= 75 && methodology.score >= 50 && supportingEvidence.length >= 2) ||
      (claim.claimType === 'TECHNICAL' && codeSupport === 'SUPPORTED' && supportingEvidence.length >= 2)
    ) {
      status = 'VERIFIED';
    } else if (
      verificationScore >= 38 &&
      (supportingEvidence.length >= 2 || (supportingEvidence.length >= 1 && demoSupport !== 'NOT_DEMONSTRATED'))
    ) {
      // Some evidence supports it, but important empirical elements or independent proof are missing
      status = 'PARTIALLY_VERIFIED';
    } else if (
      supportingEvidence.length === 0 &&
      (claim.claimType === 'ENVIRONMENTAL' || claim.claimType === 'BENCHMARK')
    ) {
      status = 'INSUFFICIENT_EVIDENCE';
    } else {
      status = 'UNVERIFIED';
    }

    // Explanations adhering strictly to evidence-based, non-accusatory language
    let explanation = '';
    if (status === 'VERIFIED') {
      explanation = `Direct empirical evidence substantiated by code implementation, structured documentation, and demonstrable video execution. High methodological completeness (${methodology.score}%).`;
    } else if (status === 'PARTIALLY_VERIFIED') {
      explanation = `Supporting documentation and functional demonstrations exist, but crucial empirical elements (${methodology.missingElements.slice(0, 2).join(', ')}) remain unspecified or unvalidated independently.`;
    } else if (status === 'CONTRADICTED') {
      explanation = `Credible conflicting statements identified across project materials (${contradictions[0]?.difference || 'variance detected between documentation and observed execution'}).`;
    } else if (status === 'INSUFFICIENT_EVIDENCE') {
      explanation = `Evidence volume is currently insufficient to establish a meaningful verification judgment under operational conditions.`;
    } else {
      explanation = `Claim is asserted in project text, but no primary experimental results, benchmark tables, or third-party validation logs were found in uploaded artifacts.`;
    }

    // Map score impact category
    let scoreImpactCategory = 'TECHNICAL_QUALITY';
    let potentialScoreImpact = 0;
    if (claim.importance === 'CRITICAL') {
      potentialScoreImpact = status === 'VERIFIED' ? +8 : status === 'CONTRADICTED' ? -12 : -5;
    } else if (claim.importance === 'HIGH') {
      potentialScoreImpact = status === 'VERIFIED' ? +5 : status === 'CONTRADICTED' ? -8 : -3;
    } else {
      potentialScoreImpact = status === 'VERIFIED' ? +2 : status === 'CONTRADICTED' ? -4 : 0;
    }

    return {
      id: `cv_${claim.id}`,
      claimId: claim.id,
      evaluationId: claim.evaluationId,
      status,
      verificationScore,
      confidence,
      methodologyScore: methodology.score,
      consistencyScore,
      demoSupport,
      demoTimestamp,
      documentSupport,
      codeSupport,
      missingEvidence: methodology.missingElements,
      explanation,
      scoreImpactCategory,
      potentialScoreImpact,
    };
  }
}
