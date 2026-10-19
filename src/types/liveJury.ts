// ====================================================
// PROJECTX-RAY AI - PHASE 11: LIVE CAMERA AI JURY TYPES
// ====================================================

export type LiveSessionStatus = 
  | 'PREPARING'
  | 'READY'
  | 'LIVE'
  | 'PAUSED'
  | 'RECONNECTING'
  | 'COMPLETED'
  | 'FAILED';

export type LiveAnalysisStatus = 'INITIALIZING' | 'ANALYZING' | 'PAUSED' | 'FINALIZING' | 'COMPLETED' | 'ERROR';

export type LiveCameraSource = 'WEBCAM' | 'SCREEN' | 'SIMULATED' | 'UPLOADED_FILE' | 'EXTERNAL_STREAM';

export interface LiveJurySession {
  id: string;
  evaluationId: string;
  status: LiveSessionStatus;
  analysisStatus: LiveAnalysisStatus;
  cameraSource: LiveCameraSource;
  micSource: string;
  startedAt?: string;
  endedAt?: string;
  durationSeconds: number;
  isRecording: boolean;
  notesCount: number;
  flaggedConcernsCount: number;
  provisionalScoreMin: number;
  provisionalScoreMax: number;
  overallProvisionalScore: number;
  createdAt: string;
  updatedAt: string;
}

export type LiveEventType = 
  | 'SESSION_STATE_CHANGED'
  | 'CAMERA_SWITCHED'
  | 'MIC_MUTED'
  | 'MIC_UNMUTED'
  | 'TRANSCRIPT_SEGMENT'
  | 'CLAIM_DETECTED'
  | 'DEMO_FEATURE_DETECTED'
  | 'HARDWARE_DETECTED'
  | 'EVIDENCE_GAP_DETECTED'
  | 'QUESTION_DETECTED'
  | 'ANSWER_DETECTED'
  | 'ANOMALY_DETECTED'
  | 'SCORE_UPDATED'
  | 'NOTE_ADDED'
  | 'SLIDE_CHANGED'
  | 'GAZE_WARNING'
  | 'POSTURE_ALERT'
  | 'SLIDE_TRANSITION'
  | 'PRESENTER_CV_TELEMETRY';

export type PresenterGazeStatus = 'DIRECT' | 'LOOKING_DOWN' | 'LOOKING_AWAY';
export type PresenterPostureStatus = 'UPRIGHT' | 'LEANING_FORWARD' | 'LEANING_BACK' | 'SLUMPED';
export type GestureActivityLevel = 'LOW' | 'OPTIMAL' | 'EXCESSIVE';
export type LightingQuality = 'GOOD' | 'TOO_DARK' | 'TOO_BRIGHT';

export interface LivePresenterTrackingMetrics {
  faceDetected: boolean;
  faceBoundingBox?: { x: number; y: number; width: number; height: number };
  gazeStatus: PresenterGazeStatus;
  eyeContactScore: number; // 0-100%
  headPose: {
    yaw: number;   // -90 to +90 (left/right)
    pitch: number; // -90 to +90 (up/down)
    roll: number;  // -90 to +90 (tilt)
  };
  postureStatus: PresenterPostureStatus;
  postureStability: number; // 0-100%
  gestureActivity: GestureActivityLevel;
  slideNumber: number;
  slideDwellTimeSeconds: number;
  slideTransitionDetected: boolean;
  lightingQuality: LightingQuality;
  timestampMs: number;
}

export interface LiveEvent {
  id: string;
  sessionId: string;
  timestampMs: number;
  timestampFormatted: string;
  eventType: LiveEventType;
  description: string;
  confidence: number;
  evidenceIds?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
}

export type LiveObservationCategory = 
  | 'CLAIM'
  | 'DEMO'
  | 'PRESENTATION'
  | 'TECHNICAL'
  | 'GAP'
  | 'WARNING';

export type LiveObservationSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';

export interface LiveObservation {
  id: string;
  sessionId: string;
  timestampMs: number;
  timestampFormatted: string;
  category: LiveObservationCategory;
  title: string;
  description: string;
  severity: LiveObservationSeverity;
  confidence: number;
  evidenceId?: string;
  createdAt: string;
}

export interface LiveTranscriptSegment {
  id: string;
  sessionId: string;
  timestampMs: number;
  timestampFormatted: string;
  speaker: string;
  text: string;
  isFinal: boolean;
  confidence: number;
  detectedClaimIds: string[];
  createdAt: string;
}

export type LiveClaimOccurrenceType = 'KNOWN_CLAIM' | 'NOVEL_CLAIM' | 'REPEATED_CLAIM' | 'UNSUPPORTED_CLAIM';

export interface LiveClaimOccurrence {
  id: string;
  sessionId: string;
  timestampMs: number;
  timestampFormatted: string;
  claimId?: string;
  claimText: string;
  occurrenceType: LiveClaimOccurrenceType;
  transcriptSnippet: string;
  confidence: number;
  isRepeated: boolean;
  repeatCount: number;
  createdAt: string;
}

export type LiveDemoStatus = 'SUCCESS' | 'PARTIAL' | 'FAILURE' | 'IN_PROGRESS';

export interface LiveDemoEvent {
  id: string;
  sessionId: string;
  timestampMs: number;
  timestampFormatted: string;
  feature: string;
  observedBehavior: string;
  status: LiveDemoStatus;
  confidence: number;
  hardwareInvolved?: string;
  createdAt: string;
}

export interface LivePresentationMetric {
  id: string;
  sessionId: string;
  elapsedSeconds: number;
  speechPaceWpm: number;
  clarityScore: number;
  slideOrScreenConfidence: number;
  demoLatencyMs: number;
  currentSlideOrTopic: string;
  timestamp: string;
}

export type LiveJudgeQuestionStatus = 'SUGGESTED' | 'ASKED' | 'ANSWERED' | 'DISMISSED';
export type LiveAnswerCompleteness = 'DIRECTLY_ADDRESSED' | 'PARTIALLY_ADDRESSED' | 'NOT_ADDRESSED';

export interface LiveJudgeQuestion {
  id: string;
  sessionId: string;
  suggestedAtMs: number;
  suggestedAtFormatted: string;
  question: string;
  reason: string;
  evidenceGap?: string;
  status: LiveJudgeQuestionStatus;
  askedAtMs?: number;
  answerText?: string;
  answerCompleteness?: LiveAnswerCompleteness;
  completenessAnalysis?: string;
  missingPoints?: string[];
  createdAt: string;
}

export interface LiveJudgeNote {
  id: string;
  sessionId: string;
  timestampMs: number;
  timestampFormatted: string;
  note: string;
  flaggedConcern: boolean;
  isBookmarked: boolean;
  createdAt: string;
}

export interface LiveScoreSnapshot {
  sessionId: string;
  evaluationId: string;
  timestampMs: number;
  provisionalScoreMin: number;
  provisionalScoreMax: number;
  provisionalScoreEstimated: number;
  provisionalScoreRange: string;
  evidenceCount: number;
  claimsDetected: number;
  demoEventsCount: number;
  questionsSuggested: number;
  questionsAnswered: number;
  flaggedConcerns: number;
  indicators: {
    evidenceCoverage: number;
    claimCorroboration: number;
    demoReliability: number;
    presentationStructure: number;
  };
  visualMetrics?: LivePresenterTrackingMetrics;
  visualTelemetryCount?: number;
}

export interface LiveSessionFinalizationResult {
  sessionId: string;
  evaluationId: string;
  finalScore: number;
  verdict: string;
  confidence: number;
  totalEvidenceCount: number;
  claimsCount: number;
  verifiedClaimsCount: number;
  partiallyVerifiedClaimsCount: number;
  unverifiedClaimsCount: number;
  contradictedClaimsCount: number;
  reportId: string;
  finalizedAt: string;
}
