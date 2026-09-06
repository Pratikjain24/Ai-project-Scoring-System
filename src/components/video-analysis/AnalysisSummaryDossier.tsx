import React, { useEffect } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Hash,
  Dna
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AnalysisSummaryDossierProps {
  onViewFullDossier: () => void;
  onViewProjectDNA?: () => void;
}

export const AnalysisSummaryDossier: React.FC<AnalysisSummaryDossierProps> = ({
  onViewFullDossier,
  onViewProjectDNA,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Fallback
    }
  }, []);

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#0E1526] to-[#080C14] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <Sparkles className="w-4 h-4" />
            <span>STAGE 11 COMPLETED // INSTITUTIONAL VERDICT RATIFIED</span>
          </div>
          <h3 className="text-2xl font-bold font-display text-white">
            Evaluation Report & Chain of Evidence Ready
          </h3>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            The multi-agent AI jury has synthesized code, PCB schematics, presentation video, and prior art into an auditable verdict.
          </p>
        </div>

        {/* Score Pill */}
        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center sm:text-right shrink-0">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
            Final Composite Score
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-gradient-emerald">
            92.4 <span className="text-base text-slate-400 font-normal">/ 100</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">
            TIER 1 HIGH DISTINCTION
          </span>
        </div>
      </div>

      {/* Summary Highlight Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
          <span className="text-slate-400 text-[10px]">Technical Rigor</span>
          <p className="text-white font-bold text-sm">96 / 100</p>
          <p className="text-[10px] text-emerald-400">41.8 FPS confirmed in micro-VM</p>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
          <span className="text-slate-400 text-[10px]">Originality & Patents</span>
          <p className="text-white font-bold text-sm">89.2% Novelty</p>
          <p className="text-[10px] text-cyan-400">0 critical patent infringements</p>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
          <span className="text-slate-400 text-[10px]">Presentation Defense</span>
          <p className="text-white font-bold text-sm">93 / 100</p>
          <p className="text-[10px] text-emerald-400">138 WPM optimal pacing</p>
        </div>
      </div>

      {/* Cryptographic Proof Hash */}
      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Evaluation Proof Hash: <span className="text-slate-200">sha256:7f83b16528d1e4c7009a24bb188f9ac4</span></span>
        </div>
        <span className="text-emerald-400 font-semibold">18 Verified Citations Attached</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        {onViewProjectDNA && (
          <button
            type="button"
            onClick={onViewProjectDNA}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 shadow-lg transition-all text-xs font-mono flex items-center justify-center gap-2 group"
          >
            <Dna className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Inspect Project DNA & Source Graph</span>
          </button>
        )}

        <button
          type="button"
          onClick={onViewFullDossier}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/25 transition-all text-xs font-mono flex items-center justify-center gap-2 group"
        >
          <span>Inspect Full Interactive Dossier</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
