export type SimilarityDimension =
  | 'PROBLEM'
  | 'SOLUTION'
  | 'FEATURE'
  | 'TECHNOLOGY'
  | 'ARCHITECTURE'
  | 'WORKFLOW'
  | 'UI_UX'
  | 'TEXTUAL'
  | 'IMPLEMENTATION'
  | 'NAMING';

export type CandidateType =
  | 'GITHUB_REPO'
  | 'RESEARCH_PAPER'
  | 'COMMERCIAL_PRODUCT'
  | 'PATENT'
  | 'ACADEMIC_PROJECT'
  | 'VIDEO'
  | 'WEBSITE';

export type OriginalityClassification =
  | 'ORIGINAL'
  | 'INSPIRED'
  | 'MODERATELY_SIMILAR'
  | 'HIGHLY_SIMILAR'
  | 'POTENTIAL_REPLICATION'
  | 'INSUFFICIENT_EVIDENCE';

export type EvidenceStrength =
  | 'VERY_WEAK'
  | 'WEAK'
  | 'MODERATE'
  | 'STRONG'
  | 'VERY_STRONG';

export type TimelineRelationship =
  | 'PRECEDES_PROJECT'
  | 'AFTER_PROJECT'
  | 'UNKNOWN';

export interface DimensionWeightConfig {
  PROBLEM: number;        // default 0.05
  SOLUTION: number;       // default 0.15
  FEATURE: number;        // default 0.15
  TECHNOLOGY: number;     // default 0.05
  ARCHITECTURE: number;   // default 0.20
  WORKFLOW: number;       // default 0.15
  UI_UX: number;          // default 0.10
  TEXTUAL: number;        // default 0.05
  IMPLEMENTATION: number; // default 0.10
  NAMING: number;         // default 0.00
}

export const DEFAULT_DIMENSION_WEIGHTS: DimensionWeightConfig = {
  PROBLEM: 0.05,
  SOLUTION: 0.15,
  FEATURE: 0.15,
  TECHNOLOGY: 0.05,
  ARCHITECTURE: 0.20,
  WORKFLOW: 0.15,
  UI_UX: 0.10,
  TEXTUAL: 0.05,
  IMPLEMENTATION: 0.10,
  NAMING: 0.00,
};

export interface SimilarityCandidate {
  id: string;
  evaluationId: string;
  sourceId?: string;
  candidateType: CandidateType;
  title: string;
  organization?: string;
  description: string;
  url?: string;
  publicationDate?: string;
  content?: string;
  features: string[];
  technologies: string[];
  architecture: {
    nodes?: string[];
    pipeline?: string[];
    relationships?: Array<{ from: string; to: string; type?: string }>;
  };
  workflow: string[];
  confidence: number;
  relevanceScore: number;
  sourceGroupId?: string;
  createdAt?: string;
}

export interface DimensionAnalysis {
  id: string;
  originalityProfileId: string;
  candidateId?: string;
  dimension: SimilarityDimension;
  score: number; // 0-100
  confidence: number; // 0-1
  matchedElements: string[];
  differentElements: string[];
  evidenceIds: string[];
  explanation: string;
  createdAt?: string;
}

export interface UniqueContribution {
  id: string;
  evaluationId: string;
  description: string;
  contributionType: string;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  evidenceIds: string[];
  createdAt?: string;
}

export interface CandidateTimelineContext {
  id: string;
  evaluationId: string;
  candidateId: string;
  candidateDate?: string;
  projectEvidenceDate?: string;
  relationship: TimelineRelationship;
  confidence: number;
  notes?: string;
  createdAt?: string;
}

export interface SimilarityGraphEdge {
  id: string;
  evaluationId: string;
  sourceNode: string;
  targetNode: string;
  dimension: SimilarityDimension | string;
  similarityType: string;
  similarityScore: number;
  differencesSummary?: string;
  evidenceId?: string;
  candidateId?: string;
  createdAt?: string;
}

export interface OriginalityProfile {
  id: string;
  evaluationId: string;
  overallOriginalityScore: number; // 0-100
  overallSimilarityScore: number;  // 0-100
  confidence: number;              // 0-1
  classification: OriginalityClassification;
  dimensionWeights: DimensionWeightConfig;
  explanation: string;
  status: 'QUEUED' | 'ANALYZING' | 'COMPLETED' | 'INSUFFICIENT_EVIDENCE' | 'FAILED';
  availableEvidence?: string[];
  missingEvidence?: string[];
  recommendedEvidence?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ComparisonTableRow {
  candidateId: string;
  title: string;
  candidateType: CandidateType;
  organization?: string;
  url?: string;
  publicationDate?: string;
  sourceQuality: EvidenceStrength;
  problemScore: number;
  technologyScore: number;
  architectureScore: number;
  featureScore: number;
  overallSimilarity: number;
  differencesSummary: string[];
  keyEvidenceIds: string[];
}

export interface OriginalityBundle {
  profile: OriginalityProfile;
  dimensions: DimensionAnalysis[];
  candidates: SimilarityCandidate[];
  candidateDimensions: Record<string, DimensionAnalysis[]>;
  contributions: UniqueContribution[];
  timelineContexts: CandidateTimelineContext[];
  graphEdges: SimilarityGraphEdge[];
  comparisonTable: ComparisonTableRow[];
}
