import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PresenterVisionTracker
} from '../utils/presenterVisionTracker';

describe('Presenter Vision Tracker - Multi-Presenter Tracking & Persistent Subject Bounding Boxes', () => {
  let tracker: PresenterVisionTracker;

  beforeEach(() => {
    tracker = new PresenterVisionTracker({
      maxPresenters: 5,
      targetFps: 30
    });
  });

  afterEach(() => {
    tracker.stop();
  });

  // ====================================================
  // 1. SPATIAL GEOMETRY & IoU / CENTROID MATCHING ALGEBRA
  // ====================================================
  describe('1. Spatial Geometry & IoU / Centroid Matching Algebra', () => {
    it('returns exact 1.0 IoU for identical bounding boxes', () => {
      const box = { x: 50, y: 50, width: 100, height: 100 };
      const iou = PresenterVisionTracker.calculateIoU(box, box);
      expect(iou).toBeCloseTo(1.0, 5);
    });

    it('returns 0.0 IoU for completely non-overlapping disjoint bounding boxes', () => {
      const boxA = { x: 0, y: 0, width: 50, height: 50 };
      const boxB = { x: 100, y: 100, width: 50, height: 50 };
      const iou = PresenterVisionTracker.calculateIoU(boxA, boxB);
      expect(iou).toBe(0.0);
    });

    it('accurately computes partial IoU for intersecting bounding boxes', () => {
      const boxA = { x: 0, y: 0, width: 100, height: 100 };
      const boxB = { x: 50, y: 0, width: 100, height: 100 };
      const iou = PresenterVisionTracker.calculateIoU(boxA, boxB);
      expect(iou).toBeCloseTo(1 / 3, 4);
    });

    it('correctly calculates Euclidean centroid distance between subjects', () => {
      const boxA = { x: 0, y: 0, width: 100, height: 100 }; // Center: (50, 50)
      const boxB = { x: 100, y: 0, width: 100, height: 100 }; // Center: (150, 50)
      const dist = PresenterVisionTracker.calculateCentroidDistance(boxA, boxB);
      expect(dist).toBeCloseTo(100, 4);
    });
  });

  // ====================================================
  // 2. MULTI-PRESENTER CAPSTONE TEAM SIMULATION (UP TO 5 PRESENTERS)
  // ====================================================
  describe('2. Multi-Presenter Capstone Team Simulation (Up to 5 Presenters Simultaneously)', () => {
    it('simulates persistent team presenters with distinct roles, positions, and persistent IDs', () => {
      const frame = tracker.processFrame();

      expect(frame.faceDetected).toBe(true);
      expect(frame.presenterCount).toBeGreaterThanOrEqual(3);
      expect(frame.activePresenterId).toBe(1);
      expect(frame.trackedPresenters).toBeDefined();
      expect(frame.trackedPresenters?.length).toBeGreaterThanOrEqual(3);

      const presenters = frame.trackedPresenters!;
      expect(presenters[0].id).toBe(1);
      expect(presenters[0].role).toBe('LEAD_PRESENTER');
      expect(presenters[0].isPrimary).toBe(true);

      expect(presenters[1].id).toBe(2);
      expect(presenters[1].role).toBe('CO_PRESENTER');
      expect(presenters[1].isPrimary).toBe(false);

      expect(presenters[2].id).toBe(3);
      expect(presenters[2].role).toBe('CO_PRESENTER');
      expect(presenters[2].isPrimary).toBe(false);
    });

    it('maintains strict ID persistence across 60 consecutive frames without identity flipping', () => {
      const observedIdsPerFrame: number[][] = [];

      for (let i = 0; i < 60; i++) {
        const frame = tracker.processFrame();
        const ids = (frame.trackedPresenters || []).map(p => p.id);
        observedIdsPerFrame.push(ids);
      }

      for (let i = 0; i < observedIdsPerFrame.length; i++) {
        expect(observedIdsPerFrame[i]).toEqual([1, 2, 3]);
      }
    });

    it('preserves top-level backward compatibility for existing rubric scoring engines', () => {
      const frame = tracker.processFrame();

      expect(frame.faceBoundingBox).toBeDefined();
      expect(frame.faceBoundingBox?.width).toBeGreaterThan(0);
      expect(frame.faceBoundingBox?.height).toBeGreaterThan(0);
      expect(typeof frame.eyeContactScore).toBe('number');
      expect(typeof frame.postureStability).toBe('number');
      expect(frame.headPose).toBeDefined();
      expect(frame.headPose.quaternion).toBeDefined();
      expect(['UPRIGHT', 'LEANING_FORWARD', 'LEANING_BACK', 'SLUMPED']).toContain(frame.postureStatus);
      expect(['DIRECT', 'LOOKING_DOWN', 'LOOKING_AWAY']).toContain(frame.gazeStatus);
    });
  });

  // ====================================================
  // 3. MEDIAPIPE FACE MESH & BLAZEPOSE SKELETAL LANDMARKS
  // ====================================================
  describe('3. MediaPipe Face Mesh & BlazePose Skeletal Landmarks', () => {
    it('generates anatomical Face Mesh landmark anchors for every tracked subject', () => {
      const frame = tracker.processFrame();
      const presenters = frame.trackedPresenters!;

      for (const presenter of presenters) {
        expect(presenter.landmarks).toBeDefined();
        const lm = presenter.landmarks!;

        expect(typeof lm.forehead.x).toBe('number');
        expect(typeof lm.forehead.y).toBe('number');
        expect(typeof lm.leftEye.x).toBe('number');
        expect(typeof lm.rightEye.x).toBe('number');
        expect(typeof lm.noseTip.x).toBe('number');
        expect(typeof lm.mouthCenter.x).toBe('number');
        expect(typeof lm.chin.x).toBe('number');

        expect(lm.forehead.y).toBeLessThan(lm.leftEye.y);
        expect(lm.leftEye.y).toBeLessThan(lm.noseTip.y);
        expect(lm.noseTip.y).toBeLessThan(lm.mouthCenter.y);
        expect(lm.mouthCenter.y).toBeLessThan(lm.chin.y);
        expect(lm.leftEye.x).toBeLessThan(lm.rightEye.x);
      }
    });

    it('generates BlazePose upper-body keypoints for posture and gesture analysis', () => {
      const frame = tracker.processFrame();
      const presenters = frame.trackedPresenters!;

      for (const presenter of presenters) {
        expect(presenter.poseKeypoints).toBeDefined();
        const kp = presenter.poseKeypoints!;

        expect(typeof kp.nose.x).toBe('number');
        expect(typeof kp.leftShoulder.x).toBe('number');
        expect(typeof kp.rightShoulder.x).toBe('number');
        expect(typeof kp.torsoCentroid.x).toBe('number');

        expect(kp.leftShoulder.x).toBeLessThan(kp.rightShoulder.x);
        expect(kp.leftShoulder.y).toBeLessThanOrEqual(kp.torsoCentroid.y);
      }
    });
  });

  // ====================================================
  // 4. INDIVIDUAL METRICS & SPEAKING DISTRIBUTION
  // ====================================================
  describe('4. Individual Eye Contact, Posture Stability, & Team Speaking Distribution', () => {
    it('tracks individual eye contact scores and postures per presenter', () => {
      const frame = tracker.processFrame();
      const presenters = frame.trackedPresenters!;

      expect(presenters.length).toBeGreaterThanOrEqual(3);
      for (const p of presenters) {
        expect(typeof p.eyeContactScore).toBe('number');
        expect(p.eyeContactScore).toBeGreaterThanOrEqual(0);
        expect(p.eyeContactScore).toBeLessThanOrEqual(100);

        expect(typeof p.postureStability).toBe('number');
        expect(p.postureStability).toBeGreaterThanOrEqual(0);
        expect(p.postureStability).toBeLessThanOrEqual(100);

        expect(['UPRIGHT', 'LEANING_FORWARD', 'LEANING_BACK', 'SLUMPED']).toContain(p.postureStatus);
        expect(typeof p.speakingSharePercent).toBe('number');
      }
    });

    it('calculates team speaking distribution summing to 100%', () => {
      const frame = tracker.processFrame();

      expect(frame.speakingDistribution).toBeDefined();
      const dist = frame.speakingDistribution!;

      const sum = Object.values(dist).reduce((acc, val) => acc + val, 0);
      expect(sum).toBeCloseTo(100, 0);
    });

    it('computes normalized Shannon entropy team speaking balance score accurately', () => {
      // Perfectly balanced 3-person team: 33.3%, 33.3%, 33.3% -> Balance = 100%
      const balancedDist = { 1: 33.33, 2: 33.33, 3: 33.34 };
      const balancedScore = PresenterVisionTracker.calculateShannonSpeakingBalance(balancedDist);
      expect(balancedScore).toBe(100);

      // Unequal distribution: 80%, 15%, 5% -> Low balance score
      const skewedDist = { 1: 80, 2: 15, 3: 5 };
      const skewedScore = PresenterVisionTracker.calculateShannonSpeakingBalance(skewedDist);
      expect(skewedScore).toBeLessThan(80);
      expect(skewedScore).toBeGreaterThan(20);

      // Solo presenter: 100% -> Balance = 100% (no teammate exclusion)
      const soloDist = { 1: 100 };
      const soloScore = PresenterVisionTracker.calculateShannonSpeakingBalance(soloDist);
      expect(soloScore).toBe(100);
    });

    it('reports WebGL hardware acceleration status with graceful Canvas fallback', () => {
      expect(typeof tracker.isWebGLAccelerated()).toBe('boolean');
    });
  });

  // ====================================================
  // 5. ANTI-OSCILLATION LEAD PRESENTER HYSTERESIS
  // ====================================================
  describe('5. Anti-Oscillation Lead Presenter Hysteresis & Manual Overrides', () => {
    it('maintains lead presenter stability without jittering between presenters', () => {
      const activeIds: number[] = [];

      for (let i = 0; i < 45; i++) {
        const frame = tracker.processFrame();
        activeIds.push(frame.activePresenterId || 1);
      }

      const uniqueLeadIds = new Set(activeIds);
      expect(uniqueLeadIds.size).toBe(1);
      expect(uniqueLeadIds.has(1)).toBe(true);
    });

    it('allows explicit programmatic lead presenter selection via setActivePresenterId', () => {
      tracker.processFrame();

      tracker.setActivePresenterId(2);
      expect(tracker.getActivePresenterId()).toBe(2);

      const tracked = tracker.getTrackedPresenters();
      const p2 = tracked.find(p => p.id === 2);
      if (p2) {
        expect(p2.isPrimary).toBe(true);
        expect(p2.role).toBe('LEAD_PRESENTER');
      }
    });

    it('resets all persistent tracking state cleanly when resetTrackers is called', () => {
      tracker.processFrame();
      expect(tracker.getTrackedPresenters().length).toBeGreaterThan(0);

      tracker.resetTrackers();
      expect(tracker.getTrackedPresenters().length).toBe(0);
      expect(tracker.getActivePresenterId()).toBe(1);
    });
  });

  // ====================================================
  // 6. REAL-TIME HUD CANVAS RENDERING WITH MULTI-PRESENTER OVERLAYS
  // ====================================================
  describe('6. Real-Time HUD Canvas Rendering with Multi-Presenter Overlays', () => {
    it('renders HUD overlay with individual speaking indicators and team balance summary', () => {
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 640;
      mockCanvas.height = 360;

      const fillTextSpy = vi.fn();
      const strokeRectSpy = vi.fn();
      const strokeSpy = vi.fn();

      mockCanvas.getContext = vi.fn().mockReturnValue({
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: strokeRectSpy,
        stroke: strokeSpy,
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        fillText: fillTextSpy,
        drawImage: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        setLineDash: vi.fn(),
        measureText: vi.fn().mockReturnValue({ width: 50 })
      }) as any;

      const frame = tracker.processFrame();
      expect(() => tracker.renderHUD(mockCanvas, frame)).not.toThrow();

      expect(fillTextSpy).toHaveBeenCalled();
      const renderedTextCalls = fillTextSpy.mock.calls.map(call => call[0]);
      expect(renderedTextCalls.some(t => String(t).includes('LIVE CV HUD'))).toBe(true);
      expect(renderedTextCalls.some(t => String(t).includes('TEAM BALANCE:'))).toBe(true);
      expect(renderedTextCalls.some(t => String(t).includes('SPK SHARE:'))).toBe(true);
    });

    it('safely handles canvas rendering with null context without exploding', () => {
      const mockCanvas = document.createElement('canvas');
      mockCanvas.getContext = vi.fn().mockReturnValue(null);

      const frame = tracker.processFrame();
      expect(() => tracker.renderHUD(mockCanvas, frame)).not.toThrow();
    });
  });
});
