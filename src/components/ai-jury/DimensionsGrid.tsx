import React from 'react';
import { 
  CheckCircle, 
  HelpCircle, 
  FileSearch, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  TrendingDown
} from 'lucide-react';
import type { ScoringDimension } from '../../types/aiJuryScoring';

interface DimensionsGridProps {
  dimensions: ScoringDimension[];
  onOpenDimensionDetail: (dimension: ScoringDimension) => void;
  selectedDimensionId?: string | null;
}

export const DimensionsGrid: React.FC<DimensionsGridProps> = ({
  dimensions,
  onOpenDimensionDetail,
  selectedDimensionId
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return { text: 'text-emerald-400', bar: 'bg-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-500/30' };
    if (score >= 80) return { text: 'text-cyan-400', bar: 'bg-cyan-400', bg: 'bg-cyan-950/40', border: 'border-cyan-500/30' };
    if (score >= 70) return { text: 'text-blue-400', bar: 'bg-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-500/30' };
    if (score >= 50) return { text: 'text-amber-400', bar: 'bg-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-500/30' };
    return { text: 'text-rose-400', bar: 'bg-rose-400', bg: 'bg-rose-950/40', border: 'border-rose-500/30' };
  };

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>8 Evaluated Dimensions</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              100% Traceable
            </span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Every category score is paired with assigned weight, empirical confidence, evidence references, and explanatory derivation.
          </p>
        </div>
      </div>

      {/* Grid of 8 Dimension Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {dimensions.map((dim) => {
          const scoreColors = getScoreColor(dim.score);
          const isSelected = selectedDimensionId === dim.id;

          return (
            <div
              key={dim.id}
              className={`rounded-2xl bg-[#0B0F19]/90 border transition-all duration-300 p-5 space-y-4 relative overflow-hidden flex flex-col justify-between ${
                isSelected 
                  ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50' 
                  : 'border-white/10 hover:border-white/20 hover:bg-[#0E1422]'
              }`}
            >
              {/* Top Row: Category Title + Score Badge + Weight + Confidence */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold block">
                      Dimension {dim.shortName}
                    </span>
                    <h4 className="text-base font-bold text-white leading-tight">
                      {dim.name}
                    </h4>
                  </div>

                  {/* Score Pill */}
                  <div className={`px-3 py-1 rounded-xl ${scoreColors.bg} ${scoreColors.border} border text-right`}>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl font-extrabold font-mono ${scoreColors.text}`}>
                        {dim.score}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">/100</span>
                    </div>
                  </div>
                </div>

                {/* Badges: Weight, Confidence, Evidence Count */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                    Weight: <strong className="text-cyan-300">{dim.weight}%</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Confidence: <strong className="text-emerald-300">{dim.confidence}%</strong>
                  </span>
                  <button
                    onClick={() => onOpenDimensionDetail(dim)}
                    className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition-colors flex items-center gap-1 font-semibold"
                    title="Click to view all supporting evidence items"
                  >
                    <FileSearch className="w-3 h-3 text-cyan-400" />
                    <span>{dim.evidenceCount} Evidence Proofs</span>
                  </button>
                </div>
              </div>

              {/* Score Bar with Sub-dimensions */}
              <div className="space-y-2 pt-1">
                {/* Main Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${scoreColors.bar} transition-all duration-700`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>

                {/* Subdimension breakdown preview */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {dim.subDimensions.map((sub, idx) => (
                    <div key={idx} className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] font-mono">
                      <div className="flex items-center justify-between text-slate-400 truncate">
                        <span className="truncate" title={sub.name}>{sub.name.split(' ')[0]}</span>
                        <span className="text-white font-bold">{sub.score}</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-800 mt-1 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400/80 rounded-full"
                          style={{ width: `${sub.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why This Score? Derivation Explanation */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-300">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Why This Score? (Derivation)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {dim.explanation}
                </p>
              </div>

              {/* Primary Strength & Primary Risk */}
              <div className="space-y-1.5 text-[11px] font-sans">
                <div className="flex items-start gap-1.5 text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-300 font-mono">Strength: </strong>
                    <span>{dim.primaryStrength}</span>
                  </div>
                </div>
                <div className="flex items-start gap-1.5 text-slate-400">
                  <TrendingDown className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 font-mono">Key Risk: </strong>
                    <span>{dim.primaryRisk}</span>
                  </div>
                </div>
              </div>

              {/* Expand Evidence Drawer Trigger */}
              <button
                onClick={() => onOpenDimensionDetail(dim)}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-cyan-950/50 border border-white/10 hover:border-cyan-500/40 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-between group mt-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Inspect Juror Deliberation & Evidence Trace</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-cyan-400 transition-all" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
