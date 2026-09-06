import React from 'react';
import { 
  FileText, 
  Layers, 
  Globe, 
  Cpu, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowDown
} from 'lucide-react';
import type { EvidenceChainStep } from '../../types/claimVerification';

interface EvidenceChainVisualizerProps {
  steps: EvidenceChainStep[];
  className?: string;
}

const getStepIcon = (step: EvidenceChainStep['step']) => {
  switch (step) {
    case 'claim':
      return <FileText className="w-4 h-4 text-cyan-400" />;
    case 'project-evidence':
      return <Layers className="w-4 h-4 text-indigo-400" />;
    case 'external-sources':
      return <Globe className="w-4 h-4 text-teal-400" />;
    case 'ai-analysis':
      return <Cpu className="w-4 h-4 text-purple-400" />;
    case 'verdict':
      return <Award className="w-4 h-4 text-emerald-400" />;
  }
};

const getStatusIcon = (status: EvidenceChainStep['status']) => {
  switch (status) {
    case 'passed':
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-rose-400" />;
    case 'neutral':
      return <span className="w-2 h-2 rounded-full bg-cyan-400" />;
  }
};

const getStatusBadge = (status: EvidenceChainStep['status']) => {
  switch (status) {
    case 'passed':
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">Verified</span>;
    case 'warning':
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">Caveat</span>;
    case 'failed':
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">Contradicted/Missing</span>;
    case 'neutral':
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-300 bg-cyan-950 border border-cyan-800">Initial Input</span>;
  }
};

export const EvidenceChainVisualizer: React.FC<EvidenceChainVisualizerProps> = ({
  steps,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400 tracking-wider">
        <span>5-Stage Evidence Verification Chain</span>
        <span className="text-[11px] text-cyan-400">CLAIM ➔ EVIDENCE ➔ EXTERNAL ➔ ANALYSIS ➔ VERDICT</span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-purple-500 before:to-emerald-500">
        {steps.map((step, idx) => (
          <div key={idx} className="relative group">
            {/* Step Node Marker */}
            <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center ring-4 ring-[#0B0F19] group-hover:border-cyan-400 transition-colors">
              {getStatusIcon(step.status)}
            </div>

            {/* Step Content Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-white/20 transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                    {getStepIcon(step.step)}
                  </div>
                  <span className="text-xs font-mono uppercase font-bold text-slate-300">
                    {step.label}
                  </span>
                  {getStatusBadge(step.status)}
                </div>

                {step.evidenceRef && (
                  <span className="text-[11px] font-mono text-cyan-300/80 truncate max-w-xs">
                    Ref: {step.evidenceRef}
                  </span>
                )}
              </div>

              <div className="text-xs font-bold text-white mt-1.5 font-sans">
                {step.title}
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                {step.content}
              </p>
            </div>

            {/* Connecting Arrow (except last step) */}
            {idx < steps.length - 1 && (
              <div className="flex justify-center -mb-2 mt-1 opacity-40">
                <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
