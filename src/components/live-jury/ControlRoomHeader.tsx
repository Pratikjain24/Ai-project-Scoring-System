import React from 'react';
import { 
  Pause, 
  Play, 
  StopCircle, 
  ArrowLeft, 
  Clock, 
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ControlRoomHeaderProps {
  timerSeconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onEndEvaluation: () => void;
  onBackToOverview: () => void;
  isExpandedCamera: boolean;
  onToggleExpandCamera: () => void;
}

export const ControlRoomHeader: React.FC<ControlRoomHeaderProps> = ({
  timerSeconds,
  isPaused,
  onTogglePause,
  onEndEvaluation,
  onBackToOverview,
  isExpandedCamera,
  onToggleExpandCamera,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full border-b border-white/10 bg-[#080B12]/95 backdrop-blur-2xl sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Section: Back link & Title with System Beacon */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToOverview}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
            title="Return to Platform Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm sm:text-base text-white tracking-tight">
                Live Jury Control Room
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 font-semibold uppercase tracking-wider">
                Session Active
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Jury Core v4.2 Online
              </span>
              <span>•</span>
              <span>CV Inference: 60 FPS</span>
              <span>•</span>
              <span className="text-cyan-400">Lat: 14ms</span>
            </div>
          </div>
        </div>

        {/* Center: Disclaimer Tag (Clear & Prominent) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono self-start md:self-auto">
          <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          <span>DEMO DATA // SIMULATED AI TELEMETRY</span>
        </div>

        {/* Right Section: Timer, Pause, Expand Camera, and End Evaluation */}
        <div className="flex items-center gap-3">
          {/* Recording Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span>REC</span>
          </div>

          {/* Session Timer & Pause Toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-white tracking-widest text-sm">
              {formatTime(timerSeconds)}
            </span>
            <button
              onClick={onTogglePause}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition-colors ml-1"
              title={isPaused ? 'Resume Evaluation' : 'Pause Evaluation'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Expand Camera Toggle */}
          <button
            onClick={onToggleExpandCamera}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              isExpandedCamera
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
            title="Toggle Expanded Camera View"
          >
            {isExpandedCamera ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand Feed</span>
              </>
            )}
          </button>

          {/* End Evaluation CTA */}
          <button
            onClick={onEndEvaluation}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5 shrink-0"
          >
            <StopCircle className="w-3.5 h-3.5" />
            <span>End Evaluation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
