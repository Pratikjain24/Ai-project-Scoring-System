import React from 'react';
import {
  Calendar,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import type { CandidateTimelineContext, SimilarityCandidate } from '../../types/originalityIntelligence';

interface TimelineAnalysisViewProps {
  timelineContexts: CandidateTimelineContext[];
  candidates: SimilarityCandidate[];
}

export const TimelineAnalysisView: React.FC<TimelineAnalysisViewProps> = ({
  timelineContexts,
  candidates,
}) => {
  const getCandidate = (id: string) => candidates.find(c => c.id === id);

  const getRelationshipBadge = (rel: string) => {
    switch (rel) {
      case 'PRECEDES_PROJECT':
        return {
          label: 'Precedes Project Baseline',
          color: 'text-amber-400 bg-amber-950/60 border-amber-700/40',
        };
      case 'AFTER_PROJECT':
        return {
          label: 'Postdates Project Baseline',
          color: 'text-cyan-400 bg-cyan-950/60 border-cyan-700/40',
        };
      default:
        return {
          label: 'Chronology Unverified',
          color: 'text-slate-400 bg-slate-800 border-slate-700',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
          <span>Chronological Timeline & Precedence Context</span>
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Temporal ordering of publicly recorded publications versus project baseline
        </p>
      </div>

      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/30 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          <span className="font-semibold text-white">Chronological Fairness Standard: </span>
          Publication preceding project evidence demonstrates prior public existence of an approach.
          However, subsequent publication or lack of documented provenance does not automatically prove causal derivation.
        </p>
      </div>

      <div className="space-y-3">
        {timelineContexts.map((ctx) => {
          const cand = getCandidate(ctx.candidateId);
          const badge = getRelationshipBadge(ctx.relationship);

          return (
            <div
              key={ctx.id}
              className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white font-display">
                      {cand?.title || ctx.candidateId}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    {ctx.notes}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Candidate Date</span>
                  <span className="text-white font-bold">{ctx.candidateDate || 'Unknown'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Project Baseline</span>
                  <span className="text-cyan-400 font-bold">{ctx.projectEvidenceDate || '2026-01-15'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
