import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Terminal
} from 'lucide-react';
import type { PipelineStage, StageStatus } from '../../types/videoAnalysis';

interface ProcessingTimelineProps {
  stages: PipelineStage[];
  currentStageIndex?: number;
  isProcessing: boolean;
}

export const ProcessingTimeline: React.FC<ProcessingTimelineProps> = ({
  stages,
}) => {
  const [expandedStageIds, setExpandedStageIds] = useState<Record<string, boolean>>({
    stage_6: true, // Expand claim extraction by default for showcase
    stage_8: true, // Expand technical evaluation
  });

  const toggleExpand = (id: string) => {
    setExpandedStageIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status: StageStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'Running':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Running</span>
          </span>
        );
      case 'Warning':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Warning</span>
          </span>
        );
      case 'Failed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-white/5 text-slate-400 border border-white/10 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Queued</span>
          </span>
        );
    }
  };

  return (
    <div className="rounded-3xl bg-[#090D16] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            STAGE 02 // MULTIMODAL VERIFICATION TIMELINE
          </span>
          <h3 className="text-xl font-display font-bold text-white mt-0.5">
            11-Stage Autonomous AI Jury Execution Pipeline
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-cyan-400 font-bold">
            {stages.filter((s) => s.status === 'Completed' || s.status === 'Warning').length} / 11 Complete
          </span>
        </div>
      </div>

      {/* 11 Stage List */}
      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const isExpanded = expandedStageIds[stage.id];
          const isCurrentRunning = stage.status === 'Running';
          const isCompleted = stage.status === 'Completed' || stage.status === 'Warning';

          return (
            <div
              key={stage.id}
              className={`rounded-2xl border transition-all ${
                isCurrentRunning
                  ? 'bg-cyan-950/25 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.15)]'
                  : isCompleted
                  ? 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  : 'bg-white/[0.01] border-white/[0.05] opacity-60'
              }`}
            >
              {/* Header row */}
              <div
                onClick={() => toggleExpand(stage.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      stage.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isCurrentRunning
                        ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                        : stage.status === 'Warning'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}
                  >
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-white font-display">
                        {stage.title}
                      </h4>
                      <span className="hidden sm:inline-block text-slate-500 text-xs">•</span>
                      <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
                        {stage.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 sm:hidden mt-0.5">
                      {stage.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-mono text-slate-400 hidden md:inline-block">
                    {stage.timestamp}
                  </span>

                  {getStatusBadge(stage.status)}

                  <button
                    type="button"
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Progress bar (active when running or partial) */}
              {stage.status === 'Running' && (
                <div className="px-5 pb-2">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                      style={{ width: `${stage.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Expandable Technical Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 space-y-4 border-t border-white/[0.06] text-xs font-mono">
                  <p className="text-slate-300 font-sans text-xs leading-relaxed pt-2">
                    {stage.summary}
                  </p>

                  {/* Telemetry Keys */}
                  {stage.details.telemetryKeys && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {stage.details.telemetryKeys.map((k, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] space-y-0.5">
                          <span className="text-[10px] text-slate-400 block">{k.label}</span>
                          <span className="text-white font-bold text-xs truncate block">{k.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Warning Notice if any */}
                  {stage.details.warningNote && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <span className="font-bold font-mono">Heuristic Anomaly Flagged: </span>
                        <span className="font-sans">{stage.details.warningNote}</span>
                      </div>
                    </div>
                  )}

                  {/* Execution Logs */}
                  {stage.details.logs && stage.details.logs.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-black/70 border border-white/10 space-y-1 text-[11px] text-slate-300">
                      <div className="flex items-center justify-between pb-1 border-b border-white/10 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-cyan-400" />
                          <span>DAEMON EXECUTION LOG</span>
                        </span>
                        <span>LATENCY: {stage.durationMs}MS</span>
                      </div>
                      {stage.details.logs.map((log, i) => (
                        <p key={i} className="leading-relaxed">
                          {log}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Output Sample */}
                  {stage.details.outputSample && (
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] text-cyan-300 flex items-center justify-between">
                      <span>Artifact Output: {stage.details.outputSample}</span>
                      <span className="text-emerald-400 font-bold">SEALED</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
