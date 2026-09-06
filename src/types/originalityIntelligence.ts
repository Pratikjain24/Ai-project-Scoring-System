export type OriginalityTier =
  | 'original'
  | 'inspired'
  | 'moderately-similar'
  | 'highly-similar'
  | 'potential-replication'
  | 'Original'
  | 'Inspired'
  | 'Moderately Similar'
  | 'Highly Similar'
  | 'Potential Replication';

export type PriorArtSourceCategory =
  | 'github'
  | 'research-papers'
  | 'patents'
  | 'products'
  | 'startups'
  | 'websites'
  | 'youtube'
  | 'academic-projects';

export interface MatchingComponent {
  name: string;
  description: string;
  parityLevel: 'conceptual' | 'structural' | 'algorithmic' | 'exact-match';
}

export interface PriorArtItem {
  id: string;
  title: string;
  entityOrAuthors: string;
  releaseDate: string; // YYYY-MM-DD
  year: number;
  sourceCategory: PriorArtSourceCategory;
  sourceUrl: string;
  similarityPercentage: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  label: OriginalityTier;
  matchingComponents: MatchingComponent[];
  similarityExplanation: string;
  differentiationSummary: string;
  verbatimExcerpt: string;
  provenanceRef: string;
}

export interface CategorySummaryStats {
  category: PriorArtSourceCategory;
  label: string;
  itemCount: number;
  averageSimilarity: number;
  maxSimilarity: number;
  confidence: number;
  topMatches: string[];
}

export interface OriginalityReport {
  projectId: string;
  projectName: string;
  projectType: 'software' | 'hardware';
  originalityScore: number; // e.g. 86.4
  similarityScore: number; // e.g. 13.6
  confidenceScore: number; // e.g. 96.8
  verdictSynthesis: string;
  disclaimer: string;
  scannedCorpusCount: string; // e.g. "4.2M Repositories, 180k Papers, 1.2M Patents"
  timestamp: string;
  categoryStats: Record<PriorArtSourceCategory, CategorySummaryStats>;
  priorArtItems: PriorArtItem[];
}

// ============================================================================
// PHASE 6: ORIGINALITY & MULTI-DIMENSIONAL SIMILARITY INTELLIGENCE ENGINE
// ============================================================================

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
  PROBLEM: number;
  SOLUTION: number;
  FEATURE: number;
  TECHNOLOGY: number;
  ARCHITECTURE: number;
  WORKFLOW: number;
  UI_UX: number;
  TEXTUAL: number;
  IMPLEMENTATION: number;
  NAMING: number;
}

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
  score: number;
  confidence: number;
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
  overallOriginalityScore: number;
  overallSimilarityScore: number;
  confidence: number;
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

