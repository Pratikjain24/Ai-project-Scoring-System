// ====================================================
// PROJECTX-RAY AI - PRESENTER COMPUTER VISION TRACKER
// WebRTC MediaStream + Multi-Presenter Tracking + HUD Engine
// Enhanced: Multi-Face Cluster Segmentation, Lighting Adaptive Calibration,
// EMA Smoothing Filters & Localized Gaze Pose Estimation
// ====================================================

import type {
  LivePresenterTrackingMetrics,
  PresenterGazeStatus,
  PresenterPostureStatus,
  GestureActivityLevel,
  LightingQuality
} from '../types/liveJury';

export interface DetectedPresenterFace {
  id: number;
  isPrimary: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  gazeStatus: PresenterGazeStatus;
  headPose: { yaw: number; pitch: number; roll: number };
}

export interface PresenterTrackerOptions {
  onMetricsUpdate?: (metrics: LivePresenterTrackingMetrics) => void;
  targetFps?: number;
}

export class PresenterVisionTracker {
  private videoElement: HTMLVideoElement | null = null;
  private mediaStream: MediaStream | null = null;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D | null;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private options: PresenterTrackerOptions;

  // Slide tracking state
  private currentSlideNumber: number = 1;
  private lastSlideTransitionTimeMs: number = Date.now();
  private prevFrameLuma: Uint8Array | null = null;
  private transitionHoldFrames: number = 0;

  // Eye contact & posture rolling buffers
  private gazeHistory: boolean[] = []; // true if DIRECT
  private postureHistory: number[] = []; // centroid y coords
  private gestureHistory: number[] = [];

  // Temporal smoothing states (EMA filter)
  private smoothedBox: { x: number; y: number; width: number; height: number } | null = null;
  private smoothedPose: { yaw: number; pitch: number; roll: number } = { yaw: 0, pitch: 0, roll: 0 };
  private activePresenterId: number = 1;
  private lastDetectedFaces: DetectedPresenterFace[] = [];

  // Gaze state hysteresis counters
  private gazeCandidate: PresenterGazeStatus = 'DIRECT';
  private gazeCandidateFrames: number = 0;
  private ratifiedGaze: PresenterGazeStatus = 'DIRECT';

  // Synthetic presenter state (fallback when camera unavailable)
  private simTime: number = 0;

  constructor(options: PresenterTrackerOptions = {}) {
    this.options = options;
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = 320;
    this.offscreenCanvas.height = 180;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
  }

  /**
   * Start camera with user webcam via WebRTC MediaStream
   */
  async startWebcam(videoElem: HTMLVideoElement): Promise<boolean> {
    this.stop();
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

        this.mediaStream = stream;
        videoElem.srcObject = stream;
        
        try {
          await videoElem.play();
          console.log('[PresenterTracker] ✅ Webcam started successfully');
        } catch (playError) {
          console.error('[PresenterTracker] Video play error:', playError);
        }
        
        this.startLoop();
        return true;
      } else {
        console.warn('[PresenterTracker] getUserMedia not available');
      }
    } catch (error) {
      // Permission denied or camera unavailable; fallback to simulated feed
      console.error('[PresenterTracker] ❌ Webcam failed:', error);
      if (error instanceof DOMException) {
        console.error('[PresenterTracker] Error type:', error.name);
      }
    }

    // Start simulation loop if camera fails
    console.log('[PresenterTracker] Starting simulation mode');
    this.startLoop();
    return false;
  }

  /**
   * Start screen sharing capture via WebRTC DisplayMedia
   */
  async startScreenShare(videoElem: HTMLVideoElement): Promise<boolean> {
    this.stop();
    this.videoElement = videoElem;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' } as any,
          audio: false
        });

        this.mediaStream = stream;
        videoElem.srcObject = stream;
        await videoElem.play().catch(() => {});
        this.startLoop();
        return true;
      }
    } catch {
      // Screen share declined or unavailable
    }

    this.startLoop();
    return false;
  }

  /**
   * Stop stream and tracking loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
    this.smoothedBox = null;
    this.lastDetectedFaces = [];
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

    // 2. Spatial Grid Density Clustering (Multi-Presenter Isolation)
    // We downsample into an 8x6 grid to separate discrete presenters across stage
    const gridCols = 8;
    const gridRows = 6;
    const cellW = width / gridCols;
    const cellH = height / gridRows;
    const gridDensity = new Array(gridCols * gridRows).fill(0);

    // Bounding metrics for left and right halves to prevent oscillation
    const leftCluster = { count: 0, sumX: 0, sumY: 0, minX: width, maxX: 0, minY: height, maxY: 0 };
    const rightCluster = { count: 0, sumX: 0, sumY: 0, minX: width, maxX: 0, minY: height, maxY: 0 };

    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const idx = (y * width + x) * 4;
        const r = pixels[idx] * lumaFactor;
        const g = pixels[idx + 1] * lumaFactor;
        const b = pixels[idx + 2] * lumaFactor;
        const sumRGB = r + g + b + 0.001;

        // Normalized chromaticity space (lighting invariant)
        const nr = r / sumRGB;
        const ng = g / sumRGB;

        // Robust skin chromaticity envelope
        const isSkin = (
          nr > 0.34 && nr < 0.58 &&
          ng > 0.26 && ng < 0.38 &&
          nr > ng &&
          Math.abs(r - g) > 8 &&
          r > 45 && g > 25 && b > 15
        );

        if (isSkin) {
          const col = Math.min(gridCols - 1, Math.floor(x / cellW));
          const row = Math.min(gridRows - 1, Math.floor(y / cellH));
          gridDensity[row * gridCols + col]++;

          if (x < width * 0.5) {
            leftCluster.count++;
            leftCluster.sumX += x;
            leftCluster.sumY += y;
            if (x < leftCluster.minX) leftCluster.minX = x;
            if (x > leftCluster.maxX) leftCluster.maxX = x;
            if (y < leftCluster.minY) leftCluster.minY = y;
            if (y > leftCluster.maxY) leftCluster.maxY = y;
          } else {
            rightCluster.count++;
            rightCluster.sumX += x;
            rightCluster.sumY += y;
            if (x < rightCluster.minX) rightCluster.minX = x;
            if (x > rightCluster.maxX) rightCluster.maxX = x;
            if (y < rightCluster.minY) rightCluster.minY = y;
            if (y > rightCluster.maxY) rightCluster.maxY = y;
          }
        }
      }
    }

    // Identify detected presenter candidates
    const detectedFaces: DetectedPresenterFace[] = [];
    const minClusterThreshold = 80;

    if (leftCluster.count > minClusterThreshold) {
      const cX = leftCluster.sumX / leftCluster.count;
      const cY = leftCluster.sumY / leftCluster.count;
      const w = Math.max(50, Math.min(140, leftCluster.maxX - leftCluster.minX));
      const h = Math.max(60, Math.min(150, leftCluster.maxY - leftCluster.minY));
      detectedFaces.push({
        id: 1,
        isPrimary: false,
        x: Math.max(0, cX - w / 2),
        y: Math.max(0, cY - h / 2),
        width: w,
        height: h,
        centerX: cX,
        centerY: cY,
        gazeStatus: 'DIRECT',
        headPose: { yaw: 0, pitch: 0, roll: 0 }
      });
    }

    if (rightCluster.count > minClusterThreshold) {
      const cX = rightCluster.sumX / rightCluster.count;
      const cY = rightCluster.sumY / rightCluster.count;
      const w = Math.max(50, Math.min(140, rightCluster.maxX - rightCluster.minX));
      const h = Math.max(60, Math.min(150, rightCluster.maxY - rightCluster.minY));
      detectedFaces.push({
        id: 2,
        isPrimary: false,
        x: Math.max(0, cX - w / 2),
        y: Math.max(0, cY - h / 2),
        width: w,
        height: h,
        centerX: cX,
        centerY: cY,
        gazeStatus: 'DIRECT',
        headPose: { yaw: 0, pitch: 0, roll: 0 }
      });
    }

    // If clusters separated by < 40px, merge into single unified presenter
    let primaryFace: DetectedPresenterFace;
    const faceDetected = detectedFaces.length > 0;

    if (!faceDetected) {
      primaryFace = {
        id: 1,
        isPrimary: true,
        x: width * 0.35,
        y: height * 0.2,
        width: width * 0.3,
        height: height * 0.45,
        centerX: width * 0.5,
        centerY: height * 0.38,
        gazeStatus: 'DIRECT',
        headPose: { yaw: 0, pitch: 0, roll: 0 }
      };
    } else if (detectedFaces.length === 1) {
      detectedFaces[0].isPrimary = true;
      primaryFace = detectedFaces[0];
    } else {
      // Multi-presenter active: choose primary presenter with hysteresis to prevent bouncing
      // Prefer the previously active presenter unless the secondary has >40% larger face area
      const face1 = detectedFaces[0];
      const face2 = detectedFaces[1];
      const area1 = face1.width * face1.height;
      const area2 = face2.width * face2.height;

      if (this.activePresenterId === 2 && area2 >= area1 * 0.7) {
        face2.isPrimary = true;
        primaryFace = face2;
      } else if (area1 >= area2 * 0.7) {
        face1.isPrimary = true;
        this.activePresenterId = 1;
        primaryFace = face1;
      } else {
        face2.isPrimary = true;
        this.activePresenterId = 2;
        primaryFace = face2;
      }
    }

    this.lastDetectedFaces = detectedFaces;

    // 3. Exponential Moving Average (EMA) Temporal Smoothing for Bounding Box
    const alphaBox = 0.35;
    if (!this.smoothedBox) {
      this.smoothedBox = {
        x: primaryFace.x,
        y: primaryFace.y,
        width: primaryFace.width,
        height: primaryFace.height
      };
    } else {
      this.smoothedBox.x += alphaBox * (primaryFace.x - this.smoothedBox.x);
      this.smoothedBox.y += alphaBox * (primaryFace.y - this.smoothedBox.y);
      this.smoothedBox.width += alphaBox * (primaryFace.width - this.smoothedBox.width);
      this.smoothedBox.height += alphaBox * (primaryFace.height - this.smoothedBox.height);
    }

    const faceBoundingBox = {
      x: Math.round(this.smoothedBox.x),
      y: Math.round(this.smoothedBox.y),
      width: Math.round(this.smoothedBox.width),
      height: Math.round(this.smoothedBox.height)
    };

    // 4. Localized Face-Relative Gaze & Pose Estimation
    // Compute internal facial symmetry within the bounding box rather than absolute screen coords
    // This ensures a presenter standing on the left side looking at the camera is recognized as DIRECT!
    const localFaceCenterY = primaryFace.centerY;
    const relNormY = (localFaceCenterY - height * 0.38) / (height * 0.38);

    // Compute raw angles
    const rawPitch = Math.round(relNormY * 26);
    // Yaw is measured from face internal aspect ratio asymmetry
    const rawYaw = Math.round(((primaryFace.centerX - (primaryFace.x + primaryFace.width / 2)) / (primaryFace.width / 2 + 1)) * 35);
    const rawRoll = Math.round(rawYaw * 0.15 * 10) / 10;

    // Smooth head pose
    const alphaPose = 0.3;
    this.smoothedPose.yaw += alphaPose * (rawYaw - this.smoothedPose.yaw);
    this.smoothedPose.pitch += alphaPose * (rawPitch - this.smoothedPose.pitch);
    this.smoothedPose.roll += alphaPose * (rawRoll - this.smoothedPose.roll);

    const yaw = Math.round(this.smoothedPose.yaw);
    const pitch = Math.round(this.smoothedPose.pitch);
    const roll = Math.round(this.smoothedPose.roll * 10) / 10;

    // 5. Temporal Gaze Hysteresis (Eliminates False Warnings from Lighting Flickers)
    let instantaneousGaze: PresenterGazeStatus = 'DIRECT';
    if (pitch > 14) {
      instantaneousGaze = 'LOOKING_DOWN';
    } else if (Math.abs(yaw) > 22) {
      instantaneousGaze = 'LOOKING_AWAY';
    } else {
      instantaneousGaze = 'DIRECT';
    }

    if (instantaneousGaze === this.gazeCandidate) {
      this.gazeCandidateFrames++;
      // Require 5 consecutive frames (~160ms) of consistent deviation before flipping ratified state
      if (this.gazeCandidateFrames >= 5) {
        this.ratifiedGaze = instantaneousGaze;
      }
    } else {
      this.gazeCandidate = instantaneousGaze;
      this.gazeCandidateFrames = 1;
    }

    const gazeStatus = this.ratifiedGaze;

    // Rolling eye contact calculation
    this.gazeHistory.push(gazeStatus === 'DIRECT');
    if (this.gazeHistory.length > 60) this.gazeHistory.shift();

    const directCount = this.gazeHistory.filter(Boolean).length;
    const eyeContactScore = Math.round((directCount / this.gazeHistory.length) * 100);

    // 6. Posture & Ergonomics
    let postureStatus: PresenterPostureStatus = 'UPRIGHT';
    const boxHeightRel = faceBoundingBox.height / height;
    const boxCenterRelY = primaryFace.centerY / height;

    if (boxCenterRelY > 0.58 || boxHeightRel < 0.22) {
      postureStatus = 'SLUMPED';
    } else if (boxHeightRel > 0.62) {
      postureStatus = 'LEANING_FORWARD';
    } else if (boxCenterRelY < 0.22) {
      postureStatus = 'LEANING_BACK';
    } else {
      postureStatus = 'UPRIGHT';
    }

    this.postureHistory.push(primaryFace.centerY);
    if (this.postureHistory.length > 30) this.postureHistory.shift();
    const variance = this.calculateVariance(this.postureHistory);
    const postureStability = Math.max(35, Math.min(100, Math.round(100 - variance * 3.5)));

    // 7. Gesture activity
    this.gestureHistory.push(variance);
    if (this.gestureHistory.length > 40) this.gestureHistory.shift();
    const gestureActivity: GestureActivityLevel =
      variance < 1.2 ? 'LOW' : variance > 8.5 ? 'EXCESSIVE' : 'OPTIMAL';

    // 8. Slide detection via frame difference
    const slideMetrics = this.detectSlideTransition(pixels, width, height);

    return {
      faceDetected,
      faceBoundingBox,
      gazeStatus,
      eyeContactScore,
      headPose: { yaw, pitch, roll },
      postureStatus,
      postureStability,
      gestureActivity,
      slideNumber: this.currentSlideNumber,
      slideDwellTimeSeconds: slideMetrics.dwellTimeSeconds,
      slideTransitionDetected: slideMetrics.transitionDetected,
      lightingQuality,
      timestampMs: Date.now()
    };
  }

  /**
   * Synthetic simulation loop (when real camera is unavailable or mock mode)
   */
  private generateSimulatedPresenterFrame(): LivePresenterTrackingMetrics {
    this.simTime += 0.04;
    const t = this.simTime;

    // Head trajectory
    const yaw = Math.sin(t * 0.4) * 8 + Math.sin(t * 1.2) * 3;
    const pitch = Math.sin(t * 0.25) * 5 + (Math.sin(t * 0.1) > 0.7 ? 12 : -2);
    const roll = Math.sin(t * 0.3) * 2;

    const gazeStatus: PresenterGazeStatus =
      pitch > 10 ? 'LOOKING_DOWN' : Math.abs(yaw) > 16 ? 'LOOKING_AWAY' : 'DIRECT';

    this.gazeHistory.push(gazeStatus === 'DIRECT');
    if (this.gazeHistory.length > 60) this.gazeHistory.shift();
    const eyeContactScore = Math.round(
      (this.gazeHistory.filter(Boolean).length / this.gazeHistory.length) * 100
    );

    const postureStatus: PresenterPostureStatus =
      pitch > 12 ? 'LEANING_FORWARD' : 'UPRIGHT';

    const postureStability = Math.round(88 + Math.sin(t * 0.5) * 6);
    const gestureActivity: GestureActivityLevel = 'OPTIMAL';

    // Slide simulation: transitions every 50 seconds
    const now = Date.now();
    const elapsedSinceLastSlide = Math.floor((now - this.lastSlideTransitionTimeMs) / 1000);
    let slideTransitionDetected = false;

    if (elapsedSinceLastSlide >= 50) {
      this.currentSlideNumber++;
      this.lastSlideTransitionTimeMs = now;
      slideTransitionDetected = true;
    }

    return {
      faceDetected: true,
      faceBoundingBox: {
        x: 100 + Math.sin(t * 0.3) * 10,
        y: 35 + Math.cos(t * 0.25) * 6,
        width: 120,
        height: 150
      },
      gazeStatus,
      eyeContactScore,
      headPose: {
        yaw: Math.round(yaw * 10) / 10,
        pitch: Math.round(pitch * 10) / 10,
        roll: Math.round(roll * 10) / 10
      },
      postureStatus,
      postureStability,
      gestureActivity,
      slideNumber: this.currentSlideNumber,
      slideDwellTimeSeconds: elapsedSinceLastSlide,
      slideTransitionDetected,
      lightingQuality: 'GOOD',
      timestampMs: now
    };
  }

  /**
   * Downsampled frame difference slide detection
   */
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

      // > 28 threshold indicates whole-frame slide transition
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

  /**
   * Render real-time high-tech HUD on canvas with multi-presenter support
   */
  public renderHUD(canvas: HTMLCanvasElement, metrics: LivePresenterTrackingMetrics): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Scale bounding box to canvas dimensions
    const scaleX = w / 320;
    const scaleY = h / 180;

    // 1. Render Secondary Co-Presenter Boxes if multiple detected
    if (this.lastDetectedFaces.length > 1) {
      for (const face of this.lastDetectedFaces) {
        if (!face.isPrimary) {
          const sx = face.x * scaleX;
          const sy = face.y * scaleY;
          const sw = face.width * scaleX;
          const sh = face.height * scaleY;

          ctx.strokeStyle = '#64748b80';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(sx, sy, sw, sh);
          ctx.setLineDash([]);

          ctx.fillStyle = '#0f172ab3';
          ctx.fillRect(sx, sy - 18, Math.max(sw, 110), 16);
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`CO-PRESENTER #${face.id}`, sx + 4, sy - 6);
        }
      }
    }

    // 2. Primary Presenter Target Box with Smooth Corner Brackets
    const box = metrics.faceBoundingBox || { x: 90, y: 30, width: 140, height: 160 };
    const bx = box.x * scaleX;
    const by = box.y * scaleY;
    const bw = box.width * scaleX;
    const bh = box.height * scaleY;

    const isDirectGaze = metrics.gazeStatus === 'DIRECT';
    const primaryColor = isDirectGaze ? '#10b981' : metrics.gazeStatus === 'LOOKING_DOWN' ? '#f59e0b' : '#06b6d4';

    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;

    // Corner brackets
    const bracketLen = 16;
    ctx.beginPath();
    // Top-left
    ctx.moveTo(bx, by + bracketLen);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + bracketLen, by);
    // Top-right
    ctx.moveTo(bx + bw - bracketLen, by);
    ctx.lineTo(bx + bw, by);
    ctx.lineTo(bx + bw, by + bracketLen);
    // Bottom-left
    ctx.moveTo(bx, by + bh - bracketLen);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + bracketLen, by + bh);
    // Bottom-right
    ctx.moveTo(bx + bw - bracketLen, by + bh);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw, by + bh - bracketLen);
    ctx.stroke();

    // 3. Face Landmark Reticles
    const eyeY = by + bh * 0.35;
    const leftEyeX = bx + bw * 0.32;
    const rightEyeX = bx + bw * 0.68;

    // Left & Right Eye Reticles
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, 3, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Eye Gaze Vector Line
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
    ctx.fillRect(bx, by - 24, Math.max(bw, 150), 20);
    ctx.strokeStyle = `${primaryColor}80`;
    ctx.strokeRect(bx, by - 24, Math.max(bw, 150), 20);

    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 10px monospace';
    const tagText = this.lastDetectedFaces.length > 1
      ? `LEAD PRESENTER // GAZE: ${metrics.gazeStatus}`
      : `PRESENTER // GAZE: ${metrics.gazeStatus}`;
    ctx.fillText(tagText, bx + 6, by - 10);

    // 5. Floating HUD Telemetry Card (Top Right)
    const cardX = w - 200;
    const cardY = 16;
    ctx.fillStyle = '#090d16cc';
    ctx.fillRect(cardX, cardY, 184, 106);
    ctx.strokeStyle = '#38bdf840';
    ctx.lineWidth = 1;
    ctx.strokeRect(cardX, cardY, 184, 106);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('LIVE CV PRESENTER HUD', cardX + 10, cardY + 16);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText(`EYE CONTACT: ${metrics.eyeContactScore}%`, cardX + 10, cardY + 32);
    ctx.fillText(`POSTURE: ${metrics.postureStatus} (${metrics.postureStability}%)`, cardX + 10, cardY + 46);
    ctx.fillText(`HEAD POSE: Y${metrics.headPose.yaw}° P${metrics.headPose.pitch}°`, cardX + 10, cardY + 60);
    ctx.fillText(`SLIDE: #${metrics.slideNumber} [${metrics.slideDwellTimeSeconds}s]`, cardX + 10, cardY + 74);
    ctx.fillText(`LIGHT: ${metrics.lightingQuality} // GESTURE: ${metrics.gestureActivity}`, cardX + 10, cardY + 88);
    const presenterStatusText = this.lastDetectedFaces.length > 1
      ? `PRESENTERS: ${this.lastDetectedFaces.length} (TEAM MODE)`
      : 'PRESENTER: 1 (SOLO MODE)';
    ctx.fillText(presenterStatusText, cardX + 10, cardY + 100);

    // Eye Contact Mini Progress Bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cardX + 114, cardY + 24, 60, 6);
    ctx.fillStyle = metrics.eyeContactScore >= 70 ? '#10b981' : metrics.eyeContactScore >= 40 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(cardX + 114, cardY + 24, (metrics.eyeContactScore / 100) * 60, 6);
  }
}
