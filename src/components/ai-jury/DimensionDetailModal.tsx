import React from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import type { ScoringDimension } from '../../types/aiJuryScoring';

interface DimensionDetailModalProps {
  dimension: ScoringDimension | null;
  onClose: () => void;
}

export const DimensionDetailModal: React.FC<DimensionDetailModalProps> = ({
  dimension,
  onClose
}) => {
  if (!dimension) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#090D17] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 uppercase tracking-widest font-bold">
                Traceable Evidence Dossier
              </span>
              <span className="text-xs font-mono text-slate-400">
                Dimension: {dimension.shortName}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {dimension.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Dimension Score</span>
            <span className="text-2xl font-extrabold text-cyan-400 font-mono">{dimension.score}</span>
            <span className="text-[10px] text-slate-500 font-mono"> / 100</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Assigned Weight</span>
            <span className="text-2xl font-extrabold text-white font-mono">{dimension.weight}%</span>
            <span className="text-[10px] text-slate-500 font-mono"> of total</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Empirical Confidence</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{dimension.confidence}%</span>
            <span className="text-[10px] text-slate-500 font-mono"> high integrity</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Verified Proofs</span>
            <span className="text-2xl font-extrabold text-cyan-300 font-mono">{dimension.evidenceCount}</span>
            <span className="text-[10px] text-slate-500 font-mono"> artefacts</span>
          </div>
        </div>

        {/* Full Explanation */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
          <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>Consensus Derivation Rationale</span>
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            {dimension.explanation}
          </p>
        </div>

        {/* Subdimensions Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Sub-Dimension Breakdown</span>
          </h4>
          <div className="space-y-2.5">
            {dimension.subDimensions.map((sub, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{sub.name}</span>
                  <span className="font-mono font-bold text-cyan-400">{sub.score} / 100</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${sub.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  {sub.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Supporting Evidence References */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Underlying Observed Evidence References ({dimension.evidenceReferences.length})</span>
          </h4>
          <div className="space-y-2">
            {dimension.evidenceReferences.map((ref) => (
              <div
                key={ref.id}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400 text-[11px]">{ref.id}</span>
                    <span className="font-bold text-white">{ref.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                      {ref.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    Reliability: {ref.reliabilityScore}%
                  </span>
                </div>
                <p className="text-slate-300 font-sans text-xs">
                  {ref.summary}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono text-slate-400">
                  <span>Source: {ref.source}</span>
                  <span className="text-cyan-300 font-semibold">{ref.timestampOrRef}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Juror Specific Critique */}
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Lead Juror Dimension Assessment</span>
          </div>
          <p className="text-xs text-slate-200 font-sans italic leading-relaxed">
            "{dimension.jurorCritique}"
          </p>
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-mono font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
