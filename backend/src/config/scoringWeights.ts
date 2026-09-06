export const SCORING_WEIGHTS = {
  problemNeed: 0.15,          // 15%
  technicalQuality: 0.20,     // 20%
  originality: 0.15,          // 15%
  socialImpact: 0.15,         // 15%
  presentation: 0.10,         // 10%
  demonstration: 0.10,        // 10%
  feasibilityScalability: 0.10,// 10%
  futurePotential: 0.05,      // 5%
} as const;

export type RubricCategoryKey = keyof typeof SCORING_WEIGHTS;

export const RUBRIC_LABELS: Record<RubricCategoryKey, string> = {
  problemNeed: 'Problem & Need',
  technicalQuality: 'Technical Quality',
  originality: 'Innovation & Originality',
  socialImpact: 'Social Impact',
  presentation: 'Presentation',
  demonstration: 'Demonstration',
  feasibilityScalability: 'Feasibility & Scalability',
  futurePotential: 'Future Potential',
};

// Validate that sum of weights strictly equals 1.0 (100%)
export function validateWeights(): boolean {
  const sum = Object.values(SCORING_WEIGHTS).reduce((acc, w) => acc + w, 0);
  return Math.abs(sum - 1.0) < 0.0001;
}
