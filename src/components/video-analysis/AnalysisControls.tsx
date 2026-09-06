import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Sparkles, 
  Cpu 
} from 'lucide-react';

interface AnalysisControlsProps {
  isProcessing: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  overallProgress: number;
  currentStageNumber: number;
  totalStages: number;
  onStart: () => void;
  onPauseToggle: () => void;
  onFastForward: () => void;
  onReset: () => void;
  hasVideo: boolean;
}

export const AnalysisControls: React.FC<AnalysisControlsProps> = ({
  isProcessing,
  isPaused,
  isCompleted,
  overallProgress,
  currentStageNumber,
  totalStages,
  onStart,
  onPauseToggle,
  onFastForward,
  onReset,
  hasVideo,
}) => {
  return (
    <div className="rounded-3xl bg-[#090D16] border border-white/10 p-6 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Overall Status & Stage Indicator */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              AI Jury Engine Execution
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : isProcessing
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}>
              {isCompleted ? 'DILIGENCE COMPLETE' : isProcessing ? `STAGE ${currentStageNumber} OF ${totalStages}` : 'IDLE / READY'}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            {isCompleted
              ? 'All 11 verification checkpoints passed. Institutional Dossier ratified.'
              : isProcessing
              ? `Processing multimodal artifacts... ${overallProgress}% total progress`
              : hasVideo
              ? 'Video attached. Click Start to begin the 11-stage autonomous evaluation.'
              : 'Please attach a project demonstration video above to initiate.'}
          </p>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!isProcessing && !isCompleted && (
            <button
              type="button"
              disabled={!hasVideo}
              onClick={onStart}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/25 transition-all text-xs font-mono flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Start AI Analysis</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {isProcessing && (
            <>
              <button
                type="button"
                onClick={onPauseToggle}
                className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                type="button"
                onClick={onFastForward}
                className="px-4 py-2.5 rounded-xl text-xs font-mono text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/40 transition-colors flex items-center gap-1.5"
                title="Fast forward all 11 stages"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Fast Forward</span>
              </button>
            </>
          )}

          {(isProcessing || isCompleted) && (
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-rose-300 hover:bg-rose-950/20 border border-white/10 transition-colors flex items-center gap-1.5"
              title="Reset timeline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Progress Bar */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>PIPELINE TOTAL COMPLETION</span>
          <span className="text-white font-bold">{overallProgress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
