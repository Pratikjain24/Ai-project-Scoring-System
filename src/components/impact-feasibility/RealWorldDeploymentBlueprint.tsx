import React, { useState } from 'react';
import { 
  Scale, 
  Server, 
  Coins, 
  CheckSquare, 
  Square, 
  Sparkles,
  FileCheck2,
  ShieldAlert
} from 'lucide-react';
import type { RealWorldDeploymentBlueprint as BlueprintType } from '../../types/impactFeasibility';

interface RealWorldDeploymentBlueprintProps {
  blueprint: BlueprintType;
}

export const RealWorldDeploymentBlueprint: React.FC<RealWorldDeploymentBlueprintProps> = ({ blueprint }) => {
  const [checklist, setChecklist] = useState(blueprint.readinessChecklist);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isReady: !item.isReady } : item
      )
    );
  };

  const completedCount = checklist.filter((item) => item.isReady).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  const getUrgencyBadge = (urgency: 'critical' | 'high' | 'medium') => {
    switch (urgency) {
      case 'critical':
        return 'bg-rose-950/60 text-rose-400 border-rose-500/30';
      case 'high':
        return 'bg-amber-950/60 text-amber-400 border-amber-500/30';
      case 'medium':
        return 'bg-cyan-950/60 text-cyan-400 border-cyan-500/30';
    }
  };

  const getSeverityBadge = (sev: 'catastrophic' | 'high' | 'medium') => {
    switch (sev) {
      case 'catastrophic':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/40 font-bold';
      case 'high':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/30';
      case 'medium':
        return 'bg-yellow-950/40 text-yellow-300 border-yellow-500/30';
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-cyan-950/40 border border-purple-500/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                AI Real-World Deployment Synthesis
              </span>
              <span className="text-xs font-mono text-slate-400">
                Production Transition Blueprint
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
              What Would Be Required to Deploy This Project in the Real World?
            </h3>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {blueprint.executiveSummary}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <span className="text-slate-400 block text-[10px]">Estimated Runway</span>
              <span className="text-white font-bold text-sm block mt-0.5">
                {blueprint.totalRunwayNeeded}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <span className="text-slate-400 block text-[10px]">Time to Commercialization</span>
              <span className="text-cyan-400 font-bold text-sm block mt-0.5">
                {blueprint.estimatedTimeToProduction}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Deployment Readiness Checklist */}
      <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold font-display text-white">
              Field Readiness Checklist ({completedCount} of {checklist.length} verified)
            </h4>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {progressPercent}% Ready
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleChecklistItem(item.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                item.isReady
                  ? 'border-emerald-500/30 bg-emerald-950/20'
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <button className="mt-0.5 text-slate-400 hover:text-white shrink-0">
                {item.isReady ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
              </button>

              <div className="space-y-1">
                <span className={`text-xs block leading-snug ${item.isReady ? 'text-slate-200 line-through' : 'text-slate-300'}`}>
                  {item.task}
                </span>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                  <span className="text-cyan-400">{item.category}</span>
                  <span>·</span>
                  <span>Owner: {item.owner}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: 4 Critical Deployment Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Regulatory & Compliance Hurdles */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Scale className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold font-display text-white">
              Regulatory & Compliance Hurdles
            </h4>
          </div>

          <div className="space-y-3">
            {blueprint.regulatory.map((reg) => (
              <div
                key={reg.id}
                className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      {reg.standard}
                    </h5>
                    <span className="text-[10px] font-mono text-slate-400">
                      Authority: {reg.governingBody}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border shrink-0 ${getUrgencyBadge(reg.urgency)}`}>
                    {reg.urgency} priority
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {reg.description}
                </p>

                <div className="pt-1 text-[11px] font-mono text-cyan-300 flex items-start gap-1.5">
                  <span className="font-bold shrink-0">Action:</span>
                  <span>{reg.requiredAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Infrastructure & Supply Chain */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Server className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold font-display text-white">
              Infrastructure & Supply Chain Prerequisites
            </h4>
          </div>

          <div className="space-y-3">
            {blueprint.infrastructure.map((inf) => (
              <div
                key={inf.id}
                className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      {inf.name}
                    </h5>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">
                      Category: {inf.category}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                    Lead: {inf.leadTime}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Spec: {inf.specification}
                </p>

                <div className="pt-1 text-[11px] font-mono text-emerald-400 flex items-start gap-1.5">
                  <span className="font-bold shrink-0">Mitigation:</span>
                  <span>{inf.mitigation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Financial Cost Model & Runway Breakdown */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Coins className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold font-display text-white">
              Financial Cost Model (CapEx & OpEx)
            </h4>
          </div>

          <div className="space-y-2.5">
            {blueprint.financialModel.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-black/30 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-semibold">
                      {item.category}
                    </span>
                    <span className="font-semibold text-white">{item.item}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    {item.notes}
                  </p>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <div className="text-slate-300">
                    Pilot: <strong className="text-white">{item.pilotCost}</strong>
                  </div>
                  <div className="text-[11px] text-cyan-400">
                    Prod: {item.productionCost}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Critical Failure Modes & Defense Playbook */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h4 className="text-sm font-bold font-display text-white">
              Critical Failure Modes & Mitigation Playbook
            </h4>
          </div>

          <div className="space-y-3">
            {blueprint.failureModes.map((fm) => (
              <div
                key={fm.id}
                className="p-3.5 rounded-xl bg-rose-950/10 border border-rose-500/20 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h5 className="text-xs font-bold text-rose-200">
                    {fm.failureMode}
                  </h5>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border shrink-0 ${getSeverityBadge(fm.severity)}`}>
                    {fm.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {fm.impactAnalysis}
                </p>

                <div className="pt-1 text-[11px] font-mono text-emerald-300 flex items-start gap-1.5">
                  <span className="font-bold text-emerald-400 shrink-0">Playbook:</span>
                  <span>{fm.mitigationPlaybook}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
