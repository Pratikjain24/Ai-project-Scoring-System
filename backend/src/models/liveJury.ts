export type LiveSessionStatus = 
  | 'PREPARING'
  | 'READY'
  | 'LIVE'
  | 'PAUSED'
  | 'RECONNECTING'
  | 'COMPLETED'
  | 'FAILED';

export type LiveDeviceStatus = 
  | 'READY'
  | 'UNAVAILABLE'
  | 'PERMISSION_DENIED'
  | 'TESTING';

export type LiveNetworkStatus = 
  | 'EXCELLENT'
  | 'STABLE'
  | 'POOR'
  | 'DISCONNECTED';

export type LiveAnalysisStatus = 
  | 'IDLE'
  | 'ANALYZING'
  | 'AI_UNAVAILABLE'
  | 'PARTIAL_ANALYSIS'
  | 'FINALIZING'
  | 'COMPLETED';

export type LiveUserRole = 'PRESENTER' | 'JUDGE';

export type LiveSourceMode = 'CAMERA' | 'SCREEN' | 'CAMERA_SCREEN';

export type LiveEventType = 
  | 'SPEECH_STARTED'
  | 'SPEECH_ENDED'
  | 'SLIDE_CHANGED'
  | 'CLAIM_DETECTED'
  | 'TECHNOLOGY_MENTION'
  | 'DEMO_STARTED'
  | 'DEMO_FEATURE_DETECTED'
  | 'ERROR_DETECTED'
  | 'RESULT_SHOWN'
  | 'QUESTION_DETECTED'
  | 'ANSWER_DETECTED'
  | 'EVIDENCE_COLLECTED'
  | 'SECTION_TRANSITION'
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

export type LiveClaimOccurrenceType = 
  | 'KNOWN_CLAIM'
  | 'NEW_CLAIM'
  | 'REPEATED_CLAIM'
  | 'POTENTIAL_CORRECTION';

export type LiveDemoStatus = 'SUCCESS' | 'PARTIAL' | 'FAILURE' | 'UNCERTAIN';

export type QuestionAnswerStatus = 
  | 'DIRECTLY_ADDRESSED'
  | 'PARTIALLY_ADDRESSED'
  | 'NOT_ADDRESSED'
  | 'UNCERTAIN';

export interface LiveJurySession {
  id: string;
  evaluationId: string;
  startedAt: string | null;
  endedAt: string | null;
  status: LiveSessionStatus;
  cameraStatus: LiveDeviceStatus;
  microphoneStatus: LiveDeviceStatus;
  networkStatus: LiveNetworkStatus;
  analysisStatus: LiveAnalysisStatus;
  activeSource: LiveSourceMode;
  role: LiveUserRole;
  currentElapsedSeconds: number;
  targetDurationSeconds: number;
  isRecording: boolean;
  settings: {
    mockMode: boolean;
    autoDetectClaims: boolean;
    autoSuggestQuestions: boolean;
    allowProvisionalScore: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LiveEvent {
  id: string;
  sessionId: string;
  timestampMs: number;
  timestampFormatted: string; // e.g. "04:52"
  eventType: LiveEventType;
  description: string;
  confidence: number;
  evidenceIds: string[];
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface LiveObservation {
  id: string;
  sessionId: string;
  timestampMs: number;
  timestampFormatted: string; // e.g. "06:11"
  category: 'TECHNICAL' | 'CLAIM' | 'DEMO' | 'ERROR' | 'PRESENTATION' | 'EVIDENCE_GAP';
  title: string;
  description: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
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
  isFinal: boolean; // false = LIVE / UNCONFIRMED, true = FINALIZED
  confidence: number;
  detectedClaimIds: string[];
  createdAt: string;
}

export interface LiveClaimOccurrence {
  id: string;
  sessionId: string;
  claimId: string;
  claimText: string;
  timestampMs: number;
  timestampFormatted: string;
  occurrenceType: LiveClaimOccurrenceType;
  transcriptSnippet: string;
  confidence: number;
  isRepeated: boolean;
  repeatCount: number;
  createdAt: string;
}

export interface LiveDemoEvent {
  id: string;
  sessionId: string;
  timestampMs: number;
  timestampFormatted: string;
  feature: string;
  observedBehavior: string;
  status: LiveDemoStatus;
  confidence: number;
  evidenceId?: string;
  hardwareInvolved?: string;
  createdAt: string;
}

export interface LivePresentationMetric {
  speechRateWpm: number;
  talkingTimeSeconds: number;
  pauseTimeSeconds: number;
  fillerWordsCount: number;
  sectionCoveragePercentage: number;
  detectedSections: string[];
  currentSection: string;
}

export interface LiveJudgeQuestion {
  id: string;
  sessionId: string;
  suggestedAtMs: number;
  suggestedAtFormatted: string;
  question: string;
  reason: string;
  evidenceGap: string;
  status: 'SUGGESTED' | 'ASKED' | 'DISMISSED';
  askedAtMs?: number;
  answerText?: string;
  answerStatus?: QuestionAnswerStatus;
  answeredAtMs?: number;
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
  evidenceCount: number;
  claimsDetected: number;
  demoEventsCount: number;
  presentationCoverage: number; // 0-100%
  technicalEvidenceCoverage: number; // 0-100%
  provisionalScoreRange: string; // e.g. "80–85" (smoothed, not a fluctuating single float)
  isProvisional: boolean;
  officialScoreAvailable: boolean;
  visualMetrics?: LivePresenterTrackingMetrics;
  visualTelemetryCount?: number;
}

export interface LiveSessionFinalizationResult {
  sessionId: string;
  evaluationId: string;
  finalScore: number; // 83.7
  verdict: string; // STRONG
  confidence: number; // 0.86
  totalEvidenceCount: number; // 91
  claimsCount: number; // 23
  verifiedClaimsCount: number; // 9
  partiallyVerifiedClaimsCount: number; // 7
  unverifiedClaimsCount: number; // 5
  contradictedClaimsCount: number; // 2
  reportId: string;
  finalizedAt: string;
}
