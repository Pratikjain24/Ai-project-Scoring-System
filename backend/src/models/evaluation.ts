export type EvaluationMode = 'LIVE_CAMERA' | 'VIDEO_ANALYSIS';

export type EvaluationStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'WARNING' | 'FAILED';

export type JobType =
  | 'FILE_PROCESSING'
  | 'VIDEO_PROCESSING'
  | 'TRANSCRIPTION'
  | 'PROJECT_ANALYSIS'
  | 'RESEARCH'
  | 'ORIGINALITY_ANALYSIS'
  | 'CLAIM_VERIFICATION'
  | 'SCORING'
  | 'REPORT_GENERATION';

export type JobState = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'WARNING' | 'FAILED';

export interface AnalysisJob {
  id: string;
  evaluationId: string;
  jobType: JobType;
  stageName: string;
  stageIndex: number;
  totalStages: number;
  state: JobState;
  progressPercentage: number; // 0 - 100
  message: string;
  executionId: string;
  details?: Record<string, any>;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Evaluation {
  id: string;
  projectId: string;
  mode: EvaluationMode;
  status: EvaluationStatus;
  overallScore?: number;
  confidence?: number;
  verdict?: 'EXCEPTIONAL' | 'STRONG' | 'PROMISING' | 'NEEDS_IMPROVEMENT' | 'WEAK';
  executiveSummary?: string;
  executionId: string;
  createdAt: string;
  updatedAt: string;
}
