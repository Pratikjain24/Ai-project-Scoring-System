import React from 'react';
import { 
  Video, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  Terminal, 
  Clock
} from 'lucide-react';
import type { DemoAnalysisData, DemoFeatureItem } from '../../types/presentationDemo';

interface DemoAnalysisSectionProps {
  demo: DemoAnalysisData;
  onInspectFeature: (feature: DemoFeatureItem) => void;
}

export const DemoAnalysisSection: React.FC<DemoAnalysisSectionProps> = ({
  demo,
  onInspectFeature,
}) => {
  const getFeatureBadge = (status: 'verified' | 'partial' | 'failed' | 'unsupported') => {
    switch (status) {
      case 'verified':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          label: 'Successfully Verified',
          icon: CheckCircle2,
        };
      case 'partial':
        return {
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          label: 'Partially Verified',
          icon: CheckCircle2,
        };
      case 'failed':
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          label: 'Failed In Demo',
          icon: XCircle,
        };
      case 'unsupported':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          label: 'Unsupported Claim',
          icon: AlertOctagon,
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Demo Completeness Metric Strip */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                Live Demonstration & Feature Execution Audit
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Systematic verification of all claimed features against live chamber / screen recordings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Demo Score:</span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              {demo.overallScore} / 100
            </span>
          </div>
        </div>

        {/* 4 Feature Tally Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          {/* Completeness */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Demo Completeness
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-display text-white">
                {demo.completenessPercentage}%
              </span>
              <span className="text-slate-500 text-[10px]">demonstrated</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${demo.completenessPercentage}%` }}
              />
            </div>
          </div>

          {/* Successful Features */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">
              Successfully Verified
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-display text-emerald-400">
                {demo.successfulFeaturesCount}
              </span>
              <span className="text-slate-500 text-[10px]">features</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Passed all latency & telemetry checks
            </span>
          </div>

          {/* Failed Features */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2">
            <span className="text-[10px] text-rose-400 uppercase tracking-wider block">
              Failed Demonstrations
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-display text-rose-400">
                {demo.failedFeaturesCount}
              </span>
              <span className="text-slate-500 text-[10px]">glitches</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Contradicted or crashed in demo
            </span>
          </div>

          {/* Unsupported Claims */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-2">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider block">
              Unsupported Claims
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-display text-amber-400">
                {demo.unsupportedClaimsCount}
              </span>
              <span className="text-slate-500 text-[10px]">deferred</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Stated orally but skipped live
            </span>
          </div>
        </div>
      </div>

      {/* 2. Feature Verification Matrix */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold font-display text-white px-2">
          Feature-by-Feature Demonstration Matrix ({demo.features.length} Features Audited)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demo.features.map((feat) => {
            const badge = getFeatureBadge(feat.status);
            const Icon = badge.icon;

            return (
              <div
                key={feat.id}
                onClick={() => onInspectFeature(feat)}
                className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-cyan-500/30 transition-all space-y-3.5 shadow-lg cursor-pointer group"
              >
                {/* Top Row: Name & Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">
                      [{feat.category}]
                    </span>
                    <h5 className="text-sm font-bold text-white mt-0.5">
                      {feat.name}
                    </h5>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold flex items-center gap-1 shrink-0 ${badge.badge}`}>
                    <Icon className="w-3 h-3" />
                    {badge.label}
                  </span>
                </div>

                {/* Claim vs Observed Result */}
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Submitted / Claimed Proposition:
                    </span>
                    <p className="text-slate-300 font-mono text-[11px]">
                      "{feat.claimText}"
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 block">
                      Observed Live Execution Result:
                    </span>
                    <p className="text-slate-200 font-sans text-xs">
                      {feat.observedResult}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Timestamp & Performance */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Timestamp: {feat.timestampStart} - {feat.timestampEnd}</span>
                  </div>

                  {feat.latencyOrPerformance && (
                    <span className="text-cyan-300 text-[11px] font-semibold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                      {feat.latencyOrPerformance}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Observed Errors & Console Exceptions */}
      {demo.observedErrors.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-rose-500/30 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
            <Terminal className="w-4 h-4 text-rose-400" />
            <h4 className="text-sm font-bold font-display text-white">
              Observed Errors & Live Telemetry Exceptions ({demo.observedErrors.length})
            </h4>
          </div>

          <div className="space-y-3">
            {demo.observedErrors.map((err) => (
              <div
                key={err.id}
                className="p-4 rounded-2xl bg-rose-950/15 border border-rose-500/20 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-rose-400 font-bold">[{err.timestamp}]</span>
                    <span className="font-bold text-white">{err.title}</span>
                  </div>

                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950 border border-rose-500/40 text-rose-300 font-bold">
                    {err.severity} severity
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  {err.description}
                </p>

                {/* Raw log snippet */}
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-rose-300 overflow-x-auto">
                  <code>{err.logSnippet}</code>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400">
                  <span>Impact: {err.impactOnDemo}</span>
                  <span className={err.recovered ? 'text-emerald-400' : 'text-rose-400'}>
                    {err.recovered ? '✓ Recovered Autonomously' : '! Persistent Discrepancy'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Second-by-Second Demo Event Timeline */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-bold font-display text-white">
            Second-by-Second Live Demo Execution Timeline
          </h4>
        </div>

        <div className="space-y-3">
          {demo.timeline.map((event) => (
            <div
              key={event.id}
              className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold">[{event.timestamp}]</span>
                  <span className="font-semibold text-white">{event.action}</span>
                  <span className="text-[10px] font-mono text-slate-400">({event.targetComponent})</span>
                </div>
                <p className="text-slate-400 font-mono text-[11px]">
                  System Response: {event.systemResponse}
                </p>
              </div>

              <div className="flex items-center gap-3 font-mono shrink-0">
                {event.latencyMs !== undefined && (
                  <span className="text-[11px] text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                    {event.latencyMs}ms latency
                  </span>
                )}
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded border font-bold ${
                  event.outcome === 'success' 
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                }`}>
                  {event.outcome}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
