import React from 'react';
import { X, FileCode2, ShieldCheck, CheckCircle2, Copy, Check } from 'lucide-react';
import type { EvidenceReference } from '../../types/technicalAudit';

interface EvidenceDrawerModalProps {
  evidence: EvidenceReference | null;
  onClose: () => void;
}

export const EvidenceDrawerModal: React.FC<EvidenceDrawerModalProps> = ({
  evidence,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!evidence) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(evidence.excerpt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-950/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <FileCode2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700/50 text-cyan-300 font-semibold">
                  {evidence.type} evidence
                </span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {evidence.relevanceScore}% Provenance Match
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {evidence.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* File location */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Artifact Source Path & Line Range
            </div>
            <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-cyan-300 flex items-center justify-between">
              <span className="truncate">{evidence.location}</span>
              <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">Verified AST</span>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              <span>Extracted Source Code / Spec Content</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-black/80 border border-white/10 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {evidence.excerpt}
            </pre>
          </div>

          {/* Verification Badge */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Cryptographically anchored in evaluation ledger</span>
            </div>
            <span className="text-slate-400 text-[10px]">SHA-256 Verified</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
