export interface PresentationEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'negative' | 'neutral';
  evidenceId?: string;
}

export interface PitchMetrics {
  meanPitchHz: number;
  minPitchHz: number;
  maxPitchHz: number;
  pitchStdDevHz: number;
  isMonotone: boolean;
  pitchStabilityScore: number; // 0 - 100
}

export interface VocalEnergyMetrics {
  meanRmsDbFS: number;
  maxRmsDbFS: number;
  minRmsDbFS: number;
  energyDynamicRangeDb: number;
  vocalProjectionScore: number; // 0 - 100
}

export interface AcousticPauseMetrics {
  totalPausesCount: number;
  totalPauseDurationSeconds: number;
  averagePauseDurationSeconds: number;
  hesitationPausesCount: number; // Awkward pauses > 1.5s
  rhetoricalPausesCount: number; // Effective rhetorical pauses (0.4s - 1.5s)
  voiceActivityRatio: number;    // Active speech vs total duration (0.0 - 1.0)
  pauseTimeline: Array<{
    timestamp: string;
    durationSeconds: number;
    type: 'hesitation' | 'rhetorical';
  }>;
}

export interface SpectralMetrics {
  meanSpectralCentroidHz: number; // Timbre brightness / resonance
  meanZeroCrossingRate: number;   // Articulation / consonant clarity
  spectralRolloffHz: number;
  articulationScore: number;      // 0 - 100
  formants?: {
    f1Hz: number; // 300 - 900 Hz (vowel openness)
    f2Hz: number; // 900 - 2500 Hz (tongue position & clarity)
    vowelClarityScore: number; // 0 - 100
  };
}

export type VocalEmotionState = 'CONFIDENT_ENGAGED' | 'CALM_COMPOSED' | 'NERVOUS_HESITANT' | 'MONOTONE_FATIGUED';

export interface AcousticForensicsReport {
  engineMode: 'LIBROSA' | 'WEBRTC_VAD' | 'NATIVE_PCM_DSP';
  analyzedDurationSeconds: number;
  sampleRateHz: number;
  pitch: PitchMetrics;
  energy: VocalEnergyMetrics;
  pauses: AcousticPauseMetrics;
  spectral: SpectralMetrics;
  vocalEmotionState?: VocalEmotionState;
  speakerDiarization?: {
    estimatedSpeakers: number;
    primarySpeakerDominancePercentage: number;
  };
  overallDeliveryScore: number;
  diagnosticFindings: string[];
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
  acousticForensics?: AcousticForensicsReport;
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
