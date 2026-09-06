import React, { useState } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { ChevronDown, ChevronUp, ArrowRight, HelpCircle as QuestionIcon } from 'lucide-react';

export type ClaimStatus = 'Verified' | 'Partially Verified' | 'Unverified' | 'Contradicted' | 'Insufficient Evidence';

export interface ClaimCardProps {
  claim: string;
  category: string;
  status: ClaimStatus;
  confidence: number;
  projectEvidence: string;
  externalEvidence?: string;
  sources?: { title: string; url?: string }[];
  judgeQuestion?: string;
  className?: string;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({
  claim,
  category,
  status,
  confidence,
  projectEvidence,
  externalEvidence,
  sources = [],
  judgeQuestion,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusBadge = (s: ClaimStatus) => {
    switch (s) {
      case 'Verified':
        return <Badge variant="emerald" dot>Verified</Badge>;
      case 'Partially Verified':
        return <Badge variant="amber" dot>Partially Verified</Badge>;
      case 'Unverified':
        return <Badge variant="neutral" dot>Unverified</Badge>;
      case 'Contradicted':
        return <Badge variant="rose" dot>Contradicted</Badge>;
      case 'Insufficient Evidence':
        return <Badge variant="neutral" dot>Insufficient Evidence</Badge>;
    }
  };

  return (
    <Card className={`p-5 transition-all duration-200 border-slate-800/80 hover:border-slate-700 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              {category}
            </span>
            {getStatusBadge(status)}
            <span className="text-xs text-slate-400">
              Confidence: <strong className="text-slate-200 font-mono">{confidence}%</strong>
            </span>
          </div>

          <h4 className="text-base font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900 pt-1 leading-snug">
            "{claim}"
          </h4>
        </div>
      </div>

      {/* Visual Evidence Chain */}
      <div className="mt-4 p-3 rounded-lg bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-xs">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <span>Evidence Chain:</span>
          <span className="text-cyan-400">CLAIM</span>
          <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
          <span className="text-cyan-400">PROJECT EVIDENCE</span>
          <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
          <span className="text-cyan-400">EXTERNAL SOURCES</span>
          <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
          <span className="text-cyan-400">VERDICT</span>
        </div>

        <div className="space-y-2">
          <div>
            <span className="font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">Project Internal Evidence: </span>
            <span className="text-slate-400 dark:text-slate-400 light:text-slate-600">{projectEvidence}</span>
          </div>

          {externalEvidence && (
            <div>
              <span className="font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700">External Web & Prior Art: </span>
              <span className="text-slate-400 dark:text-slate-400 light:text-slate-600">{externalEvidence}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Judge Question & Source Citations */}
      {(judgeQuestion || sources.length > 0) && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium py-1"
          >
            <span>{expanded ? 'Hide Jury Follow-up & Sources' : 'Recommended Judge Question & Sources'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="mt-3 space-y-3 pt-1 border-t border-slate-800">
              {judgeQuestion && (
                <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/50">
                  <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold mb-1">
                    <QuestionIcon className="w-3.5 h-3.5" />
                    <span>Recommended Judge Cross-Examination Question:</span>
                  </div>
                  <p className="text-xs text-slate-200 italic">
                    "{judgeQuestion}"
                  </p>
                </div>
              )}

              {sources.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Referenced Sources:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:border-cyan-500/50 transition-colors"
                      >
                        {s.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
