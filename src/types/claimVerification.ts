export type ClaimStatus =
  | 'verified'
  | 'partially-verified'
  | 'unverified'
  | 'contradicted'
  | 'insufficient-evidence';

export type ClaimCategory =
  | 'performance'
  | 'security'
  | 'novelty'
  | 'scalability'
  | 'power-battery'
  | 'accuracy'
  | 'feasibility'
  | 'reliability';

export interface InternalEvidence {
  id: string;
  sourceType: 'code' | 'benchmark' | 'schematic' | 'slide' | 'log' | 'cad';
  location: string; // e.g. "src/crypto/ntt.rs:L42-L89"
  summary: string;
  snippet: string;
  relevanceScore: number; // 0 - 100
}

export interface ExternalEvidence {
  id: string;
  sourceType: 'paper' | 'datasheet' | 'standard' | 'benchmark' | 'patent';
  citation: string;
  url: string;
  corroborationType: 'supports' | 'nuances' | 'refutes' | 'inconclusive';
  summary: string;
  excerpt: string;
}

export interface EvidenceChainStep {
  step: 'claim' | 'project-evidence' | 'external-sources' | 'ai-analysis' | 'verdict';
  label: string;
  status: 'passed' | 'warning' | 'failed' | 'neutral';
  title: string;
  content: string;
  evidenceRef?: string;
}

export interface AskTheJudgeQuestion {
  inquiry: string;
  targetVulnerability: string;
  requiredProofArtifact: string;
  urgency: 'critical' | 'moderate' | 'inquisitive';
}

export interface ProjectClaim {
  id: string;
  claimText: string;
  extractedFrom: string; // e.g. "Pitch Deck · Slide 6" or "README.md · Section 2"
  category: ClaimCategory;
  status: ClaimStatus;
  confidence: number; // 0 - 100 %
  internalEvidence: InternalEvidence[];
  externalEvidence: ExternalEvidence[];
  sourceLinks: { label: string; url: string; type: string }[];
  verificationResult: {
    verdictSummary: string;
    analyticalBreakdown: string[];
    hedgingNotice?: string;
  };
  evidenceChain: EvidenceChainStep[];
  judgeQuestion?: AskTheJudgeQuestion;
}

export interface ClaimVerificationReport {
  projectId: string;
  projectName: string;
  projectType: 'software' | 'hardware';
  overallVerificationRate: number; // e.g. 71.4%
  totalClaimsCount: number;
  averageConfidence: number;
  statusBreakdown: Record<ClaimStatus, number>;
  claims: ProjectClaim[];
}

// ============================================================================
// PHASE 7 TRUTH ANALYSIS ENGINE TYPES (Live API integration)
// ============================================================================

export type BackendClaimStatus =
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'UNVERIFIED'
  | 'CONTRADICTED'
  | 'INSUFFICIENT_EVIDENCE';

export type BackendClaimImportance = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ClaimContradiction {
  id: string;
  evaluationId: string;
  claimAId: string;
  claimBId?: string | null;
  sourceA: string;
  sourceB: string;
  statementA: string;
  statementB: string;
  difference: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  conflictType: 'INTERNAL' | 'EXTERNAL_CONFLICT' | 'TEMPORAL_DRIFT';
  createdAt: string;
}

export interface ClaimHumanReview {
  id: string;
  claimId: string;
  evaluationId: string;
  reviewerName: string;
  oldStatus: string;
  newStatus: string;
  reason: string;
  createdAt: string;
}

export interface ClaimVersion {
  id: string;
  claimId: string;
  versionNumber: number;
  claimText: string;
  status: string;
  reason: string;
  createdAt: string;
}

export interface ClaimBenchmark {
  id: string;
  claimId: string;
  benchmarkSource: string;
  metric: string;
  value: string;
  dataset?: string;
  conditions?: string;
  comparability: 'DIRECTLY_COMPARABLE' | 'PARTIALLY_COMPARABLE' | 'NOT_COMPARABLE';
  evidenceIds: string[];
  notes: string;
}

export interface ClaimDetailBundle {
  claim: {
    id: string;
    evaluationId: string;
    claimText: string;
    claimType: string;
    importance: BackendClaimImportance;
    status: BackendClaimStatus;
    confidence: number;
    projectEvidence?: string;
    externalEvidence?: string;
    explanation?: string;
    recommendedJudgeQuestion?: string;
    supportingEvidenceIds?: string[];
    contradictingEvidenceIds?: string[];
  };
  parameters?: {
    subject?: string;
    metric?: string;
    value?: string;
    unit?: string;
    condition?: string;
    dataset?: string;
    evaluationMethod?: string;
  };
  verification?: {
    id: string;
    claimId: string;
    status: BackendClaimStatus;
    verificationScore: number;
    confidence: number;
    methodologyScore: number;
    consistencyScore: number;
    demoSupport: 'CONFIRMED' | 'PARTIAL' | 'NOT_DEMONSTRATED' | 'CONTRADICTED';
    demoTimestamp?: string;
    documentSupport: 'FULL' | 'PARTIAL' | 'ABSENT' | 'CONFLICTING';
    codeSupport: 'SUPPORTED' | 'UNSUPPORTED' | 'NONE';
    missingEvidence: string[];
    explanation: string;
    recommendedJudgeQuestion?: string;
    scoreImpactCategory: string;
    potentialScoreImpact: number;
  };
  benchmarks: ClaimBenchmark[];
  contradictions: ClaimContradiction[];
  versions: ClaimVersion[];
  humanReviews: ClaimHumanReview[];
  supportingEvidence: any[];
  contradictingEvidence: any[];
}

export interface EvaluationClaimsSummary {
  evaluationId: string;
  totalClaims: number;
  verifiedCount: number;
  partiallyVerifiedCount: number;
  unverifiedCount: number;
  contradictedCount: number;
  insufficientEvidenceCount: number;
  highRiskCount: number;
  overallReliabilityRate: number;
  averageConfidence: number;
  claims: any[];
  contradictions: ClaimContradiction[];
}

