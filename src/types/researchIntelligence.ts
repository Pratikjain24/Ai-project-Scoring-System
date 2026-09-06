export type ResearchSourceType =
  | 'ACADEMIC'
  | 'GITHUB'
  | 'PATENT'
  | 'COMPANY'
  | 'PRODUCT'
  | 'GOVERNMENT'
  | 'NEWS'
  | 'DOCUMENTATION'
  | 'BLOG'
  | 'FORUM'
  | 'VIDEO'
  | 'OTHER';

export type PrimarySecondaryNature = 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'UNKNOWN';
export type SourceAvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'PAYWALLED' | 'REDIRECTED';

export type ResearchQuestionCategory =
  | 'SIMILARITY'
  | 'COMPETITORS'
  | 'ACADEMIC'
  | 'BENCHMARKS'
  | 'PATENTS'
  | 'PROBLEM_SCALE'
  | 'LIMITATIONS'
  | 'CLAIM_VERIFICATION'
  | 'MARKET'
  | 'IMPACT'
  | 'FEASIBILITY';

export type ResearchPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ResearchPlan {
  id: string;
  evaluationId: string;
  projectId: string;
  searchTopics: string[];
  sourceTypes: ResearchSourceType[];
  priority: ResearchPriority;
  expectedEvidence: string[];
  createdAt: string;
}

export interface ResearchQuestion {
  id: string;
  evaluationId: string;
  planId?: string;
  questionText: string;
  category: ResearchQuestionCategory;
  priority: ResearchPriority;
  status: 'PENDING' | 'RESEARCHING' | 'ANSWERED' | 'INSUFFICIENT_EVIDENCE';
  createdAt: string;
}

export type QueryPurpose =
  | 'GENERAL'
  | 'TECHNICAL'
  | 'ORIGINALITY'
  | 'CLAIM_VERIFICATION'
  | 'MARKET'
  | 'IMPACT'
  | 'FEASIBILITY'
  | 'PATENT'
  | 'ACADEMIC'
  | 'OPEN_SOURCE'
  | 'COMPETITIVE';

export interface ResearchQuery {
  id: string;
  evaluationId: string;
  questionId?: string;
  queryText: string;
  purpose: QueryPurpose;
  priority: ResearchPriority;
  status: 'QUEUED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface ResearchSourceItem {
  id: string;
  evaluationId: string;
  url: string;
  canonicalUrl?: string;
  title: string;
  description?: string;
  domain?: string;
  sourceType: ResearchSourceType;
  author?: string;
  publisher?: string;
  publicationDate?: string;
  lastUpdated?: string;
  content?: string;
  language?: string;
  authorityScore: number;
  relevanceScore: number;
  qualityScore: number;
  primarySecondaryNature: PrimarySecondaryNature;
  availabilityStatus: SourceAvailabilityStatus;
  overallRank: number;
  metadata?: Record<string, any>;
  retrievedAt: string;
  createdAt: string;
}

export interface ResearchSourceEvidence {
  id: string;
  sourceId: string;
  evaluationId: string;
  researchQuestionId?: string;
  claimId?: string;
  excerptText: string;
  text?: string;
  relatedClaim?: string;
  context?: string;
  location?: string;
  confidence: number;
  isDirectQuote: boolean;
  sourceTitle?: string;
  sourceUrl?: string;
  createdAt: string;
}

export type ResearchFindingType =
  | 'EXISTING_SOLUTION'
  | 'TECHNICAL_FACT'
  | 'COMPETING_PRODUCT'
  | 'SIMILAR_PROJECT'
  | 'ACADEMIC_RESEARCH'
  | 'PATENT'
  | 'MARKET_INFORMATION'
  | 'IMPACT_EVIDENCE'
  | 'LIMITATION'
  | 'RISK'
  | 'BENCHMARK'
  | 'OTHER';

export interface ResearchFinding {
  id: string;
  evaluationId: string;
  researchQuestionId?: string;
  summary: string;
  findingType: ResearchFindingType;
  confidence: number;
  evidenceIds: string[];
  relatedClaims?: string[];
  relatedTechnologies?: string[];
  relatedFeatures?: string[];
}

export interface ResearchReportSummary {
  researchOverview: string;
  majorFindings: string[];
  similarProjectsCount: number;
  commercialSolutionsCount: number;
  academicPapersCount: number;
  patentsCount: number;
  highQualitySourcesCount: number;
  totalSourcesCount: number;
  contradictionsCount: number;
  evidenceGaps: string[];
  researchLimitations: string[];
}

export type SolutionType = 'OPEN_SOURCE' | 'COMMERCIAL_PRODUCT' | 'ACADEMIC_PROTOTYPE' | 'STARTUP' | 'RESEARCH_SYSTEM';
export type SimilarityClassification = 'RELATED' | 'SIMILAR' | 'DIRECTLY_COMPETITIVE' | 'COMPLEMENTARY' | 'UNKNOWN';

export interface SimilarProject {
  id: string;
  evaluationId: string;
  sourceId?: string;
  name: string;
  organization?: string;
  solutionType: SolutionType;
  classification: SimilarityClassification;
  description: string;
  matchingFeatures: string[];
  differences: string[];
  technologies?: string[];
  targetUsers?: string[];
  availability?: string;
  confidence: number;
  sourceUrl?: string;
  createdAt: string;
}

export interface AcademicPaper {
  id: string;
  sourceId: string;
  evaluationId: string;
  title: string;
  authors: string[];
  year: number;
  publisher?: string;
  doi?: string;
  abstract: string;
  methods?: string[];
  datasets?: string[];
  benchmarkedMetrics?: Record<string, string>;
  limitations?: string;
  sourceUrl?: string;
  createdAt: string;
}

export interface PatentRecord {
  id: string;
  sourceId?: string;
  evaluationId: string;
  patentNumber: string;
  title: string;
  applicant: string;
  inventor?: string;
  filingDate?: string;
  publicationDate?: string;
  status: string;
  summary: string;
  relevantClaims: string[];
  sourceUrl?: string;
  createdAt: string;
}

export interface CrossSourceContradiction {
  id: string;
  evaluationId: string;
  sourceAId: string;
  sourceBId: string;
  topic: string;
  statementA: string;
  statementB: string;
  differenceExplanation: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  sourceATitle?: string;
  sourceBTitle?: string;
  createdAt: string;
}

export interface ProblemValidationResult {
  problemExists: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  scale: string;
  affectedUsers: string;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  confidence: number;
  status: 'CONFIRMED' | 'INSUFFICIENT_EVIDENCE';
  evidenceIds: string[];
  summary: string;
}

export interface TechnologyBenchmarkResult {
  technology: string;
  alternatives: string[];
  benchmarks: Array<{
    metric: string;
    targetValue: string;
    competitorOrAlternative: string;
    tradeoffNotes: string;
  }>;
  tradeoffs: string[];
  evidenceIds: string[];
}

export interface ResearchIntelligenceBundle {
  evaluationId: string;
  plan: ResearchPlan;
  questions: ResearchQuestion[];
  queries: ResearchQuery[];
  sources: ResearchSourceItem[];
  evidence: ResearchSourceEvidence[];
  similarProjects: SimilarProject[];
  academicPapers: AcademicPaper[];
  patents: PatentRecord[];
  contradictions: CrossSourceContradiction[];
  problemValidation: ProblemValidationResult;
  technologyBenchmarks: TechnologyBenchmarkResult[];
  findings?: ResearchFinding[];
  summary?: ResearchReportSummary;
  statistics: {
    sourcesFound: number;
    highQualitySources: number;
    researchQuestionsCount: number;
    potentialSimilarProjectsCount: number;
    claimsResearchedCount: number;
    researchCoverageScore: number;
    averageSourceQuality: number;
    averageFindingConfidence: number;
  };
}
