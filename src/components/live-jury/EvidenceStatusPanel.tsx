import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  GitBranch, 
  Cpu, 
  Database, 
  CheckCircle2
} from 'lucide-react';
import { INITIAL_EVIDENCE_STATUS } from '../../data/liveJuryData';

export interface EvidenceStatusPanelProps {
  evidenceStatus?: typeof INITIAL_EVIDENCE_STATUS;
}

export const EvidenceStatusPanel: React.FC<EvidenceStatusPanelProps> = ({
  evidenceStatus = INITIAL_EVIDENCE_STATUS,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Git Commit Forensics': return <GitBranch className="w-4 h-4 text-cyan-400" />;
      case 'Hardware Inspection': return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'Micro-VM Sandbox': return <Layers className="w-4 h-4 text-amber-400" />;
      default: return <Database className="w-4 h-4 text-violet-400" />;
    }
  };

  return (
    <div className="rounded-3xl bg-[#090D16] border border-white/10 p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white">
            Multimodal Ingestion & Evidence Daemons
          </h3>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
          evidenceStatus === INITIAL_EVIDENCE_STATUS
            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
        }`}>
          {evidenceStatus === INITIAL_EVIDENCE_STATUS ? 'DEMO DATA' : 'LIVE DAEMONS'}
        </span>
      </div>

      {/* Daemons List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {evidenceStatus.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition-all text-xs font-mono space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getIcon(item.type)}
                <span className="font-bold text-white font-display text-xs">{item.module}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>{item.status}</span>
              </span>
            </div>

            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
              {item.detail}
            </p>

            <div className="pt-1.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-400">
              <span>{item.type}</span>
              <span className="text-cyan-400">Lat: {item.latency}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
