import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Search
} from 'lucide-react';
import type { PresentationDemoReport } from '../../types/presentationDemo';

interface EvaluationSynthesisCardProps {
  report: PresentationDemoReport;
}

export const EvaluationSynthesisCard: React.FC<EvaluationSynthesisCardProps> = ({ report }) => {
  return (
    <div className="space-y-8">
      {/* 1. Strengths & Weaknesses Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-emerald-500/30 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h4 className="text-base font-bold font-display text-white">
              Observed Strengths & High-Conviction Moments
            </h4>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300">
            {report.strengths.map((st, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{st}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-amber-500/30 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h4 className="text-base font-bold font-display text-white">
              Observed Weaknesses & Contested Ground
            </h4>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300">
            {report.weaknesses.map((wk, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{wk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 2. Actionable Improvement Suggestions (with Evidence Derivation) */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Lightbulb className="w-5 h-5 text-cyan-400" />
            <div>
              <h4 className="text-base font-bold font-display text-white">
                Targeted Improvement Suggestions & Coaching
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Every suggestion is linked directly to empirical timestamps and logged evidence
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {report.improvementSuggestions.map((imp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    imp.priority === 'P0' 
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      : imp.priority === 'P1'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                      : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {imp.priority} Priority
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    [{imp.category}]
                  </span>
                </div>
              </div>

              <p className="text-sm font-semibold text-white leading-snug">
                {imp.recommendation}
              </p>

              {/* Evidence derivation box */}
              <div className="pt-2 border-t border-white/5 flex items-start gap-2 text-[11px] font-mono text-cyan-300 bg-cyan-950/20 p-2.5 rounded-xl">
                <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Derived from Observed Evidence:</strong> {imp.evidenceDerivedFrom}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
