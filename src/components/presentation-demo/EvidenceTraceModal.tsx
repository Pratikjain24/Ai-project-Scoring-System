import React from 'react';
import { 
  X, 
  FileText, 
  Volume2, 
  Video, 
  Terminal, 
  Eye
} from 'lucide-react';
import type { SpeechMetric, ObservedEvidenceItem } from '../../types/presentationDemo';

interface EvidenceTraceModalProps {
  metric: SpeechMetric | null;
  onClose: () => void;
}

export const EvidenceTraceModal: React.FC<EvidenceTraceModalProps> = ({
  metric,
  onClose,
}) => {
  if (!metric) return null;

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'audio-waveform': return Volume2;
      case 'video-frame': return Video;
      case 'telemetry-log': return Terminal;
      case 'gaze-heatmap': return Eye;
      default: return FileText;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-950/60 overflow-hidden space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/60">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              OBSERVED EVIDENCE DERIVATION
            </span>
            <h3 className="text-base font-bold text-white font-display mt-0.5">
              {metric.name} ({metric.measuredValue})
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 pt-0 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Methodological Evaluation Basis
            </span>
            <p className="text-slate-300 leading-relaxed">
              {metric.detailedAnalysis}
            </p>
          </div>

          {/* Evidence Items List */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
              Substantiating Observed Proof ({metric.evidenceSnippets.length})
            </h4>

            {metric.evidenceSnippets.map((ev: ObservedEvidenceItem) => {
              const Icon = getEvidenceIcon(ev.type);

              return (
                <div
                  key={ev.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white">{ev.label}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-slate-500">{ev.sourceLocation}</span>
                      <span className="text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                        @{ev.timestamp}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 font-mono text-[11px] bg-black/50 p-2.5 rounded-xl border border-white/5">
                    "{ev.snippet}"
                  </p>

                  <p className="text-[11px] text-emerald-400 font-mono">
                    <strong>Evidentiary Correlation:</strong> {ev.metricCorrelation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">
            Source: ProjectX-Ray AI Multi-Modal Evaluator
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
