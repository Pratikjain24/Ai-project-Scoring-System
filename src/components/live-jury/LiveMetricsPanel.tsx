import React from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles
} from 'lucide-react';
import { INITIAL_LIVE_METRICS } from '../../data/liveJuryData';

export const LiveMetricsPanel: React.FC = () => {
  return (
    <div className="rounded-3xl bg-[#090D16] border border-white/10 p-5 shadow-2xl flex flex-col justify-between space-y-4">
      {/* Header with Demo Data badge */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white">
            Live AI Telemetry Metrics
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
          DEMO DATA
        </span>
      </div>

      {/* Metrics List */}
      <div className="space-y-3">
        {INITIAL_LIVE_METRICS.map((metric) => (
          <div
            key={metric.id}
            className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition-all text-xs font-mono space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-sans font-medium">{metric.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">
                  {metric.value}{metric.unit || '%'}
                </span>
                {metric.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                {metric.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                {metric.trend === 'stable' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
              </div>
            </div>

            {/* Subtle Progress Bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  metric.id === 'confidence' || metric.id === 'claim_verification'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : metric.id === 'speech_pace'
                    ? 'bg-gradient-to-r from-violet-500 to-cyan-400'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                }`}
                style={{
                  width: `${metric.id === 'speech_pace' ? Math.min(100, (metric.value / 180) * 100) : metric.value}%`,
                }}
              />
            </div>

            <p className="text-[10px] text-slate-400 font-sans">
              {metric.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Summary Note */}
      <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] font-mono text-cyan-300 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>Aggregate Session Score: 90.8 / 100 (Tier 1 Run)</span>
      </div>
    </div>
  );
};
