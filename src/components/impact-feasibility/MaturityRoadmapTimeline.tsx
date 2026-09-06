import React, { useState } from 'react';
import { 
  GitBranch, 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  AlertOctagon, 
  DollarSign, 
  Target, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import type { MaturityStage, MaturityStageId } from '../../types/impactFeasibility';

interface MaturityRoadmapTimelineProps {
  stages: MaturityStage[];
}

export const MaturityRoadmapTimeline: React.FC<MaturityRoadmapTimelineProps> = ({ stages }) => {
  const [activeStageId, setActiveStageId] = useState<MaturityStageId>('prototype');

  const activeStage = stages.find((s) => s.id === activeStageId) || stages[0];

  const getStageColor = (status: 'active' | 'next' | 'future') => {
    switch (status) {
      case 'active':
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400',
          ring: 'ring-emerald-400/30',
          line: 'bg-emerald-500',
        };
      case 'next':
        return {
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          dot: 'bg-cyan-400',
          ring: 'ring-cyan-400/30',
          line: 'bg-cyan-500',
        };
      case 'future':
        return {
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          dot: 'bg-purple-400',
          ring: 'ring-purple-400/30',
          line: 'bg-purple-500',
        };
    }
  };

  const getMilestoneStatusBadge = (status: 'completed' | 'in-progress' | 'planned' | 'blocked') => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
            <CircleDot className="w-3 h-3 animate-spin" />
            In Progress
          </span>
        );
      case 'planned':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
            <Clock className="w-3 h-3" />
            Planned
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-400">
            <AlertOctagon className="w-3 h-3" />
            Gated
          </span>
        );
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-white">
              Prototype → Pilot → Production Maturity Roadmap
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Empirical stage progression from laboratory proof-of-concept to industrial scale
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Current Phase:</span>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            {stages[0].trlLevel} Verified
          </span>
        </div>
      </div>

      {/* 3-Stage Sequential Step Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stages.map((stage, idx) => {
          const colors = getStageColor(stage.status);
          const isSelected = activeStageId === stage.id;

          return (
            <button
              key={stage.id}
              onClick={() => setActiveStageId(stage.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${
                isSelected
                  ? 'border-cyan-500/60 bg-cyan-950/25 ring-1 ring-cyan-500/50 shadow-lg'
                  : 'border-white/10 bg-black/30 hover:bg-white/[0.03] hover:border-white/20'
              }`}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Stage 0{idx + 1}
                  </span>
                </div>

                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border ${colors.badge}`}>
                  {stage.badgeLabel}
                </span>
              </div>

              {/* Title & TRL */}
              <div className="mt-2.5">
                <h4 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>{stage.stageName}</span>
                  <span className="text-xs font-mono text-cyan-400">{stage.trlLevel}</span>
                </h4>
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  Timeline: {stage.targetTimeline}
                </p>
              </div>

              {/* Selection bottom bar */}
              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Breakdown Card */}
      <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-6">
        {/* Stage Overview Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                {activeStage.trlLevel} Specification
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs font-mono text-slate-300">
                {activeStage.duration}
              </span>
            </div>
            <h4 className="text-xl font-bold font-display text-white mt-1">
              {activeStage.stageName}: Strategy & Architecture
            </h4>
            <p className="text-xs text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
              {activeStage.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono shrink-0">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
              <span className="text-[10px] text-slate-400 block">Est. Stage Budget</span>
              <span className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                {activeStage.budgetEstimate}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
              <span className="text-[10px] text-slate-400 block">Validation Target</span>
              <span className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                {activeStage.validationCohort.split(' ')[0]} {activeStage.validationCohort.split(' ')[1]}
              </span>
            </div>
          </div>
        </div>

        {/* Milestones & Deliverables List */}
        <div className="space-y-3">
          <h5 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Key Technical Milestones & Deliverables
          </h5>

          <div className="space-y-2.5">
            {activeStage.milestones.map((ms) => (
              <div
                key={ms.id}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/15 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {ms.title}
                    </span>
                    {getMilestoneStatusBadge(ms.status)}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Deliverable: {ms.deliverable}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <span className="text-slate-500">Due: {ms.targetDate}</span>
                  {ms.verificationEvidence && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30 text-[10px] text-emerald-400">
                      ✓ Evidence Linked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Split: Gating Criteria & Critical Stage Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Gating Criteria */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-cyan-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Stage Gating Criteria (Required to Advance)
            </span>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {activeStage.gatingCriteria.map((crit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5 font-bold">✓</span>
                  <span>{crit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Risks */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Critical Phase Bottlenecks & Hazards
            </span>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {activeStage.keyRisks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5 font-bold">!</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
