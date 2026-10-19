export type MediaSourceType = 'UPLOADED_VIDEO' | 'LIVE_CAMERA';
export type VideoFormat = 'MP4' | 'MOV' | 'WEBM' | 'LIVE_STREAM';
export type VideoProcessingStatus = 'UPLOADED' | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';

export interface MediaSource {
  type: MediaSourceType;
  reference: string;
  isLive: boolean;
  metadata?: Record<string, any>;
}

export type VideoSegmentType = 
  | 'INTRODUCTION'
  | 'PROBLEM_EXPLANATION'
  | 'SOLUTION_EXPLANATION'
  | 'TECHNICAL_EXPLANATION'
  | 'ARCHITECTURE_EXPLANATION'
  | 'FEATURE_DEMONSTRATION'
  | 'LIVE_DEMO'
  | 'RESULTS'
  | 'CONCLUSION'
  | 'Q_AND_A';

export interface VideoSegment {
  id: string;
  videoId: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  segmentType: VideoSegmentType;
  confidence: number;
  createdAt: string;
}

export interface TranscriptSegment {
  id: string;
  videoId: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  text: string;
  confidence: number;
  speakerTag?: string;
  createdAt: string;
}

export type VisualEventType =
  | 'SCREEN_SHOWN'
  | 'APPLICATION_OPENED'
  | 'DASHBOARD_SHOWN'
  | 'CODE_SHOWN'
  | 'ARCHITECTURE_DIAGRAM_SHOWN'
  | 'HARDWARE_SHOWN'
  | 'SENSOR_INTERACTION'
  | 'DEVICE_RESPONSE'
  | 'CHART_SHOWN'
  | 'RESULT_SHOWN'
  | 'ERROR_APPEARED'
  | 'TEXT_HEAVILY_DISPLAYED'
  | 'SLIDE_CHANGE';

export type VisualConfidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type HardwareConfidence = 'CONFIRMED' | 'PROBABLE' | 'UNCERTAIN';

export interface VisualEvent {
  id: string;
  videoId: string;
  timestamp: number; // seconds
  frameReference?: string;
  eventType: VisualEventType;
  description: string;
  confidence: VisualConfidence;
  hardwareConfidence?: HardwareConfidence;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface TechnicalMention {
  id: string;
  videoId: string;
  technology: string;
  timestamp: number;
  sourceText: string;
  confidence: number;
  createdAt: string;
}

export type DemoObservationResult = 'SUCCESS' | 'FAILURE' | 'PARTIAL' | 'UNCERTAIN';

export interface DemoObservation {
  id: string;
  videoId: string;
  evaluationId?: string;
  feature: string;
  timestamp: number;
  observedBehavior: string;
  result: DemoObservationResult;
  confidence: number;
  evidenceId?: string;
  createdAt: string;
}

export type DemoSupportStatus = 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'NOT_DEMONSTRATED' | 'UNCERTAIN';

export interface ClaimDemoMatch {
  id: string;
  evaluationId: string;
  claimId: string;
  videoId: string;
  timestamp: number;
  demoSupport: DemoSupportStatus;
  confidence: number;
  observationNotes: string;
  claimText?: string;
  createdAt: string;
}

export type MilestoneVerificationStatus = 'VERIFIED' | 'PARTIAL' | 'NOT_DEMONSTRATED' | 'FAILED';

export interface DemoMilestone {
  id: string;
  videoId: string;
  evaluationId?: string;
  milestoneName: string;
  timestamp: number;
  status: MilestoneVerificationStatus;
  confidence: number;
  frameReference?: string;
  thumbnailUrl?: string;
  claimId?: string;
  evidenceId?: string;
  verificationNotes?: string;
  details?: Record<string, any>;
  createdAt: string;
}

export type VideoAnomalyType =
  | 'FRAME_DROP'
  | 'BUFFER_OVERRUN'
  | 'LATENCY_SPIKE'
  | 'DETECTION_FALSE_NEGATIVE'
  | 'TELEMETRY_DESYNC'
  | 'ENVIRONMENT_ABSENCE'
  | 'AUDIO_DROPOUT'
  | 'FREEZE_FRAME';

export type AnomalySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface VideoAnomaly {
  id: string;
  videoId: string;
  evaluationId?: string;
  anomalyType: VideoAnomalyType;
  timestamp: number;
  severity: AnomalySeverity;
  description: string;
  frameReference?: string;
  durationSeconds?: number;
  detectedBy: string;
  resolved: boolean;
  createdAt: string;
}

export interface SpeechMetrics {
  speechRateWpm: number;
  pauseFrequency: number;
  pauseDurationSeconds: number;
  fillerWordFrequency: number;
  talkingTimeRatio: number;
  silenceTimeRatio: number;
  structureSectionsCount: number;
  clarityScore: number;
  fillerBreakdown?: Record<string, number>;
  pauseEvents?: Array<{
    startTime: number;
    endTime: number;
    duration: number;
    category?: 'NATURAL_CADENCE' | 'THINKING_HESITATION' | 'PROLONGED_SILENCE';
  }>;
  pauseMetrics?: {
    totalPauseCount: number;
    naturalCadenceCount: number;
    thinkingHesitationCount: number;
    prolongedSilenceCount: number;
  };
  vocalTone?: {
    pitchStability: number;
    pitchStabilityScore?: number;
    energyDynamics: number;
    inflectionVariation: number;
    pacingConsistency: number;
  };
  audioTrackMetrics?: {
    sampleRate: number;
    channels: number;
    durationSeconds: number;
    audioExtractedVia: 'FFMPEG' | 'DIRECT_STREAM_PROBE' | 'SYNTHETIC';
    extractionSource?: 'FFMPEG_REAL_PCM' | 'SYNTHETIC_ACOUSTIC_PROBE';
    rmsLevelDb?: number;
    rmsDbLevel?: number;
  };
}

export interface PresentationMetricsEntity {
  id: string;
  videoId: string;
  evaluationId?: string;
  speechRateWpm: number;
  pauseFrequency: number;
  pauseDurationSeconds: number;
  fillerWordFrequency: number;
  talkingTimeRatio: number;
  silenceTimeRatio: number;
  structureSectionsCount: number;
  clarityScore: number;
  rawMetrics?: SpeechMetrics;
  createdAt: string;
}

export type TimelineEventType =
  | 'SLIDE_CHANGE'
  | 'SPEECH'
  | 'CLAIM'
  | 'TECHNICAL_MENTION'
  | 'DEMO'
  | 'MILESTONE'
  | 'ANOMALY'
  | 'ERROR'
  | 'RESULT'
  | 'QUESTION'
  | 'ANSWER'
  | 'SCENE_CHANGE';

export interface AnalysisEvent {
  id: string;
  evaluationId: string;
  videoId: string;
  timestamp: number;
  eventType: TimelineEventType;
  description: string;
  confidence: number;
  evidenceIds: string[];
  createdAt: string;
}

export interface VideoMetadata {
  durationSeconds: number;
  fps: number;
  resolution: string;
  audioTrack: {
    present: boolean;
    sampleRate: number;
    channels: number;
  };
  sampleIntervalSeconds: number;
  codec?: string;
  fileSizeBytes?: number;
}

export interface VideoEntity {
  id: string;
  evaluationId?: string;
  projectId: string;
  fileReference: string;
  mediaSourceType: MediaSourceType;
  format: VideoFormat;
  durationSeconds: number;
  fps: number;
  resolution: string;
  audioTrackPresent: boolean;
  status: VideoProcessingStatus;
  metadata?: VideoMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface MultimodalAnalysisBundle {
  video: VideoEntity;
  segments: VideoSegment[];
  transcript: TranscriptSegment[];
  visualEvents: VisualEvent[];
  technicalMentions: TechnicalMention[];
  demoObservations: DemoObservation[];
  claimDemoMatches: ClaimDemoMatch[];
  demoMilestones?: DemoMilestone[];
  videoAnomalies?: VideoAnomaly[];
  presentationMetrics: PresentationMetricsEntity | null;
  timeline: AnalysisEvent[];
}
