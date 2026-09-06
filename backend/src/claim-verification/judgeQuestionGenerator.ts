import type { Claim, ClaimParameters, MethodologyCompleteness } from '../models/claim';

export class JudgeQuestionGenerator {
  /**
   * Generates a focused, actionable inquiry for project evaluators and jurors.
   * Directly targets identified methodology gaps or ungrounded assertions.
   */
  static generate(
    claim: Claim,
    parameters?: ClaimParameters,
    methodology?: MethodologyCompleteness,
    contradictionCount: number = 0
  ): string {
    const text = claim.claimText.toLowerCase();

    // 1. Accuracy / Precision / Recall quantitative claims
    if (claim.claimType === 'ACCURACY' || claim.claimType === 'PERFORMANCE' || /accuracy/i.test(text)) {
      if (contradictionCount > 0) {
        return `Slide 14 cites 95% accuracy, Section 4 documents 91.2%, and your demo video mentions ~90%. Which empirical test set was evaluated to establish each number, and what explains the variance across project materials?`;
      }
      return `What specific dataset split, sample volume, and independent validation cohort were used to calculate the reported ${parameters?.value || '95'}% accuracy, and how was ground-truth road damage verified?`;
    }

    // 2. Real-time / Speed / Latency claims
    if (claim.claimType === 'SPEED' || claim.claimType === 'LATENCY' || /real-time/i.test(text)) {
      return `What is the measured end-to-end frame processing latency under peak vehicle speed (e.g. 50 km/h) on the Jetson Orin Nano, and does frame skipping occur during dense detection batches?`;
    }

    // 3. Cost / Price / Economic claims
    if (claim.claimType === 'COST' || /cheaper|cost/i.test(text)) {
      return `What baseline cost model is the claimed 40% reduction compared against, and does this comparison incorporate recurring cellular LTE data telemetry, camera lens maintenance, and GIS cloud storage?`;
    }

    // 4. Environmental / Weather robustness claims
    if (/weather/i.test(text) || claim.claimType === 'ENVIRONMENTAL') {
      return `Section 6 notes optical degradation during heavy rain and night fog. What validation benchmarks or filtering algorithms have been tested to prevent false-positive pothole triggers under wet asphalt reflections?`;
    }

    // 5. Time / Efficiency reduction claims
    if (/70%|inspection time/i.test(text) || claim.claimType === 'EFFICIENCY') {
      return `What baseline manual road survey protocol was measured to substantiate the 70% inspection time reduction, and how many municipal road kilometers were surveyed during the comparative trial?`;
    }

    // 6. Security / Authentication claims
    if (claim.claimType === 'SECURITY' || /auth|jwt|security/i.test(text)) {
      return `While JWT authentication is present in the API middleware, what protocol handles secure secret rotation, credential storage on edge transit vehicles, and token revocation?`;
    }

    // Default targeted question
    const missingArtifact = methodology?.missingElements[0] || 'independent test set';
    return `Can you provide empirical documentation or experimental logs substantiating "${claim.claimText}", specifically addressing the missing ${missingArtifact}?`;
  }
}
