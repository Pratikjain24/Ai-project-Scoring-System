import React from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  ExternalLink,
  Zap,
  Target
} from 'lucide-react';
import type { AIJuryScorecard, RiskIndicator } from '../../types/aiJuryScoring';

interface HighlightsAndRisksProps {
  scorecard: AIJuryScorecard;
  onInspectEvidence?: (evidenceTrace: string) => void;
  onSelectDimension?: (dimensionId: string) => void;
}

export const HighlightsAndRisks: React.FC<HighlightsAndRisksProps> = ({
  scorecard,
  onInspectEvidence,
  onSelectDimension
}) => {
  const getSeverityBadge = (severity: RiskIndicator['severity']) => {
    switch (severity) {
      case 'High':
        return {
          bg: 'bg-rose-950/80',
          border: 'border-rose-500/50',
          text: 'text-rose-300',
          icon: 'text-rose-400'
        };
      case 'Medium':
        return {
          bg: 'bg-amber-950/80',
          border: 'border-amber-500/50',
          text: 'text-amber-300',
          icon: 'text-amber-400'
        };
      case 'Low':
        return {
          bg: 'bg-blue-950/80',
          border: 'border-blue-500/50',
          text: 'text-blue-300',
          icon: 'text-blue-400'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 6 cols: Strongest & Weakest Area Cards */}
      <div className="lg:col-span-6 space-y-4">
        {/* Strongest Area Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-[#0B1516] to-[#0B0F19] border border-emerald-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                  Top Performing Dimension
                </span>
                <h4 className="text-base font-bold text-white">
                  {scorecard.strongestArea.name}
                </h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                {scorecard.strongestArea.score}
              </span>
              <span className="text-xs text-slate-400 font-mono block">/100</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
            {scorecard.strongestArea.reason}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20 text-xs font-mono">
            <span className="text-emerald-300">
              Weighted Contribution: +{scorecard.strongestArea.weightedContribution} pts
            </span>
            <button
              onClick={() => onSelectDimension && onSelectDimension(scorecard.strongestArea.dimensionId)}
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
            >
              <span>Inspect Dimension</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Weakest Area Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-[#19140B] to-[#0B0F19] border border-amber-500/30 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                  Key Friction / Weakest Area
                </span>
                <h4 className="text-base font-bold text-white">
                  {scorecard.weakestArea.name}
                </h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-amber-400 font-mono">
                {scorecard.weakestArea.score}
              </span>
              <span className="text-xs text-slate-400 font-mono block">/100</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
            {scorecard.weakestArea.reason}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-amber-500/20 text-xs font-mono">
            <span className="text-amber-300">
              Weighted Contribution: +{scorecard.weakestArea.weightedContribution} pts
            </span>
            <button
              onClick={() => onSelectDimension && onSelectDimension(scorecard.weakestArea.dimensionId)}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <span>Inspect Remediation</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Right 6 cols: Detected Risk Indicators */}
      <div className="lg:col-span-6 flex flex-col justify-between p-5 rounded-2xl bg-[#0B0F19]/90 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Detected Risk Indicators & Mitigations ({scorecard.risks.length})
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Autonomous Fault Telemetry
          </span>
        </div>

        {/* Risk Items List */}
        <div className="space-y-3">
          {scorecard.risks.map((risk) => {
            const badge = getSeverityBadge(risk.severity);

            return (
              <div
                key={risk.id}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${badge.bg} ${badge.border} ${badge.text} border mt-0.5`}>
                      {risk.severity} Risk
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white">
                        {risk.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Impact: {risk.impactArea}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Flags and Evidence Trace */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {risk.detectedFlags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-300 flex items-center gap-1"
                    >
                      <Zap className="w-2.5 h-2.5 text-cyan-400" />
                      {flag}
                    </span>
                  ))}
                </div>

                {/* Mitigation */}
                <div className="pt-2 border-t border-white/5 text-xs text-slate-300 flex items-start justify-between gap-2 font-sans">
                  <div className="text-[11px] leading-relaxed">
                    <strong className="text-cyan-300 font-mono">AI Mitigation: </strong>
                    {risk.suggestedMitigation}
                  </div>
                  {onInspectEvidence && (
                    <button
                      onClick={() => onInspectEvidence(risk.evidenceTrace)}
                      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 shrink-0 flex items-center gap-1"
                      title="Inspect raw log evidence"
                    >
                      <Target className="w-3 h-3" />
                      <span>Log Trace</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
