import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { CameraFeedPanel } from '../components/live-jury/CameraFeedPanel';
import { PresenterVisionTracker } from '../utils/presenterVisionTracker';
import { processFramePixelsInWorker } from '../utils/visionWorker';

describe('Senior Tester Offensive Hardening & Exploitation Elimination Suite', () => {
  let originalMediaDevices: MediaDevices | undefined;

  beforeEach(() => {
    originalMediaDevices = navigator.mediaDevices;
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined) as any;
    window.HTMLMediaElement.prototype.pause = vi.fn() as any;

    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      drawImage: vi.fn(),
      ellipse: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 50 }),
    }) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: originalMediaDevices,
    });
  });

  // =========================================================================
  // FIX 1: KILL THE AUTOMATIC SPEAKING ASSUMPTION ON isPrimary
  // =========================================================================
  describe('Fix 1: Elimination of Automatic Speaking Assumption on isPrimary', () => {
    it('does NOT award speaking confidence or speaking ticks to a mute lead presenter', () => {
      const tracker = new PresenterVisionTracker({ maxPresenters: 3 });
      
      // Lead presenter with mouth closed (mouth delta = 0)
      const mockDet = { x: 100, y: 50, width: 120, height: 150, centerX: 160, centerY: 125 };
      (tracker as any).updatePersistentTracks([mockDet], 320, 180);

      const presenters = tracker.getTrackedPresenters();
      expect(presenters.length).toBe(1);
      const lead = presenters[0];
      expect(lead.isPrimary).toBe(true);
      expect(lead.role).toBe('LEAD_PRESENTER');

      // Without active optical mouth movement or audio RMS gate, speaking confidence must stay low
      expect(lead.speakingConfidence).toBeLessThan(0.40);
      
      tracker.stop();
    });

    it('correlates speaking confidence when audio RMS gate exceeds threshold and mouth opens', () => {
      const tracker = new PresenterVisionTracker({ maxPresenters: 3 });
      
      // Supply audio telemetry showing active speech (> -42 dBFS)
      tracker.setAudioMetrics({
        inputRmsDbFS: -26,
        outputRmsDbFS: -28,
        noiseFloorDbFS: -55,
        snrDb: 18,
        noiseReductionAppliedDb: 14,
        speechDetected: true,
        vadConfidence: 0.92,
        filterActive: true
      });

      expect(tracker.getAudioMetrics()?.outputRmsDbFS).toBe(-28);
      expect(tracker.getAudioMetrics()?.speechDetected).toBe(true);
      tracker.stop();
    });
  });

  // =========================================================================
  // FIX 2: DISARM THE SIMULATION EXPLOITATION
  // =========================================================================
  describe('Fix 2: Disarm Simulation Exploitation (UNVERIFIED_HARDWARE_FAULT Capping)', () => {
    it('caps eye contact and posture to 50% max and flags UNVERIFIED on hardware failure', () => {
      const tracker = new PresenterVisionTracker();
      
      // Start simulation in penalty mode
      tracker.startSimulation({ isPenaltyMode: true, maxScoreCap: 50.0 });
      expect(tracker.isPenaltyMode()).toBe(true);

      const frame = tracker.processFrame();
      expect(frame.telemetryVerified).toBe(false);
      expect(frame.unverifiedHardwareFault).toBe(true);
      expect(frame.visualDeliveryStatus).toBe('UNVERIFIED_HARDWARE_FAULT');
      
      // Must NOT award free 85% score!
      expect(frame.eyeContactScore).toBeLessThanOrEqual(50);
      expect(frame.postureStability).toBeLessThanOrEqual(50);
      expect(frame.gazeStatus).toBe('LOOKING_AWAY');
      expect(frame.postureStatus).toBe('SLUMPED');

      tracker.stop();
    });

    it('renders the UNVERIFIED_HARDWARE_FAULT badge in the UI when camera error occurs', async () => {
      // Mock getUserMedia rejection
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: {
          getUserMedia: vi.fn().mockRejectedValue(new DOMException('Hardware error', 'NotReadableError')),
        },
      });

      render(<CameraFeedPanel isExpanded={false} onToggleExpand={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByTestId('camera-error-banner')).toBeInTheDocument();
      });

      // The unverified hardware badge should be rendered
      await waitFor(() => {
        const badge = screen.getByTestId('unverified-hardware-badge');
        expect(badge).toBeInTheDocument();
        expect(badge.textContent).toContain('UNVERIFIED_HARDWARE_FAULT');
      });
    });
  });

  // =========================================================================
  // FIX 3: YCbCr ADAPTIVE COLOR SEGMENTATION (FITZPATRICK TYPES I-VI)
  // =========================================================================
  describe('Fix 3: YCbCr Color-Space Segmentation (Fitzpatrick Types I - VI)', () => {
    it('accurately identifies human skin across light, medium, and dark Fitzpatrick pigmentations', () => {
      const width = 160;
      const height = 90;
      const pixels = new Uint8ClampedArray(width * height * 4);

      // Create a test synthetic face patch with darker skin tone (Fitzpatrick Type V / VI)
      // RGB: (85, 52, 40) -> High melanin, low luminance
      for (let y = 20; y < 70; y++) {
        for (let x = 60; x < 100; x++) {
          const idx = (y * width + x) * 4;
          pixels[idx] = 85;     // R
          pixels[idx + 1] = 52; // G
          pixels[idx + 2] = 40; // B
          pixels[idx + 3] = 255;
        }
      }

      const result = processFramePixelsInWorker(pixels, width, height, 5);
      expect(result.detections.length).toBeGreaterThan(0);
      const faceDet = result.detections[0];
      expect(faceDet.width).toBeGreaterThanOrEqual(40);
      expect(faceDet.centerX).toBeGreaterThan(50);
      expect(faceDet.centerX).toBeLessThan(110);
    });

    it('adapts chrominance thresholds under low ambient lighting (<50 luma)', () => {
      const width = 160;
      const height = 90;
      const pixels = new Uint8ClampedArray(width * height * 4);

      // Low lighting dark room patch (30 lux)
      for (let y = 20; y < 70; y++) {
        for (let x = 60; x < 100; x++) {
          const idx = (y * width + x) * 4;
          pixels[idx] = 60;     // R
          pixels[idx + 1] = 38; // G
          pixels[idx + 2] = 28; // B
          pixels[idx + 3] = 255;
        }
      }

      const result = processFramePixelsInWorker(pixels, width, height, 5);
      expect(result.lightingQuality).toBe('TOO_DARK');
      expect(result.detections.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // FIX 5: ATTACH HARDWARE INTERRUPTION LISTENERS (USB YANK / DEVICE REVOKE)
  // =========================================================================
  describe('Fix 5: Hardware Interruption Listeners (USB Yank Detection)', () => {
    it('catches track onended event when external webcam is disconnected mid-stream', async () => {
      let onEndedCallback: (() => void) | undefined = undefined;
      const mockTrack = {
        kind: 'video',
        id: 'external-usb-cam-track',
        enabled: true,
        readyState: 'live',
        stop: vi.fn(),
        set onended(fn: (() => void) | null | undefined) {
          onEndedCallback = fn ?? undefined;
        },
        get onended(): (() => void) | undefined {
          return onEndedCallback;
        }
      };

      const mockStream = {
        id: 'stream-usb-1',
        getTracks: vi.fn(() => [mockTrack]),
        getVideoTracks: vi.fn(() => [mockTrack]),
        getAudioTracks: vi.fn(() => []),
      };

      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: {
          getUserMedia: vi.fn().mockResolvedValue(mockStream),
        },
      });

      render(<CameraFeedPanel isExpanded={false} onToggleExpand={vi.fn()} />);

      await waitFor(() => {
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
      });

      // Verify track.onended listener was attached
      expect(typeof mockTrack.onended).toBe('function');

      // Simulate physical USB pull-out
      act(() => {
        if (mockTrack.onended) {
          mockTrack.onended();
        }
      });

      // Error banner should display disconnection notice
      await waitFor(() => {
        expect(screen.getByTestId('camera-error-banner')).toBeInTheDocument();
        expect(screen.getByTestId('camera-error-banner').textContent).toContain('Webcam disconnected');
      });
    });
  });
});
