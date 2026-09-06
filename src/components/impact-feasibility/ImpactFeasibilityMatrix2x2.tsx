import React from 'react';
import { Target, Sparkles, Compass } from 'lucide-react';
import type { ImpactFeasibilityQuadrant } from '../../types/specialistEvaluation';

interface ImpactFeasibilityMatrix2x2Props {
  projectName: string;
  impactScore: number;
  feasibilityScore: number;
  quadrant: ImpactFeasibilityQuadrant;
}

export const ImpactFeasibilityMatrix2x2: React.FC<ImpactFeasibilityMatrix2x2Props> = ({
  projectName,
  impactScore,
  feasibilityScore,
  quadrant,
}) => {
  // Normalize 0-100 score to percentage position inside matrix
  const posX = Math.max(10, Math.min(90, feasibilityScore));
  const posY = Math.max(10, Math.min(90, 100 - impactScore)); // Invert Y so high impact is top

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold font-display text-white">
              Strategic Impact vs Feasibility 2×2 Matrix
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              PORTFOLIO PLACEMENT
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Bivariate positioning mapping real-world social/economic utility against engineering deployability
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-emerald-400">Impact: <strong>{impactScore}/100</strong></span>
          <span>·</span>
          <span className="text-cyan-400">Feasibility: <strong>{feasibilityScore}/100</strong></span>
        </div>
      </div>

      {/* The 2x2 Canvas Container */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-2xl bg-[#07090E]/90 border border-white/10 p-4 overflow-hidden select-none">
        {/* Quadrant Grid Dividers */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 divide-x divide-y divide-white/10 pointer-events-none">
          {/* Top Left: High Impact / Low Feasibility (Moonshots) */}
          <div className="p-3 sm:p-4 flex flex-col justify-between bg-purple-950/10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300/80 font-bold">
              Strategic Moonshots
            </span>
            <span className="text-[10px] font-mono text-slate-500">High Impact · Low Feasibility</span>
          </div>

          {/* Top Right: High Impact / High Feasibility (Prime Sweet Spot) */}
          <div className="p-3 sm:p-4 flex flex-col justify-between bg-emerald-950/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                High-Impact High-Viability (Optimal)
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SWEET SPOT
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">High Impact · High Feasibility</span>
          </div>

          {/* Bottom Left: Low Impact / Low Feasibility */}
          <div className="p-3 sm:p-4 flex flex-col justify-between bg-rose-950/10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Low Priority
            </span>
            <span className="text-[10px] font-mono text-slate-600">Low Impact · Low Feasibility</span>
          </div>

          {/* Bottom Right: Low Impact / High Feasibility */}
          <div className="p-3 sm:p-4 flex flex-col justify-between bg-blue-950/10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-300/80 font-bold">
              Quick Wins & Incremental Utility
            </span>
            <span className="text-[10px] font-mono text-slate-500">Low Impact · High Feasibility</span>
          </div>
        </div>

        {/* Dynamic Project Marker */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 group cursor-pointer"
          style={{ left: `${posX}%`, top: `${posY}%` }}
        >
          <div className="relative flex items-center justify-center">
            {/* Pulsing Aura */}
            <span className="absolute w-8 h-8 rounded-full bg-cyan-400/40 animate-ping" />
            <span className="absolute w-6 h-6 rounded-full bg-cyan-500/30" />
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 border-2 border-white shadow-lg shadow-cyan-500/50 flex items-center justify-center">
              <Target className="w-2.5 h-2.5 text-slate-950" />
            </div>

            {/* Tooltip Tag */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-950/95 border border-cyan-500/50 shadow-2xl text-[11px] font-mono text-cyan-200 pointer-events-none">
              <strong className="text-white">{projectName}</strong> ({impactScore}I / {feasibilityScore}F)
            </div>
          </div>
        </div>

        {/* Future Expansion Opportunity Pin */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 opacity-60 hover:opacity-100 group cursor-pointer"
          style={{ left: `${Math.min(92, posX + 10)}%`, top: `${Math.max(8, posY - 6)}%` }}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-purple-400/60 border border-white/60 flex items-center justify-center" />
            <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-lg bg-slate-950/90 border border-purple-500/40 text-[9px] font-mono text-purple-300">
              Future V2X Expansion Horizon
            </div>
          </div>
        </div>
      </div>

      {/* Footer Classification Label */}
      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
        <span className="text-slate-400">
          Audited Quadrant Classification: <strong className="text-emerald-300">{quadrant.replace(/_/g, ' ')}</strong>
        </span>
        <span className="text-slate-500 text-[11px]">
          Target position: High-Impact High-Viability sweet spot with clear path to pilot procurement.
        </span>
      </div>
    </div>
  );
};
