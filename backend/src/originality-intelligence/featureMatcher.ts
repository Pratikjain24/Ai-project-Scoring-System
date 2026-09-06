/**
 * Feature Matcher
 * Compares functional feature sets between project and candidate,
 * calculating overlap ratio while isolating project-unique features.
 */

export interface FeatureMatchResult {
  score: number; // 0 - 100
  matchedFeatures: Array<{ projectFeature: string; candidateFeature: string; similarity: number }>;
  uniqueProjectFeatures: string[];
  uniqueCandidateFeatures: string[];
  explanation: string;
}

export class FeatureMatcher {
  private static tokenize(text: string): Set<string> {
    return new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2)
    );
  }

  private static calculateJaccard(s1: Set<string>, s2: Set<string>): number {
    if (s1.size === 0 || s2.size === 0) return 0;
    let intersection = 0;
    for (const item of s1) {
      if (s2.has(item)) intersection++;
    }
    const union = s1.size + s2.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  static compare(projectFeatures: string[], candidateFeatures: string[]): FeatureMatchResult {
    if (!projectFeatures.length && !candidateFeatures.length) {
      return {
        score: 0,
        matchedFeatures: [],
        uniqueProjectFeatures: [],
        uniqueCandidateFeatures: [],
        explanation: 'No feature sets available for comparison.',
      };
    }

    const matchedPairs: Array<{ projectFeature: string; candidateFeature: string; similarity: number }> = [];
    const matchedProjectIndices = new Set<number>();
    const matchedCandidateIndices = new Set<number>();

    const projTokens = projectFeatures.map(f => this.tokenize(f));
    const candTokens = candidateFeatures.map(f => this.tokenize(f));

    for (let i = 0; i < projectFeatures.length; i++) {
      let bestMatchIdx = -1;
      let highestSim = 0;

      for (let j = 0; j < candidateFeatures.length; j++) {
        const sim = this.calculateJaccard(projTokens[i], candTokens[j]);
        // Also check substring or strong keyword containment
        const sub1 = projectFeatures[i].toLowerCase();
        const sub2 = candidateFeatures[j].toLowerCase();
        let boost = 0;
        if (sub1.includes(sub2) || sub2.includes(sub1)) boost = 0.3;

        const effectiveSim = Math.min(1.0, sim + boost);
        if (effectiveSim > 0.35 && effectiveSim > highestSim) {
          highestSim = effectiveSim;
          bestMatchIdx = j;
        }
      }

      if (bestMatchIdx !== -1 && !matchedCandidateIndices.has(bestMatchIdx)) {
        matchedPairs.push({
          projectFeature: projectFeatures[i],
          candidateFeature: candidateFeatures[bestMatchIdx],
          similarity: Math.round(highestSim * 100),
        });
        matchedProjectIndices.add(i);
        matchedCandidateIndices.add(bestMatchIdx);
      }
    }

    const uniqueProjectFeatures = projectFeatures.filter((_, idx) => !matchedProjectIndices.has(idx));
    const uniqueCandidateFeatures = candidateFeatures.filter((_, idx) => !matchedCandidateIndices.has(idx));

    const totalFeatures = Math.max(1, projectFeatures.length);
    const score = Math.min(100, Math.round((matchedPairs.length / totalFeatures) * 100));

    let explanation = '';
    if (matchedPairs.length === projectFeatures.length && projectFeatures.length > 0) {
      explanation = `High functional overlap (${matchedPairs.length}/${totalFeatures} features matched). No novel features detected in this subsystem.`;
    } else if (matchedPairs.length > 0) {
      explanation = `Partial feature overlap (${matchedPairs.length}/${totalFeatures} features matched). ${uniqueProjectFeatures.length} unique project features identified.`;
    } else {
      explanation = `Distinct feature capabilities. Zero significant overlap with candidate implementation.`;
    }

    return {
      score,
      matchedFeatures: matchedPairs,
      uniqueProjectFeatures,
      uniqueCandidateFeatures,
      explanation,
    };
  }
}
