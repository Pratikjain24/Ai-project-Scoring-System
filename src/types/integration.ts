// ====================================================
// PROJECTX-RAY AI - PHASE 12: INTEGRATION & PRODUCTION TYPES
// ====================================================

export type EvaluationState = 
  | 'DRAFT'
  | 'READY'
  | 'INGESTING'
  | 'UNDERSTANDING'
  | 'ANALYZING_MEDIA'
  | 'RESEARCHING'
  | 'ANALYZING_ORIGINALITY'
  | 'VERIFYING_CLAIMS'
  | 'EVALUATING'
  | 'SCORING'
  | 'JURY_REVIEW'
  | 'REPORT_GENERATING'
  | 'READY_FOR_REVIEW'
  | 'FINAL'
  | 'FAILED'
  | 'ARCHIVED';

export type EvaluationCheckpoint = 
  | 'INGESTION_COMPLETE'
  | 'PROJECT_DNA_COMPLETE'
  | 'MEDIA_COMPLETE'
  | 'RESEARCH_COMPLETE'
  | 'ORIGINALITY_COMPLETE'
  | 'CLAIMS_COMPLETE'
  | 'EVALUATION_COMPLETE'
  | 'SCORING_COMPLETE'
  | 'JURY_COMPLETE'
  | 'REPORT_COMPLETE';

export type StageStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

export interface StageProgressInfo {
  state: EvaluationState;
  label: string;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
}

export interface OrchestratorProgress {
  evaluationId: string;
  currentState: EvaluationState;
  currentCheckpoint?: EvaluationCheckpoint;
  isCompleted: boolean;
  isFailed: boolean;
  isLocked: boolean;
  totalStages: number;
  completedStages: number;
  percentage: number;
  stages: StageProgressInfo[];
  errorMessage?: string;
  errorStage?: string;
  checkpoints: {
    checkpointName: EvaluationCheckpoint;
    stageName: string;
    createdAt: string;
    dataHash: string;
  }[];
  updatedAt: string;
}

export interface IntegrityCheckResult {
  evaluationId: string;
  isValid: boolean;
  weightsSum: number;
  isWeightsValid: boolean;
  isScoreBounded: boolean;
  calculatedScore: number;
  baselineScore: number;
  isScoreDeterministic: boolean;
  brokenEvidenceReferences: string[];
  warnings: string[];
  errors: string[];
  checkedAt: string;
}

export type UserRole = 'USER' | 'REVIEWER' | 'ADMIN';

export interface AuthContext {
  userId: string;
  role: UserRole;
  email: string;
  organizationId?: string;
}

export interface AuditEventRecord {
  id: string;
  actorId: string;
  actorRole: string;
  event: string;
  entityType: string;
  entityId: string;
  metadataJson?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface UsageSummary {
  totalTokens: number;
  totalEstimatedCost: number;
  operationCounts: Record<string, number>;
  records: {
    id: string;
    evaluationId: string;
    provider: string;
    operation: string;
    tokensInput: number;
    tokensOutput: number;
    durationMs: number;
    estimatedCost: number;
    status: string;
    createdAt: string;
  }[];
}

export type EvidenceRequestPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type EvidenceRequestStatus = 'OPEN' | 'SUBMITTED' | 'REVIEWED' | 'CLOSED';

export interface EvidenceRequestRecord {
  id: string;
  evaluationId: string;
  title: string;
  description: string;
  priority: EvidenceRequestPriority;
  requestedBy: string;
  status: EvidenceRequestStatus;
  responseNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationRevisionRecord {
  id: string;
  evaluationId: string;
  revisionNumber: number;
  previousScore: number;
  newScore: number;
  changedEvidenceCount: number;
  impactedModulesJson: string;
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface FeatureFlagRecord {
  key: string;
  name: string;
  enabled: boolean;
  description?: string;
  updatedAt: string;
}

export interface SystemHealthMetrics {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  uptimeSeconds: number;
  activeJobsCount: number;
  failedJobsCount: number;
  totalEvaluationsCount: number;
  databaseLatencyMs: number;
  providers: {
    name: string;
    status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
    latencyMs: number;
    errorRate: number;
  }[];
  queueDepth: number;
  timestamp: string;
}
