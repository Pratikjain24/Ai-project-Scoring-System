import React, { useState } from 'react';
import {
  GitFork,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Info,
} from 'lucide-react';
import type { SimilarityGraphEdge, SimilarityCandidate } from '../../types/originalityIntelligence';

interface InteractiveEvidenceGraphProps {
  edges: SimilarityGraphEdge[];
  candidates: SimilarityCandidate[];
}

export const InteractiveEvidenceGraph: React.FC<InteractiveEvidenceGraphProps> = ({
  edges,
  candidates,
}) => {
  const [selectedEdge, setSelectedEdge] = useState<SimilarityGraphEdge | null>(edges[0] || null);

  const getCandidateForEdge = (candidateId?: string) => {
    if (!candidateId) return null;
    return candidates.find(c => c.id === candidateId) || null;
  };

  const activeCandidate = getCandidateForEdge(selectedEdge?.candidateId);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
          <span>Multi-Dimensional Evidence Graph</span>
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Progressive node-link disclosure between project subsystems and public candidate implementations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Node & Edge Network Visualization */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-slate-900/80 p-5 space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-slate-400">
            <span>Graph Relationships ({edges.length})</span>
            <span className="text-[10px]">Click any edge to reveal evidence & contrast</span>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-2">
            {edges.map((edge) => {
              const isSelected = selectedEdge?.id === edge.id;
              const cand = getCandidateForEdge(edge.candidateId);

              return (
                <div
                  key={edge.id}
                  onClick={() => setSelectedEdge(edge)}
                  className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/40'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-cyan-400 shrink-0">
                      <GitFork className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-white">
                          {edge.sourceNode}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="text-xs font-mono font-semibold text-cyan-300">
                          {edge.targetNode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                          {edge.dimension}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {cand?.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center self-end">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        edge.similarityScore >= 75
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                      }`}
                    >
                      {edge.similarityScore}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Interactive Relationship Inspector */}
        <div className="rounded-2xl border border-cyan-500/30 bg-[#0B0F19] p-5 space-y-4 shadow-xl shadow-cyan-950/20">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <Info className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold font-display text-white">Relationship Inspector</h4>
          </div>

          {selectedEdge ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Subsystem Mapping</span>
                <div className="font-mono text-white font-semibold text-xs mt-0.5">
                  {selectedEdge.sourceNode}
                </div>
                <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                  <span>matches</span>
                  <span className="font-bold">{selectedEdge.targetNode}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Reference Candidate
                </span>
                <div className="font-semibold text-white font-display text-sm">
                  {activeCandidate?.title || 'External Reference'}
                </div>
                <p className="text-slate-400 text-[11px] mt-1 font-mono">
                  {activeCandidate?.description}
                </p>
                {activeCandidate?.url && (
                  <a
                    href={activeCandidate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:underline mt-1.5"
                  >
                    <span>Inspect Public Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                  Identified Structural Contrast
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedEdge.differencesSummary || 'Implementation divergence verified.'}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Metric Confidence</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> High Confidence
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              Select an edge to inspect evidence details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
