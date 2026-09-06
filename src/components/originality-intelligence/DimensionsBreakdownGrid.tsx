import React, { useState } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  GitFork,
  Layout,
  FileCode,
  Tag,
  Check,
  X,
} from 'lucide-react';
import type { DimensionAnalysis, DimensionWeightConfig } from '../../types/originalityIntelligence';

interface DimensionsBreakdownGridProps {
  dimensions: DimensionAnalysis[];
  weights: DimensionWeightConfig;
}

export const DimensionsBreakdownGrid: React.FC<DimensionsBreakdownGridProps> = ({
  dimensions,
  weights,
}) => {
  const [expandedDim, setExpandedDim] = useState<string | null>(null);

  const getDimensionIcon = (dim: string) => {
    switch (dim) {
      case 'PROBLEM':
        return <Layers className="w-4 h-4 text-rose-400" />;
      case 'SOLUTION':
        return <GitFork className="w-4 h-4 text-cyan-400" />;
      case 'FEATURE':
        return <Check className="w-4 h-4 text-emerald-400" />;
      case 'TECHNOLOGY':
        return <Cpu className="w-4 h-4 text-indigo-400" />;
      case 'ARCHITECTURE':
        return <GitFork className="w-4 h-4 text-purple-400" />;
      case 'WORKFLOW':
        return <Layers className="w-4 h-4 text-amber-400" />;
      case 'UI_UX':
        return <Layout className="w-4 h-4 text-pink-400" />;
      case 'TEXTUAL':
        return <FileCode className="w-4 h-4 text-blue-400" />;
      case 'IMPLEMENTATION':
        return <FileCode className="w-4 h-4 text-teal-400" />;
      case 'NAMING':
        return <Tag className="w-4 h-4 text-slate-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const getLevelBadge = (score: number) => {
    if (score >= 70) {
      return { text: 'HIGH', color: 'text-rose-400 bg-rose-950/60 border-rose-700/50' };
    }
    if (score >= 40) {
      return { text: 'MODERATE', color: 'text-amber-400 bg-amber-950/60 border-amber-700/50' };
    }
    return { text: 'LOW', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <span>10-Dimensional Similarity Breakdown</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Independent analyzers evaluating distinct layers of potential project derivation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dimensions.map((dim) => {
          const weight = (weights as any)[dim.dimension] ?? 0.1;
          const level = getLevelBadge(dim.score);
          const isExpanded = expandedDim === dim.id;

          return (
            <div
              key={dim.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-slate-900/90 border-cyan-500/40 shadow-lg shadow-cyan-950/30'
                  : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedDim(isExpanded ? null : dim.id)}
                className="p-4 cursor-pointer flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                    {getDimensionIcon(dim.dimension)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white font-mono">
                        {dim.dimension.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                        Weight: {Math.round(weight * 100)}%
                      </span>
                      {dim.dimension === 'TECHNOLOGY' && dim.score <= 35 && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-700/40">
                          Common Stack Guardrail Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-sans">
                      {dim.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="text-xl font-mono font-bold text-white">{dim.score}</span>
                      <span className="text-[10px] font-mono text-slate-500">/100</span>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${level.color}`}>
                      {level.text}
                    </span>
                  </div>
                  <button className="text-slate-400 hover:text-white p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1 w-full bg-white/5">
                <div
                  className={`h-full transition-all duration-500 ${
                    dim.score >= 70
                      ? 'bg-rose-500'
                      : dim.score >= 40
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>

              {/* Expanded Detail Drawer */}
              {isExpanded && (
                <div className="p-4 bg-black/40 border-t border-white/10 space-y-4 text-xs">
                  <div className="text-slate-300 leading-relaxed font-sans">
                    <span className="font-semibold text-white">Analyzer Assessment: </span>
                    {dim.explanation}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Matched Elements */}
                    <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/30 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-rose-400 font-mono font-bold text-[11px]">
                        <Check className="w-3.5 h-3.5" />
                        <span>Matched Components ({dim.matchedElements.length})</span>
                      </div>
                      {dim.matchedElements.length > 0 ? (
                        <ul className="space-y-1 text-slate-300 font-mono text-[10px]">
                          {dim.matchedElements.map((m, idx) => (
                            <li key={idx} className="truncate">&bull; {m}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500 font-mono text-[10px]">No direct overlaps identified.</p>
                      )}
                    </div>

                    {/* Different Elements */}
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-[11px]">
                        <X className="w-3.5 h-3.5" />
                        <span>Project Divergences ({dim.differentElements.length})</span>
                      </div>
                      {dim.differentElements.length > 0 ? (
                        <ul className="space-y-1 text-slate-300 font-mono text-[10px]">
                          {dim.differentElements.map((d, idx) => (
                            <li key={idx} className="truncate">&bull; {d}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500 font-mono text-[10px]">No unique divergences detected.</p>
                      )}
                    </div>
                  </div>

                  {/* Supporting Evidence IDs */}
                  {dim.evidenceIds && dim.evidenceIds.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-400">Supporting Evidence:</span>
                      {dim.evidenceIds.map((eid, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-cyan-300"
                        >
                          {eid}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
