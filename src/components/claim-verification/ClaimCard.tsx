import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  FileCode2, 
  ExternalLink, 
  Sparkles,
  Link,
  BookOpen,
  Info
} from 'lucide-react';
import type { ProjectClaim, ClaimStatus } from '../../types/claimVerification';
import { EvidenceChainVisualizer } from './EvidenceChainVisualizer';
import { AskTheJudgePanel } from './AskTheJudgePanel';

interface ClaimCardProps {
  claim: ProjectClaim;
  isExpandedDefault?: boolean;
  onAddToDocket?: (question: string) => void;
  isInDocket?: boolean;
  onOpenDetail?: (claimId: string) => void;
}

const getStatusBadge = (status: ClaimStatus) => {
  switch (status) {
    case 'verified':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 shadow-sm shadow-emerald-950">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Verified
        </span>
      );
    case 'partially-verified':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 shadow-sm shadow-amber-950">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Partially Verified
        </span>
      );
    case 'unverified':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-500/10 border border-slate-500/30 text-slate-300 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          Unverified in Code
        </span>
      );
    case 'contradicted':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-1.5 shadow-sm shadow-rose-950">
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          Contradicted
        </span>
      );
    case 'insufficient-evidence':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
          Insufficient Evidence
        </span>
      );
  }
};

export const ClaimCard: React.FC<ClaimCardProps> = ({
  claim,
  isExpandedDefault = false,
  onAddToDocket,
  isInDocket = false,
  onOpenDetail,
}) => {
  const [isExpanded, setIsExpanded] = useState(isExpandedDefault);
  const [activeTab, setActiveTab] = useState<'evidence' | 'chain' | 'judge'>('evidence');

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/40 overflow-hidden">
      {/* Top Claim Card Body */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Header Strip: Extracted Source, Category, Status, Confidence */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300 uppercase">
              {claim.category}
            </span>
            <span className="text-xs font-mono text-cyan-400/80">
              Extracted from: <strong className="text-slate-200">{claim.extractedFrom}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(claim.status)}

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-bold">{claim.confidence}% Conf.</span>
            </div>
          </div>
        </div>

        {/* Claim Main Text Statement */}
        <div className="space-y-1">
          <div className="text-[10.5px] uppercase font-mono tracking-wider text-slate-500">
            Factual Proposition Under Examination:
          </div>
          <h3 className="text-base sm:text-lg font-display font-bold text-white leading-snug">
            "{claim.claimText}"
          </h3>
        </div>

        {/* Quick Analytical Synthesis Verdict Banner */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Verification Verdict</span>
          </div>
          <p className="text-slate-200 leading-relaxed font-sans">
            {claim.verificationResult.verdictSummary}
          </p>

          {/* Uncertainty / Hedging Notice if present */}
          {claim.verificationResult.hedgingNotice && (
            <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-[11.5px] flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{claim.verificationResult.hedgingNotice}</span>
            </div>
          )}
        </div>

        {/* Action / View Switcher Strip */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('evidence');
                setIsExpanded(true);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all ${
                isExpanded && activeTab === 'evidence'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              Internal & External Evidence ({claim.internalEvidence.length + claim.externalEvidence.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('chain');
                setIsExpanded(true);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all ${
                isExpanded && activeTab === 'chain'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              Evidence Chain (5 Stages)
            </button>

            {claim.judgeQuestion && (
              <button
                onClick={() => {
                  setActiveTab('judge');
                  setIsExpanded(true);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1 ${
                  isExpanded && activeTab === 'judge'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-amber-950/40 text-amber-300/90 hover:text-amber-200 border border-amber-500/30'
                }`}
              >
                <span>Ask the Judge</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onOpenDetail && (
              <button
                onClick={() => onOpenDetail(claim.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 transition-all flex items-center gap-1.5 shadow-sm hover:shadow-cyan-900/40"
                title="Open comprehensive telemetry drawer, benchmarks, contradictions, and juror audit"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Deep Truth Telemetry</span>
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>{isExpanded ? 'Collapse' : 'Expand Details'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Tabs Container */}
      {isExpanded && (
        <div className="px-5 sm:px-6 pb-6 pt-3 border-t border-white/10 bg-black/20 space-y-4 animate-fadeIn">
          {/* TAB 1: Evidence (Internal & External) */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              {/* Internal Repository Evidence */}
              <div>
                <div className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Internal Project Evidence ({claim.internalEvidence.length})</span>
                </div>
                {claim.internalEvidence.length > 0 ? (
                  <div className="space-y-2.5">
                    {claim.internalEvidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                              {ev.sourceType}
                            </span>
                            <code className="text-cyan-300 font-mono text-[11px]">{ev.location}</code>
                          </div>
                          <span className="text-emerald-400 font-mono text-[11px]">
                            {ev.relevanceScore}% Relevance Match
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs">{ev.summary}</p>
                        {ev.snippet && (
                          <pre className="p-2.5 rounded-xl bg-black/80 text-[11px] font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap border border-white/5">
                            {ev.snippet}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-xs font-mono text-slate-400 italic text-center">
                    Zero internal evidence artifacts found in repository for this assertion.
                  </div>
                )}
              </div>

              {/* External Literature & Standards Evidence */}
              <div>
                <div className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>External Scientific & Industry Corroboration ({claim.externalEvidence.length})</span>
                </div>
                {claim.externalEvidence.length > 0 ? (
                  <div className="space-y-2.5">
                    {claim.externalEvidence.map((ext) => (
                      <div
                        key={ext.id}
                        className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                              {ext.sourceType}
                            </span>
                            <span className="font-semibold text-slate-200">{ext.citation}</span>
                          </div>
                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                              ext.corroborationType === 'supports'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : ext.corroborationType === 'refutes'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {ext.corroborationType}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs">{ext.summary}</p>
                        {ext.excerpt && (
                          <div className="p-2.5 rounded-xl bg-black/60 italic text-slate-300 text-[11px] border border-white/5">
                            "{ext.excerpt}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-xs font-mono text-slate-400 italic text-center">
                    No external papers or datasheets directly matched for this proprietary claim.
                  </div>
                )}
              </div>

              {/* Source Links */}
              {claim.sourceLinks.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-1.5 flex items-center gap-1">
                    <Link className="w-3 h-3 text-cyan-400" />
                    <span>Direct Evidence Source Links</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {claim.sourceLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-3 h-3 text-cyan-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Evidence Chain (5 Stages) */}
          {activeTab === 'chain' && (
            <EvidenceChainVisualizer steps={claim.evidenceChain} />
          )}

          {/* TAB 3: Ask the Judge Panel */}
          {activeTab === 'judge' && claim.judgeQuestion && (
            <AskTheJudgePanel
              question={claim.judgeQuestion}
              claimId={claim.id}
              onAddToDocket={onAddToDocket}
              isInDocket={isInDocket}
            />
          )}
        </div>
      )}
    </div>
  );
};
