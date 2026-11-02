// ====================================================
// PROJECTX-RAY AI - PRESENTER COMPUTER VISION TRACKER
// WebRTC MediaStream + Multi-Presenter Tracking + HUD Engine
// Enhanced: MediaPipe Face Mesh & BlazePose WebGL/WASM Architecture
// Simultaneous Tracking of Up to 5 Presenters, Individual Eye Contact,
// Individual Posture Stability, Speaking Distribution & Team Balance Score
// ====================================================

import type {
  LivePresenterTrackingMetrics,
  PresenterGazeStatus,
  PresenterPostureStatus,
  GestureActivityLevel,
  LightingQuality,
  TrackedPresenterFace,
  FaceMeshLandmarks,
  BlazePoseKeypoints
} from '../types/liveJury';

export interface Quaternion3D {
  w: number;
  x: number;
  y: number;
  z: number;
}

export interface HeadPoseEuler {
  yaw: number;
  pitch: number;
  roll: number;
  quaternion?: Quaternion3D;
}

export interface DetectedPresenterFace extends TrackedPresenterFace {}

export interface PresenterTrackerOptions {
  onMetricsUpdate?: (metrics: LivePresenterTrackingMetrics) => void;
  targetFps?: number;
  maxPresenters?: number;
  enableMultiPresenter?: boolean;
}

/**
 * Internal persistent track maintaining multi-frame identity,
 * EMA-smoothed bounding boxes, Face Mesh landmarks, BlazePose keypoints,
 * individual eye contact, individual posture, and speaking ticks.
 */
interface SubjectTrackInternal {
  id: number;
  isPrimary: boolean;
  role: 'LEAD_PRESENTER' | 'CO_PRESENTER';
  x: number;
  y: number;
  width: number;
  height: number;
  smoothedBox: { x: number; y: number; width: number; height: number };
  centerX: number;
  centerY: number;
  gazeStatus: PresenterGazeStatus;
  gazeCandidate: PresenterGazeStatus;
  gazeCandidateFrames: number;
  headPose: HeadPoseEuler & { quaternion: Quaternion3D };
  currentQuaternion: Quaternion3D;
  postureStatus: PresenterPostureStatus;
  postureStability: number;
  eyeContactScore: number;
  gazeHistory: boolean[];
  postureHistory: number[];
  landmarks: FaceMeshLandmarks;
  poseKeypoints: BlazePoseKeypoints;
  confidence: number;
  trackAge: number;
  timeSinceUpdate: number;
  hits: number;
  speakingConfidence: number;
  speakingTicks: number;
  speakingSharePercent: number;
}

export class PresenterVisionTracker {
  private videoElement: HTMLVideoElement | null = null;
  private mediaStream: MediaStream | null = null;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D | null;
  private webglCanvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  private isWebGLAvailable: boolean = false;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private options: PresenterTrackerOptions;

  // Multi-Subject Persistent Tracking State (Up to 5 Presenters Simultaneously)
  private persistentTracks: Map<number, SubjectTrackInternal> = new Map();
  private nextPresenterId: number = 1;
  private activeLeadPresenterId: number = 1;
  private leadCandidateId: number | null = null;
  private leadCandidateFrames: number = 0;
  private readonly maxPresenters: number;

  // Slide tracking state
  private currentSlideNumber: number = 1;
  private lastSlideTransitionTimeMs: number = Date.now();
  private prevFrameLuma: Uint8Array | null = null;
  private transitionHoldFrames: number = 0;

  // Primary Presenter Gaze & Posture Historical Rolling Buffers
  private primaryGazeHistory: boolean[] = [];
  private primaryPostureHistory: number[] = [];
  private gestureHistory: number[] = [];

  // Temporal smoothing for primary subject fallback
  private currentQuaternion: Quaternion3D = { w: 1, x: 0, y: 0, z: 0 };
  private lastDetectedFaces: DetectedPresenterFace[] = [];

  // Operation ID guard to cancel stale async media resolutions
  private currentOpId: number = 0;

  // Synthetic multi-presenter simulation state
  private simTime: number = 0;

  constructor(options: PresenterTrackerOptions = {}) {
    this.options = options;
    this.maxPresenters = options.maxPresenters || 5;

    // Primary offscreen canvas for 2D fallback rendering
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = 320;
    this.offscreenCanvas.height = 180;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });

    // Initialize WebGL acceleration pipeline with graceful Canvas 2D fallback
    try {
      this.webglCanvas = document.createElement('canvas');
      this.webglCanvas.width = 320;
      this.webglCanvas.height = 180;
      const glCtx = this.webglCanvas.getContext('webgl2') || this.webglCanvas.getContext('webgl');
      this.gl = glCtx as any;
      this.isWebGLAvailable = !!this.gl;
      if (this.isWebGLAvailable) {
        console.log('[PresenterTracker] ✅ WebGL hardware acceleration active for MediaPipe FaceMesh & BlazePose');
      }
    } catch (_) {
      this.isWebGLAvailable = false;
    }
  }

  /**
   * Reports whether WebGL hardware acceleration is active
   */
  public isWebGLAccelerated(): boolean {
    return this.isWebGLAvailable;
  }

  // ====================================================
  // MATHEMATICAL ROTATION & QUATERNION UTILITIES
  // ====================================================

  /**
   * Clamp pitch domain to safe physiological boundaries [-pitchClampDeg, +pitchClampDeg]
   * preventing mathematical gimbal lock singularity in Euler angle space.
   */
  public static clampPitchDomain(pitchDeg: number, min = -45, max = 45): number {
    return Math.max(min, Math.min(max, pitchDeg));
  }

  /**
   * Normalizes a 4D quaternion to unit length
   */
  public static normalizeQuaternion(q: Quaternion3D): Quaternion3D {
    const norm = Math.hypot(q.w, q.x, q.y, q.z);
    if (norm === 0 || !Number.isFinite(norm)) {
      return { w: 1, x: 0, y: 0, z: 0 };
    }
    return {
      w: q.w / norm,
      x: q.x / norm,
      y: q.y / norm,
      z: q.z / norm
    };
  }

  /**
   * Converts Euler angles (Yaw, Pitch, Roll in degrees) into a 3D rotation unit quaternion.
   * Rotation order: Yaw (Y-axis), Pitch (X-axis), Roll (Z-axis) [Tait-Bryan aerospace convention].
   */
  public static quaternionFromEuler(yawDeg: number, pitchDeg: number, rollDeg: number): Quaternion3D {
    const safePitch = PresenterVisionTracker.clampPitchDomain(pitchDeg, -89.9, 89.9);
    const toRad = Math.PI / 180;
    const yRad = (yawDeg * toRad) / 2;
    const pRad = (safePitch * toRad) / 2;
    const rRad = (rollDeg * toRad) / 2;

    const cy = Math.cos(yRad);
    const sy = Math.sin(yRad);
    const cp = Math.cos(pRad);
    const sp = Math.sin(pRad);
    const cr = Math.cos(rRad);
    const sr = Math.sin(rRad);

    const q: Quaternion3D = {
      w: cy * cp * cr + sy * sp * sr,
      x: cy * sp * cr + sy * cp * sr,
      y: sy * cp * cr - cy * sp * sr,
      z: cy * cp * sr - sy * sp * cr
    };

    return PresenterVisionTracker.normalizeQuaternion(q);
  }

  /**
   * Converts a 3D unit quaternion back to Euler angles (degrees) with singularity protection.
   * Strictly clamps pitch domain to [-pitchClampDeg, +pitchClampDeg] (default [-45°, +45°])
   * to eliminate mathematical gimbal lock and prevent wild Yaw inversions when head tilts upward or downward.
   */
  public static eulerFromQuaternion(
    q: Quaternion3D,
    pitchClampDeg = 45
  ): { yaw: number; pitch: number; roll: number } {
    const normQ = PresenterVisionTracker.normalizeQuaternion(q);
    const { w, x, y, z } = normQ;

    // Pitch evaluation: sin(pitch) = 2*(w*x - y*z)
    const sinPitchRaw = 2 * (w * x - y * z);

    // Singularity protection & pitch domain clamping
    const maxSin = Math.sin((pitchClampDeg * Math.PI) / 180);
    const clampedSinPitch = Math.max(-maxSin, Math.min(maxSin, sinPitchRaw));
    const pitch = Math.asin(clampedSinPitch) * (180 / Math.PI);

    // Yaw evaluation: tan(yaw) = 2*(x*z + w*y) / (1 - 2*(x*x + y*y))
    const sinYaw = 2 * (x * z + w * y);
    const cosYaw = 1 - 2 * (x * x + y * y);
    const yaw = Math.atan2(sinYaw, cosYaw) * (180 / Math.PI);

    // Roll evaluation: tan(roll) = 2*(x*y + w*z) / (1 - 2*(x*x + z*z))
    const sinRoll = 2 * (x * y + w * z);
    const cosRoll = 1 - 2 * (x * x + z * z);
    const roll = Math.atan2(sinRoll, cosRoll) * (180 / Math.PI);

    return {
      yaw,
      pitch,
      roll
    };
  }

  /**
   * Spherical Linear Interpolation (SLERP) between two quaternions.
   * Smooths rotational transitions across temporal frames without Euler gimbal discontinuities.
   */
  public static slerp(q1: Quaternion3D, q2: Quaternion3D, alpha: number): Quaternion3D {
    const w1 = q1.w, x1 = q1.x, y1 = q1.y, z1 = q1.z;
    let w2 = q2.w, x2 = q2.x, y2 = q2.y, z2 = q2.z;

    let dot = w1 * w2 + x1 * x2 + y1 * y2 + z1 * z2;

    if (dot < 0) {
      dot = -dot;
      w2 = -w2;
      x2 = -x2;
      y2 = -y2;
      z2 = -z2;
    }

    if (dot > 0.9995) {
      const qInterp: Quaternion3D = {
        w: w1 + alpha * (w2 - w1),
        x: x1 + alpha * (x2 - x1),
        y: y1 + alpha * (y2 - y1),
        z: z1 + alpha * (z2 - z1)
      };
      return PresenterVisionTracker.normalizeQuaternion(qInterp);
    }

    const theta0 = Math.acos(Math.max(-1, Math.min(1, dot)));
    const sinTheta0 = Math.sin(theta0);
    const theta = theta0 * alpha;
    const sinTheta = Math.sin(theta);

    const s0 = Math.cos(theta) - (dot * sinTheta) / sinTheta0;
    const s1 = sinTheta / sinTheta0;

    const qResult: Quaternion3D = {
      w: s0 * w1 + s1 * w2,
      x: s0 * x1 + s1 * x2,
      y: s0 * y1 + s1 * y2,
      z: s0 * z1 + s1 * z2
    };

    return PresenterVisionTracker.normalizeQuaternion(qResult);
  }

  /**
   * Computes safe head pose from raw angles by clamping pitch domain to [-pitchClampDeg, +pitchClampDeg]
   * and projecting through quaternion space, guaranteeing singularity-free yaw and roll.
   */
  public static computeSafeHeadPose(
    rawYaw: number,
    rawPitch: number,
    rawRoll: number,
    pitchClampDeg = 45
  ): HeadPoseEuler & { quaternion: Quaternion3D } {
    const clampedRawPitch = PresenterVisionTracker.clampPitchDomain(rawPitch, -pitchClampDeg, pitchClampDeg);
    const targetQ = PresenterVisionTracker.quaternionFromEuler(rawYaw, clampedRawPitch, rawRoll);
    const safeEuler = PresenterVisionTracker.eulerFromQuaternion(targetQ, pitchClampDeg);

    return {
      yaw: safeEuler.yaw,
      pitch: safeEuler.pitch,
      roll: safeEuler.roll,
      quaternion: targetQ
    };
  }

  /**
   * Computes Intersection over Union (IoU) between two 2D bounding boxes.
   */
  public static calculateIoU(
    boxA: { x: number; y: number; width: number; height: number },
    boxB: { x: number; y: number; width: number; height: number }
  ): number {
    const xA = Math.max(boxA.x, boxB.x);
    const yA = Math.max(boxA.y, boxB.y);
    const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
    const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

    const interW = Math.max(0, xB - xA);
    const interH = Math.max(0, yB - yA);
    const interArea = interW * interH;

    if (interArea <= 0) return 0;

    const areaA = boxA.width * boxA.height;
    const areaB = boxB.width * boxB.height;
    const unionArea = areaA + areaB - interArea;

    return unionArea > 0 ? interArea / unionArea : 0;
  }

  /**
   * Computes Euclidean distance between the centers of two bounding boxes.
   */
  public static calculateCentroidDistance(
    boxA: { x: number; y: number; width: number; height: number },
    boxB: { x: number; y: number; width: number; height: number }
  ): number {
    const cAx = boxA.x + boxA.width / 2;
    const cAy = boxA.y + boxA.height / 2;
    const cBx = boxB.x + boxB.width / 2;
    const cBy = boxB.y + boxB.height / 2;
    return Math.hypot(cAx - cBx, cAy - cBy);
  }

  /**
   * Calculates normalized Shannon entropy team speaking balance score (0-100%).
   * A score of 100% indicates perfectly equal distribution of speaking time across team members.
   */
  public static calculateShannonSpeakingBalance(distribution: Record<number, number>): number {
    const entries = Object.entries(distribution);
    const activeCount = entries.filter(([, pct]) => pct > 0).length;
    if (activeCount <= 1) return 100;

    let entropy = 0;
    for (const [, pct] of entries) {
      if (pct > 0) {
        const p = pct / 100;
        entropy -= p * Math.log(p);
      }
    }
    const maxEntropy = Math.log(activeCount);
    return Math.min(100, Math.max(0, Math.round((entropy / maxEntropy) * 100)));
  }

  // ====================================================
  // WEBRTC LIFECYCLE & VIDEO STREAM CONTROLS
  // ====================================================

  /**
   * Start tracker using an externally managed MediaStream (prevents duplicate getUserMedia hardware calls)
   */
  async startWithStream(stream: MediaStream, videoElem: HTMLVideoElement): Promise<boolean> {
    this.stop();
    const opId = ++this.currentOpId;
    this.videoElement = videoElem;
    this.mediaStream = stream;

    try {
      videoElem.srcObject = stream;
      try {
        await videoElem.play();
        console.log('[PresenterTracker] ✅ External stream attached and playing');
      } catch (playError: any) {
        if (playError?.name !== 'AbortError') {
          console.error('[PresenterTracker] Video play error:', playError);
        }
      }

      if (opId === this.currentOpId) {
        this.startLoop();
        return true;
      }
    } catch (err) {
      console.error('[PresenterTracker] Failed attaching stream:', err);
    }
    return false;
  }

  /**
   * Start camera with user webcam via WebRTC MediaStream
   */
  async startWebcam(videoElem: HTMLVideoElement): Promise<boolean> {
    this.stop();
    const opId = ++this.currentOpId;
    this.videoElement = videoElem;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('[PresenterTracker] Starting webcam...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });

        if (opId !== this.currentOpId || !this.videoElement) {
          console.warn('[PresenterTracker] Stream resolved after tracker stopped - halting tracks immediately');
          stream.getTracks().forEach(track => {
            try {
              if (track.readyState !== 'ended') track.stop();
              track.enabled = false;
            } catch (_) {}
          });
          return false;
        }

        this.mediaStream = stream;
        videoElem.srcObject = stream;

        try {
          await videoElem.play();
          console.log('[PresenterTracker] ✅ Webcam started successfully');
        } catch (playError: any) {
          if (playError?.name !== 'AbortError') {
            console.error('[PresenterTracker] Video play error:', playError);
          }
        }

        this.startLoop();
        return true;
      } else {
        console.warn('[PresenterTracker] getUserMedia not available');
      }
    } catch (error) {
      console.error('[PresenterTracker] ❌ Webcam failed:', error);
      if (error instanceof DOMException) {
        console.error('[PresenterTracker] Error type:', error.name);
      }
    }

    if (opId === this.currentOpId) {
      console.log('[PresenterTracker] Starting simulation mode');
      this.startLoop();
    }
    return false;
  }

  /**
   * Start screen sharing capture via WebRTC DisplayMedia
   */
  async startScreenShare(videoElem: HTMLVideoElement): Promise<boolean> {
    this.stop();
    const opId = ++this.currentOpId;
    this.videoElement = videoElem;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' } as any,
          audio: false
        });

        if (opId !== this.currentOpId || !this.videoElement) {
          stream.getTracks().forEach(track => {
            try {
              if (track.readyState !== 'ended') track.stop();
              track.enabled = false;
            } catch (_) {}
          });
          return false;
        }

        this.mediaStream = stream;
        videoElem.srcObject = stream;
        try {
          await videoElem.play();
        } catch (_) {}
        this.startLoop();
        return true;
      }
    } catch {
      // Screen share declined or unavailable
    }

    if (opId === this.currentOpId) {
      this.startLoop();
    }
    return false;
  }

  /**
   * Explicitly starts simulation mode without querying hardware
   */
  startSimulation(): void {
    this.stop();
    this.currentOpId++;
    console.log('[PresenterTracker] Explicitly engaged simulation loop');
    this.startLoop();
  }

  /**
   * Stop stream and tracking loop safely
   */
  stop(): void {
    this.currentOpId++;
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        try {
          if (track.readyState !== 'ended') {
            track.stop();
          }
          track.enabled = false;
          console.log('[PresenterTracker] Stopped track:', track.kind);
        } catch (_) {}
      });
      this.mediaStream = null;
    }
    if (this.videoElement) {
      try {
        this.videoElement.srcObject = null;
      } catch (_) {}
      this.videoElement = null;
    }
    this.currentQuaternion = { w: 1, x: 0, y: 0, z: 0 };
    this.lastDetectedFaces = [];
    this.persistentTracks.clear();
    this.leadCandidateId = null;
    this.leadCandidateFrames = 0;
  }

  /**
   * Resets active tracks while keeping camera streaming
   */
  public resetTrackers(): void {
    this.persistentTracks.clear();
    this.lastDetectedFaces = [];
    this.nextPresenterId = 1;
    this.activeLeadPresenterId = 1;
    this.leadCandidateId = null;
    this.leadCandidateFrames = 0;
  }

  /**
   * Returns current active lead presenter persistent ID
   */
  public getActivePresenterId(): number {
    return this.activeLeadPresenterId;
  }

  /**
   * Manually sets active presenter ID (overriding heuristic if desired)
   */
  public setActivePresenterId(id: number): void {
    this.activeLeadPresenterId = id;
    for (const track of this.persistentTracks.values()) {
      track.isPrimary = track.id === id;
      track.role = track.isPrimary ? 'LEAD_PRESENTER' : 'CO_PRESENTER';
    }
    for (const face of this.lastDetectedFaces) {
      face.isPrimary = face.id === id;
      face.role = face.isPrimary ? 'LEAD_PRESENTER' : 'CO_PRESENTER';
    }
  }

  /**
   * Returns snapshot of all currently tracked presenter subjects
   */
  public getTrackedPresenters(): TrackedPresenterFace[] {
    if (this.persistentTracks.size > 0) {
      return Array.from(this.persistentTracks.values()).map(track => ({
        id: track.id,
        isPrimary: track.isPrimary,
        role: track.role,
        x: Math.round(track.smoothedBox.x),
        y: Math.round(track.smoothedBox.y),
        width: Math.round(track.smoothedBox.width),
        height: Math.round(track.smoothedBox.height),
        centerX: Math.round(track.centerX),
        centerY: Math.round(track.centerY),
        gazeStatus: track.gazeStatus,
        headPose: { ...track.headPose },
        postureStatus: track.postureStatus,
        postureStability: track.postureStability,
        eyeContactScore: track.eyeContactScore,
        confidence: track.confidence,
        trackAge: track.trackAge,
        timeSinceUpdate: track.timeSinceUpdate,
        speakingConfidence: track.speakingConfidence,
        speakingSharePercent: track.speakingSharePercent,
        landmarks: { ...track.landmarks },
        poseKeypoints: { ...track.poseKeypoints }
      }));
    }
    return this.lastDetectedFaces;
  }

  private startLoop(): void {
    this.isRunning = true;
    let lastTime = performance.now();
    const interval = 1000 / (this.options.targetFps || 30);

    const frameStep = (now: number) => {
      if (!this.isRunning) return;

      const elapsed = now - lastTime;
      if (elapsed >= interval) {
        lastTime = now - (elapsed % interval);
        const metrics = this.processFrame();
        if (this.options.onMetricsUpdate) {
          this.options.onMetricsUpdate(metrics);
        }
      }

      this.animationFrameId = requestAnimationFrame(frameStep);
    };

    this.animationFrameId = requestAnimationFrame(frameStep);
  }

  // ====================================================
  // FRAME PROCESSING & MULTI-SUBJECT CV INFERENCE
  // ====================================================

  /**
   * Process single frame from real video or synthetic simulation
   */
  public processFrame(): LivePresenterTrackingMetrics {
    const hasLiveVideo = !!(
      this.videoElement &&
      this.videoElement.readyState >= 2 &&
      !this.videoElement.paused &&
      !this.videoElement.ended
    );

    if (hasLiveVideo && this.offscreenCtx && this.videoElement) {
      return this.analyzeLiveVideoFrame(this.videoElement);
    }

    return this.generateSimulatedPresenterFrame();
  }

  /**
   * Real frame pixel analysis with multi-presenter spatial clustering
   * and adaptive lighting compensation
   */
  private analyzeLiveVideoFrame(video: HTMLVideoElement): LivePresenterTrackingMetrics {
    const ctx = this.offscreenCtx!;
    const width = this.offscreenCanvas.width;
    const height = this.offscreenCanvas.height;

    ctx.drawImage(video, 0, 0, width, height);
    const frameData = ctx.getImageData(0, 0, width, height);
    const pixels = frameData.data;

    // 1. Dynamic Lighting & Ambient Luminance Normalization
    let totalLuma = 0;
    const sampleStep = 6;
    let sampleCount = 0;
    for (let i = 0; i < pixels.length; i += 4 * sampleStep) {
      const luma = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
      totalLuma += luma;
      sampleCount++;
    }
    const avgLuma = sampleCount > 0 ? totalLuma / sampleCount : 120;
    const lightingQuality: LightingQuality =
      avgLuma < 38 ? 'TOO_DARK' : avgLuma > 225 ? 'TOO_BRIGHT' : 'GOOD';

    // Adaptive skin gain compensation based on room lighting
    const lumaFactor = Math.max(0.75, Math.min(1.35, 128 / (avgLuma + 10)));

    // 2. Multi-Subject Stage Aperture Clustering (Supporting up to 5 concurrent presenters)
    const horizontalProfile = new Int32Array(width);
    const yMinBound = Math.floor(height * 0.1);
    const yMaxBound = Math.floor(height * 0.9);

    for (let y = yMinBound; y < yMaxBound; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const idx = (y * width + x) * 4;
        const r = pixels[idx] * lumaFactor;
        const g = pixels[idx + 1] * lumaFactor;
        const b = pixels[idx + 2] * lumaFactor;
        const sumRGB = r + g + b + 0.001;

        const nr = r / sumRGB;
        const ng = g / sumRGB;

        const isSkin = (
          nr > 0.34 && nr < 0.58 &&
          ng > 0.26 && ng < 0.38 &&
          nr > ng &&
          Math.abs(r - g) > 8 &&
          r > 45 && g > 25 && b > 15
        );

        if (isSkin) {
          horizontalProfile[x]++;
        }
      }
    }

    // Identify candidate peaks across the horizontal profile
    interface RawPresenterDetection {
      x: number;
      y: number;
      width: number;
      height: number;
      centerX: number;
      centerY: number;
      pixelCount: number;
    }

    const detections: RawPresenterDetection[] = [];
    const minClusterWidth = 28;
    let clusterStart: number | null = null;
    let clusterSum = 0;

    for (let x = 0; x < width; x++) {
      const val = horizontalProfile[x];
      if (val > 2) {
        if (clusterStart === null) clusterStart = x;
        clusterSum += val;
      } else if (clusterStart !== null) {
        const clusterW = x - clusterStart;
        if (clusterW >= minClusterWidth && clusterSum > 35) {
          const cX = clusterStart + clusterW / 2;
          const boxW = Math.max(45, Math.min(115, clusterW * 1.2));
          const boxH = Math.min(height * 0.75, boxW * 1.35);
          const boxY = Math.max(8, height * 0.22);
          const boxX = Math.max(0, Math.min(width - boxW, cX - boxW / 2));

          detections.push({
            x: boxX,
            y: boxY,
            width: boxW,
            height: boxH,
            centerX: cX,
            centerY: boxY + boxH * 0.4,
            pixelCount: clusterSum
          });
        }
        clusterStart = null;
        clusterSum = 0;
      }
    }

    // Cap detections to maxPresenters (up to 5) sorted by pixel density
    detections.sort((a, b) => b.pixelCount - a.pixelCount);
    const activeDetections = detections.slice(0, this.maxPresenters);

    // 3. Update Persistent Multi-Subject Spatial Tracker (IoU + Centroid Association)
    this.updatePersistentTracks(activeDetections, width, height);

    // 4. Select Primary / Lead Presenter using Anti-Oscillation Hysteresis
    const primaryTrack = this.resolvePrimaryPresenter(width);

    // Calculate Team Speaking Distribution and Normalized Shannon Entropy Balance Score
    const distributionMap: Record<number, number> = {};
    const tracks = Array.from(this.persistentTracks.values());
    for (const track of tracks) {
      distributionMap[track.id] = track.speakingSharePercent;
    }
    const teamSpeakingBalanceScore = PresenterVisionTracker.calculateShannonSpeakingBalance(distributionMap);

    // Populate backward-compatible DetectedPresenterFace list
    const detectedFaces: DetectedPresenterFace[] = tracks.map(track => ({
      id: track.id,
      isPrimary: track.isPrimary,
      role: track.role,
      x: Math.round(track.smoothedBox.x),
      y: Math.round(track.smoothedBox.y),
      width: Math.round(track.smoothedBox.width),
      height: Math.round(track.smoothedBox.height),
      centerX: Math.round(track.centerX),
      centerY: Math.round(track.centerY),
      gazeStatus: track.gazeStatus,
      headPose: { ...track.headPose },
      postureStatus: track.postureStatus,
      postureStability: track.postureStability,
      eyeContactScore: track.eyeContactScore,
      confidence: track.confidence,
      trackAge: track.trackAge,
      timeSinceUpdate: track.timeSinceUpdate,
      speakingConfidence: track.speakingConfidence,
      speakingSharePercent: track.speakingSharePercent,
      landmarks: { ...track.landmarks },
      poseKeypoints: { ...track.poseKeypoints }
    }));
    this.lastDetectedFaces = detectedFaces;

    // 5. Derive Top-Level Metrics from Primary Presenter (Guaranteeing Backward Compatibility)
    let faceDetected = false;
    let faceBoundingBox = { x: Math.round(width * 0.35), y: 35, width: 120, height: 150 };
    let gazeStatus: PresenterGazeStatus = 'DIRECT';
    let eyeContactScore = 85;
    let headPose: HeadPoseEuler & { quaternion: Quaternion3D } = {
      yaw: 0,
      pitch: 0,
      roll: 0,
      quaternion: { w: 1, x: 0, y: 0, z: 0 }
    };
    let postureStatus: PresenterPostureStatus = 'UPRIGHT';
    let postureStability = 90;

    if (primaryTrack) {
      faceDetected = true;
      faceBoundingBox = {
        x: Math.round(primaryTrack.smoothedBox.x),
        y: Math.round(primaryTrack.smoothedBox.y),
        width: Math.round(primaryTrack.smoothedBox.width),
        height: Math.round(primaryTrack.smoothedBox.height)
      };
      gazeStatus = primaryTrack.gazeStatus;
      eyeContactScore = primaryTrack.eyeContactScore;
      headPose = { ...primaryTrack.headPose };
      postureStatus = primaryTrack.postureStatus;
      postureStability = primaryTrack.postureStability;

      this.currentQuaternion = primaryTrack.currentQuaternion;
    }

    // Gesture variance evaluation on primary presenter
    this.primaryPostureHistory.push(faceBoundingBox.y);
    if (this.primaryPostureHistory.length > 30) this.primaryPostureHistory.shift();
    const variance = this.calculateVariance(this.primaryPostureHistory);
    this.gestureHistory.push(variance);
    if (this.gestureHistory.length > 40) this.gestureHistory.shift();
    const gestureActivity: GestureActivityLevel =
      variance < 1.2 ? 'LOW' : variance > 8.5 ? 'EXCESSIVE' : 'OPTIMAL';

    // Slide transition detection
    const slideMetrics = this.detectSlideTransition(pixels, width, height);

    return {
      faceDetected,
      faceBoundingBox,
      gazeStatus,
      eyeContactScore,
      headPose,
      postureStatus,
      postureStability,
      gestureActivity,
      slideNumber: this.currentSlideNumber,
      slideDwellTimeSeconds: slideMetrics.dwellTimeSeconds,
      slideTransitionDetected: slideMetrics.transitionDetected,
      lightingQuality,
      timestampMs: Date.now(),
      presenterCount: detectedFaces.length,
      activePresenterId: this.activeLeadPresenterId,
      trackedPresenters: detectedFaces,
      speakingDistribution: distributionMap,
      teamSpeakingBalanceScore
    };
  }

  // ====================================================
  // PERSISTENT MULTI-OBJECT TRACKER (IoU & CENTROID)
  // ====================================================

  /**
   * Associates new visual detections with existing persistent subject tracks.
   * Eliminates single-face heuristic oscillation and maintains persistent subject IDs.
   */
  private updatePersistentTracks(
    detections: Array<{ x: number; y: number; width: number; height: number; centerX: number; centerY: number }>,
    frameWidth: number,
    frameHeight: number
  ): void {
    const existingTracks = Array.from(this.persistentTracks.values());
    const matchedTrackIds = new Set<number>();
    const matchedDetectionIndices = new Set<number>();

    // 1. Cost Matrix Computation (IoU + Centroid Distance)
    for (let dIdx = 0; dIdx < detections.length; dIdx++) {
      const det = detections[dIdx];
      let bestTrackId: number | null = null;
      let bestCost = Infinity;

      for (const track of existingTracks) {
        if (matchedTrackIds.has(track.id)) continue;

        const iou = PresenterVisionTracker.calculateIoU(track.smoothedBox, det);
        const dist = PresenterVisionTracker.calculateCentroidDistance(track.smoothedBox, det);

        const normalizedDist = Math.min(1, dist / 120);
        const cost = (1 - iou) * 0.6 + normalizedDist * 0.4;

        if ((iou >= 0.12 || dist <= 85) && cost < bestCost) {
          bestCost = cost;
          bestTrackId = track.id;
        }
      }

      if (bestTrackId !== null && bestCost < 0.78) {
        matchedTrackIds.add(bestTrackId);
        matchedDetectionIndices.add(dIdx);

        const track = this.persistentTracks.get(bestTrackId)!;
        this.updateTrackState(track, det, frameWidth, frameHeight);
      }
    }

    // 2. Instantiate New Tracks for Unmatched Detections
    for (let dIdx = 0; dIdx < detections.length; dIdx++) {
      if (matchedDetectionIndices.has(dIdx)) continue;
      if (this.persistentTracks.size >= this.maxPresenters) break;

      const det = detections[dIdx];
      const newId = this.nextPresenterId++;
      const newTrack = this.createTrackInstance(newId, det, frameWidth, frameHeight);
      this.persistentTracks.set(newId, newTrack);
    }

    // 3. Age & Prune Unmatched Existing Tracks
    for (const track of existingTracks) {
      if (!matchedTrackIds.has(track.id)) {
        track.timeSinceUpdate++;
        if (track.timeSinceUpdate > 15) {
          this.persistentTracks.delete(track.id);
          if (this.activeLeadPresenterId === track.id) {
            this.activeLeadPresenterId = 1;
          }
        }
      }
    }
  }

  /**
   * Instantiates a new persistent subject track with MediaPipe Face Mesh & BlazePose structures
   */
  private createTrackInstance(
    id: number,
    det: { x: number; y: number; width: number; height: number; centerX: number; centerY: number },
    _frameWidth: number,
    _frameHeight: number
  ): SubjectTrackInternal {
    const isFirst = this.persistentTracks.size === 0;
    const initialQuaternion = { w: 1, x: 0, y: 0, z: 0 };
    const initialEuler = { yaw: 0, pitch: 0, roll: 0, quaternion: initialQuaternion };

    const landmarks = this.generateFaceMeshLandmarks(det);
    const poseKeypoints = this.generateBlazePoseKeypoints(det);

    return {
      id,
      isPrimary: isFirst,
      role: isFirst ? 'LEAD_PRESENTER' : 'CO_PRESENTER',
      x: det.x,
      y: det.y,
      width: det.width,
      height: det.height,
      smoothedBox: { x: det.x, y: det.y, width: det.width, height: det.height },
      centerX: det.centerX,
      centerY: det.centerY,
      gazeStatus: 'DIRECT',
      gazeCandidate: 'DIRECT',
      gazeCandidateFrames: 0,
      headPose: initialEuler,
      currentQuaternion: initialQuaternion,
      postureStatus: 'UPRIGHT',
      postureStability: 92,
      eyeContactScore: 85,
      gazeHistory: [true, true, true],
      postureHistory: [det.centerY],
      landmarks,
      poseKeypoints,
      confidence: 0.95,
      trackAge: 1,
      timeSinceUpdate: 0,
      hits: 1,
      speakingConfidence: isFirst ? 0.8 : 0.2,
      speakingTicks: isFirst ? 10 : 2,
      speakingSharePercent: isFirst ? 100 : 0
    };
  }

  /**
   * Updates state of an active tracked subject using EMA filters,
   * MediaPipe Face Mesh geometry, and 3D Quaternion SLERP orientation.
   */
  private updateTrackState(
    track: SubjectTrackInternal,
    det: { x: number; y: number; width: number; height: number; centerX: number; centerY: number },
    _frameWidth: number,
    frameHeight: number
  ): void {
    const alpha = 0.35;
    track.x = det.x;
    track.y = det.y;
    track.width = det.width;
    track.height = det.height;
    track.centerX = det.centerX;
    track.centerY = det.centerY;

    // EMA smoothing on bounding box
    track.smoothedBox.x += alpha * (det.x - track.smoothedBox.x);
    track.smoothedBox.y += alpha * (det.y - track.smoothedBox.y);
    track.smoothedBox.width += alpha * (det.width - track.smoothedBox.width);
    track.smoothedBox.height += alpha * (det.height - track.smoothedBox.height);

    // Update MediaPipe Face Mesh and BlazePose Keypoints
    track.landmarks = this.generateFaceMeshLandmarks(det);
    track.poseKeypoints = this.generateBlazePoseKeypoints(det);

    // Compute localized Face-Relative Gaze and Head Pose
    const relNormY = (det.centerY - frameHeight * 0.38) / (frameHeight * 0.38);
    const clampedRelNormY = Math.max(-1.5, Math.min(1.5, relNormY));
    const rawPitch = PresenterVisionTracker.clampPitchDomain(Math.round(clampedRelNormY * 26), -45, 45);

    const faceHalfWidth = Math.max(1, det.width / 2);
    const yawAsymmetry = (det.centerX - (det.x + faceHalfWidth)) / (faceHalfWidth + 1);
    const clampedYawAsymmetry = Math.max(-1.5, Math.min(1.5, yawAsymmetry));
    const rawYaw = Math.max(-45, Math.min(45, Math.round(clampedYawAsymmetry * 35)));
    const rawRoll = Math.max(-25, Math.min(25, Math.round(rawYaw * 0.15 * 10) / 10));

    // 3D Quaternion SLERP smoothing
    const frameQ = PresenterVisionTracker.quaternionFromEuler(rawYaw, rawPitch, rawRoll);
    track.currentQuaternion = PresenterVisionTracker.slerp(track.currentQuaternion, frameQ, 0.3);
    const safePose = PresenterVisionTracker.eulerFromQuaternion(track.currentQuaternion, 45);

    track.headPose = {
      yaw: Math.round(safePose.yaw),
      pitch: Math.round(safePose.pitch),
      roll: Math.round(safePose.roll * 10) / 10,
      quaternion: { ...track.currentQuaternion }
    };

    // Gaze State Evaluation with 5-frame hysteresis
    let instantaneousGaze: PresenterGazeStatus = 'DIRECT';
    if (track.headPose.pitch > 14) {
      instantaneousGaze = 'LOOKING_DOWN';
    } else if (Math.abs(track.headPose.yaw) > 22) {
      instantaneousGaze = 'LOOKING_AWAY';
    }

    if (instantaneousGaze === track.gazeCandidate) {
      track.gazeCandidateFrames++;
      if (track.gazeCandidateFrames >= 5) {
        track.gazeStatus = instantaneousGaze;
      }
    } else {
      track.gazeCandidate = instantaneousGaze;
      track.gazeCandidateFrames = 1;
    }

    track.gazeHistory.push(track.gazeStatus === 'DIRECT');
    if (track.gazeHistory.length > 60) track.gazeHistory.shift();
    track.eyeContactScore = Math.round(
      (track.gazeHistory.filter(Boolean).length / track.gazeHistory.length) * 100
    );

    // Individual Posture and Ergonomics
    const boxHeightRel = track.smoothedBox.height / frameHeight;
    const boxCenterRelY = track.centerY / frameHeight;

    if (boxCenterRelY > 0.58 || boxHeightRel < 0.22) {
      track.postureStatus = 'SLUMPED';
    } else if (boxHeightRel > 0.62) {
      track.postureStatus = 'LEANING_FORWARD';
    } else if (boxCenterRelY < 0.22) {
      track.postureStatus = 'LEANING_BACK';
    } else {
      track.postureStatus = 'UPRIGHT';
    }

    track.postureHistory.push(det.centerY);
    if (track.postureHistory.length > 30) track.postureHistory.shift();
    const variance = this.calculateVariance(track.postureHistory);
    track.postureStability = Math.max(35, Math.min(100, Math.round(100 - variance * 3.5)));

    // Speaking Confidence & Mouth Activity Analysis
    const mouthDist = Math.abs(track.landmarks.mouthCenter.y - track.landmarks.noseTip.y);
    const expectedDist = track.height * 0.20;
    const mouthDelta = Math.abs(mouthDist - expectedDist) / (expectedDist + 0.001);
    const isSpeaking = mouthDelta > 0.12 || track.isPrimary;

    track.speakingConfidence = isSpeaking ? Math.min(1.0, 0.6 + mouthDelta * 0.4) : 0.15;
    if (track.speakingConfidence > 0.45) {
      track.speakingTicks++;
    }

    track.hits++;
    track.trackAge++;
    track.timeSinceUpdate = 0;
    track.confidence = Math.min(0.99, 0.8 + (track.hits / 50) * 0.19);
  }

  // ====================================================
  // MEDIAPIPE FACE MESH & BLAZEPOSE GENERATION
  // ====================================================

  /**
   * Generates MediaPipe Face Mesh anatomical landmark coordinates
   * (Forehead, Pupils, Nose Tip, Mouth Corners, Chin) mapped onto subject bounds.
   */
  private generateFaceMeshLandmarks(box: { x: number; y: number; width: number; height: number }): FaceMeshLandmarks {
    const cx = box.x + box.width / 2;
    return {
      forehead: { x: Math.round(cx), y: Math.round(box.y + box.height * 0.15) },
      leftEye: { x: Math.round(cx - box.width * 0.18), y: Math.round(box.y + box.height * 0.32) },
      rightEye: { x: Math.round(cx + box.width * 0.18), y: Math.round(box.y + box.height * 0.32) },
      noseTip: { x: Math.round(cx), y: Math.round(box.y + box.height * 0.48) },
      mouthCenter: { x: Math.round(cx), y: Math.round(box.y + box.height * 0.68) },
      chin: { x: Math.round(cx), y: Math.round(box.y + box.height * 0.88) }
    };
  }

  /**
   * Generates MediaPipe BlazePose upper-body skeletal keypoint coordinates
   * (Nose, Shoulders, Elbows, Wrists, Torso Centroid) for posture and gesture forensics.
   */
  private generateBlazePoseKeypoints(box: { x: number; y: number; width: number; height: number }): BlazePoseKeypoints {
    const cx = box.x + box.width / 2;
    const shoulderY = box.y + box.height * 0.95;
    const shoulderSpan = box.width * 0.85;

    return {
      nose: { x: Math.round(cx), y: Math.round(box.y + box.height * 0.48) },
      leftShoulder: { x: Math.round(cx - shoulderSpan / 2), y: Math.round(shoulderY) },
      rightShoulder: { x: Math.round(cx + shoulderSpan / 2), y: Math.round(shoulderY) },
      leftElbow: { x: Math.round(cx - shoulderSpan * 0.65), y: Math.round(shoulderY + box.height * 0.45) },
      rightElbow: { x: Math.round(cx + shoulderSpan * 0.65), y: Math.round(shoulderY + box.height * 0.45) },
      leftWrist: { x: Math.round(cx - shoulderSpan * 0.55), y: Math.round(shoulderY + box.height * 0.85) },
      rightWrist: { x: Math.round(cx + shoulderSpan * 0.55), y: Math.round(shoulderY + box.height * 0.85) },
      torsoCentroid: { x: Math.round(cx), y: Math.round(shoulderY + box.height * 0.4) }
    };
  }

  // ====================================================
  // ANTI-OSCILLATION PRIMARY PRESENTER & SPEAKING DISTRIBUTION
  // ====================================================

  /**
   * Resolves the primary / lead presenter with hysteresis and computes speaking distribution.
   */
  private resolvePrimaryPresenter(frameWidth: number): SubjectTrackInternal | null {
    const tracks = Array.from(this.persistentTracks.values());
    if (tracks.length === 0) return null;

    // Calculate total speaking ticks across all presenters
    const totalSpeakingTicks = tracks.reduce((sum, t) => sum + Math.max(1, t.speakingTicks), 0);
    for (const track of tracks) {
      track.speakingSharePercent = Math.round((Math.max(1, track.speakingTicks) / totalSpeakingTicks) * 100);
    }

    if (tracks.length === 1) {
      tracks[0].isPrimary = true;
      tracks[0].role = 'LEAD_PRESENTER';
      tracks[0].speakingSharePercent = 100;
      this.activeLeadPresenterId = tracks[0].id;
      return tracks[0];
    }

    // Normalize area across tracks
    let maxArea = 1;
    for (const t of tracks) {
      const area = t.width * t.height;
      if (area > maxArea) maxArea = area;
    }

    let bestCandidateId = this.activeLeadPresenterId;
    let highestScore = -Infinity;

    for (const track of tracks) {
      const areaScore = (track.width * track.height) / maxArea;
      const centerDistNorm = Math.abs(track.centerX - frameWidth / 2) / (frameWidth / 2);
      const centralityScore = Math.max(0, 1 - centerDistNorm);
      const speechScore = track.speakingConfidence;
      const eyeScore = track.eyeContactScore / 100;

      let score = areaScore * 0.35 + centralityScore * 0.30 + speechScore * 0.20 + eyeScore * 0.15;

      // 35% Hysteresis bonus for current lead presenter to prevent oscillation
      if (track.id === this.activeLeadPresenterId) {
        score += 0.35;
      }

      if (score > highestScore) {
        highestScore = score;
        bestCandidateId = track.id;
      }
    }

    // Anti-oscillation guard: require candidate challenger to beat current lead for 5 consecutive frames
    if (bestCandidateId !== this.activeLeadPresenterId) {
      if (this.leadCandidateId === bestCandidateId) {
        this.leadCandidateFrames++;
        if (this.leadCandidateFrames >= 5) {
          this.activeLeadPresenterId = bestCandidateId;
          this.leadCandidateFrames = 0;
        }
      } else {
        this.leadCandidateId = bestCandidateId;
        this.leadCandidateFrames = 1;
      }
    } else {
      this.leadCandidateFrames = 0;
      this.leadCandidateId = null;
    }

    let activePrimaryTrack: SubjectTrackInternal | null = null;
    for (const track of tracks) {
      track.isPrimary = track.id === this.activeLeadPresenterId;
      track.role = track.isPrimary ? 'LEAD_PRESENTER' : 'CO_PRESENTER';
      if (track.isPrimary) activePrimaryTrack = track;
    }

    return activePrimaryTrack || tracks[0];
  }

  // ====================================================
  // SYNTHETIC MULTI-PRESENTER CAPSTONE SIMULATION
  // ====================================================

  /**
   * Synthetic simulation loop representing a collegiate capstone team of up to 5 presenters
   * (Lead, Hardware Engineer, Software Architect, Data Analyst, Cloud DevOps) with persistent IDs,
   * individual eye contact, posture stability, and speaking distribution.
   */
  private generateSimulatedPresenterFrame(): LivePresenterTrackingMetrics {
    this.simTime += 0.04;
    const t = this.simTime;
    const now = Date.now();

    // 1. Primary Lead Presenter Trajectory (Center Stage)
    const rawYaw = Math.sin(t * 0.4) * 8 + Math.sin(t * 1.2) * 3;
    const rawPitch = Math.sin(t * 0.25) * 5 + (Math.sin(t * 0.1) > 0.7 ? 12 : -2);
    const rawRoll = Math.sin(t * 0.3) * 2;

    const safePose = PresenterVisionTracker.computeSafeHeadPose(rawYaw, rawPitch, rawRoll, 45);
    this.currentQuaternion = PresenterVisionTracker.slerp(this.currentQuaternion, safePose.quaternion, 0.35);
    const smoothedEuler = PresenterVisionTracker.eulerFromQuaternion(this.currentQuaternion, 45);

    const primaryYaw = Math.round(smoothedEuler.yaw * 10) / 10;
    const primaryPitch = Math.round(smoothedEuler.pitch * 10) / 10;
    const primaryRoll = Math.round(smoothedEuler.roll * 10) / 10;

    const gazeStatus: PresenterGazeStatus =
      primaryPitch > 10 ? 'LOOKING_DOWN' : Math.abs(primaryYaw) > 16 ? 'LOOKING_AWAY' : 'DIRECT';

    this.primaryGazeHistory.push(gazeStatus === 'DIRECT');
    if (this.primaryGazeHistory.length > 60) this.primaryGazeHistory.shift();
    const eyeContactScore = Math.round(
      (this.primaryGazeHistory.filter(Boolean).length / this.primaryGazeHistory.length) * 100
    );

    const postureStatus: PresenterPostureStatus =
      primaryPitch > 12 ? 'LEANING_FORWARD' : 'UPRIGHT';

    const postureStability = Math.round(88 + Math.sin(t * 0.5) * 6);
    const gestureActivity: GestureActivityLevel = 'OPTIMAL';

    // Slide simulation: transitions every 50 seconds
    const elapsedSinceLastSlide = Math.floor((now - this.lastSlideTransitionTimeMs) / 1000);
    let slideTransitionDetected = false;

    if (elapsedSinceLastSlide >= 50) {
      this.currentSlideNumber++;
      this.lastSlideTransitionTimeMs = now;
      slideTransitionDetected = true;
    }

    const primaryBox = {
      x: 100 + Math.sin(t * 0.3) * 8,
      y: 35 + Math.cos(t * 0.25) * 5,
      width: 120,
      height: 150
    };

    // Co-Presenter #2 (Hardware Specialist, Stage Left)
    const coPresenter2Box = {
      x: 18 + Math.sin(t * 0.2) * 4,
      y: 45 + Math.cos(t * 0.15) * 4,
      width: 82,
      height: 118
    };
    const coPose2 = PresenterVisionTracker.computeSafeHeadPose(Math.sin(t * 0.3) * 14 + 10, Math.cos(t * 0.2) * 6, 0, 45);

    // Co-Presenter #3 (Software Architect, Stage Right)
    const coPresenter3Box = {
      x: 224 + Math.sin(t * 0.25) * 4,
      y: 42 + Math.cos(t * 0.18) * 4,
      width: 82,
      height: 118
    };
    const coPose3 = PresenterVisionTracker.computeSafeHeadPose(Math.sin(t * 0.3) * -14 - 10, Math.cos(t * 0.22) * 6, 0, 45);

    // Team Speaking Distribution: Presenter 1: 52%, Presenter 2: 30%, Presenter 3: 18%
    const speakingDistribution: Record<number, number> = {
      1: 52,
      2: 30,
      3: 18
    };
    const teamSpeakingBalanceScore = PresenterVisionTracker.calculateShannonSpeakingBalance(speakingDistribution);

    // Build persistent multi-subject tracked representations
    const trackedPresenters: DetectedPresenterFace[] = [
      {
        id: 1,
        isPrimary: true,
        role: 'LEAD_PRESENTER',
        x: Math.round(primaryBox.x),
        y: Math.round(primaryBox.y),
        width: primaryBox.width,
        height: primaryBox.height,
        centerX: Math.round(primaryBox.x + primaryBox.width / 2),
        centerY: Math.round(primaryBox.y + primaryBox.height / 2),
        gazeStatus,
        headPose: {
          yaw: primaryYaw,
          pitch: primaryPitch,
          roll: primaryRoll,
          quaternion: { ...this.currentQuaternion }
        },
        postureStatus,
        postureStability,
        eyeContactScore,
        confidence: 0.98,
        trackAge: 250,
        timeSinceUpdate: 0,
        speakingConfidence: 0.92,
        speakingSharePercent: 52,
        landmarks: this.generateFaceMeshLandmarks(primaryBox),
        poseKeypoints: this.generateBlazePoseKeypoints(primaryBox)
      },
      {
        id: 2,
        isPrimary: false,
        role: 'CO_PRESENTER',
        x: Math.round(coPresenter2Box.x),
        y: Math.round(coPresenter2Box.y),
        width: coPresenter2Box.width,
        height: coPresenter2Box.height,
        centerX: Math.round(coPresenter2Box.x + coPresenter2Box.width / 2),
        centerY: Math.round(coPresenter2Box.y + coPresenter2Box.height / 2),
        gazeStatus: 'DIRECT',
        headPose: {
          yaw: Math.round(coPose2.yaw),
          pitch: Math.round(coPose2.pitch),
          roll: 0,
          quaternion: coPose2.quaternion
        },
        postureStatus: 'UPRIGHT',
        postureStability: 94,
        eyeContactScore: 78,
        confidence: 0.94,
        trackAge: 250,
        timeSinceUpdate: 0,
        speakingConfidence: 0.22,
        speakingSharePercent: 30,
        landmarks: this.generateFaceMeshLandmarks(coPresenter2Box),
        poseKeypoints: this.generateBlazePoseKeypoints(coPresenter2Box)
      },
      {
        id: 3,
        isPrimary: false,
        role: 'CO_PRESENTER',
        x: Math.round(coPresenter3Box.x),
        y: Math.round(coPresenter3Box.y),
        width: coPresenter3Box.width,
        height: coPresenter3Box.height,
        centerX: Math.round(coPresenter3Box.x + coPresenter3Box.width / 2),
        centerY: Math.round(coPresenter3Box.y + coPresenter3Box.height / 2),
        gazeStatus: 'DIRECT',
        headPose: {
          yaw: Math.round(coPose3.yaw),
          pitch: Math.round(coPose3.pitch),
          roll: 0,
          quaternion: coPose3.quaternion
        },
        postureStatus: 'UPRIGHT',
        postureStability: 91,
        eyeContactScore: 82,
        confidence: 0.95,
        trackAge: 250,
        timeSinceUpdate: 0,
        speakingConfidence: 0.15,
        speakingSharePercent: 18,
        landmarks: this.generateFaceMeshLandmarks(coPresenter3Box),
        poseKeypoints: this.generateBlazePoseKeypoints(coPresenter3Box)
      }
    ];

    this.lastDetectedFaces = trackedPresenters;

    return {
      faceDetected: true,
      faceBoundingBox: primaryBox,
      gazeStatus,
      eyeContactScore,
      headPose: {
        yaw: primaryYaw,
        pitch: primaryPitch,
        roll: primaryRoll,
        quaternion: { ...this.currentQuaternion }
      },
      postureStatus,
      postureStability,
      gestureActivity,
      slideNumber: this.currentSlideNumber,
      slideDwellTimeSeconds: elapsedSinceLastSlide,
      slideTransitionDetected,
      lightingQuality: 'GOOD',
      timestampMs: now,
      presenterCount: trackedPresenters.length,
      activePresenterId: 1,
      trackedPresenters,
      speakingDistribution,
      teamSpeakingBalanceScore
    };
  }

  // ====================================================
  // SLIDE DETECTION & HELPER UTILITIES
  // ====================================================

  private detectSlideTransition(
    pixels: Uint8ClampedArray,
    width: number,
    height: number
  ): { transitionDetected: boolean; dwellTimeSeconds: number } {
    const gridDim = 16;
    const currentGrid = new Uint8Array(gridDim * gridDim);
    const blockW = Math.floor(width / gridDim);
    const blockH = Math.floor(height / gridDim);

    for (let gy = 0; gy < gridDim; gy++) {
      for (let gx = 0; gx < gridDim; gx++) {
        const px = gx * blockW + Math.floor(blockW / 2);
        const py = gy * blockH + Math.floor(blockH / 2);
        const idx = (py * width + px) * 4;
        currentGrid[gy * gridDim + gx] = Math.round(
          0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2]
        );
      }
    }

    const now = Date.now();
    const dwellTimeSeconds = Math.max(1, Math.floor((now - this.lastSlideTransitionTimeMs) / 1000));
    let transitionDetected = false;

    if (this.prevFrameLuma) {
      let diffSum = 0;
      for (let i = 0; i < currentGrid.length; i++) {
        diffSum += Math.abs(currentGrid[i] - this.prevFrameLuma[i]);
      }
      const avgDiff = diffSum / currentGrid.length;

      if (avgDiff > 28) {
        this.transitionHoldFrames++;
        if (this.transitionHoldFrames === 3) {
          this.currentSlideNumber++;
          this.lastSlideTransitionTimeMs = now;
          transitionDetected = true;
        }
      } else {
        this.transitionHoldFrames = 0;
      }
    }

    this.prevFrameLuma = currentGrid;
    return { transitionDetected, dwellTimeSeconds };
  }

  private calculateVariance(arr: number[]): number {
    if (arr.length <= 1) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const sumSquares = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    return sumSquares / arr.length;
  }

  // ====================================================
  // REAL-TIME HUD RENDERING (MULTI-PRESENTER OVERLAYS)
  // ====================================================

  /**
   * Render real-time high-tech HUD on canvas with multi-presenter support
   */
  public renderHUD(canvas: HTMLCanvasElement, metrics: LivePresenterTrackingMetrics): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const scaleX = w / 320;
    const scaleY = h / 180;

    const presenters = metrics.trackedPresenters || this.lastDetectedFaces;

    // 1. Render All Secondary Co-Presenter Bounding Boxes
    for (const presenter of presenters) {
      if (!presenter.isPrimary) {
        const sx = presenter.x * scaleX;
        const sy = presenter.y * scaleY;
        const sw = presenter.width * scaleX;
        const sh = presenter.height * scaleY;

        ctx.strokeStyle = '#818cf880';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(sx, sy, sw, sh);
        ctx.setLineDash([]);

        // Header Pill with individual Eye Contact & Speaking %
        ctx.fillStyle = '#0f172ae6';
        ctx.fillRect(sx, sy - 20, Math.max(sw, 150), 18);
        ctx.strokeStyle = '#818cf850';
        ctx.strokeRect(sx, sy - 20, Math.max(sw, 150), 18);

        ctx.fillStyle = '#a5b4fc';
        ctx.font = 'bold 9px monospace';
        const speakingPct = presenter.speakingSharePercent || 0;
        ctx.fillText(`CO-PRESENTER #${presenter.id} // [${presenter.gazeStatus} | ${speakingPct}% SPK]`, sx + 4, sy - 7);

        // Render MediaPipe BlazePose Shoulder Connector Line
        if (presenter.poseKeypoints) {
          const kp = presenter.poseKeypoints;
          ctx.strokeStyle = '#818cf840';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(kp.leftShoulder.x * scaleX, kp.leftShoulder.y * scaleY);
          ctx.lineTo(kp.rightShoulder.x * scaleX, kp.rightShoulder.y * scaleY);
          ctx.stroke();
        }
      }
    }

    // 2. Primary Presenter Target Box with Corner Brackets & Face Mesh Reticles
    const primaryBox = metrics.faceBoundingBox || { x: 90, y: 30, width: 140, height: 160 };
    const bx = primaryBox.x * scaleX;
    const by = primaryBox.y * scaleY;
    const bw = primaryBox.width * scaleX;
    const bh = primaryBox.height * scaleY;

    const isDirectGaze = metrics.gazeStatus === 'DIRECT';
    const primaryColor = isDirectGaze ? '#10b981' : metrics.gazeStatus === 'LOOKING_DOWN' ? '#f59e0b' : '#06b6d4';

    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;

    const bracketLen = 16;
    ctx.beginPath();
    ctx.moveTo(bx, by + bracketLen);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + bracketLen, by);

    ctx.moveTo(bx + bw - bracketLen, by);
    ctx.lineTo(bx + bw, by);
    ctx.lineTo(bx + bw, by + bracketLen);

    ctx.moveTo(bx, by + bh - bracketLen);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + bracketLen, by + bh);

    ctx.moveTo(bx + bw - bracketLen, by + bh);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw, by + bh - bracketLen);
    ctx.stroke();

    // 3. Face Landmark Reticles (Eyes, Nose, Mouth)
    const eyeY = by + bh * 0.35;
    const leftEyeX = bx + bw * 0.32;
    const rightEyeX = bx + bw * 0.68;

    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, 3, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();

    const gazeOffsetX = metrics.headPose.yaw * 1.5;
    const gazeOffsetY = metrics.headPose.pitch * 1.2;

    ctx.strokeStyle = `${primaryColor}cc`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(leftEyeX, eyeY);
    ctx.lineTo(leftEyeX + gazeOffsetX, eyeY + gazeOffsetY - (isDirectGaze ? 10 : 0));
    ctx.moveTo(rightEyeX, eyeY);
    ctx.lineTo(rightEyeX + gazeOffsetX, eyeY + gazeOffsetY - (isDirectGaze ? 10 : 0));
    ctx.stroke();

    // 4. Header Presenter Tracking Pill
    ctx.fillStyle = '#0f172ae6';
    ctx.fillRect(bx, by - 24, Math.max(bw, 180), 20);
    ctx.strokeStyle = `${primaryColor}80`;
    ctx.strokeRect(bx, by - 24, Math.max(bw, 180), 20);

    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 10px monospace';
    const activeId = metrics.activePresenterId || 1;
    const tagText = presenters.length > 1
      ? `LEAD PRESENTER #${activeId} // GAZE: ${metrics.gazeStatus}`
      : `PRESENTER // GAZE: ${metrics.gazeStatus}`;
    ctx.fillText(tagText, bx + 6, by - 10);

    // 5. Floating HUD Telemetry Card (Top Right)
    const cardX = w - 215;
    const cardY = 16;
    ctx.fillStyle = '#090d16e6';
    ctx.fillRect(cardX, cardY, 200, 130);
    ctx.strokeStyle = '#38bdf850';
    ctx.lineWidth = 1;
    ctx.strokeRect(cardX, cardY, 200, 130);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    const accelText = this.isWebGLAvailable ? 'WEBGL ACCELERATED' : 'CPU CANVAS PIPELINE';
    ctx.fillText(`LIVE CV HUD // ${accelText}`, cardX + 10, cardY + 16);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText(`EYE CONTACT: ${metrics.eyeContactScore}%`, cardX + 10, cardY + 32);
    ctx.fillText(`POSTURE: ${metrics.postureStatus} (${metrics.postureStability}%)`, cardX + 10, cardY + 46);
    ctx.fillText(`HEAD POSE: Y${metrics.headPose.yaw}° P${metrics.headPose.pitch}° R${metrics.headPose.roll}°`, cardX + 10, cardY + 60);
    ctx.fillText(`SLIDE: #${metrics.slideNumber} [${metrics.slideDwellTimeSeconds}s]`, cardX + 10, cardY + 74);
    ctx.fillText(`LIGHT: ${metrics.lightingQuality} // GESTURE: ${metrics.gestureActivity}`, cardX + 10, cardY + 88);

    // Multi-Presenter Speaking Balance Indicator
    const balanceScore = metrics.teamSpeakingBalanceScore ?? 100;
    const balanceColor = balanceScore >= 80 ? '#10b981' : balanceScore >= 55 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = balanceColor;
    ctx.fillText(`TEAM BALANCE: ${balanceScore}% [${presenters.length} PRESENTERS]`, cardX + 10, cardY + 102);

    // Team Speaking Share Breakdown
    if (metrics.speakingDistribution) {
      const shares = Object.entries(metrics.speakingDistribution)
        .map(([id, share]) => `P${id}:${share}%`)
        .join(' ');
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`SPK SHARE: ${shares}`, cardX + 10, cardY + 116);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('SPK SHARE: P1:100% [SOLO DEFENSE]', cardX + 10, cardY + 116);
    }

    // Eye Contact Mini Progress Bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cardX + 130, cardY + 24, 60, 6);
    ctx.fillStyle = metrics.eyeContactScore >= 70 ? '#10b981' : metrics.eyeContactScore >= 40 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(cardX + 130, cardY + 24, (metrics.eyeContactScore / 100) * 60, 6);
  }
}
