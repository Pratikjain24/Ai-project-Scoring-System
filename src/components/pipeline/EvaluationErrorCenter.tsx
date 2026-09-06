import React from 'react';
import { AlertOctagon, RotateCw, CheckCircle2, XCircle } from 'lucide-react';

interface EvaluationErrorCenterProps {
  evaluationId?: string;
  stageName?: string;
  errorMessage?: string;
  affectedModules?: string[];
  unaffectedModules?: string[];
  onRetry: () => void;
  onDismiss?: () => void;
}

export const EvaluationErrorCenter: React.FC<EvaluationErrorCenterProps> = ({
  evaluationId: _evaluationId,
  stageName = 'RESEARCHING',
  errorMessage = 'Primary research provider temporarily unavailable.',
  affectedModules = ['External Research Benchmarks', 'Academic Prior Art Ingestion'],
  unaffectedModules = ['Document Intelligence', 'Project DNA', 'Technical Architecture', 'Deterministic Rubric'],
  onRetry,
  onDismiss
}) => {
  return (
    <div className="w-full my-4 p-5 rounded-2xl bg-rose-950/20 border border-rose-800/40 backdrop-blur-md shadow-xl text-slate-200 animate-in fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Evaluation Error Center</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700/50">
                Stage: {stageName}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700/40">
                Graceful Degradation Active
              </span>
            </div>
            <p className="text-xs text-rose-200/90 mt-1 font-medium">
              {errorMessage}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white text-xs p-1"
          >
            ✕
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-rose-900/30">
        {/* Affected */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-rose-900/40">
          <div className="text-[11px] font-semibold text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
            <XCircle className="w-3.5 h-3.5" /> What Is Affected
          </div>
          <ul className="mt-1.5 space-y-1">
            {affectedModules.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Unaffected */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-emerald-900/40">
          <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5" /> Unaffected Modules (Preserved)
          </div>
          <ul className="mt-1.5 space-y-1">
            {unaffectedModules.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-4 pt-3 border-t border-rose-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-400">
          Safe checkpoint preserved. You can resume without rerunning unaffected stages.
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-950/40 transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Resume from Last Safe Checkpoint
          </button>
        </div>
      </div>
    </div>
  );
};
