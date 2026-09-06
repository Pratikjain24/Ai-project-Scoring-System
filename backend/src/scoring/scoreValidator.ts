export interface ScoreValidationResult {
  isValid: boolean;
  calibratedConfidence: number;
  warnings: string[];
}

export class ScoreValidator {
  /**
   * Validates confidence and enforces penalty rules:
   * 1. A score cannot be considered high confidence (>85%) when evidenceCount is low (<3).
   * 2. Unresolved / contradicted claims penalize overall confidence.
   * 3. Separates SCORE from CONFIDENCE.
   */
  static validateAndCalibrateConfidence(
    rawConfidence: number,
    evidenceCount: number,
    hasContradictedClaims: boolean,
    unverifiedClaimRatio: number
  ): ScoreValidationResult {
    const warnings: string[] = [];
    let calibrated = rawConfidence;

    // Rule 1: Evidence sparsity cap
    if (evidenceCount < 3) {
      const maxAllowed = 65;
      if (calibrated > maxAllowed) {
        warnings.push(`Evidence count (${evidenceCount}) is sparse; capping confidence at ${maxAllowed}%.`);
        calibrated = maxAllowed;
      }
    }

    // Rule 2: Contradicted claims penalty
    if (hasContradictedClaims) {
      warnings.push('Contradicted claims detected in submission; applying -15% confidence penalty.');
      calibrated = Math.max(30, calibrated - 15);
    }

    // Rule 3: High unverified claims ratio penalty (>40% unverified)
    if (unverifiedClaimRatio > 0.4) {
      warnings.push(`${Math.round(unverifiedClaimRatio * 100)}% of claims remain unverified; applying -10% confidence penalty.`);
      calibrated = Math.max(30, calibrated - 10);
    }

    return {
      isValid: true,
      calibratedConfidence: Math.round(calibrated),
      warnings,
    };
  }
}
