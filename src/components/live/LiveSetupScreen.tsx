import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Mic, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Sparkles
} from 'lucide-react';
import type { LiveCameraSource } from '../../types/liveJury';

interface LiveSetupScreenProps {
  evaluationId?: string;
  projectName: string;
  onEnterRoom: (source: LiveCameraSource, micId: string) => void;
}

export const LiveSetupScreen: React.FC<LiveSetupScreenProps> = ({
  projectName,
  onEnterRoom,
}) => {
  const [selectedSource, setSelectedSource] = useState<LiveCameraSource>('SIMULATED');
  const [selectedMic, setSelectedMic] = useState<string>('default');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [micVolume, setMicVolume] = useState<number>(45);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Probe media permissions
  useEffect(() => {
    let active = true;

    async function checkPermissions() {
      if (selectedSource === 'SIMULATED') {
        setHasCameraPermission(true);
        setHasMicPermission(true);
        return;
      }

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: selectedSource === 'WEBCAM',
            audio: true 
          });
          
          if (!active) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }

          streamRef.current = stream;
          setHasCameraPermission(true);
          setHasMicPermission(true);

          if (videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = stream;
          }
        } else {
          setHasCameraPermission(false);
          setHasMicPermission(false);
        }
      } catch {
        if (active) {
          setHasCameraPermission(false);
          setHasMicPermission(false);
        }
      }
    }

    checkPermissions();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [selectedSource]);

  // Audio meter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setMicVolume(Math.floor(25 + Math.random() * 50));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-slate-100 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Phase 11: Live Multi-Modal Evaluation
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          ProjectX-Ray Live AI Jury Room
        </h1>
        <p className="text-slate-400 mt-2 max-w-xl mx-auto text-sm sm:text-base">
          Real-time synchronized evaluation room for <span className="text-white font-medium">{projectName}</span>. Continuous claim verification, live demo telemetry, and non-intrusive adaptive judging.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left: Device Preview */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                Live Video & Audio Feed Preview
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {selectedSource === 'SIMULATED' ? 'High-Tech Simulation' : 'Direct Hardware Stream'}
              </span>
            </div>

            {/* Video Preview Box */}
            <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center group shadow-inner">
              {selectedSource === 'WEBCAM' && hasCameraPermission ? (
                <video 
                  ref={videoPreviewRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : selectedSource === 'SIMULATED' ? (
                <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
                  
                  {/* Radar grid effect */}
                  <div className="w-24 h-24 rounded-full border border-cyan-500/30 flex items-center justify-center relative mb-4 animate-pulse">
                    <div className="w-16 h-16 rounded-full border border-cyan-500/50 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-cyan-400" />
                    </div>
                  </div>
                  
                  <div className="text-sm font-semibold text-white">
                    Smart Road Vision Demonstration Feed
                  </div>
                  <div className="text-xs text-slate-400 mt-1 max-w-sm">
                    Pre-configured edge telemetry simulation: Jetson Orin Nano TensorRT pipeline with live asphalt pothole tagging.
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Feed Stream Ready (1080p @ 30 FPS)
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
                  <div className="text-sm font-medium text-slate-300">Camera Permission Required</div>
                  <div className="text-xs text-slate-500 max-w-xs mt-1">
                    Grant browser camera access to broadcast live, or switch to High-Tech Simulation mode.
                  </div>
                  <button 
                    onClick={() => setSelectedSource('SIMULATED')}
                    className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
                  >
                    Switch to Simulated Feed
                  </button>
                </div>
              )}

              {/* HUD Overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                </span>
                <span className="text-[11px] font-mono font-semibold text-cyan-300 bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-500/30 backdrop-blur-sm">
                  STANDBY 1080p
                </span>
              </div>
            </div>

            {/* Audio Meter */}
            <div className="mt-4 bg-slate-950 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Mic className="w-3.5 h-3.5 text-cyan-400" />
                  Microphone Level
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {hasMicPermission ? `${micVolume}% (Optimal)` : 'Hardware Disabled'}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-150 ${
                    micVolume > 80 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${micVolume}%` }}
                />
              </div>
            </div>
          </div>

          {/* Device Controls */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Camera Source
              </label>
              <select 
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value as LiveCameraSource)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="SIMULATED">Simulated Presentation (Recommended)</option>
                <option value="WEBCAM">System Webcam (Live)</option>
                <option value="SCREEN">Screen Share Feed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Audio Input
              </label>
              <select 
                value={selectedMic}
                onChange={(e) => setSelectedMic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="default">Default Input Microphone</option>
                <option value="simulated">High-Fidelity Audio Stream</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Pre-Session Checklist & Privacy Policy */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Pre-Session Checklist */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Pre-Session System Readiness
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">Video Capture Pipeline</div>
                    <div className="text-[11px] text-slate-500">1080p WebRTC / Canvas synchronized</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">ONLINE</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">Speech-to-Text Pipeline</div>
                    <div className="text-[11px] text-slate-500">Interim + Final stabilized transcript</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">ACTIVE</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">Claim Corroboration Engine</div>
                    <div className="text-[11px] text-slate-500">Indexed against Project DNA claims</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">READY</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">Expected Evaluation Time</div>
                    <div className="text-[11px] text-slate-500">Target 10-minute presentation scenario</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold">10:00</span>
              </div>
            </div>
          </div>

          {/* Strict Privacy Notice */}
          <div className="bg-slate-900/60 border border-cyan-900/30 rounded-2xl p-4 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-bold text-cyan-400 mb-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Strict Ethical & Privacy Guarantee
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ProjectX-Ray AI strictly evaluates <strong className="text-slate-200">technical evidence</strong>, verbal claims, demonstrated features, and structure. The system explicitly <strong className="text-slate-200">does NOT</strong> perform facial recognition, emotion tracking, psychological profiling, or biometric identification.
            </p>
          </div>

          {/* CTA Action */}
          <button
            onClick={() => onEnterRoom(selectedSource, selectedMic)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-[0.99]"
          >
            <Play className="w-5 h-5 fill-current" />
            ENTER LIVE EVALUATION ROOM
          </button>
        </div>
      </div>
    </div>
  );
};
