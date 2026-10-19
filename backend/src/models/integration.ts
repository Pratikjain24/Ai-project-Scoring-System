// ====================================================
// PROJECTX-RAY AI - PHASE 12: INTEGRATION & PRODUCTION MODELS
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

export interface EvaluationStateRecord {
  evaluationId: string;
  currentState: EvaluationState;
  previousState?: EvaluationState;
  latestCheckpoint?: EvaluationCheckpoint;
  retryCount: number;
  errorMessage?: string;
  errorStage?: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationCheckpointRecord {
  id: string;
  evaluationId: string;
  checkpointName: EvaluationCheckpoint;
  stageName: string;
  dataHash: string;
  snapshotDataJson?: string;
  createdAt: string;
}

export type UserRole = 
  | 'USER' 
  | 'STUDENT' 
  | 'PROJECT_OWNER' 
  | 'EVALUATOR' 
  | 'JUROR' 
  | 'REVIEWER' 
  | 'LEAD_REVIEWER' 
  | 'ADMIN';

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

export interface UsageRecord {
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

export interface AnalysisImpactResult {
  evidenceType: string;
  evidenceId: string;
  impactedModules: string[];
  requiresReportRegeneration: boolean;
  explanation: string;
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
