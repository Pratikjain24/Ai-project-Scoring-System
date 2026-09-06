import React from 'react';
import {
  Sparkles,
  GitCompare,
  Lightbulb,
} from 'lucide-react';
import type { UniqueContribution, ComparisonTableRow } from '../../types/originalityIntelligence';

interface DifferencesAndContributionsPanelProps {
  contributions: UniqueContribution[];
  comparisonRows: ComparisonTableRow[];
}

export const DifferencesAndContributionsPanel: React.FC<DifferencesAndContributionsPanelProps> = ({
  contributions,
  comparisonRows,
}) => {
  const getImportanceBadge = (imp: string) => {
    switch (imp) {
      case 'CRITICAL':
        return 'text-purple-300 bg-purple-950/60 border-purple-600/50';
      case 'HIGH':
        return 'text-emerald-300 bg-emerald-950/60 border-emerald-600/50';
      case 'MEDIUM':
        return 'text-cyan-300 bg-cyan-950/60 border-cyan-600/50';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  // Collect top similarities from highest similarity candidate
  const topCandidate = [...comparisonRows].sort((a, b) => b.overallSimilarity - a.overallSimilarity)[0];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
          <span>Difference Engine & Unique Contribution Analysis</span>
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Mandatory contrast engine balancing discovered structural similarities against proven innovations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Strongest Identified Similarities */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-5 space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider">
              <GitCompare className="w-4 h-4" />
              <span>Strongest Similarity Areas</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700/40">
              Correlated Reference: {topCandidate?.title || 'Public Codebases'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="font-semibold text-white font-mono flex items-center justify-between">
                <span>Core Computer Vision Pipeline (YOLOv8 + OpenCV)</span>
                <span className="text-amber-400 font-mono text-[11px]">81% Structural</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Camera frame ingestion feeding into sequential YOLO inference matches standard design patterns in open-source road inspection tooling.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="font-semibold text-white font-mono flex items-center justify-between">
                <span>Civic Road Damage Problem Domain</span>
                <span className="text-amber-400 font-mono text-[11px]">85% Problem</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Targeting automated municipal roadway maintenance, reactive repair prevention, and public works department workflow integration.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
              <div className="font-semibold text-white font-mono flex items-center justify-between">
                <span>Geospatial Incident Map Visualization</span>
                <span className="text-amber-400 font-mono text-[11px]">72% Feature</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Interactive dashboard map with clustered marker pins for pothole occurrences is widespread across municipal inspection platforms.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Strongest Unique Contributions */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-5 space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>Verified Unique Contributions</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/40">
              {contributions.length} Novel Innovations Verified
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {contributions.map((uc) => (
              <div
                key={uc.id}
                className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-white font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{uc.contributionType.replace(/_/g, ' ')}</span>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${getImportanceBadge(uc.importance)}`}>
                    {uc.importance}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {uc.description}
                </p>
                {uc.evidenceIds.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1 text-[9px] font-mono text-slate-500 flex-wrap">
                    <span>Evidence:</span>
                    {uc.evidenceIds.map((eid, idx) => (
                      <span key={idx} className="text-cyan-400 underline">
                        {eid}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
