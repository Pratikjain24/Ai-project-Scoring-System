import React, { useState } from 'react';
import { Card } from './Card';
import { ChevronDown, ChevronUp, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  weight?: string;
  confidence: number;
  evidenceCount: number;
  explanation?: string;
  strengths?: string[];
  weaknesses?: string[];
  className?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  title,
  score,
  maxScore = 100,
  weight,
  confidence,
  evidenceCount,
  explanation,
  strengths = [],
  weaknesses = [],
  className = '',
}) => {
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (val: number) => {
    if (val >= 85) return 'text-emerald-400';
    if (val >= 70) return 'text-cyan-400';
    if (val >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getProgressColor = (val: number): 'emerald' | 'cyan' | 'amber' | 'rose' => {
    if (val >= 85) return 'emerald';
    if (val >= 70) return 'cyan';
    if (val >= 50) return 'amber';
    return 'rose';
  };

  return (
    <Card className={`p-4 sm:p-5 transition-all duration-200 border-slate-800/80 hover:border-slate-700/80 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm sm:text-base text-slate-100 dark:text-slate-100 light:text-slate-900 truncate">
              {title}
            </h4>
            {weight && (
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Weight: {weight}
              </span>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Confidence: <strong className="text-slate-200 dark:text-slate-200 light:text-slate-800 font-mono">{confidence}%</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span><strong className="text-slate-200 dark:text-slate-200 light:text-slate-800 font-mono">{evidenceCount}</strong> evidence items</span>
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className={`text-2xl font-bold font-mono ${getScoreColor(score)}`}>
            {score.toFixed(1)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono uppercase">/ {maxScore}</span>
        </div>
      </div>

      <div className="mt-3">
        <ProgressBar value={score} max={maxScore} variant={getProgressColor(score)} size="sm" />
      </div>

      {(explanation || strengths.length > 0 || weaknesses.length > 0) && (
        <div className="mt-3 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium py-1"
          >
            <span>{expanded ? 'Hide scoring breakdown' : 'Why this score?'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="mt-2 text-xs text-slate-300 space-y-2.5 pt-1 animate-fadeIn">
              {explanation && (
                <p className="leading-relaxed text-slate-300 dark:text-slate-300 light:text-slate-700 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 p-2.5 rounded border border-slate-800/60 light:border-slate-300">
                  {explanation}
                </p>
              )}

              {strengths.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3 h-3" /> Key Strengths
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    {strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>
              )}

              {weaknesses.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 mb-1">
                    <AlertCircle className="w-3 h-3" /> Detected Weaknesses / Gaps
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    {weaknesses.map((weak, i) => (
                      <li key={i}>{weak}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
