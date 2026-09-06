import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen
} from 'lucide-react';
import type { ImpactSubMetric } from '../../types/impactFeasibility';

interface PillarDetailCardProps {
  pillarTitle: string;
  pillarColor: string;
  pillarBorderColor: string;
  pillarBgColor: string;
  subMetrics: ImpactSubMetric[];
  searchQuery?: string;
  allExpanded?: boolean;
}

export const PillarDetailCard: React.FC<PillarDetailCardProps> = ({
  pillarTitle,
  pillarColor,
  pillarBorderColor,
  pillarBgColor,
  subMetrics,
  searchQuery = '',
  allExpanded = false,
}) => {
  const [expandedMetricIds, setExpandedMetricIds] = useState<Record<string, boolean>>({});

  const toggleMetric = (id: string) => {
    setExpandedMetricIds((prev) => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : !allExpanded,
    }));
  };

  const isMetricExpanded = (id: string) => {
    if (expandedMetricIds[id] !== undefined) {
      return expandedMetricIds[id];
    }
    return allExpanded;
  };

  // Filter metrics based on search query
  const filteredMetrics = subMetrics.filter((metric) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      metric.name.toLowerCase().includes(q) ||
      metric.headline.toLowerCase().includes(q) ||
      metric.metricValue.toLowerCase().includes(q) ||
      metric.description.toLowerCase().includes(q)
    );
  });

  if (filteredMetrics.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2 pt-2">
        <div className="flex items-center gap-2.5">
          <span 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: pillarColor }} 
          />
          <h3 className="text-base font-bold font-display text-white tracking-wide">
            {pillarTitle}
          </h3>
          <span className="text-xs font-mono text-slate-400">
            ({filteredMetrics.length} Evaluated Metrics)
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMetrics.map((metric) => {
          const expanded = isMetricExpanded(metric.id);

          return (
            <div
              key={metric.id}
              className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                expanded
                  ? `${pillarBorderColor} ${pillarBgColor} shadow-xl shadow-black/40 ring-1 ring-white/10`
                  : 'border-white/10 bg-slate-900/40 hover:bg-slate-900/70 hover:border-white/20'
              }`}
            >
              {/* Card Top Row: Metric Name & Weight */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Criterion #{metric.id.split('-').pop()}
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {metric.name}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
                    {metric.weight}% Wt
                  </span>

                  <button
                    onClick={() => toggleMetric(metric.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {expanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Empirical Value Headline */}
              <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Verified Empirical Value
                  </span>
                  <span className="text-lg font-black font-display text-white tracking-tight">
                    {metric.metricValue}
                  </span>
                </div>

                {metric.unit && (
                  <span className="text-xs font-mono text-cyan-300 max-w-[140px] text-right">
                    {metric.unit}
                  </span>
                )}
              </div>

              {/* Score & AI Confidence Meters */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {/* Score */}
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Score:</span>
                    <span className="text-white font-bold">{metric.score} / 100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${metric.score}%`,
                        backgroundColor: pillarColor 
                      }}
                    />
                  </div>
                </div>

                {/* AI Confidence */}
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">AI Confidence:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {metric.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${metric.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Brief Headline */}
              <p className="text-xs text-slate-300 mt-3 font-medium leading-relaxed">
                {metric.headline}
              </p>

              {/* Expandable Deep Dive */}
              {expanded && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3.5 animate-fadeIn">
                  {/* Detailed Description */}
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Analytical Assessment
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {metric.description}
                    </p>
                  </div>

                  {/* Strengths & Limitations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Strengths */}
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Key Advantages
                      </span>
                      <ul className="space-y-1 text-slate-300 text-[11px]">
                        {metric.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limitations */}
                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Boundary Constraints
                      </span>
                      <ul className="space-y-1 text-slate-300 text-[11px]">
                        {metric.limitations.map((lim, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400 mt-0.5">•</span>
                            <span>{lim}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Verified Evidence References */}
                  {metric.evidence.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-cyan-400" />
                        Primary Ground Truth Evidence
                      </span>

                      {metric.evidence.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">
                              {ev.title}
                            </span>
                            <span className="text-[10px] font-mono text-cyan-400">
                              {ev.source}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 italic font-serif">
                            "{ev.excerpt}"
                          </p>

                          <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-emerald-400 font-semibold">
                            <span>Validated Result:</span>
                            <span className="text-white bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                              {ev.verifiedValue}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Expand Toggle Link */}
              <button
                onClick={() => toggleMetric(metric.id)}
                className="mt-3 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>{expanded ? 'Hide Deep Dive' : 'Inspect Evidence & Constraints'}</span>
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
