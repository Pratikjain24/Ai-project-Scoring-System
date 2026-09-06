export interface PresentationEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'negative' | 'neutral';
  evidenceId?: string;
}

export interface PresentationAnalysis {
  id: string;
  evaluationId: string;
  presentationScore: number;
  clarity: number;
  confidenceScore: number;
  speechRate: number; // words per minute
  fillerWordsCount: number;
  structure: number;
  eyeContact: number;
  posture: number;
  engagement: number;
  timeManagement: number;
  timelineEvents: PresentationEvent[];
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  evidenceIds: string[];
  createdAt: string;
}

export interface DemoFeatureAudit {
  id: string;
  featureName: string;
  status: 'SUCCESSFUL' | 'FAILED' | 'UNCERTAIN' | 'NOT_DEMONSTRATED';
  observedLatencyMs?: number;
  observedOutput?: string;
  claimId?: string;
  evidenceId?: string;
  notes: string;
}

export interface DemoAnalysis {
  id: string;
  evaluationId: string;
  demoScore: number;
  completenessPercentage: number;
  featuresAudited: DemoFeatureAudit[];
  observedErrors: string[];
  unsupportedClaims: string[];
  evidenceIds: string[];
  createdAt: string;
}
