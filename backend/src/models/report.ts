import type { ProjectDNA, TechnicalAssessment } from './assessments';
import type { MasterCategoryScore, VerdictQualifier } from './masterScoring';

export type ReportStatus = 'DRAFT' | 'GENERATING' | 'READY' | 'WARNING' | 'FAILED' | 'FINAL';
export type ProjectStage = 'Concept' | 'Prototype' | 'Validated Prototype' | 'Pilot Ready' | 'Deployment Ready' | 'Production Ready';

export interface ReportQualityCheck {
  overallScore: number; // 0-100
  rating: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'DEFICIENT';
  completeness: number; // 0-100
  evidenceLinking: number; // 0-100
  citationValidity: number; // 0-100
  consistency: number; // 0-100
  readability: number; // 0-100
  issues: string[];
}

export interface ReportConsistencyCheck {
  status: 'VERIFIED' | 'WARNING';
  passedCount: number;
  totalChecks: number;
  warnings: string[];
  details: {
    scoreMatchesEngine: boolean;
    categoriesSum100: boolean;
    verdictMatchesThreshold: boolean;
    claimsCountMatchesEngine: boolean;
    originalityMatchesEngine: boolean;
    allEvidenceIdsResolve: boolean;
    allSourcesExist: boolean;
    recommendationsReferenceRealRisks: boolean;
  };
}

export interface ReportExecutiveSummary {
  projectName: string;
  projectType: string;
  domain: string;
  stage: ProjectStage;
  overallScore: number;
  verdict: string;
  confidence: number;
  evidenceCoverage: number;
  status: ReportStatus;
  coreSummary: string;
  primaryStrengths: string[];
  primaryWeaknesses: string[];
  mostImportantConcern: string;
  topRecommendation: string;
  authoritativeVerdictQuote: string;
}

export interface ReportProjectProfile {
  name: string;
  teamName: string;
  domain: string;
  projectType: string;
  stage: ProjectStage;
  evaluationMode: string;
  problemSummary: string;
  solutionSummary: string;
  targetUsers: string[];
  primaryTechnologies: string[];
}

export interface ReportProblemAnalysis {
  statement: string;
  severityScore: number;
  targetDemographics: string;
  marketNeedJustification: string;
  observableConsequences: string[];
  priorUnsuccessfulApproaches: string[];
  supportingEvidenceIds: string[];
}

export interface ReportScoreExplanation {
  categoryKey: string;
  categoryLabel: string;
  rawScore: number;
  weight: number;
  weightedScore: number;
  confidence: number;
  evidenceCount: number;
  whyThisScore: string;
  supportingEvidence: string[];
  limitingFactors: string[];
  improvementPath: string[];
}

export interface ReportTechnicalSection {
  architectureSummary: string;
  algorithms: string[];
  aiModelEvaluation?: {
    modelType: string;
    precision: string;
    throughputFps: number;
    latencyMs: number;
    datasetOrigin: string;
    overfittingRisk: string;
  };
  hardwareArchitecture?: {
    components: string[];
    powerConsumptionWatts: number;
    thermalMargins: string;
    pcbDesignNotes: string;
    manufacturingReadiness: string;
  };
  dataPipelines: string;
  securityAssessment: string;
  performanceMetrics: Record<string, any>;
  scalabilitySummary: string;
  testingFidelity: string;
  assessments: TechnicalAssessment[];
  evidenceGaps: string[];
}

export interface ReportOriginalitySection {
  originalityScore: number;
  similarityScore: number;
  confidence: number;
  classification: 'ORIGINAL' | 'INSPIRED' | 'MODERATELY_SIMILAR' | 'HIGHLY_SIMILAR' | 'POTENTIAL_REPLICATION' | 'INSUFFICIENT_EVIDENCE';
  strongestSimilarities: Array<{ targetName: string; similarityScore: number; description: string }>;
  majorDifferences: string[];
  uniqueContributions: string[];
  candidateProjectsCount: number;
  timelineAnalysis: string;
  methodologyNote: string;
}

export interface ReportClaimVerificationSection {
  totalClaims: number;
  verifiedCount: number;
  partiallyVerifiedCount: number;
  unverifiedCount: number;
  contradictedCount: number;
  insufficientEvidenceCount: number;
  highImportanceClaims: Array<{
    id: string;
    claimText: string;
    status: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'UNVERIFIED' | 'CONTRADICTED' | 'INSUFFICIENT_EVIDENCE';
    confidence: number;
    evidenceIds: string[];
    evidenceGaps: string[];
    judgeQuestion?: string;
  }>;
}

export interface ReportPresentationSection {
  clarityScore: number;
  speechRateWpm: number;
  confidenceIndicator: number;
  structureScore: number;
  timeManagementScore: number;
  fillerWordsPerMinute: number;
  technicalDepthScore: number;
  observableSummary: string;
  strengths: string[];
  areasForImprovement: string[];
}

export interface ReportDemonstrationSection {
  demoScore: number;
  completenessPercentage: number;
  demonstratedFeatures: Array<{
    name: string;
    status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'NOT_DEMONSTRATED';
    timestamp: string; // e.g. "06:33"
    evidenceId?: string;
    notes: string;
  }>;
  operationalEnvironment: string;
  unsupportedClaims: string[];
}

export interface ReportImpactSection {
  socialImpactScore: number;
  economicImpactScore: number;
  environmentalImpactScore: number;
  accessibilityScore: number;
  publicBenefitScore: number;
  compositeScore: number;
  confidence: number;
  beneficiariesEstimate: string;
  economicValueEstimate: string;
  environmentalNotes: string;
  evidenceIds: string[];
}

export interface ReportFeasibilitySection {
  technicalFeasibility: number;
  economicFeasibility: number;
  operationalFeasibility: number;
  deploymentReadinessScore: number;
  scalabilityScore: number;
  commercialPotentialScore: number;
  deploymentBlockers: string[];
  costEvidenceSummary: string;
  infrastructureRequirements: string[];
  maintenanceConsiderations: string[];
}

export interface ReportRiskItem {
  id: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  description: string;
  mitigation: string;
  evidenceIds: string[];
}

export interface ReportRecommendationItem {
  rank: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  problem: string;
  action: string;
  whyItMatters: string;
  expectedBenefit: string;
  relatedEvidenceIds: string[];
}

export interface ReportRoadmapStage {
  stage: 'CURRENT' | 'NEXT' | 'PILOT' | 'PRODUCTION' | 'SCALE';
  title: string;
  targetTimeline: string;
  requirements: string[];
  majorBlockers: string[];
  recommendedCapabilities: string[];
}

export interface ReportCommercializationSection {
  targetUsers: string[];
  potentialCustomers: string[];
  valueProposition: string;
  competitiveLandscape: string;
  differentiation: string[];
  deploymentModel: string;
  commercialRisks: string[];
}

export interface ReportJudgeQuestionItem {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  question: string;
  reason: string;
  category: string;
  relatedIssueId?: string;
  relatedClaimId?: string;
  relatedEvidenceId?: string;
}

export interface ReportSourceCitation {
  citationId: string; // e.g. "[Source 1]"
  sourceId: string;
  title: string;
  publisher: string;
  url?: string;
  publicationDate?: string;
  location?: string;
  quality: 'PEER_REVIEWED' | 'GOVERNMENT_STANDARD' | 'BENCHMARK' | 'INDUSTRY_SPEC' | 'PROPRIETARY';
  relevance: 'DIRECT_CORROBORATION' | 'PRIOR_ART' | 'METRIC_BASELINE' | 'MARKET_DATA';
  relatedFinding: string;
}

export interface ReportEvidenceIndexItem {
  id: string;
  type: string;
  source: string;
  location: string;
  directSourceContent: string;
  aiInterpretation: string;
  confidence: number;
  relatedCategory: string;
  relatedClaimId?: string;
  relatedScoreKey?: string;
}

export interface ReportSections {
  executiveSummary: ReportExecutiveSummary;
  projectProfile: ReportProjectProfile;
  problemAnalysis: ReportProblemAnalysis;
  projectDNA: ProjectDNA;
  scoreBreakdown: {
    overallScore: number;
    verdict: string;
    confidence: number;
    evidenceCoverage: number;
    categories: MasterCategoryScore[];
  };
  scoreExplanation: ReportScoreExplanation[];
  technicalAssessment: ReportTechnicalSection;
  originalityAssessment: ReportOriginalitySection;
  claimVerification: ReportClaimVerificationSection;
  presentationAnalysis: ReportPresentationSection;
  demonstrationAnalysis: ReportDemonstrationSection;
  impactAssessment: ReportImpactSection;
  feasibilityAssessment: ReportFeasibilitySection;
  riskAssessment: ReportRiskItem[];
  recommendations: ReportRecommendationItem[];
  futureScope: ReportRoadmapStage[];
  commercialization: ReportCommercializationSection;
  judgeQuestions: ReportJudgeQuestionItem[];
  evidenceSummary: {
    totalEvidenceCount: number;
    coverageScore: number;
    reliabilityScore: string;
    evidenceIndex: ReportEvidenceIndexItem[];
  };
  researchSummary: {
    totalSources: number;
    synthesisOverview: string;
    citations: ReportSourceCitation[];
  };
  limitations: string[];
  finalVerdict: {
    verdictRank: string;
    verdictHeadline: string;
    officialStatement: string;
    ratifiedBy: string;
    ratifiedDate: string;
    qualifiers: VerdictQualifier[];
    consensusHash: string;
  };
}

export interface ReportSectionItem {
  sectionIndex: number; // 0 to 19 (1-indexed: 1 to 20)
  key: string;
  title: string;
  category: string;
  status: 'GENERATED' | 'FALLBACK_GENERATED' | 'DEGRADED';
  data: any;
  error?: string;
  renderType: string;
}

export interface EvaluationReport {
  id: string;
  evaluationId: string;
  version: number;
  status: ReportStatus;
  title: string;
  projectName: string;
  projectType: string;
  teamName: string;
  domain: string;
  overallScore: number;
  overallVerdict: string;
  overallConfidence: number;
  evidenceCoverage: number;
  generatedAt: string;
  engineVersion: string;
  rubricVersion: string;
  qualityCheck: ReportQualityCheck;
  consistencyCheck: ReportConsistencyCheck;
  sections: ReportSections;
  sectionsArray?: ReportSectionItem[]; // Guaranteed exactly 20 canonical sections
  generationErrors?: string[];
}


export interface ReportShare {
  id: string;
  evaluationId: string;
  reportId: string;
  token: string;
  permissions: 'VIEW_ONLY';
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface ReportVersionMeta {
  version: number;
  reportId: string;
  overallScore: number;
  verdict: string;
  confidence: number;
  coverage: number;
  status: ReportStatus;
  changesSummary: string;
  newEvidenceCount: number;
  changedClaimsCount: number;
  generatedAt: string;
}

export interface ReportDiff {
  v1Version: number;
  v2Version: number;
  scoreDifference: number;
  verdictChanged: boolean;
  previousVerdict: string;
  currentVerdict: string;
  addedEvidenceIds: string[];
  categoryScoreDiffs: Record<string, { v1: number; v2: number; delta: number }>;
  reclassifiedClaims: Array<{ claimId: string; fromStatus: string; toStatus: string }>;
  newRecommendations: string[];
}
