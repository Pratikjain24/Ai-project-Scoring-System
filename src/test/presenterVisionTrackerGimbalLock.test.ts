import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  PresenterVisionTracker,
  type Quaternion3D
} from '../utils/presenterVisionTracker';

describe('Presenter Vision Tracker - Gimbal Lock Singularity Elimination & Quaternion 3D Transforms', () => {
  let tracker: PresenterVisionTracker;

  beforeEach(() => {
    tracker = new PresenterVisionTracker();
  });

  afterEach(() => {
    tracker.stop();
  });

  describe('1. Pitch Domain Clamping (Mathematical Singularity Pre-emption)', () => {
    it('preserves physiological head pitch within [-45°, +45°]', () => {
      expect(PresenterVisionTracker.clampPitchDomain(0)).toBe(0);
      expect(PresenterVisionTracker.clampPitchDomain(25)).toBe(25);
      expect(PresenterVisionTracker.clampPitchDomain(-35)).toBe(-35);
      expect(PresenterVisionTracker.clampPitchDomain(45)).toBe(45);
      expect(PresenterVisionTracker.clampPitchDomain(-45)).toBe(-45);
    });

    it('strictly clamps upward head pitch > +45° to +45°', () => {
      expect(PresenterVisionTracker.clampPitchDomain(50)).toBe(45);
      expect(PresenterVisionTracker.clampPitchDomain(75)).toBe(45);
      expect(PresenterVisionTracker.clampPitchDomain(89.9)).toBe(45);
      expect(PresenterVisionTracker.clampPitchDomain(120)).toBe(45);
    });

    it('strictly clamps downward head pitch < -45° to -45°', () => {
      expect(PresenterVisionTracker.clampPitchDomain(-50)).toBe(-45);
      expect(PresenterVisionTracker.clampPitchDomain(-75)).toBe(-45);
      expect(PresenterVisionTracker.clampPitchDomain(-89.9)).toBe(-45);
      expect(PresenterVisionTracker.clampPitchDomain(-140)).toBe(-45);
    });

    it('honors customizable pitch clamp limits when specified', () => {
      expect(PresenterVisionTracker.clampPitchDomain(60, -30, 30)).toBe(30);
      expect(PresenterVisionTracker.clampPitchDomain(-50, -30, 30)).toBe(-30);
      expect(PresenterVisionTracker.clampPitchDomain(15, -30, 30)).toBe(15);
    });
  });

  describe('2. Quaternion Normalization & Algebra', () => {
    it('preserves unit quaternions with norm = 1', () => {
      const q: Quaternion3D = { w: 1, x: 0, y: 0, z: 0 };
      const normQ = PresenterVisionTracker.normalizeQuaternion(q);
      expect(normQ.w).toBeCloseTo(1, 5);
      expect(normQ.x).toBeCloseTo(0, 5);
      expect(normQ.y).toBeCloseTo(0, 5);
      expect(normQ.z).toBeCloseTo(0, 5);
    });

    it('normalizes unnormalized 4D quaternions to unit hypersphere length', () => {
      const unnormalized: Quaternion3D = { w: 2, x: 2, y: 2, z: 2 };
      const normQ = PresenterVisionTracker.normalizeQuaternion(unnormalized);
      const magnitude = Math.hypot(normQ.w, normQ.x, normQ.y, normQ.z);
      expect(magnitude).toBeCloseTo(1, 6);
      expect(normQ.w).toBeCloseTo(0.5, 5);
      expect(normQ.x).toBeCloseTo(0.5, 5);
      expect(normQ.y).toBeCloseTo(0.5, 5);
      expect(normQ.z).toBeCloseTo(0.5, 5);
    });

    it('defensively handles zero or degenerate quaternions by falling back to identity', () => {
      const degenerate: Quaternion3D = { w: 0, x: 0, y: 0, z: 0 };
      const fallback = PresenterVisionTracker.normalizeQuaternion(degenerate);
      expect(fallback).toEqual({ w: 1, x: 0, y: 0, z: 0 });

      const nanDegenerate: Quaternion3D = { w: NaN, x: 0, y: 0, z: 0 };
      const nanFallback = PresenterVisionTracker.normalizeQuaternion(nanDegenerate);
      expect(nanFallback).toEqual({ w: 1, x: 0, y: 0, z: 0 });
    });
  });

  describe('3. Euler to Quaternion & Inverse Transformation Round-Trip', () => {
    it('correctly maps zero rotation to identity quaternion and back', () => {
      const q = PresenterVisionTracker.quaternionFromEuler(0, 0, 0);
      expect(q.w).toBeCloseTo(1, 5);
      expect(q.x).toBeCloseTo(0, 5);
      expect(q.y).toBeCloseTo(0, 5);
      expect(q.z).toBeCloseTo(0, 5);

      const euler = PresenterVisionTracker.eulerFromQuaternion(q);
      expect(euler.yaw).toBeCloseTo(0, 4);
      expect(euler.pitch).toBeCloseTo(0, 4);
      expect(euler.roll).toBeCloseTo(0, 4);
    });

    it('accurately round-trips pure Yaw rotation (left/right turn)', () => {
      const inputYaw = 32.5;
      const q = PresenterVisionTracker.quaternionFromEuler(inputYaw, 0, 0);
      const euler = PresenterVisionTracker.eulerFromQuaternion(q);
      expect(euler.yaw).toBeCloseTo(inputYaw, 4);
      expect(euler.pitch).toBeCloseTo(0, 4);
      expect(euler.roll).toBeCloseTo(0, 4);
    });

    it('accurately round-trips pure Pitch rotation (up/down tilt)', () => {
      const inputPitch = 24.0;
      const q = PresenterVisionTracker.quaternionFromEuler(0, inputPitch, 0);
      const euler = PresenterVisionTracker.eulerFromQuaternion(q);
      expect(euler.yaw).toBeCloseTo(0, 4);
      expect(euler.pitch).toBeCloseTo(inputPitch, 4);
      expect(euler.roll).toBeCloseTo(0, 4);
    });

    it('accurately round-trips pure Roll rotation (head tilt sideways)', () => {
      const inputRoll = -18.5;
      const q = PresenterVisionTracker.quaternionFromEuler(0, 0, inputRoll);
      const euler = PresenterVisionTracker.eulerFromQuaternion(q);
      expect(euler.yaw).toBeCloseTo(0, 4);
      expect(euler.pitch).toBeCloseTo(0, 4);
      expect(euler.roll).toBeCloseTo(inputRoll, 4);
    });

    it('accurately round-trips complex combined 3D rotations within safe envelope', () => {
      const testPoses = [
        { yaw: 20, pitch: 15, roll: -10 },
        { yaw: -35, pitch: -22, roll: 14 },
        { yaw: 12.5, pitch: -40, roll: 5.5 },
        { yaw: -28, pitch: 35, roll: -12 }
      ];

      for (const pose of testPoses) {
        const q = PresenterVisionTracker.quaternionFromEuler(pose.yaw, pose.pitch, pose.roll);
        const reconstructed = PresenterVisionTracker.eulerFromQuaternion(q);
        expect(reconstructed.yaw).toBeCloseTo(pose.yaw, 2);
        expect(reconstructed.pitch).toBeCloseTo(pose.pitch, 2);
        expect(reconstructed.roll).toBeCloseTo(pose.roll, 2);
      }
    });
  });

  describe('4. Gimbal Lock Singularity Elimination at Extreme Pitch (> 45°)', () => {
    it('prevents wild Yaw sign inversion when pitch exceeds +45° upward', () => {
      // Input: Yaw = +30°, Pitch = +75° (extreme upward tilt), Roll = +10°
      const safePose = PresenterVisionTracker.computeSafeHeadPose(30, 75, 10, 45);

      // Pitch MUST be clamped to 45°
      expect(safePose.pitch).toBeCloseTo(45, 2);
      // Yaw MUST maintain its true positive direction (+30°) and NOT flip wildly to -150° or -30°
      expect(safePose.yaw).toBeCloseTo(30, 2);
      // Roll MUST remain stable
      expect(safePose.roll).toBeCloseTo(10, 2);
    });

    it('prevents wild Yaw sign inversion when pitch exceeds -45° downward', () => {
      // Input: Yaw = -28°, Pitch = -80° (extreme downward tilt), Roll = -5°
      const safePose = PresenterVisionTracker.computeSafeHeadPose(-28, -80, -5, 45);

      // Pitch clamped strictly to -45°
      expect(safePose.pitch).toBeCloseTo(-45, 2);
      // Yaw MUST retain -28° without wild flipping or sign inversion
      expect(safePose.yaw).toBeCloseTo(-28, 2);
      expect(safePose.roll).toBeCloseTo(-5, 2);
    });

    it('remains numerically stable near 90° mathematical Euler singularity', () => {
      // Test at +89.9° and -89.9°
      const extremeUp = PresenterVisionTracker.computeSafeHeadPose(22, 89.9, 0, 45);
      expect(extremeUp.pitch).toBeCloseTo(45, 2);
      expect(extremeUp.yaw).toBeCloseTo(22, 2);
      expect(Number.isFinite(extremeUp.yaw)).toBe(true);
      expect(Number.isFinite(extremeUp.pitch)).toBe(true);
      expect(Number.isFinite(extremeUp.roll)).toBe(true);

      const extremeDown = PresenterVisionTracker.computeSafeHeadPose(-18, -89.9, 0, 45);
      expect(extremeDown.pitch).toBeCloseTo(-45, 2);
      expect(extremeDown.yaw).toBeCloseTo(-18, 2);
      expect(Number.isFinite(extremeDown.yaw)).toBe(true);
      expect(Number.isFinite(extremeDown.pitch)).toBe(true);
    });

    it('handles synthetic singular quaternions where 2(wx - yz) approaches 1.0', () => {
      // In a raw Euler solver, when 2(wx - yz) = 1.0, atan2(0, 0) occurs.
      // Our eulerFromQuaternion clamps sin(pitch) to sin(45°) ~ 0.7071,
      // guaranteeing cos(pitch) >= 0.7071 > 0, so denominator never vanishes.
      const pitch90Quaternion: Quaternion3D = {
        w: Math.SQRT1_2,
        x: Math.SQRT1_2,
        y: 0,
        z: 0
      };

      const result = PresenterVisionTracker.eulerFromQuaternion(pitch90Quaternion, 45);
      expect(result.pitch).toBeCloseTo(45, 2);
      expect(Number.isNaN(result.yaw)).toBe(false);
      expect(Number.isNaN(result.pitch)).toBe(false);
      expect(Number.isNaN(result.roll)).toBe(false);
      expect(result.yaw).toBeCloseTo(0, 2);
      expect(result.roll).toBeCloseTo(0, 2);
    });
  });

  describe('5. Spherical Linear Interpolation (SLERP) Continuous Smoothing', () => {
    it('returns q1 at alpha = 0 and q2 at alpha = 1', () => {
      const q1 = PresenterVisionTracker.quaternionFromEuler(0, 0, 0);
      const q2 = PresenterVisionTracker.quaternionFromEuler(30, 20, 10);

      const atZero = PresenterVisionTracker.slerp(q1, q2, 0);
      expect(atZero.w).toBeCloseTo(q1.w, 5);
      expect(atZero.x).toBeCloseTo(q1.x, 5);
      expect(atZero.y).toBeCloseTo(q1.y, 5);
      expect(atZero.z).toBeCloseTo(q1.z, 5);

      const atOne = PresenterVisionTracker.slerp(q1, q2, 1);
      expect(atOne.w).toBeCloseTo(q2.w, 5);
      expect(atOne.x).toBeCloseTo(q2.x, 5);
      expect(atOne.y).toBeCloseTo(q2.y, 5);
      expect(atOne.z).toBeCloseTo(q2.z, 5);
    });

    it('smoothly interpolates intermediate rotations at alpha = 0.5', () => {
      const qStart = PresenterVisionTracker.quaternionFromEuler(0, 0, 0);
      const qEnd = PresenterVisionTracker.quaternionFromEuler(40, 20, 10);

      const qMid = PresenterVisionTracker.slerp(qStart, qEnd, 0.5);
      const eulerMid = PresenterVisionTracker.eulerFromQuaternion(qMid);

      // Midpoint yaw and pitch should be approximately half of total trajectory
      expect(eulerMid.yaw).toBeGreaterThan(15);
      expect(eulerMid.yaw).toBeLessThan(25);
      expect(eulerMid.pitch).toBeGreaterThan(8);
      expect(eulerMid.pitch).toBeLessThan(14);

      // Magnitude of interpolated quaternion MUST remain unit length
      const mag = Math.hypot(qMid.w, qMid.x, qMid.y, qMid.z);
      expect(mag).toBeCloseTo(1, 5);
    });

    it('correctly handles antipodal quaternions by taking the shortest path on S^3', () => {
      const q1 = PresenterVisionTracker.quaternionFromEuler(10, 5, 0);
      // Construct negated equivalent quaternion representing the same physical orientation
      const q2Antipodal: Quaternion3D = {
        w: -q1.w,
        x: -q1.x,
        y: -q1.y,
        z: -q1.z
      };

      // Dot product is -1
      const interpolated = PresenterVisionTracker.slerp(q1, q2Antipodal, 0.5);
      const euler = PresenterVisionTracker.eulerFromQuaternion(interpolated);

      // Must remain identical without spinning 360 degrees
      expect(euler.yaw).toBeCloseTo(10, 2);
      expect(euler.pitch).toBeCloseTo(5, 2);
    });

    it('gracefully switches to normalized lerp for near-identical orientations', () => {
      const q1 = PresenterVisionTracker.quaternionFromEuler(15, 10, 0);
      const q2 = PresenterVisionTracker.quaternionFromEuler(15.01, 10.01, 0);

      const interpolated = PresenterVisionTracker.slerp(q1, q2, 0.5);
      const euler = PresenterVisionTracker.eulerFromQuaternion(interpolated);

      expect(euler.yaw).toBeCloseTo(15.005, 2);
      expect(euler.pitch).toBeCloseTo(10.005, 2);
    });
  });

  describe('6. PresenterVisionTracker Integration & Telemetry Output', () => {
    it('produces valid normalized quaternion in headPose during frame processing', () => {
      const frame = tracker.processFrame();

      expect(frame.headPose).toBeDefined();
      expect(typeof frame.headPose.yaw).toBe('number');
      expect(typeof frame.headPose.pitch).toBe('number');
      expect(typeof frame.headPose.roll).toBe('number');

      // Quaternion must be populated
      expect(frame.headPose.quaternion).toBeDefined();
      const q = frame.headPose.quaternion!;
      const norm = Math.hypot(q.w, q.x, q.y, q.z);
      expect(norm).toBeCloseTo(1, 4);

      // Pitch must remain within safe physiological limits
      expect(frame.headPose.pitch).toBeGreaterThanOrEqual(-45);
      expect(frame.headPose.pitch).toBeLessThanOrEqual(45);
    });

    it('smooths orientation continuously over consecutive frames without discontinuous jumps', () => {
      const yaws: number[] = [];
      const pitches: number[] = [];

      // Process 10 frames
      for (let i = 0; i < 10; i++) {
        const frame = tracker.processFrame();
        yaws.push(frame.headPose.yaw);
        pitches.push(frame.headPose.pitch);
      }

      // Check max delta between any adjacent frame: should be smooth (< 15° per frame)
      for (let i = 1; i < yaws.length; i++) {
        const yawDelta = Math.abs(yaws[i] - yaws[i - 1]);
        const pitchDelta = Math.abs(pitches[i] - pitches[i - 1]);
        expect(yawDelta).toBeLessThan(15);
        expect(pitchDelta).toBeLessThan(15);
      }
    });

    it('resets orientation quaternion to identity on stop()', () => {
      // Step simulation
      tracker.processFrame();
      tracker.processFrame();

      tracker.stop();

      // After stop and fresh frame, orientation should restart smoothly from identity
      const nextFrame = tracker.processFrame();
      expect(nextFrame.headPose.quaternion).toBeDefined();
      expect(Math.hypot(
        nextFrame.headPose.quaternion!.w,
        nextFrame.headPose.quaternion!.x,
        nextFrame.headPose.quaternion!.y,
        nextFrame.headPose.quaternion!.z
      )).toBeCloseTo(1, 4);
    });
  });
});

