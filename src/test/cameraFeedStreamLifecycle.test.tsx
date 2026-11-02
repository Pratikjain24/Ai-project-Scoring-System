import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { CameraFeedPanel, stopMediaStreamTracks } from '../components/live-jury/CameraFeedPanel';
import { PresenterVisionTracker } from '../utils/presenterVisionTracker';

// Helper to create mock MediaStreamTrack
const createMockTrack = (kind = 'video', id = 'track-1') => {
  let readyState: 'live' | 'ended' = 'live';
  return {
    kind,
    id,
    enabled: true,
    get readyState() {
      return readyState;
    },
    stop: vi.fn(() => {
      readyState = 'ended';
    }),
  };
};

// Helper to create mock MediaStream
const createMockStream = (tracksCount = 1) => {
  const tracks = Array.from({ length: tracksCount }, (_, i) =>
    createMockTrack('video', `video-track-${i + 1}`)
  );
  return {
    id: `stream-${Math.random().toString(36).slice(2, 9)}`,
    getTracks: vi.fn(() => tracks),
    getVideoTracks: vi.fn(() => tracks),
    getAudioTracks: vi.fn(() => []),
    _tracks: tracks,
  } as unknown as MediaStream & { _tracks: ReturnType<typeof createMockTrack>[] };
};

describe('WebRTC Camera Stream Lifecycle & Hardware Lock Prevention', () => {
  let originalMediaDevices: MediaDevices | undefined;
  let mockPlay: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    originalMediaDevices = navigator.mediaDevices;
    mockPlay = vi.fn().mockResolvedValue(undefined);

    // Mock HTMLMediaElement.prototype.play
    window.HTMLMediaElement.prototype.play = mockPlay as any;
    window.HTMLMediaElement.prototype.pause = vi.fn() as any;

    // Mock Canvas getContext
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

  describe('stopMediaStreamTracks utility', () => {
    it('safely stops all active tracks in a stream and marks them disabled', () => {
      const mockStream = createMockStream(2);
      expect(mockStream._tracks[0].stop).not.toHaveBeenCalled();
      expect(mockStream._tracks[1].stop).not.toHaveBeenCalled();

      stopMediaStreamTracks(mockStream as any, 'TestTag');

      expect(mockStream._tracks[0].stop).toHaveBeenCalledTimes(1);
      expect(mockStream._tracks[1].stop).toHaveBeenCalledTimes(1);
      expect(mockStream._tracks[0].enabled).toBe(false);
      expect(mockStream._tracks[1].enabled).toBe(false);
    });

    it('handles null, undefined, or streams with throwing tracks without exploding', () => {
      expect(() => stopMediaStreamTracks(null)).not.toThrow();
      expect(() => stopMediaStreamTracks(undefined)).not.toThrow();

      const faultyStream = {
        getTracks: vi.fn(() => [
          {
            kind: 'video',
            id: 'err-1',
            readyState: 'live',
            enabled: true,
            stop: () => {
              throw new Error('OS Device Error');
            },
          },
        ]),
      } as any;

      expect(() => stopMediaStreamTracks(faultyStream)).not.toThrow();
    });
  });

  describe('CameraFeedPanel Component & Lifecycle Protection', () => {
    it('renders initial UI elements with hardware test bench and device controls', async () => {
      // Mock getUserMedia resolving immediately
      const mockStream = createMockStream(1);
      const getUserMediaMock = vi.fn().mockResolvedValue(mockStream);
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: { getUserMedia: getUserMediaMock },
      });

      const onToggleExpand = vi.fn();
      render(<CameraFeedPanel isExpanded={false} onToggleExpand={onToggleExpand} />);

      expect(screen.getByTestId('camera-feed-panel')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-camera-btn')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-mic-btn')).toBeInTheDocument();
      expect(screen.getByTestId('expand-camera-btn')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/LIVE WEBCAM \/\/ USER FEED/i)).toBeInTheDocument();
      });
    });

    it('CRITICAL BUG FIX TEST: immediately stops late-acquired tracks when getUserMedia resolves after unmount', async () => {
      let resolveGetUserMedia!: (stream: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolveGetUserMedia = resolve;
      });

      const getUserMediaMock = vi.fn().mockReturnValue(delayedPromise);
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: { getUserMedia: getUserMediaMock },
      });

      const mockStream = createMockStream(1);
      const activeTrack = mockStream._tracks[0];

      // 1. Mount component (starts camera acquisition)
      const { unmount } = render(<CameraFeedPanel isExpanded={false} onToggleExpand={vi.fn()} />);
      expect(getUserMediaMock).toHaveBeenCalledTimes(1);
      expect(activeTrack.stop).not.toHaveBeenCalled();

      // 2. UNMOUNT the component while getUserMedia is still awaiting!
      unmount();

      // 3. Now the browser/OS finishes granting camera access and resolves getUserMedia
      await act(async () => {
        resolveGetUserMedia(mockStream);
      });

      // 4. VERIFY: The late-acquired track MUST be stopped immediately by the post-resolution guard!
      // This guarantees hardware LED turns off and avoids NotReadableError!
      expect(activeTrack.stop).toHaveBeenCalledTimes(1);
      expect(activeTrack.enabled).toBe(false);
      expect(activeTrack.readyState).toBe('ended');
    });

    it('stops late-acquired tracks if user clicks Stop Camera while acquisition is still pending', async () => {
      let resolveGetUserMedia!: (stream: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolveGetUserMedia = resolve;
      });

      const getUserMediaMock = vi.fn().mockReturnValue(delayedPromise);
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: { getUserMedia: getUserMediaMock },
      });

      const mockStream = createMockStream(1);
      const activeTrack = mockStream._tracks[0];

      render(<CameraFeedPanel isExpanded={false} onToggleExpand={vi.fn()} />);

      // User deactivates camera before hardware finishes initializing
      const toggleCameraBtn = screen.getByTestId('toggle-camera-btn');
      fireEvent.click(toggleCameraBtn);

      // Camera off placeholder should appear
      expect(screen.getByTestId('camera-off-placeholder')).toBeInTheDocument();

      // Now late promise resolves
      await act(async () => {
        resolveGetUserMedia(mockStream);
      });

      // Track should have been immediately halted because camera was toggled off
      expect(activeTrack.stop).toHaveBeenCalled();
      expect(activeTrack.enabled).toBe(false);
    });

    it('gracefully handles NotReadableError (camera locked) by engaging simulated hardware test bench', async () => {
      const notReadableError = new DOMException('Camera in use by another app', 'NotReadableError');
      const getUserMediaMock = vi.fn().mockRejectedValue(notReadableError);
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: { getUserMedia: getUserMediaMock },
      });

      render(<CameraFeedPanel isExpanded={false} onToggleExpand={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByTestId('camera-error-banner')).toBeInTheDocument();
        expect(screen.getByText(/Camera hardware locked/i)).toBeInTheDocument();
      });

      // Simulated bench fallback should be active
      expect(screen.getByTestId('simulated-bench-fallback')).toBeInTheDocument();
      expect(screen.getByText(/LIVE CAM \/\/ HARDWARE TEST BENCH/i)).toBeInTheDocument();
    });

    it('handles NotAllowedError (permission denied) cleanly without unhandled exception', async () => {
      const permissionError = new DOMException('Permission denied', 'NotAllowedError');
      const getUserMediaMock = vi.fn().mockRejectedValue(permissionError);
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: { getUserMedia: getUserMediaMock },
      });

      render(<CameraFeedPanel isExpanded={false} onToggleExpand={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByTestId('camera-error-banner')).toBeInTheDocument();
        expect(screen.getByText(/Camera permission denied/i)).toBeInTheDocument();
      });
    });

    it('toggles microphone state and fires expand view callback', async () => {
      const mockStream = createMockStream(1);
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: { getUserMedia: vi.fn().mockResolvedValue(mockStream) },
      });

      const onToggleExpand = vi.fn();
      render(<CameraFeedPanel isExpanded={false} onToggleExpand={onToggleExpand} />);

      // Mic toggle
      const micBtn = screen.getByTestId('toggle-mic-btn');
      expect(screen.getByText('Mic Active')).toBeInTheDocument();
      fireEvent.click(micBtn);
      expect(screen.getByText('Mic Muted')).toBeInTheDocument();
      fireEvent.click(micBtn);
      expect(screen.getByText('Mic Active')).toBeInTheDocument();

      // Expand toggle
      const expandBtn = screen.getByTestId('expand-camera-btn');
      fireEvent.click(expandBtn);
      expect(onToggleExpand).toHaveBeenCalledTimes(1);
    });

    it('cleans up active stream and tracker when unmounted normally', async () => {
      const mockStream = createMockStream(1);
      const activeTrack = mockStream._tracks[0];
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: { getUserMedia: vi.fn().mockResolvedValue(mockStream) },
      });

      const { unmount } = render(<CameraFeedPanel isExpanded={false} onToggleExpand={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText(/LIVE WEBCAM \/\/ USER FEED/i)).toBeInTheDocument();
      });

      expect(activeTrack.stop).not.toHaveBeenCalled();

      // Normal unmount
      unmount();

      // Track should now be stopped
      expect(activeTrack.stop).toHaveBeenCalledTimes(1);
      expect(activeTrack.enabled).toBe(false);
    });
  });

  describe('PresenterVisionTracker Integration & Lifecycle', () => {
    it('startWithStream attaches external stream without calling getUserMedia again', async () => {
      const getUserMediaMock = vi.fn();
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: { getUserMedia: getUserMediaMock },
      });

      const tracker = new PresenterVisionTracker();
      const mockStream = createMockStream(1);
      const videoElem = document.createElement('video');

      const success = await tracker.startWithStream(mockStream as any, videoElem);

      expect(success).toBe(true);
      expect(videoElem.srcObject).toBe(mockStream);
      expect(getUserMediaMock).not.toHaveBeenCalled(); // No second getUserMedia call!

      tracker.stop();
      expect(mockStream._tracks[0].stop).toHaveBeenCalled();
    });

    it('startSimulation runs tracking loop without requiring camera stream', () => {
      const tracker = new PresenterVisionTracker();
      expect(() => tracker.startSimulation()).not.toThrow();
      tracker.stop();
    });
  });
});
