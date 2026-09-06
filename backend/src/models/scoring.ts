import type { RubricCategoryKey } from '../config/scoringWeights';

export interface CategoryScore {
  id: string;
  evaluationId: string;
  categoryKey: RubricCategoryKey;
  categoryLabel: string;
  rawScore: number;       // 0 - 100
  weight: number;         // e.g. 0.20
  weightedScore: number;  // rawScore * weight
  confidence: number;     // 0 - 100
  evidenceCount: number;
  explanation: string;
}

export type VerdictRank =
  | 'EXCEPTIONAL'
  | 'STRONG'
  | 'PROMISING'
  | 'NEEDS_IMPROVEMENT'
  | 'WEAK';

export interface FinalJuryVerdict {
  evaluationId: string;
  overallScore: number;
  confidence: number;
  verdict: VerdictRank;
  verdictSummary: string;
  categoryScores: CategoryScore[];
  strongestArea: string;
  weakestArea: string;
  keyDissentNotes?: string[];
  createdAt: string;
}

export interface Risk {
  id: string;
  evaluationId: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'TECHNICAL' | 'ORIGINALITY' | 'FEASIBILITY' | 'REGULATORY' | 'MARKET';
  description: string;
  mitigation: string;
  relatedEvidenceIds: string[];
}

export interface Recommendation {
  id: string;
  evaluationId: string;
  title: string;
  problem: string;
  whyItMatters: string;
  recommendedAction: string;
  expectedImpact: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  relatedEvidenceIds: string[];
}

export interface JudgeQuestion {
  id: string;
  evaluationId: string;
  question: string;
  reason: string;
  relatedClaimId?: string;
  relatedAssessmentCategory?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}
