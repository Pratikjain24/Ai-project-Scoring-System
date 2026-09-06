import React from 'react';
import { 
  Star, 
  Target, 
  Sparkles 
} from 'lucide-react';
import type { ExceptionalityAnalysis } from '../../types/aiJuryScoring';

interface ExceptionalityPanelProps {
  currentScore: number;
  futureScore: number;
  exceptionalityAnalysis: ExceptionalityAnalysis;
}

export const ExceptionalityPanel: React.FC<ExceptionalityPanelProps> = ({
  currentScore,
  futureScore,
  exceptionalityAnalysis,
}) => {
  return (
    <div className="space-y-6">
      {/* Header comparing Current vs Future */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Capability Separation
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Current Demonstrated Score vs Future Potential Ceiling
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              The jury explicitly distinguishes between what the team has proven today in bench execution versus the long-term architectural upside of the solution.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Current */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Current Score
              </span>
              <span className="text-3xl font-black font-mono text-cyan-400">
                {currentScore}
              </span>
              <span className="text-[10px] font-mono text-slate-500 block">Demonstrated Today</span>
            </div>

            <span className="text-slate-600 font-mono text-xl">→</span>

            {/* Future */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/40 text-center">
              <span className="text-[10px] uppercase font-mono text-emerald-400 block mb-1">
                Future Potential
              </span>
              <span className="text-3xl font-black font-mono text-emerald-300">
                {futureScore}
              </span>
              <span className="text-[10px] font-mono text-emerald-400/70 block">Architectural Ceiling</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exceptionality Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: What separates from average */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono uppercase text-slate-100">
                What Separates This From Average Projects?
              </h3>
              <p className="text-[11px] text-slate-400">Core architectural differentiators</p>
            </div>
          </div>

          <div className="space-y-3">
            {exceptionalityAnalysis.separatorsFromAverage.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Roadmap to Exceptional */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono uppercase text-slate-100">
                How To Move From Strong To Exceptional (Tier 1)?
              </h3>
              <p className="text-[11px] text-slate-400">Evidence-based trajectory to 90+ consensus</p>
            </div>
          </div>

          <div className="space-y-3">
            {exceptionalityAnalysis.roadmapToTier1.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
