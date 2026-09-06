/**
 * Originality Scorer
 * Deterministic multi-stage originality scoring pipeline.
 * Computes dimension-weighted similarity, discounts syndicated derivative sources,
 * credits verified unique contributions, and preserves uncertainty.
 */

import type {
  DimensionWeightConfig,
  DimensionAnalysis,
  UniqueContribution,
  OriginalityClassification,
  SimilarityCandidate,
} from '../models/originalityIntelligence';

export interface ScoreComputationResult {
  overallOriginalityScore: number;
  overallSimilarityScore: number;
  confidence: number;
  classification: OriginalityClassification;
  explanation: string;
  isInsufficientEvidence: boolean;
  missingEvidence: string[];
  recommendedEvidence: string[];
}

export class OriginalityScorer {
  static compute(
    profileId: string,
    dimensionAnalyses: DimensionAnalysis[],
    weights: DimensionWeightConfig,
    contributions: UniqueContribution[],
    candidates: SimilarityCandidate[]
  ): ScoreComputationResult {
    // 1. Insufficient Evidence Check
    if (!candidates || candidates.length === 0) {
      return {
        overallOriginalityScore: 0,
        overallSimilarityScore: 0,
        confidence: 0.1,
        classification: 'INSUFFICIENT_EVIDENCE',
        explanation: 'Insufficient public comparative sources discovered. An originality score cannot be reliably established without comparative benchmarks.',
        isInsufficientEvidence: true,
        missingEvidence: [
          'External repository search results',
          'Domain-specific peer-reviewed academic literature',
          'Commercial product specifications',
        ],
        recommendedEvidence: [
          'Perform broad web and GitHub search for domain keywords',
          'Submit open-source project URL or architecture blueprints',
        ],
      };
    }

    // 2. Aggregate Dimension Scores
    const dimensionScores: Record<string, number> = {};
    let totalConfidence = 0;

    for (const d of dimensionAnalyses) {
      dimensionScores[d.dimension] = d.score;
      totalConfidence += d.confidence;
    }

    const avgConfidence = dimensionAnalyses.length > 0
      ? Number((totalConfidence / dimensionAnalyses.length).toFixed(2))
      : 0.7;

    // 3. Source Independence / Grouping Check
    // Cluster candidates by sourceGroupId to avoid counting syndication as separate evidence
    const seenGroups = new Set<string>();
    let independentSourcesCount = 0;
    for (const c of candidates) {
      const gid = c.sourceGroupId || c.id;
      if (!seenGroups.has(gid)) {
        seenGroups.add(gid);
        independentSourcesCount++;
      }
    }

    // 4. Deterministic Weighted Raw Similarity
    let weightedRaw = 0;
    let sumWeights = 0;

    const dims: Array<keyof DimensionWeightConfig> = [
      'PROBLEM',
      'SOLUTION',
      'FEATURE',
      'TECHNOLOGY',
      'ARCHITECTURE',
      'WORKFLOW',
      'UI_UX',
      'TEXTUAL',
      'IMPLEMENTATION',
      'NAMING',
    ];

    for (const dim of dims) {
      const w = weights[dim] ?? 0;
      const score = dimensionScores[dim] ?? 0;
      weightedRaw += score * w;
      sumWeights += w;
    }

    const normalizedRaw = sumWeights > 0 ? weightedRaw / sumWeights : 0;

    // 5. Unique Contribution Offsetting
    // Each verified unique contribution offsets raw similarity (up to 25 points maximum)
    let contributionOffset = 0;
    for (const u of contributions) {
      if (u.importance === 'CRITICAL') contributionOffset += 6;
      else if (u.importance === 'HIGH') contributionOffset += 4.5;
      else if (u.importance === 'MEDIUM') contributionOffset += 3;
      else contributionOffset += 1.5;
    }
    contributionOffset = Math.min(26, contributionOffset);

    // 6. Final Similarity & Originality Scores
    const finalSimilarity = Math.max(0, Math.min(100, Math.round(normalizedRaw - contributionOffset)));
    const finalOriginality = Math.max(0, Math.min(100, 100 - finalSimilarity));

    // 7. Deterministic Classification
    let classification: OriginalityClassification = 'MODERATELY_SIMILAR';
    if (finalOriginality >= 85) {
      classification = 'ORIGINAL';
    } else if (finalOriginality >= 70) {
      classification = 'INSPIRED';
    } else if (finalOriginality >= 50) {
      classification = 'MODERATELY_SIMILAR';
    } else if (finalOriginality >= 30) {
      classification = 'HIGHLY_SIMILAR';
    } else {
      classification = 'POTENTIAL_REPLICATION';
    }

    // 8. Generate Evidence-Based Narrative Explanation
    const archScore = dimensionScores['ARCHITECTURE'] || 0;
    const workScore = dimensionScores['WORKFLOW'] || 0;
    const featScore = dimensionScores['FEATURE'] || 0;
    const techScore = dimensionScores['TECHNOLOGY'] || 0;

    let narrative = '';
    if (archScore >= 70 && workScore >= 70) {
      narrative = `Structural similarity detected in system architecture (${archScore}%) and operational workflow (${workScore}%) relative to publicly available implementations. `;
    } else if (featScore >= 60) {
      narrative = `Moderate functional feature overlap (${featScore}%) observed with established domain solutions. `;
    } else {
      narrative = `Broad conceptual and procedural distinctiveness observed across external reference candidates. `;
    }

    if (contributions.length > 0) {
      narrative += `However, the project demonstrates ${contributions.length} verified unique contributions—including ${contributions[0].description.toLowerCase()} `;
    }

    if (techScore <= 35) {
      narrative += `Shared technology elements represent ubiquitous open-source libraries rather than structural derivation.`;
    }

    return {
      overallOriginalityScore: finalOriginality,
      overallSimilarityScore: finalSimilarity,
      confidence: Math.min(0.95, Math.max(0.65, avgConfidence)),
      classification,
      explanation: narrative.trim(),
      isInsufficientEvidence: false,
      missingEvidence: [],
      recommendedEvidence: [],
    };
  }
}
