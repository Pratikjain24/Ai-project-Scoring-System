import React, { useState } from 'react';
import { 
  Gavel, 
  HelpCircle, 
  Copy, 
  Check, 
  Target, 
  FileCheck2, 
  Plus,
  Sparkles
} from 'lucide-react';
import type { AskTheJudgeQuestion } from '../../types/claimVerification';

interface AskTheJudgePanelProps {
  question: AskTheJudgeQuestion;
  claimId: string;
  onAddToDocket?: (questionText: string) => void;
  isInDocket?: boolean;
}

export const AskTheJudgePanel: React.FC<AskTheJudgePanelProps> = ({
  question,
  onAddToDocket,
  isInDocket = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(question.inquiry);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getUrgencyBadge = () => {
    switch (question.urgency) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-rose-600 text-white shadow-sm shadow-rose-600/40">
            Critical Defense Inquiry
          </span>
        );
      case 'moderate':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Substantiation Required
          </span>
        );
      case 'inquisitive':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            Clarification
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-950/25 via-slate-900/90 to-rose-950/20 border border-amber-500/30 p-4 sm:p-5 backdrop-blur-md shadow-lg shadow-amber-950/20 space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Gavel className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Ask the Judge · Interrogation Generator</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-[10.5px] font-mono text-slate-400">
              Synthesized follow-up inquiry due to weak or conflicting evidence
            </div>
          </div>
        </div>

        {getUrgencyBadge()}
      </div>

      {/* Suggested Question Prompt */}
      <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/30 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-amber-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Recommended Live Jury Question:
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[10.5px] text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Question'}</span>
          </button>
        </div>
        <p className="text-sm font-serif italic text-amber-100/95 leading-relaxed">
          "{question.inquiry}"
        </p>
      </div>

      {/* Targeted Vulnerability & Required Proof */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
        {/* Vulnerability */}
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <div className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
            <Target className="w-3 h-3 text-rose-400" />
            <span>Targeted Architectural Gap:</span>
          </div>
          <p className="text-slate-300 text-[11.5px] font-sans leading-snug">
            {question.targetVulnerability}
          </p>
        </div>

        {/* Expected Evidence Artifact */}
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <div className="text-[10px] uppercase text-slate-400 flex items-center gap-1">
            <FileCheck2 className="w-3 h-3 text-emerald-400" />
            <span>Required Defense Proof:</span>
          </div>
          <p className="text-slate-300 text-[11.5px] font-sans leading-snug">
            {question.requiredProofArtifact}
          </p>
        </div>
      </div>

      {/* Action to add to Judge's Live Docket */}
      {onAddToDocket && (
        <div className="flex justify-end pt-1">
          <button
            onClick={() => onAddToDocket(question.inquiry)}
            disabled={isInDocket}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
              isInDocket
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 cursor-default'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 hover:border-amber-400'
            }`}
          >
            {isInDocket ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isInDocket ? 'Added to Jury Docket' : 'Add to Live Jury Docket'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
