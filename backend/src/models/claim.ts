export type ClaimStatus =
  | 'CLAIMED'
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'UNVERIFIED'
  | 'CONTRADICTED'
  | 'INSUFFICIENT_EVIDENCE'
  | 'NOT_APPLICABLE';

export type ClaimType =
  | 'PERFORMANCE'
  | 'ACCURACY'
  | 'PRECISION'
  | 'RECALL'
  | 'F1_SCORE'
  | 'SPEED'
  | 'LATENCY'
  | 'COST'
  | 'EFFICIENCY'
  | 'ENERGY'
  | 'SECURITY'
  | 'SCALABILITY'
  | 'RELIABILITY'
  | 'USER_COUNT'
  | 'IMPACT'
  | 'MARKET'
  | 'INNOVATION'
  | 'TECHNICAL'
  | 'ENVIRONMENTAL'
  | 'OTHER';

export type ClaimSourceType =
  | 'PROJECT_DOCUMENT'
  | 'PROJECT_VIDEO'
  | 'USER_INPUT'
  | 'CODE'
  | 'DEMO'
  | 'WEBSITE';

export type ClaimImportance = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type DemoSupportStatus =
  | 'SUPPORTED_BY_DEMO'
  | 'PARTIALLY_SUPPORTED_BY_DEMO'
  | 'NOT_DEMONSTRATED'
  | 'UNCERTAIN';

export type DocumentSupportStatus = 'FULL' | 'PARTIAL' | 'NONE';

export type CodeSupportStatus = 'SUPPORTED' | 'PARTIAL' | 'NOT_SUPPORTED';

export type BenchmarkComparability =
  | 'DIRECTLY_COMPARABLE'
  | 'PARTIALLY_COMPARABLE'
  | 'NOT_COMPARABLE';

export interface ClaimParameters {
  subject: string;
  metric?: string;
  value?: string;
  unit?: string;
  condition?: string;
  dataset?: string;
  evaluationMethod?: string;
}

export interface Claim {
  id: string;
  evaluationId: string;
  claimText: string;
  claimType: ClaimType;
  importance: ClaimImportance;
  status: ClaimStatus;
  confidence: number;
  projectEvidence: string;
  externalEvidence?: string;
  explanation: string;
  recommendedJudgeQuestion?: string;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  sourceType?: ClaimSourceType;
  sourceDocumentId?: string;
  sourcePageId?: string;
  sourceVideoId?: string;
  sourceTimestamp?: number;
  originalText?: string;
  normalizedClaim?: string;
  createdAt: string;
}

export interface ClaimVerificationResult {
  id: string;
  claimId: string;
  evaluationId: string;
  status: ClaimStatus;
  verificationScore: number; // 0 - 100
  confidence: number;        // 0 - 100
  methodologyScore: number;  // 0 - 100
  consistencyScore: number;  // 0 - 100
  demoSupport: DemoSupportStatus;
  demoTimestamp?: number;
  documentSupport: DocumentSupportStatus;
  codeSupport: CodeSupportStatus;
  missingEvidence: string[];
  explanation: string;
  recommendedJudgeQuestion?: string;
  scoreImpactCategory?: string;
  potentialScoreImpact?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClaimBenchmark {
  id: string;
  claimId: string;
  benchmarkSource: string;
  metric: string;
  value: string;
  dataset?: string;
  conditions?: string;
  comparability: BenchmarkComparability;
  evidenceIds: string[];
  notes?: string;
  createdAt?: string;
}

export interface PotentialContradiction {
  id: string;
  evaluationId: string;
  claimAId: string;
  claimBId?: string;
  sourceA: string;
  sourceB: string;
  statementA: string;
  statementB: string;
  difference: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  conflictType: 'INTERNAL' | 'EXTERNAL_CONFLICT';
  createdAt?: string;
}

export interface MethodologyCompleteness {
  score: number; // 0 - 100
  presentElements: string[];
  missingElements: string[];
  details: string;
}

export interface ClaimVersion {
  id: string;
  claimId: string;
  versionNumber: number;
  claimText: string;
  status: ClaimStatus;
  parameters?: ClaimParameters;
  reason: string;
  createdAt: string;
}

export interface ClaimHumanReview {
  id: string;
  claimId: string;
  evaluationId: string;
  reviewerName: string;
  oldStatus: ClaimStatus;
  newStatus: ClaimStatus;
  reason: string;
  createdAt: string;
}

export interface ClaimDetailBundle {
  claim: Claim;
  parameters?: ClaimParameters;
  verification?: ClaimVerificationResult;
  benchmarks: ClaimBenchmark[];
  contradictions: PotentialContradiction[];
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
  claims: Claim[];
  contradictions: PotentialContradiction[];
}
