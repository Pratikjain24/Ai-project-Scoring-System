import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Info 
} from 'lucide-react';
import type { MasterCategoryScore } from '../../types/aiJuryScoring';

interface CategoryBreakdownPanelProps {
  categoryScores: MasterCategoryScore[];
  onSelectEvidence?: (evidenceId: string) => void;
}

export const CategoryBreakdownPanel: React.FC<CategoryBreakdownPanelProps> = ({
  categoryScores,
  onSelectEvidence,
}) => {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const totalWeighted = categoryScores.reduce((sum, c) => sum + c.weightedScore, 0);

  const toggleExpand = (catKey: string) => {
    setExpandedCat(prev => (prev === catKey ? null : catKey));
  };

  return (
    <div className="space-y-6">
      {/* Header with summary math */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Deterministic Formula
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
              sum(rawScore × weight / 100)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            8-Category Transparent Score Breakdown
          </h2>
          <p className="text-xs text-slate-400">
            Every category score is computed from corroborated multi-modal artifacts with full internal precision.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Sum of Weighted Contributions</span>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-2xl font-black font-mono text-emerald-400">
                {totalWeighted.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-500">→ {totalWeighted.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8-Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryScores.map((cat) => {
          const isExpanded = expandedCat === cat.categoryKey;
          const isUnassessed = cat.status === 'NOT_ASSESSED';

          return (
            <div
              key={cat.id || cat.categoryKey}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'bg-slate-900/90 border-cyan-500/40 shadow-xl'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              } p-5 flex flex-col justify-between`}
            >
              <div>
                {/* Category Top Bar */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-slate-300">
                        {cat.categoryLabel}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        Weight: {cat.weight}%
                      </span>
                      {cat.status === 'ASSESSED' && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                          ASSESSED
                        </span>
                      )}
                      {cat.status === 'NOT_ASSESSED' && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30">
                          NOT ASSESSED
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-baseline gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">Raw Score</span>
                        <span className="text-2xl font-black font-mono text-white">
                          {isUnassessed ? 'N/A' : cat.rawScore}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">/100</span>
                      </div>
                      <span className="text-slate-600 font-mono text-lg">×</span>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">Weight</span>
                        <span className="text-lg font-mono font-bold text-cyan-300">{cat.weight}%</span>
                      </div>
                      <span className="text-slate-600 font-mono text-lg">=</span>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">Weighted Contribution</span>
                        <span className="text-2xl font-black font-mono text-emerald-400">
                          {isUnassessed ? '0.00' : cat.weightedScore.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence Metrics & Coverage */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Confidence</span>
                    <span className="font-bold text-cyan-400">{cat.confidence}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Evidence Items</span>
                    <span className="font-bold text-slate-200">{cat.evidenceCount} artifacts</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Support Coverage</span>
                    <span className="font-bold text-purple-400">{cat.evidenceCoverage}%</span>
                  </div>
                </div>

                {/* "Why this score?" explanation */}
                <div className="mt-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-bold text-cyan-400 mb-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Why This Score?</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {isUnassessed ? 'No reliable assessment available.' : cat.whyThisScore}
                  </p>
                </div>

                {/* Expanded Details: Strengths, Weaknesses, Evidence IDs */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 animate-fadeIn">
                    {/* Strengths */}
                    {cat.strengths && cat.strengths.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Validated Strengths
                        </span>
                        <ul className="space-y-1">
                          {cat.strengths.map((str, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {cat.weaknesses && cat.weaknesses.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Identified Constraints
                        </span>
                        <ul className="space-y-1">
                          {cat.weaknesses.map((weak, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                              <span>{weak}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Linked Evidence IDs */}
                    {cat.evidenceIds && cat.evidenceIds.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                        <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-cyan-400" />
                          Linked Corroborating Evidence
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.evidenceIds.map((eid, i) => (
                            <button
                              key={i}
                              onClick={() => onSelectEvidence && onSelectEvidence(eid)}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/60 transition-colors"
                            >
                              {eid}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Expand Toggle Button */}
              <button
                onClick={() => toggleExpand(cat.categoryKey)}
                className="mt-4 pt-2 border-t border-slate-800/60 w-full flex items-center justify-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors"
              >
                <span>{isExpanded ? 'Collapse Details' : 'Expand Assessment Facts & Evidence'}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
