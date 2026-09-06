import React from 'react';
import { Target, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';

export interface EvidenceCardProps {
  conclusion: string;
  evidence: string;
  confidence: number; // 0-100%
  source: string;
  sourceUrl?: string;
  timestampOrRef?: string;
  category?: string;
  className?: string;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  conclusion,
  evidence,
  confidence,
  source,
  sourceUrl,
  timestampOrRef,
  category,
  className = ''
}) => {
  return (
    <div className={`p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/15 transition-all space-y-3 font-sans text-xs ${className}`}>
      
      {/* 1. Conclusion */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Evaluation Conclusion</span>
          </div>
          {category && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
              {category}
            </span>
          )}
        </div>
        <p className="text-slate-200 font-medium leading-relaxed">
          {conclusion}
        </p>
      </div>

      {/* 2. Supporting Evidence */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/20 space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 font-bold uppercase">
          <Target className="w-3.5 h-3.5 text-cyan-400" />
          <span>Observed Supporting Evidence</span>
        </div>
        <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
          {evidence}
        </p>
      </div>

      {/* 3. Confidence & 4. Source */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-[11px] font-mono">
        {/* Confidence */}
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Confidence: <strong className="text-white">{confidence}%</strong></span>
        </div>

        {/* Source */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
          <span>Source:</span>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-purple-200 underline truncate max-w-[200px]"
            >
              {source}
            </a>
          ) : (
            <span className="text-slate-300 font-semibold truncate max-w-[200px]">{source}</span>
          )}
          {timestampOrRef && (
            <span className="text-cyan-400 text-[10px]">({timestampOrRef})</span>
          )}
        </div>
      </div>

    </div>
  );
};
