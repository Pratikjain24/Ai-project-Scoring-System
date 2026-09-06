export type JuryVerdictLevel = 
  | 'Exceptional' 
  | 'Strong' 
  | 'Promising' 
  | 'Needs Improvement' 
  | 'Weak';

export type DimensionId = 
  | 'problem-need'
  | 'technical-quality'
  | 'innovation-originality'
  | 'social-impact'
  | 'presentation'
  | 'demonstration-quality'
  | 'feasibility-scalability'
  | 'future-potential';

export type CanonicalCategoryKey =
  | 'problemNeed'
  | 'technicalQuality'
  | 'originality'
  | 'socialImpact'
  | 'presentation'
  | 'demonstration'
  | 'feasibilityScalability'
  | 'futurePotential';

export type CategoryAssessmentStatus = 'ASSESSED' | 'PARTIALLY_ASSESSED' | 'NOT_ASSESSED';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';

export type VerdictRank = 'EXCEPTIONAL' | 'STRONG' | 'PROMISING' | 'NEEDS_IMPROVEMENT' | 'WEAK';

export type QualifierType =
  | 'HIGH_RISK'
  | 'LOW_CONFIDENCE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'STRONG_ORIGINALITY_CONCERNS'
  | 'DEPLOYMENT_BARRIER'
  | 'UNVERIFIED_MAJOR_CLAIMS';

export interface VerdictQualifier {
  type: QualifierType;
  label: string;
  reason: string;
}

export interface MasterCategoryScore {
  id: string;
  evaluationId: string;
  categoryKey: CanonicalCategoryKey;
  categoryLabel: string;
  rawScore: number;       // 0-100 full precision
  weight: number;         // e.g. 20 (meaning 20%)
  weightedScore: number;  // rawScore * weight / 100
  confidence: number;     // 0-100
  evidenceCount: number;
  evidenceCoverage: number; // 0-100%
  status: CategoryAssessmentStatus;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  evidenceIds: string[];
  whyThisScore: string;
  createdAt?: string;
}

export interface ConfidenceFactorBreakdown {
  overallConfidence: number; // 0-100
  confidenceLevel: ConfidenceLevel;
  factors: {
    evidenceCoverage: number;
    evidenceQuality: number;
    sourceDiversity: number;
    assessmentConsistency: number;
    directObservationCoverage: number;
    unresolvedClaimDeduction: number;
    missingCriticalEvidenceDeduction: number;
  };
  narrativeExplanation: string;
}

export interface EvidenceCoverageBreakdown {
  overallCoverage: number; // 0-100%
  categoryCoverage: Record<CanonicalCategoryKey, number>;
  totalExpectedArtifacts: number;
  totalCorroboratedArtifacts: number;
  evaluationSupportStatus: 'FULLY_SUPPORTED' | 'SUBSTANTIALLY_SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'POORLY_SUPPORTED';
  explanation: string;
}

export interface TopStrength {
  rank: number;
  assessment: string;
  score: number;
  category: string;
  evidenceIds: string[];
}

export interface TopWeakness {
  rank: number;
  weakness: string;
  scoreDeficit: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  evidenceConfidence: number;
}

export interface CriticalRisk {
  id: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  description: string;
  mitigation: string;
  relatedEvidenceIds: string[];
}

export interface RankedEvidenceGap {
  id: string;
  category: string;
  description: string;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  expectedEvidence: string;
  impactOnEvaluation: string;
}

export interface ClaimImpactItem {
  claimId: string;
  claimText: string;
  affectedCategory: CanonicalCategoryKey;
  potentialImportance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  currentStatus: string;
  potentialScoreImpact: number;
  notes: string;
}

export interface SensitivityArea {
  category: CanonicalCategoryKey;
  label: string;
  weight: number;
  sensitivityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  potentialImpactDescription: string;
}

export interface ScoreSensitivityAnalysis {
  currentScore: number;
  highSensitivityAreas: SensitivityArea[];
  methodologyNote: string;
}

export interface FinalRecommendation {
  rank: number;
  title: string;
  problem: string;
  action: string;
  expectedBenefit: string;
  feasibility: 'HIGH' | 'MEDIUM' | 'LOW';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  relatedEvidenceIds: string[];
}

export interface ExceptionalityAnalysis {
  separatorsFromAverage: string[];
  gapToExceptional: string[];
  roadmapToTier1: string[];
}

export interface HumanReview {
  id: string;
  evaluationId: string;
  reviewer: string;
  category: string;
  originalScore: number;
  reviewedScore: number;
  reason: string;
  createdAt: string;
}

export interface JuryNote {
  id: string;
  evaluationId: string;
  category: string;
  text: string;
  author: string;
  relatedEvidenceIds: string[];
  timestamp: string;
}

export interface JuryQuestionItem {
  id: string;
  question: string;
  reason: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  isAsked?: boolean;
  isFlagged?: boolean;
  isBookmarked?: boolean;
  judgeNote?: string;
}

export interface ScoreHistoryEntry {
  id: string;
  evaluationId: string;
  versionNumber: number;
  overallScore: number;
  confidence: number;
  evidenceCoverage: number;
  verdict: VerdictRank;
  changeSummary: string;
  whyScoreChanged: string;
  addedEvidenceIds: string[];
  rubricVersionId: string;
  engineVersion: string;
  createdAt: string;
}

export interface SimulationResponse {
  isSimulation: true;
  label: 'SIMULATION - NOT OFFICIAL SCORE';
  originalOverallScore: number;
  simulatedScore: number;
  difference: number;
  simulatedCategoryScores: Record<CanonicalCategoryKey, {
    original: number;
    simulated: number;
    weight: number;
    weightedOriginal: number;
    weightedSimulated: number;
  }>;
  changedCategories: CanonicalCategoryKey[];
  projectedVerdict: VerdictRank;
}

export interface JuryDecisionData {
  id: string;
  evaluationId: string;
  rubricVersionId: string;
  overallScore: number;
  verdict: VerdictRank;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  evidenceCoverage: number;
  scoreReliability: string;
  qualifiers: VerdictQualifier[];
  executiveVerdict: string;
  strengths: TopStrength[];
  weaknesses: TopWeakness[];
  risks: CriticalRisk[];
  evidenceGaps: RankedEvidenceGap[];
  claimImpact: ClaimImpactItem[];
  sensitivity: ScoreSensitivityAnalysis;
  recommendations: FinalRecommendation[];
  judgeQuestions: JuryQuestionItem[];
  currentProjectScore: number;
  futurePotentialScore: number;
  exceptionalityAnalysis: ExceptionalityAnalysis;
  categoryScores?: MasterCategoryScore[];
  humanReviews?: HumanReview[];
  juryNotes?: JuryNote[];
  questionInteractions?: any[];
  status: 'DRAFT' | 'ANALYZING' | 'READY_FOR_REVIEW' | 'FINAL' | 'ARCHIVED';
  versionNumber: number;
  calculationTime: number;
  engineVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceReference {
  id: string;
  title: string;
  category: 'telemetry' | 'code-audit' | 'patent-search' | 'video-timestamp' | 'speech-metric' | 'log-dump';
  source: string;
  timestampOrRef: string;
  summary: string;
  reliabilityScore: number; // 0-100
}

export interface SubDimensionMetric {
  name: string;
  score: number; // 0-100
  note: string;
}

export interface ScoringDimension {
  id: DimensionId;
  name: string;
  shortName: string;
  score: number; // 0-100
  weight: number; // 0-100 (%)
  confidence: number; // 0-100 (%)
  evidenceCount: number;
  explanation: string;
  subDimensions: SubDimensionMetric[];
  evidenceReferences: EvidenceReference[];
  jurorCritique: string;
  primaryStrength: string;
  primaryRisk: string;
}

export interface RiskIndicator {
  id: string;
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  dimensionId: DimensionId;
  impactArea: string;
  detectedFlags: string[];
  suggestedMitigation: string;
  evidenceTrace: string;
}

export interface JurorDeliberation {
  jurorId: string;
  name: string;
  role: string;
  institution: string;
  avatarColor: string;
  voteScore: number;
  stance: 'Unanimous Endorsement' | 'Endorse with Stipulations' | 'Conditional Approval' | 'Revision Required';
  keyQuote: string;
  coreCritique: string;
}

export interface WeightPreset {
  id: string;
  name: string;
  description: string;
  weights: Record<DimensionId, number>;
}

export interface AIJuryScorecard {
  projectId: string;
  projectName: string;
  projectTrack: 'hardware' | 'software';
  tagline: string;
  evaluatedAt: string;
  evaluationEngineVersion: string;
  totalEvidenceCount: number;

  overallScore: number;
  verdictLevel: JuryVerdictLevel;
  verdictHeadline: string;
  verdictSummary: string;
  juryRecommendation: string;

  dimensions: ScoringDimension[];
  strongestArea: {
    dimensionId: DimensionId;
    name: string;
    score: number;
    weightedContribution: number;
    reason: string;
  };
  weakestArea: {
    dimensionId: DimensionId;
    name: string;
    score: number;
    weightedContribution: number;
    reason: string;
  };

  risks: RiskIndicator[];
  jurors: JurorDeliberation[];
}
