import { SCORING_WEIGHTS, RUBRIC_LABELS, validateWeights, type RubricCategoryKey } from '../config/scoringWeights';
import type { CategoryScore, FinalJuryVerdict, VerdictRank } from '../models/scoring';
import { ScoreValidator } from './scoreValidator';

export interface AssessmentInputs {
  problemNeedRaw: number;
  technicalQualityRaw: number;
  originalityRaw: number;
  socialImpactRaw: number;
  presentationRaw: number;
  demonstrationRaw: number;
  feasibilityScalabilityRaw: number;
  futurePotentialRaw: number;
  evidenceCounts: Record<RubricCategoryKey, number>;
  rawConfidence: number;
  hasContradictedClaims: boolean;
  unverifiedClaimRatio: number;
}

export class ScoringEngine {
  static calculate(evaluationId: string, inputs: AssessmentInputs): FinalJuryVerdict {
    // 1. Assert weights sum to exactly 1.0 (100%)
    if (!validateWeights()) {
      throw new Error('Critical Scoring Engine Error: Rubric category weights do not sum to 100%.');
    }

    const rawScoresMap: Record<RubricCategoryKey, number> = {
      problemNeed: Math.min(100, Math.max(0, inputs.problemNeedRaw)),
      technicalQuality: Math.min(100, Math.max(0, inputs.technicalQualityRaw)),
      originality: Math.min(100, Math.max(0, inputs.originalityRaw)),
      socialImpact: Math.min(100, Math.max(0, inputs.socialImpactRaw)),
      presentation: Math.min(100, Math.max(0, inputs.presentationRaw)),
      demonstration: Math.min(100, Math.max(0, inputs.demonstrationRaw)),
      feasibilityScalability: Math.min(100, Math.max(0, inputs.feasibilityScalabilityRaw)),
      futurePotential: Math.min(100, Math.max(0, inputs.futurePotentialRaw)),
    };

    let totalWeightedScore = 0;
    const categoryScores: CategoryScore[] = [];

    for (const key of Object.keys(SCORING_WEIGHTS) as RubricCategoryKey[]) {
      const raw = rawScoresMap[key];
      const weight = SCORING_WEIGHTS[key];
      const weighted = raw * weight;
      totalWeightedScore += weighted;

      const evCount = inputs.evidenceCounts[key] || 3;
      const catConfidence = Math.min(95, Math.max(50, 75 + evCount * 2));

      categoryScores.push({
        id: `sc_${evaluationId}_${key}`,
        evaluationId,
        categoryKey: key,
        categoryLabel: RUBRIC_LABELS[key],
        rawScore: parseFloat(raw.toFixed(1)),
        weight,
        weightedScore: parseFloat(weighted.toFixed(2)),
        confidence: catConfidence,
        evidenceCount: evCount,
        explanation: `Score derived from ${evCount} corroborated artifacts across rubric dimension.`,
      });
    }

    const overallScore = parseFloat(totalWeightedScore.toFixed(1));

    // 2. Validate & calibrate confidence
    const totalEvidenceCount = Object.values(inputs.evidenceCounts).reduce((a, b) => a + b, 0);
    const confidenceValidation = ScoreValidator.validateAndCalibrateConfidence(
      inputs.rawConfidence,
      totalEvidenceCount,
      inputs.hasContradictedClaims,
      inputs.unverifiedClaimRatio
    );

    // 3. Determine Verdict Level
    let verdict: VerdictRank = 'PROMISING';
    if (overallScore >= 88) verdict = 'EXCEPTIONAL';
    else if (overallScore >= 80) verdict = 'STRONG';
    else if (overallScore >= 70) verdict = 'PROMISING';
    else if (overallScore >= 55) verdict = 'NEEDS_IMPROVEMENT';
    else verdict = 'WEAK';

    // 4. Find strongest and weakest areas
    const sorted = [...categoryScores].sort((a, b) => b.rawScore - a.rawScore);
    const strongestArea = `${sorted[0].categoryLabel} (${sorted[0].rawScore}/100)`;
    const weakestArea = `${sorted[sorted.length - 1].categoryLabel} (${sorted[sorted.length - 1].rawScore}/100)`;

    return {
      evaluationId,
      overallScore,
      confidence: confidenceValidation.calibratedConfidence,
      verdict,
      verdictSummary: `Composite weighted evaluation of ${overallScore}/100 places project in ${verdict} tier with ${confidenceValidation.calibratedConfidence}% calibrated certainty.`,
      categoryScores,
      strongestArea,
      weakestArea,
      keyDissentNotes: confidenceValidation.warnings,
      createdAt: new Date().toISOString(),
    };
  }
}
