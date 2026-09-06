export type CanonicalCategoryKey =
  | 'problemNeed'
  | 'technicalQuality'
  | 'originality'
  | 'socialImpact'
  | 'presentation'
  | 'demonstration'
  | 'feasibilityScalability'
  | 'futurePotential';

export interface RubricCategoryDefinition {
  key: CanonicalCategoryKey;
  label: string;
  defaultWeight: number; // 0-100
  description: string;
  evaluationSources: string[];
}

export const CANONICAL_RUBRIC_CATEGORIES: Record<CanonicalCategoryKey, RubricCategoryDefinition> = {
  problemNeed: {
    key: 'problemNeed',
    label: 'Problem & Need',
    defaultWeight: 15,
    description: 'Urgency, scale, societal relevance, and problem-solution alignment based on documented problem statements and research benchmarking.',
    evaluationSources: ['Project DNA', 'Document Intelligence', 'Research Intelligence', 'Claim Verification'],
  },
  technicalQuality: {
    key: 'technicalQuality',
    label: 'Technical Quality',
    defaultWeight: 20,
    description: 'Architectural rigor, engineering maturity, modularity, AI/algorithmic integrity, and codebase/hardware design quality.',
    evaluationSources: ['Technical Auditor', 'AI Model Evaluator', 'Codebase Audits', 'Architecture Topologies'],
  },
  originality: {
    key: 'originality',
    label: 'Innovation & Originality',
    defaultWeight: 15,
    description: 'Novelty across 10 multi-faceted dimensions, patent and academic precedence, and verified unique contributions.',
    evaluationSources: ['Originality Intelligence Engine', 'Similarity Candidates', 'Unique Contributions'],
  },
  socialImpact: {
    key: 'socialImpact',
    label: 'Social Impact',
    defaultWeight: 15,
    description: 'Direct and indirect societal benefit, accessibility, environmental sustainability, and public value generation.',
    evaluationSources: ['Impact Evaluator', 'Research Intelligence', 'Societal Stakeholder Analysis'],
  },
  presentation: {
    key: 'presentation',
    label: 'Presentation',
    defaultWeight: 10,
    description: 'Clarity, narrative structure, speech cadence, absence of excessive fillers, and transparent communication of concepts.',
    evaluationSources: ['Multimodal Video Analysis', 'Speech Metrics', 'Pitch Deck Intelligence'],
  },
  demonstration: {
    key: 'demonstration',
    label: 'Demonstration Quality',
    defaultWeight: 10,
    description: 'Empirical execution completeness, live feature demonstrations, error-free operations, and claim-to-demo fidelity.',
    evaluationSources: ['Demo Observations', 'Claim-Demo Matches', 'Video Analysis Timeline'],
  },
  feasibilityScalability: {
    key: 'feasibilityScalability',
    label: 'Feasibility & Scalability',
    defaultWeight: 10,
    description: 'Production readiness, deployment economics, scalability limits, infrastructure complexity, and realistic roadmap.',
    evaluationSources: ['Feasibility Evaluator', 'Cost Categorization', 'Deployment Roadmap'],
  },
  futurePotential: {
    key: 'futurePotential',
    label: 'Future Potential',
    defaultWeight: 5,
    description: 'Long-term extensibility, market trajectory, research follow-through, and architectural expansion capacity.',
    evaluationSources: ['Evaluator Maturity Model', 'Research Benchmarks', 'Strategic Roadmap'],
  },
};

export const DEFAULT_WEIGHTS: Record<CanonicalCategoryKey, number> = {
  problemNeed: 15,
  technicalQuality: 20,
  originality: 15,
  socialImpact: 15,
  presentation: 10,
  demonstration: 10,
  feasibilityScalability: 10,
  futurePotential: 5,
};

export interface VerdictThresholdRule {
  verdict: 'EXCEPTIONAL' | 'STRONG' | 'PROMISING' | 'NEEDS_IMPROVEMENT' | 'WEAK';
  minScore: number;
  maxScore: number;
  label: string;
  description: string;
}

export const DEFAULT_VERDICT_THRESHOLDS: VerdictThresholdRule[] = [
  {
    verdict: 'EXCEPTIONAL',
    minScore: 90,
    maxScore: 100,
    label: 'Exceptional (Tier 1 Consensus)',
    description: 'Breakthrough work meeting publication or production standards with verified empirical evidence across all dimensions.',
  },
  {
    verdict: 'STRONG',
    minScore: 80,
    maxScore: 89.999,
    label: 'Strong (Tier 2 High Caliber)',
    description: 'High-caliber execution with solid technical grounding and proven utility, subject to targeted deployment remediations.',
  },
  {
    verdict: 'PROMISING',
    minScore: 70,
    maxScore: 79.999,
    label: 'Promising (Tier 3 Incubation)',
    description: 'Solid concept with demonstrable capabilities, but requiring further independent validation or performance hardening.',
  },
  {
    verdict: 'NEEDS_IMPROVEMENT',
    minScore: 50,
    maxScore: 69.999,
    label: 'Needs Improvement (Tier 4 Remediation)',
    description: 'Material gaps observed between claimed functionality and empirical results, or significant architectural vulnerabilities.',
  },
  {
    verdict: 'WEAK',
    minScore: 0,
    maxScore: 49.999,
    label: 'Weak (Tier 5 Non-Viable)',
    description: 'Unverifiable claims, irreproducible demonstration, severe originality deficits, or unaddressed critical flaws.',
  },
];

/**
 * Validates that weights sum to exactly 100% (within floating point precision)
 */
export function validateWeightsSum(weights: Record<string, number>): boolean {
  const sum = Object.values(weights).reduce((acc, w) => acc + w, 0);
  return Math.abs(sum - 100) < 0.0001;
}
