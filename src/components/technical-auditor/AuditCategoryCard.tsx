import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle, 
  FileCode2, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  PlusCircle,
  MinusCircle,
  ExternalLink,
  Layers,
  Cpu,
  Database,
  Globe,
  Lock,
  Zap,
  Maximize2,
  BrainCircuit,
  TestTube2,
  Palette,
  Radio,
  BatteryCharging,
  Wrench,
  Flame,
  Factory
} from 'lucide-react';
import type { TechnicalAuditMetric, EvidenceReference } from '../../types/technicalAudit';

interface AuditCategoryCardProps {
  metric: TechnicalAuditMetric;
  isExpandedDefault?: boolean;
  onViewEvidence?: (evidence: EvidenceReference) => void;
  isHighlighted?: boolean;
}

// Icon mapper for software & hardware categories
const getMetricIcon = (key: string) => {
  switch (key) {
    // Software
    case 'architecture': return <Layers className="w-5 h-5 text-cyan-400" />;
    case 'algorithms': return <BrainCircuit className="w-5 h-5 text-indigo-400" />;
    case 'database': return <Database className="w-5 h-5 text-emerald-400" />;
    case 'api-design': return <Globe className="w-5 h-5 text-blue-400" />;
    case 'security': return <Lock className="w-5 h-5 text-rose-400" />;
    case 'performance': return <Zap className="w-5 h-5 text-amber-400" />;
    case 'scalability': return <Maximize2 className="w-5 h-5 text-purple-400" />;
    case 'ai-ml-implementation': return <BrainCircuit className="w-5 h-5 text-teal-400" />;
    case 'testing': return <TestTube2 className="w-5 h-5 text-sky-400" />;
    case 'ui-ux': return <Palette className="w-5 h-5 text-pink-400" />;

    // Hardware
    case 'component-selection': return <Cpu className="w-5 h-5 text-cyan-400" />;
    case 'circuit-system-architecture': return <Layers className="w-5 h-5 text-blue-400" />;
    case 'sensors': return <Zap className="w-5 h-5 text-emerald-400" />;
    case 'controller': return <Cpu className="w-5 h-5 text-indigo-400" />;
    case 'communication': return <Radio className="w-5 h-5 text-teal-400" />;
    case 'power-consumption': return <BatteryCharging className="w-5 h-5 text-amber-400" />;
    case 'reliability': return <ShieldCheck className="w-5 h-5 text-sky-400" />;
    case 'mechanical-design': return <Wrench className="w-5 h-5 text-orange-400" />;
    case 'safety': return <Flame className="w-5 h-5 text-rose-400" />;
    case 'manufacturing-feasibility': return <Factory className="w-5 h-5 text-purple-400" />;

    default: return <Layers className="w-5 h-5 text-cyan-400" />;
  }
};

export const AuditCategoryCard: React.FC<AuditCategoryCardProps> = ({
  metric,
  isExpandedDefault = false,
  onViewEvidence,
  isHighlighted = false,
}) => {
  const [isWhyExpanded, setIsWhyExpanded] = useState(isExpandedDefault);

  // Status badge styling
  const getStatusBadge = () => {
    if (metric.score >= 90) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Exceptional
        </span>
      );
    }
    if (metric.score >= 80) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
          Solid
        </span>
      );
    }
    if (metric.score >= 70) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          Needs Attention
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3 text-rose-400" />
        Critical Defect
      </span>
    );
  };

  // Bar meter color
  const getScoreBarColor = () => {
    if (metric.score >= 90) return 'from-emerald-500 to-cyan-400';
    if (metric.score >= 80) return 'from-cyan-500 to-blue-500';
    if (metric.score >= 70) return 'from-amber-500 to-yellow-400';
    return 'from-rose-600 to-rose-400';
  };

  return (
    <div
      id={`card-${metric.id}`}
      className={`rounded-2xl transition-all duration-300 bg-slate-900/60 backdrop-blur-md border ${
        isHighlighted
          ? 'border-cyan-400 ring-2 ring-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
          : 'border-white/10 hover:border-white/20 shadow-xl shadow-black/40'
      }`}
    >
      {/* Card Header & Scores */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Title & Icon */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
              {getMetricIcon(metric.key)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white font-display tracking-tight">
                  {metric.name}
                </h3>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-sans line-clamp-2">
                {metric.headline}
              </p>
            </div>
          </div>

          {/* Scores Metadata Strip: Score + Confidence + Evidence Count */}
          <div className="flex items-center gap-3 shrink-0 bg-white/[0.03] border border-white/10 rounded-xl p-2.5 sm:px-4">
            {/* Score */}
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Score</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-white tracking-tight">
                  {metric.score}
                </span>
                <span className="text-xs font-mono text-slate-400">/100</span>
              </div>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Confidence */}
            <div className="text-left">
              <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Confidence</div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-sm font-bold font-mono text-emerald-300">
                  {metric.confidence}%
                </span>
              </div>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Evidence Count */}
            <div className="text-left">
              <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Evidence</div>
              <div className="flex items-center gap-1">
                <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-sm font-bold font-mono text-cyan-300">
                  {metric.evidenceCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Meter */}
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1.5">
            <span>AUDIT PERFORMANCE METER</span>
            <span className="text-cyan-400 font-semibold">{metric.score}% OF MAXIMUM</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getScoreBarColor()} transition-all duration-700 ease-out`}
              style={{ width: `${metric.score}%` }}
            />
          </div>
        </div>

        {/* Strengths & Weaknesses Snapshot */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Strengths */}
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-semibold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Key Strengths ({metric.strengths.length})</span>
            </div>
            <ul className="space-y-1.5 text-slate-300">
              {metric.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px] font-semibold mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Identified Gaps ({metric.weaknesses.length})</span>
            </div>
            <ul className="space-y-1.5 text-slate-300">
              {metric.weaknesses.map((w, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Detected Risks if any */}
        {metric.risks && metric.risks.length > 0 && (
          <div className="mt-3 bg-rose-950/25 border border-rose-500/30 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-rose-400 font-mono text-[11px] font-semibold mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Critical Risk Flag</span>
            </div>
            <p className="text-xs text-rose-200/90 leading-relaxed">
              {metric.risks.join('; ')}
            </p>
          </div>
        )}

        {/* "Why this score?" Accordion Trigger */}
        <div className="mt-4 pt-3 flex items-center justify-between">
          <button
            onClick={() => setIsWhyExpanded(!isWhyExpanded)}
            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-mono font-semibold transition-all duration-200"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Why this score?</span>
            {isWhyExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
            )}
          </button>

          <span className="text-[11px] font-mono text-slate-400">
            Weighted Impact: <strong className="text-slate-200">{metric.weight}%</strong> of Composite
          </span>
        </div>
      </div>

      {/* Expandable "Why this score?" Deep-Dive Panel */}
      {isWhyExpanded && (
        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-cyan-500/20 bg-cyan-950/20 rounded-b-2xl animate-fadeIn">
          <div className="space-y-4">
            {/* Executive Rationale Summary */}
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-xs font-semibold mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Auditor Rationale</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {metric.whyThisScore.summary}
              </p>
            </div>

            {/* Sub-dimension Breakdown */}
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                Sub-Dimension Evaluation
              </div>
              <div className="space-y-1.5">
                {metric.whyThisScore.breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 text-slate-300"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Factors (Bonuses & Deductions) */}
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                Applied Penalties & Bonuses
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {metric.whyThisScore.factors.map((factor, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs ${
                      factor.type === 'bonus'
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    }`}
                  >
                    {factor.type === 'bonus' ? (
                      <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <MinusCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-mono font-bold">
                        {factor.type === 'bonus' ? `+${factor.points} pts` : `${factor.points} pts`}
                      </div>
                      <div className="text-[11px] opacity-90 leading-snug mt-0.5">
                        {factor.reason}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Evidence Citations */}
            {metric.whyThisScore.keyEvidence && metric.whyThisScore.keyEvidence.length > 0 && (
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Corroborating Evidence ({metric.whyThisScore.keyEvidence.length})
                </div>
                <div className="space-y-2">
                  {metric.whyThisScore.keyEvidence.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => onViewEvidence?.(ev)}
                      className="group/ev p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-500/50 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold">
                            {ev.type}
                          </span>
                          <span className="font-semibold text-slate-200 group-hover/ev:text-cyan-300 transition-colors">
                            {ev.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] font-mono">
                          <span>{ev.relevanceScore}% Match</span>
                          <ExternalLink className="w-3 h-3 group-hover/ev:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mb-1.5">
                        Location: <code className="text-cyan-300/90">{ev.location}</code>
                      </div>
                      <pre className="p-2 rounded bg-black/50 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap border border-white/5">
                        {ev.excerpt}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence Calibration Footnote */}
            <div className="pt-2 text-[11px] text-slate-400 font-mono border-t border-white/10 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Confidence calibration basis: {metric.whyThisScore.confidenceReasoning}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
