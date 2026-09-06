import React from 'react';
import { 
  Volume2, 
  Gauge, 
  Smile, 
  MessageSquareWarning, 
  ListTree, 
  Eye, 
  UserCheck, 
  Sparkles, 
  Clock,
  ShieldCheck,
  Search
} from 'lucide-react';
import type { SpeechMetric } from '../../types/presentationDemo';

interface SpeechMetricCardsProps {
  metrics: SpeechMetric[];
  onInspectEvidence: (metric: SpeechMetric) => void;
}

export const SpeechMetricCards: React.FC<SpeechMetricCardsProps> = ({
  metrics,
  onInspectEvidence,
}) => {
  const getMetricIcon = (key: string) => {
    switch (key) {
      case 'clarity': return Volume2;
      case 'speakingPace': return Gauge;
      case 'confidence': return Smile;
      case 'fillerWords': return MessageSquareWarning;
      case 'explanationStructure': return ListTree;
      case 'eyeContact': return Eye;
      case 'posture': return UserCheck;
      case 'audienceEngagement': return Sparkles;
      case 'timeManagement': return Clock;
      default: return ShieldCheck;
    }
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'Exceptional':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Strong':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Average':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => {
        const Icon = getMetricIcon(metric.key);

        return (
          <div
            key={metric.id}
            className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 transition-all duration-200 flex flex-col justify-between space-y-4 hover:border-white/20 shadow-lg"
          >
            {/* Top Row: Icon & Rating Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {metric.name}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Criterion #{metric.id}
                  </span>
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${getRatingBadge(metric.rating)}`}>
                {metric.rating}
              </span>
            </div>

            {/* Score & Measured Value */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Measured Value
                </span>
                <span className="text-base font-black font-display text-white">
                  {metric.measuredValue}
                </span>
              </div>

              <div className="text-right font-mono text-xs">
                <span className="text-slate-500 text-[10px] block">Target Range</span>
                <span className="text-cyan-300 font-semibold">{metric.optimalBenchmark}</span>
              </div>
            </div>

            {/* Score Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Speech Score:</span>
                <span className="text-emerald-400 font-bold">{metric.score} / 100</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${metric.score}%` }}
                />
              </div>
            </div>

            {/* Headline */}
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
              {metric.headline}
            </p>

            {/* Bottom: Inspect Evidence Action */}
            <button
              onClick={() => onInspectEvidence(metric)}
              className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors group"
            >
              <span className="flex items-center gap-1.5">
                <Search className="w-3 h-3 group-hover:scale-110 transition-transform" />
                Inspect Observed Evidence ({metric.evidenceSnippets.length})
              </span>
              <span>→</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
