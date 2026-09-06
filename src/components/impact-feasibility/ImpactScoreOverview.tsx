import React from 'react';
import { 
  Users, 
  DollarSign, 
  Leaf, 
  Wrench, 
  ShieldCheck, 
  Download, 
  Sparkles,
  Code2,
  HardDrive
} from 'lucide-react';
import type { ImpactFeasibilityReport, ImpactPillarId } from '../../types/impactFeasibility';

interface ImpactScoreOverviewProps {
  report: ImpactFeasibilityReport;
  selectedTrack: 'software' | 'hardware';
  onTrackChange: (track: 'software' | 'hardware') => void;
  activePillarFilter: ImpactPillarId | 'all' | 'roadmap' | 'blueprint';
  onPillarSelect: (pillar: ImpactPillarId | 'all' | 'roadmap' | 'blueprint') => void;
  onExportReport: () => void;
}

export const ImpactScoreOverview: React.FC<ImpactScoreOverviewProps> = ({
  report,
  selectedTrack,
  onTrackChange,
  activePillarFilter,
  onPillarSelect,
  onExportReport,
}) => {
  const pillarsConfig: Array<{
    id: ImpactPillarId;
    title: string;
    icon: React.ElementType;
    score: number;
    confidence: number;
    weight: number;
    color: string;
    borderColor: string;
    bgColor: string;
    textColor: string;
    summary: string;
  }> = [
    {
      id: 'social',
      title: 'Social Impact',
      icon: Users,
      score: report.pillars.social.pillarScore,
      confidence: report.pillars.social.confidence,
      weight: report.pillars.social.weight,
      color: '#06b6d4',
      borderColor: 'border-cyan-500/40',
      bgColor: 'bg-cyan-950/30',
      textColor: 'text-cyan-400',
      summary: report.pillars.social.headline,
    },
    {
      id: 'economic',
      title: 'Economic Impact',
      icon: DollarSign,
      score: report.pillars.economic.pillarScore,
      confidence: report.pillars.economic.confidence,
      weight: report.pillars.economic.weight,
      color: '#10b981',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-emerald-950/30',
      textColor: 'text-emerald-400',
      summary: report.pillars.economic.headline,
    },
    {
      id: 'environmental',
      title: 'Environmental Impact',
      icon: Leaf,
      score: report.pillars.environmental.pillarScore,
      confidence: report.pillars.environmental.confidence,
      weight: report.pillars.environmental.weight,
      color: '#34d399',
      borderColor: 'border-teal-500/40',
      bgColor: 'bg-teal-950/30',
      textColor: 'text-teal-400',
      summary: report.pillars.environmental.headline,
    },
    {
      id: 'feasibility',
      title: 'Feasibility & Readiness',
      icon: Wrench,
      score: report.pillars.feasibility.pillarScore,
      confidence: report.pillars.feasibility.confidence,
      weight: report.pillars.feasibility.weight,
      color: '#a855f7',
      borderColor: 'border-purple-500/40',
      bgColor: 'bg-purple-950/30',
      textColor: 'text-purple-400',
      summary: report.pillars.feasibility.headline,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Project Context & Composite Index */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0B0F19] to-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Project title & metadata */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Stage 6 of 6: Impact & Feasibility Matrix
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-mono">
                {report.evaluatorEngine}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              {report.projectName}
            </h2>

            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              {report.executiveSummary}
            </p>
          </div>

          {/* Right: Dual Track Switcher & Export */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
            {/* Track Switcher */}
            <div className="p-1 rounded-2xl bg-black/40 border border-white/10 flex items-center">
              <button
                onClick={() => onTrackChange('software')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                  selectedTrack === 'software'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Software Track</span>
              </button>

              <button
                onClick={() => onTrackChange('hardware')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                  selectedTrack === 'hardware'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Hardware Track</span>
              </button>
            </div>

            {/* Export Report Action */}
            <button
              onClick={onExportReport}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-slate-200 hover:text-white transition-all shadow-md"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>

        {/* Middle: Composite Metric Strip */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* 1. Composite Viability Score */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Composite Viability
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-display text-white">
                {report.compositeViabilityScore}
              </span>
              <span className="text-xs font-mono text-slate-500">/ 100</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                style={{ width: `${report.compositeViabilityScore}%` }}
              />
            </div>
          </div>

          {/* 2. Composite AI Confidence */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Evidence Confidence
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-display text-emerald-400">
                {report.compositeConfidence}%
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-2 block">
              High evidentiary cross-check
            </span>
          </div>

          {/* 3. Current Maturity Stage */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Maturity Level
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-display text-purple-300">
                {report.roadmap[0].trlLevel}
              </span>
              <span className="text-xs font-mono text-purple-400">Working Lab</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-2 block">
              Next: {report.roadmap[1].stageName}
            </span>
          </div>

          {/* 4. Time to Production */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Deployment Horizon
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-display text-amber-300">
                {report.realWorldDeployment.estimatedTimeToProduction.split(' ')[0]}
              </span>
              <span className="text-xs font-mono text-amber-400">Months</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-2 block">
              Est. Runway: {report.realWorldDeployment.totalRunwayNeeded.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Pillars Interactive Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillarsConfig.map((pillar) => {
          const Icon = pillar.icon;
          const isSelected = activePillarFilter === pillar.id;

          return (
            <div
              key={pillar.id}
              onClick={() => onPillarSelect(pillar.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative group overflow-hidden ${
                isSelected 
                  ? `${pillar.borderColor} ${pillar.bgColor} ring-1 ring-cyan-400/50 shadow-xl` 
                  : 'border-white/10 bg-slate-900/50 hover:bg-slate-900/80 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${pillar.borderColor} ${pillar.bgColor}`}>
                    <Icon className={`w-4 h-4 ${pillar.textColor}`} />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                    {pillar.title}
                  </span>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                  {pillar.weight}% Wt
                </span>
              </div>

              {/* Score & Confidence */}
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-black font-display text-white">
                    {pillar.score}
                  </span>
                  <span className="text-xs font-mono text-slate-500 ml-1">/ 100</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="text-emerald-400 font-bold">{pillar.confidence}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${pillar.score}%`,
                    backgroundColor: pillar.color 
                  }}
                />
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 mt-3 leading-relaxed">
                {pillar.summary}
              </p>

              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className={`${pillar.textColor} font-semibold group-hover:underline`}>
                  {isSelected ? 'Viewing Sub-Metrics' : 'Inspect Sub-Metrics →'}
                </span>
                <span className="text-slate-500">
                  {pillar.id === 'feasibility' ? '6 sub-metrics' : '4 sub-metrics'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
