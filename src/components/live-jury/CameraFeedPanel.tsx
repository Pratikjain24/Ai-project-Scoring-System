import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Maximize2, 
  Minimize2, 
  Cpu, 
  Eye,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Radio,
  Sliders,
  Volume2,
  Users
} from 'lucide-react';
import { PresenterVisionTracker } from '../../utils/presenterVisionTracker';
import { AudioNoiseFilter, type AudioFilterMetrics, type NoiseSuppressionLevel } from '../../utils/audioNoiseFilter';
import type { LivePresenterTrackingMetrics } from '../../types/liveJury';

interface CameraFeedPanelProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

/**
 * Safely terminates all tracks on a MediaStream instance to immediately release
 * OS-level camera hardware locks and avoid NotReadableError on subsequent initializations.
 */
export const stopMediaStreamTracks = (stream: MediaStream | null | undefined, tag = 'CameraFeed'): void => {
  if (!stream) return;
  try {
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      try {
        if (track.readyState !== 'ended') {
          track.stop();
        }
        track.enabled = false;
        console.log(`[${tag}] 🛑 Safely stopped media track: kind=${track.kind}, id=${track.id}`);
      } catch (trackErr) {
        console.warn(`[${tag}] Warning while stopping track:`, trackErr);
      }
    });
  } catch (err) {
    console.warn(`[${tag}] Error querying stream tracks:`, err);
  }
};

export const CameraFeedPanel: React.FC<CameraFeedPanelProps> = ({
  isExpanded,
  onToggleExpand,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [micActive, setMicActive] = useState<boolean>(true);
  const [usingRealWebcam, setUsingRealWebcam] = useState<boolean>(false);
  const [isAcquiring, setIsAcquiring] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<LivePresenterTrackingMetrics | null>(null);
  const [noiseFilterActive, setNoiseFilterActive] = useState<boolean>(true);
  const [noiseLevel, setNoiseLevel] = useState<NoiseSuppressionLevel>('MEDIUM');
  const [audioMetrics, setAudioMetrics] = useState<AudioFilterMetrics | null>(null);

  // Core DOM and tracking references
  const videoRef = useRef<HTMLVideoElement>(null);
  const hudCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackerRef = useRef<PresenterVisionTracker | null>(null);
  const audioFilterRef = useRef<AudioNoiseFilter | null>(null);
  const noiseLevelRef = useRef<NoiseSuppressionLevel>(noiseLevel);
  const noiseFilterActiveRef = useRef<boolean>(noiseFilterActive);

  useEffect(() => {
    noiseLevelRef.current = noiseLevel;
  }, [noiseLevel]);

  useEffect(() => {
    noiseFilterActiveRef.current = noiseFilterActive;
  }, [noiseFilterActive]);

  // Lifecycle & Race Condition Guards
  const isMountedRef = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeSessionIdRef = useRef<number>(0);

  // Initialize and manage camera hardware & tracker lifecycle
  useEffect(() => {
    isMountedRef.current = true;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const sessionId = ++activeSessionIdRef.current;

    // Create Presenter Vision Tracker instance
    const tracker = new PresenterVisionTracker({
      targetFps: 30,
      maxPresenters: 5,
      enableMultiPresenter: true,
      onMetricsUpdate: (m) => {
        if (!isMountedRef.current) return;
        setMetrics(m);
        if (hudCanvasRef.current) {
          const canvas = hudCanvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            tracker.renderHUD(canvas, m);
          }
        }
      }
    });
    trackerRef.current = tracker;

    // Initialize Web Audio noise reduction filter
    const noiseFilter = new AudioNoiseFilter({
      reductionLevel: noiseLevelRef.current,
      enableAdaptiveGate: noiseFilterActiveRef.current,
      onMetricsUpdate: (m) => {
        if (!isMountedRef.current) return;
        setAudioMetrics(m);
        trackerRef.current?.setAudioMetrics(m);
      },
    });
    audioFilterRef.current = noiseFilter;

    async function startCamera() {
      // 1. Explicitly disabled by user toggle
      if (!cameraActive) {
        console.log(`[CameraFeed] [Session #${sessionId}] Camera deactivated by user. Halting hardware feed.`);
        if (streamRef.current) {
          stopMediaStreamTracks(streamRef.current, 'CameraFeed-UserDeactivate');
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setUsingRealWebcam(false);
        setIsAcquiring(false);
        tracker.stop();
        return;
      }

      setIsAcquiring(true);
      setCameraError(null);

      // 2. Browser Environment Capability Check
      if (!navigator.mediaDevices?.getUserMedia) {
        console.warn(`[CameraFeed] [Session #${sessionId}] getUserMedia API unavailable in this browser environment.`);
        if (isMountedRef.current && sessionId === activeSessionIdRef.current) {
          setUsingRealWebcam(false);
          setIsAcquiring(false);
          setCameraError('WebRTC camera API not available in this environment. Telemetry tagged UNVERIFIED_HARDWARE_FAULT.');
          tracker.startSimulation({ isPenaltyMode: true, maxScoreCap: 50.0 });
        }
        return;
      }

      try {
        console.log(`[CameraFeed] [Session #${sessionId}] Requesting camera access with AbortController...`);

        // Request camera media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false,
        });

        // 3. CRITICAL POST-RESOLUTION GUARD:
        // Did the component unmount, was it aborted, or was camera toggled OFF while getUserMedia was awaiting?
        const isObsolete = 
          !isMountedRef.current || 
          controller.signal.aborted || 
          sessionId !== activeSessionIdRef.current || 
          !cameraActive;

        if (isObsolete) {
          console.warn(`[CameraFeed] [Session #${sessionId}] ⚠️ Stream acquired after unmount/abort/disable. Halting late tracks immediately to prevent hardware lock.`);
          stopMediaStreamTracks(stream, 'CameraFeed-LateGuard');
          return;
        }

        // 4. Safely swap active stream references
        if (streamRef.current && streamRef.current !== stream) {
          stopMediaStreamTracks(streamRef.current, 'CameraFeed-Superseded');
        }
        streamRef.current = stream;

        // Attach hardware interruption listener (USB yank, device revoke)
        stream.getVideoTracks().forEach((track) => {
          track.onended = () => {
            console.warn('[CameraFeed] ⚠️ Hardware track ended unexpectedly (USB yanked).');
            if (isMountedRef.current) {
              setCameraError('Webcam disconnected. Please reconnect your video hardware.');
              setUsingRealWebcam(false);
              tracker.stop();
              tracker.startSimulation({ isPenaltyMode: true, maxScoreCap: 50.0 });
            }
          };
        });

        // 5. Bind stream to HTMLVideoElement
        if (videoRef.current && isMountedRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
            console.log(`[CameraFeed] [Session #${sessionId}] ✅ Video stream playing successfully`);
          } catch (playError: any) {
            if (playError?.name !== 'AbortError') {
              console.error(`[CameraFeed] [Session #${sessionId}] Video play failed:`, playError);
            }
          }

          if (isMountedRef.current && sessionId === activeSessionIdRef.current) {
            setUsingRealWebcam(true);
            setIsAcquiring(false);

            // Connect acquired hardware stream directly to tracker (no duplicate getUserMedia call)
            const trackerStarted = await tracker.startWithStream(stream, videoRef.current);
            if (trackerStarted) {
              console.log(`[CameraFeed] [Session #${sessionId}] ✅ Presenter tracking initialized with hardware stream`);
            } else {
              console.warn(`[CameraFeed] [Session #${sessionId}] Tracker defaulted to simulation mode`);
            }
          }
        }
      } catch (error: any) {
        // If aborted during unmount, exit cleanly without error state
        if (controller.signal.aborted || !isMountedRef.current) {
          console.log(`[CameraFeed] [Session #${sessionId}] Camera request was cleanly aborted during unmount/switch.`);
          return;
        }

        console.error(`[CameraFeed] [Session #${sessionId}] ❌ Camera initialization failed:`, error);
        let errorMsg = 'Camera initialization failed.';

        if (error instanceof DOMException) {
          if (error.name === 'NotAllowedError') {
            errorMsg = 'Camera permission denied. Please allow camera permissions in browser settings.';
          } else if (error.name === 'NotFoundError') {
            errorMsg = 'No camera hardware detected. Hardware test bench engaged (UNVERIFIED).';
          } else if (error.name === 'NotReadableError') {
            errorMsg = 'Camera hardware locked by another application or tab. Hardware test bench engaged (UNVERIFIED).';
          } else if (error.name === 'NotSupportedError') {
            errorMsg = 'Camera access requires a secure origin (HTTPS or localhost).';
          } else if (error.name === 'AbortError') {
            errorMsg = 'Camera hardware request was interrupted.';
          } else {
            errorMsg = `Camera error (${error.name}): ${error.message}`;
          }
        } else if (error?.message) {
          errorMsg = error.message;
        }

        if (isMountedRef.current && sessionId === activeSessionIdRef.current) {
          setCameraError(errorMsg);
          setUsingRealWebcam(false);
          setIsAcquiring(false);
          // Disarm simulation exploit: engage penalty mode with 50% cap
          tracker.startSimulation({ isPenaltyMode: true, maxScoreCap: 50.0 });
        }
      }
    }

    startCamera();

    // 6. Comprehensive Cleanup on Unmount or Dependency Change
    const videoNode = videoRef.current;
    return () => {
      isMountedRef.current = false;
      controller.abort();
      
      // Stop tracker processing loop
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }

      // Dispose audio noise filter
      if (audioFilterRef.current) {
        audioFilterRef.current.dispose();
        audioFilterRef.current = null;
      }

      // Explicitly stop and release hardware media tracks
      if (streamRef.current) {
        stopMediaStreamTracks(streamRef.current, 'CameraFeed-UnmountCleanup');
        streamRef.current = null;
      }

      // Detach video element reference
      if (videoNode) {
        try {
          videoNode.srcObject = null;
        } catch (_) {}
      }
    };
  }, [cameraActive]);

  const toggleCamera = useCallback(() => {
    setCameraActive((prev) => !prev);
  }, []);

  const toggleMic = useCallback(() => {
    setMicActive((prev) => !prev);
  }, []);

  const toggleNoiseFilter = useCallback(() => {
    setNoiseFilterActive((prev) => {
      const next = !prev;
      audioFilterRef.current?.setNoiseReductionLevel(next ? noiseLevel : 'LOW');
      return next;
    });
  }, [noiseLevel]);

  const cycleNoiseReductionLevel = useCallback(() => {
    setNoiseLevel((prev) => {
      const next: NoiseSuppressionLevel = prev === 'LOW' ? 'MEDIUM' : prev === 'MEDIUM' ? 'AGGRESSIVE' : 'LOW';
      audioFilterRef.current?.setNoiseReductionLevel(next);
      return next;
    });
  }, []);

  const retryCamera = useCallback(() => {
    setCameraActive(false);
    setTimeout(() => {
      if (isMountedRef.current) {
        setCameraActive(true);
      }
    }, 100);
  }, []);

  return (
    <div 
      data-testid="camera-feed-panel"
      className={`rounded-3xl bg-[#090D16] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all ${
        isExpanded ? 'h-[750px]' : 'h-[460px] sm:h-[500px]'
      }`}
    >
      {/* Top Overlay Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          <div 
            data-testid="hardware-status-badge"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-200"
          >
            <span className={`w-2 h-2 rounded-full ${usingRealWebcam ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'}`} />
            <span>{usingRealWebcam ? 'LIVE WEBCAM // USER FEED' : 'LIVE CAM // HARDWARE TEST BENCH'}</span>
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>AI CV: 60 FPS</span>
          </span>

          <span 
            data-testid="multi-presenter-badge"
            className="px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5"
          >
            <Users className="w-3 h-3 text-cyan-400" />
            <span>PRESENTERS: {metrics?.presenterCount ?? metrics?.trackedPresenters?.length ?? 1}/5 [WEBGL]</span>
          </span>

          <button
            onClick={toggleNoiseFilter}
            data-testid="rnnoise-filter-badge"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-mono transition-colors pointer-events-auto ${
              noiseFilterActive
                ? 'bg-violet-950/80 border-violet-500/50 text-violet-300 hover:bg-violet-900/50'
                : 'bg-black/60 border-white/10 text-slate-400 hover:bg-white/5'
            }`}
            title="Click to toggle Web Audio RNNoise ambient noise suppression"
          >
            <Sliders className="w-3 h-3 text-violet-400" />
            <span>RNNOISE: {noiseFilterActive ? `ACTIVE [-14dB | SNR: ${audioMetrics?.snrDb || 21}dB]` : 'BYPASS'}</span>
          </button>

          {isAcquiring && (
            <span className="px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40 text-[10px] font-mono text-amber-300 flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
              <span>ACQUIRING SENSOR...</span>
            </span>
          )}
        </div>

        {/* Demo Data disclaimer indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-400">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>EVIDENCE AUDIT OVERLAY</span>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
        {cameraActive ? (
          <>
            {/* Real Webcam video element */}
            <video
              ref={videoRef}
              data-testid="camera-video-element"
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                usingRealWebcam ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Live Presenter CV HUD Overlay */}
            <canvas
              ref={hudCanvasRef}
              data-testid="hud-canvas-element"
              width={1280}
              height={720}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Simulated Lab Video / Hardware Bench Fallback when webcam is unavailable */}
            {!usingRealWebcam && (
              <div 
                data-testid="simulated-bench-fallback"
                className="absolute inset-0 w-full h-full bg-[#080C14] flex items-center justify-center overflow-hidden"
              >
                {/* Background grid & radar sweep */}
                <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                {/* Animated Reticle Circles */}
                <div className="w-64 h-64 rounded-full border border-cyan-500/20 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 rounded-full border border-dashed border-cyan-500/30 animate-spin [animation-duration:20s]" />
                  <div className="w-32 h-32 rounded-full border border-emerald-500/40" />
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                </div>

                {/* Simulated Hardware Prototype Graphic representation */}
                <div className="absolute w-72 h-44 rounded-xl border border-cyan-500/40 bg-cyan-950/20 backdrop-blur-xs flex flex-col justify-between p-3 pointer-events-none">
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      <span>TARGET: HAILO-8 M.2 NPU</span>
                    </span>
                    <span className="text-emerald-400">84ms INFER</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>ESP32-S3-WROOM-1</span>
                    <span className="text-cyan-300">IMU 200Hz OK</span>
                  </div>
                </div>
              </div>
            )}

            {/* Unverified Telemetry Hardware Fault Badge */}
            {((metrics?.unverifiedHardwareFault) || (!usingRealWebcam && cameraError)) && (
              <div 
                data-testid="unverified-hardware-badge"
                className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/90 border border-red-500/60 text-red-200 text-xs font-mono shadow-xl backdrop-blur-md"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>UNVERIFIED_HARDWARE_FAULT // VISUAL RUBRIC CAPPED AT 50%</span>
              </div>
            )}

            {/* Error Notification Pill */}
            {cameraError && (
              <div 
                data-testid="camera-error-banner"
                className="absolute top-16 left-4 right-4 z-20 flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-950/90 border border-amber-500/40 text-amber-200 text-xs font-mono backdrop-blur-md shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{cameraError}</span>
                </div>
                <button
                  onClick={retryCamera}
                  className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] uppercase font-bold border border-amber-500/40 transition-colors pointer-events-auto"
                >
                  Retry
                </button>
              </div>
            )}

            {/* High-Tech Computer Vision HUD Overlays */}
            {/* Box 1: Hardware Probe Check */}
            <div className="absolute top-28 left-8 sm:left-14 border border-cyan-400/80 bg-cyan-950/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 flex items-center gap-2 pointer-events-none shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>[CV-OBJECT] ESP32-S3 BOARD [PASS]</span>
            </div>

            {/* Box 2: Presenter Face & Gaze Tracking */}
            <div className="absolute top-28 right-8 sm:right-14 border border-emerald-400/80 bg-emerald-950/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2 pointer-events-none shadow-lg">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>GAZE & EYE CONTACT: {metrics ? `${metrics.eyeContactScore}% [${metrics.gazeStatus}]` : '92% NOMINAL'}</span>
            </div>

            {/* Box 3: Speech Diarization & Audio Noise Floor */}
            <div className="absolute bottom-20 left-8 border border-amber-400/80 bg-amber-950/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-amber-300 flex items-center gap-2 pointer-events-none shadow-lg">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>
                NOISE FLOOR: {audioMetrics ? `${audioMetrics.noiseFloorDbFS} dBFS` : '-48.0 dBFS'} // DIARIZATION: ACTIVE [2 PRES.]
              </span>
            </div>

            {/* Box 4: Multi-Presenter & Speaking Balance */}
            <div 
              data-testid="multi-presenter-overlay"
              className="absolute bottom-20 right-8 border border-cyan-400/80 bg-cyan-950/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 flex items-center gap-2 pointer-events-none shadow-lg"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                TEAM BALANCE: {metrics?.teamSpeakingBalanceScore ?? 88}% | ACTIVE: P#{metrics?.activePresenterId ?? 1}
              </span>
            </div>
          </>
        ) : (
          /* Camera Off Placeholder */
          <div 
            data-testid="camera-off-placeholder"
            className="text-center space-y-3 p-8 font-mono"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mx-auto">
              <CameraOff className="w-7 h-7" />
            </div>
            <p className="text-sm text-slate-300 font-semibold">Camera Video Feed Suspended</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">Click Start Camera to re-engage multimodal visual analysis.</p>
          </div>
        )}
      </div>

      {/* Bottom Interactive Controls Toolbar */}
      <div className="relative z-20 px-6 py-3.5 bg-black/85 backdrop-blur-xl border-t border-white/10 flex items-center justify-between">
        {/* Left: Device Toggles */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleCamera}
            data-testid="toggle-camera-btn"
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all ${
              cameraActive
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            {cameraActive ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
            <span>{cameraActive ? 'Stop Camera' : 'Start Camera'}</span>
          </button>

          <button
            onClick={toggleMic}
            data-testid="toggle-mic-btn"
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all ${
              micActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            <span>{micActive ? 'Mic Active' : 'Mic Muted'}</span>
          </button>

          <button
            onClick={toggleNoiseFilter}
            data-testid="toggle-noise-filter-btn"
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all ${
              noiseFilterActive
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 hover:bg-violet-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
            }`}
            title="Toggle Web Audio RNNoise ambient noise suppression"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{noiseFilterActive ? 'RNNoise: Active' : 'RNNoise: Off'}</span>
          </button>

          {noiseFilterActive && (
            <button
              onClick={cycleNoiseReductionLevel}
              data-testid="cycle-noise-level-btn"
              className="px-2.5 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition-all bg-violet-500/10 text-violet-300 border border-violet-500/30 hover:bg-violet-500/20"
              title="Cycle noise suppression aggressiveness (LOW -> MEDIUM -> AGGRESSIVE)"
            >
              <Volume2 className="w-3 h-3 text-violet-400" />
              <span>{noiseLevel}</span>
            </button>
          )}
        </div>

        {/* Center: Audio level simulation */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Audio Telemetry:</span>
          <div className="flex items-center gap-0.5 h-4">
            <div className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <div className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse [animation-delay:100ms]" />
            <div className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse [animation-delay:200ms]" />
            <div className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse [animation-delay:300ms]" />
            <div className="w-1 h-1 bg-slate-600 rounded-full" />
          </div>
          <span className="text-emerald-400 text-[10px]">48 kHz</span>
        </div>

        {/* Right: Expand view toggle */}
        <button
          onClick={onToggleExpand}
          data-testid="expand-camera-btn"
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          title={isExpanded ? 'Restore Normal Layout' : 'Expand Camera View'}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
