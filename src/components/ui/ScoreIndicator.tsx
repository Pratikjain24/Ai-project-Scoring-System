import React from 'react';
import { ShieldCheck, FileSearch } from 'lucide-react';

export interface ScoreIndicatorProps {
  score: number;
  maxScore?: number;
  confidence?: number;
  evidenceCount?: number;
  status?: string;
  size?: 'sm' | 'md' | 'lg';
  showBar?: boolean;
  className?: string;
}

export const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({
  score,
  maxScore = 100,
  confidence,
  evidenceCount,
  status,
  size = 'md',
  showBar = true,
  className = ''
}) => {
  const getScoreColor = (val: number) => {
    if (val >= 90) return { text: 'text-emerald-400', bar: 'bg-emerald-400', badge: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' };
    if (val >= 80) return { text: 'text-cyan-400', bar: 'bg-cyan-400', badge: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300' };
    if (val >= 70) return { text: 'text-blue-400', bar: 'bg-blue-400', badge: 'bg-blue-950/60 border-blue-500/40 text-blue-300' };
    if (val >= 50) return { text: 'text-amber-400', bar: 'bg-amber-400', badge: 'bg-amber-950/60 border-amber-500/40 text-amber-300' };
    return { text: 'text-rose-400', bar: 'bg-rose-400', badge: 'bg-rose-950/60 border-rose-500/40 text-rose-300' };
  };

  const colors = getScoreColor(score);
  const pct = Math.min(Math.max((score / maxScore) * 100, 0), 100);

  return (
    <div className={`space-y-2 font-mono ${className}`}>
      {/* Top Row: Score + Status Pill */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className={`font-extrabold tracking-tight ${colors.text} ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-base'}`}>
            {score}
          </span>
          <span className="text-[10px] text-slate-500">/{maxScore}</span>
        </div>

        {status && (
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${colors.badge}`}>
            {status}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {showBar && (
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${colors.bar} transition-all duration-700 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Sub-row: Confidence + Evidence */}
      {(confidence !== undefined || evidenceCount !== undefined) && (
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          {confidence !== undefined && (
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{confidence}% Confidence</span>
            </span>
          )}
          {evidenceCount !== undefined && (
            <span className="flex items-center gap-1 text-slate-400">
              <FileSearch className="w-3 h-3 text-cyan-400" />
              <span>{evidenceCount} Proofs</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
