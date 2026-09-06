export type AnalysisMode = 'demo-playback' | 'live-stream';

export interface ObservedEvidenceItem {
  id: string;
  type: 'video-frame' | 'transcript-excerpt' | 'audio-waveform' | 'telemetry-log' | 'gaze-heatmap';
  timestamp: string; // e.g. "02:14"
  label: string;
  sourceLocation: string;
  snippet: string;
  metricCorrelation: string;
}

export interface SpeechMetric {
  id: string;
  key: string;
  name: string;
  score: number; // 0 - 100
  rating: 'Exceptional' | 'Strong' | 'Average' | 'Needs Work';
  measuredValue: string; // e.g. "138 WPM", "84% Gaze", "14 Count"
  optimalBenchmark: string; // e.g. "130-150 WPM"
  headline: string;
  detailedAnalysis: string;
  evidenceSnippets: ObservedEvidenceItem[];
}

export interface FillerWordCount {
  word: string;
  count: number;
  timestamps: string[];
}

export interface PresentationEvent {
  id: string;
  timestamp: string;
  seconds: number;
  type: 'slide-transition' | 'key-assertion' | 'filler-cluster' | 'q-and-a' | 'tone-shift';
  title: string;
  description: string;
  speakerQuote: string;
  slideNumber?: number;
  confidenceAtEvent: number;
  evidenceRefId?: string;
}

export interface DemoFeatureItem {
  id: string;
  name: string;
  category: string;
  status: 'verified' | 'partial' | 'failed' | 'unsupported';
  claimText: string;
  observedResult: string;
  timestampStart: string;
  timestampEnd: string;
  latencyOrPerformance?: string;
  evidenceRefId: string;
}

export interface ObservedErrorEvent {
  id: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  logSnippet: string;
  impactOnDemo: string;
  recovered: boolean;
}

export interface DemoEvent {
  id: string;
  timestamp: string;
  seconds: number;
  action: string;
  targetComponent: string;
  outcome: 'success' | 'warning' | 'failure';
  systemResponse: string;
  latencyMs?: number;
  telemetrySnippet?: string;
}

export interface PresentationAnalysisData {
  overallScore: number;
  clarity: SpeechMetric;
  speakingPace: SpeechMetric;
  confidence: SpeechMetric;
  fillerWords: SpeechMetric & { breakdown: FillerWordCount[]; totalCount: number; perMinute: number };
  explanationStructure: SpeechMetric;
  eyeContact: SpeechMetric;
  posture: SpeechMetric;
  audienceEngagement: SpeechMetric;
  timeManagement: SpeechMetric & { allocatedMinutes: number; actualMinutes: number; overtimeSeconds: number };
  timeline: PresentationEvent[];
}

export interface DemoAnalysisData {
  overallScore: number;
  completenessPercentage: number;
  features: DemoFeatureItem[];
  successfulFeaturesCount: number;
  failedFeaturesCount: number;
  unsupportedClaimsCount: number;
  observedErrors: ObservedErrorEvent[];
  timeline: DemoEvent[];
}

export interface PresentationDemoReport {
  projectId: string;
  projectName: string;
  projectType: 'software' | 'hardware';
  sessionTitle: string;
  presenter: string;
  evaluatedAt: string;
  durationSeconds: number;
  durationFormatted: string;
  compositeScore: number;
  confidenceLevel: number;
  mode: AnalysisMode;
  presentation: PresentationAnalysisData;
  demo: DemoAnalysisData;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: Array<{
    priority: 'P0' | 'P1' | 'P2';
    category: 'Presentation' | 'Live Demo' | 'Technical Defense';
    recommendation: string;
    evidenceDerivedFrom: string;
  }>;
}
