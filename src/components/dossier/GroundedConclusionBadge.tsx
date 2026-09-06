import React, { useState } from 'react';
import { ShieldCheck, Target, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { GroundedConclusion } from '../../types/masterDossier';

interface GroundedConclusionBadgeProps {
  conclusions: GroundedConclusion[];
  sectionTitle?: string;
}

export const GroundedConclusionBadge: React.FC<GroundedConclusionBadgeProps> = ({
  conclusions,
  sectionTitle
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!conclusions || conclusions.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer p-2 rounded-xl bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-500/20 transition-all text-xs font-mono select-none"
      >
        <div className="flex items-center gap-2 text-cyan-300">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="font-bold uppercase tracking-wider">
            Empirically Grounded Conclusions ({conclusions.length})
          </span>
          {sectionTitle && (
            <span className="text-slate-400 text-[10px] hidden sm:inline">
              • {sectionTitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <span>{isExpanded ? 'Hide Evidence Provenance' : 'Inspect Evidence Provenance'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Expanded list of conclusions with evidence, confidence, and source */}
      {isExpanded && (
        <div className="space-y-2.5 pt-1">
          {conclusions.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-2 text-xs font-sans shadow-lg"
            >
              <div className="text-slate-200 font-medium leading-relaxed">
                "{item.statement}"
              </div>

              {/* Badges: Evidence, Confidence, Source */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
                <div className="px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-cyan-400" />
                  <span><strong>Evidence:</strong> {item.evidence}</span>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span><strong>Confidence:</strong> {item.confidence}%</span>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-purple-950/70 border border-purple-500/30 text-purple-300 flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3 text-purple-400" />
                  <span><strong>Source:</strong> {item.source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
