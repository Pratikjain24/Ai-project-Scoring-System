import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Maximize2, 
  Minimize2, 
  Activity, 
  Cpu, 
  Eye
} from 'lucide-react';
import { PresenterVisionTracker } from '../../utils/presenterVisionTracker';
import type { LivePresenterTrackingMetrics } from '../../types/liveJury';

interface CameraFeedPanelProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const CameraFeedPanel: React.FC<CameraFeedPanelProps> = ({
  isExpanded,
  onToggleExpand,
}) => {
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [usingRealWebcam, setUsingRealWebcam] = useState(false);
  const [metrics, setMetrics] = useState<LivePresenterTrackingMetrics | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hudCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackerRef = useRef<PresenterVisionTracker | null>(null);

  // Attempt real webcam access, fallback gracefully to simulated lab feed
  useEffect(() => {
    let mounted = true;

    const tracker = new PresenterVisionTracker({
      targetFps: 30,
      onMetricsUpdate: (m) => {
        if (!mounted) return;
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

    async function startCamera() {
      if (!cameraActive) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        setUsingRealWebcam(false);
        tracker.stop();
        return;
      }

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          console.log('[CameraFeed] Requesting camera access...');
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
          
          if (mounted && videoRef.current) {
            videoRef.current.srcObject = stream;
            
            try {
              await videoRef.current.play();
              console.log('[CameraFeed] ✅ Video playback started successfully');
            } catch (playError) {
              console.error('[CameraFeed] Video playback failed:', playError);
            }
            
            streamRef.current = stream;
            setUsingRealWebcam(true);
            
            const trackerStarted = await tracker.startWebcam(videoRef.current);
            if (trackerStarted) {
              console.log('[CameraFeed] ✅ Presenter tracking initialized');
            } else {
              console.warn('[CameraFeed] Tracker started in simulation mode');
            }
          }
        } else {
          console.warn('[CameraFeed] getUserMedia API not available in this browser');
          setUsingRealWebcam(false);
        }
      } catch (error) {
        console.error('[CameraFeed] ❌ Camera initialization failed:', error);
        
        if (error instanceof DOMException) {
          if (error.name === 'NotAllowedError') {
            console.error('❌ Camera permission denied by user');
            alert('Camera access denied. Please allow camera permissions in your browser settings and refresh the page.');
          } else if (error.name === 'NotFoundError') {
            console.error('❌ No camera device found');
            alert('No camera detected. Please connect a webcam and try again.');
          } else if (error.name === 'NotReadableError') {
            console.error('❌ Camera is already in use by another application');
            alert('Camera is in use by another application. Please close it and try again.');
          } else if (error.name === 'NotSupportedError') {
            console.error('❌ Camera access requires HTTPS or localhost');
            alert('⚠️ Camera requires secure connection!\n\nPlease access the app via:\n• http://localhost:5173\n• https://localhost:5173\n\nCurrent URL: ' + window.location.href);
          } else {
            console.error('❌ Camera error:', error.name, error.message);
            alert('Camera error: ' + error.message);
          }
        } else {
          console.error('❌ Unknown camera error:', error);
        }
        
        if (mounted) {
          setUsingRealWebcam(false);
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;
      tracker.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraActive]);

  const toggleCamera = () => {
    setCameraActive((prev) => !prev);
  };

  const toggleMic = () => {
    setMicActive((prev) => !prev);
  };

  return (
    <div className={`rounded-3xl bg-[#090D16] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all ${
      isExpanded ? 'h-[750px]' : 'h-[460px] sm:h-[500px]'
    }`}>
      {/* Top Overlay Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-200">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>{usingRealWebcam ? 'LIVE WEBCAM // USER FEED' : 'LIVE CAM // HARDWARE TEST BENCH'}</span>
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
            AI CV: 60 FPS
          </span>
        </div>

        {/* Demo Data disclaimer indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-amber-400">
          <span>DEMO DATA OVERLAY</span>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
        {cameraActive ? (
          <>
            {/* Real Webcam video element */}
            <video
              ref={videoRef}
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                usingRealWebcam ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />

            {/* Live Presenter CV HUD Overlay */}
            <canvas
              ref={hudCanvasRef}
              width={1280}
              height={720}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Simulated Lab Video / Hardware Bench Fallback when webcam is unavailable */}
            {!usingRealWebcam && (
              <div className="absolute inset-0 w-full h-full bg-[#080C14] flex items-center justify-center overflow-hidden">
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

            {/* High-Tech Computer Vision HUD Overlays */}
            {/* Box 1: Hardware Probe Check */}
            <div className="absolute top-20 left-8 sm:left-14 border border-cyan-400/80 bg-cyan-950/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 flex items-center gap-2 pointer-events-none shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>[CV-OBJECT] ESP32-S3 BOARD [PASS]</span>
            </div>

            {/* Box 2: Presenter Face & Gaze Tracking */}
            <div className="absolute top-20 right-8 sm:right-14 border border-emerald-400/80 bg-emerald-950/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2 pointer-events-none shadow-lg">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>GAZE & EYE CONTACT: {metrics ? `${metrics.eyeContactScore}% [${metrics.gazeStatus}]` : '92% NOMINAL'}</span>
            </div>

            {/* Box 3: Oscilloscope Ripple Telemetry */}
            <div className="absolute bottom-20 left-8 border border-amber-400/80 bg-amber-950/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-amber-300 flex items-center gap-2 pointer-events-none shadow-lg">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>OSCILLOSCOPE RIPPLE: 14mV p-p</span>
            </div>
          </>
        ) : (
          /* Camera Off Placeholder */
          <div className="text-center space-y-3 p-8 font-mono">
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
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all ${
              micActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            <span>{micActive ? 'Mic Active' : 'Mic Muted'}</span>
          </button>
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
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          title={isExpanded ? 'Restore Normal Layout' : 'Expand Camera View'}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
