import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Clock, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';
import type { ClaimDemoMatch, DemoSupportStatus } from '../../types/multimodal';

interface ClaimDemoMatchSectionProps {
  matches: ClaimDemoMatch[];
  onSeekToTimestamp?: (seconds: number) => void;
}

export const ClaimDemoMatchSection: React.FC<ClaimDemoMatchSectionProps> = ({
  matches,
  onSeekToTimestamp,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSupportBadge = (status: DemoSupportStatus) => {
    switch (status) {
      case 'SUPPORTED':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          label: 'DEMO SUPPORTED',
        };
      case 'PARTIALLY_SUPPORTED':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          label: 'PARTIALLY DEMONSTRATED',
        };
      case 'NOT_DEMONSTRATED':
        return {
          icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          label: 'NOT DEMONSTRATED',
        };
      case 'UNCERTAIN':
      default:
        return {
          icon: <HelpCircle className="w-3.5 h-3.5 text-slate-400" />,
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          label: 'DEMO UNCERTAIN',
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-mono text-cyan-300 uppercase tracking-wider">
                Claim ↔ Video Demonstration Evidence Correlator
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              Correlates project document and spoken claims against empirical video and hardware demonstrations.
              <strong className="text-cyan-200"> Note:</strong> This evaluates demonstration evidence support, NOT independent scientific verification.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 font-semibold shrink-0">
            {matches.length} Claims Audited
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((m) => {
          const badge = getSupportBadge(m.demoSupport);
          return (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono font-bold ${badge.bg}`}>
                    {badge.icon}
                    {badge.label}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{Math.round(m.confidence * 100)}% Confidence</span>
                  </div>
                </div>

                {/* Project Claim */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
                    Project Claim
                  </span>
                  <p className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    "{m.claimText || 'Real-time telemetry and edge inference validation claim.'}"
                  </p>
                </div>

                {/* Video Demonstration Observation */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-slate-400 uppercase text-[10px] tracking-wider">Observed Demonstration</span>
                    {m.timestamp > 0 && (
                      <button
                        onClick={() => onSeekToTimestamp?.(m.timestamp)}
                        className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                        title="Jump to video timestamp"
                      >
                        <Clock className="w-3 h-3" />
                        <span>@{formatTime(m.timestamp)}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {m.observationNotes}
                  </p>
                </div>
              </div>

              {/* Footer Timestamp Seek */}
              {m.timestamp > 0 && (
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Video Sync Marker: {formatTime(m.timestamp)}
                  </span>
                  <button
                    onClick={() => onSeekToTimestamp?.(m.timestamp)}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                  >
                    <span>Inspect exact video frame</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
