import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  XCircle,
  FileText,
  Video,
  Code2,
  UserCheck,
  Database,
  ArrowRight,
  CheckCircle2,
  Send,
  History,
  Layers,
  Sparkles
} from 'lucide-react';
import type {
  ClaimDetailBundle,
  BackendClaimStatus,
} from '../../types/claimVerification';
import { api } from '../../services/api';

interface ClaimDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationId: string;
  claimId: string | null;
  onClaimUpdated?: () => void;
}

export const ClaimDetailDrawer: React.FC<ClaimDetailDrawerProps> = ({
  isOpen,
  onClose,
  evaluationId,
  claimId,
  onClaimUpdated,
}) => {
  const [detail, setDetail] = useState<ClaimDetailBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'evidence' | 'benchmarks' | 'audit'>('evidence');

  // Human Review Override form state
  const [reviewerName, setReviewerName] = useState('Juror #3 (Lead Technical Auditor)');
  const [overrideStatus, setOverrideStatus] = useState<BackendClaimStatus>('PARTIALLY_VERIFIED');
  const [overrideReason, setOverrideReason] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && claimId) {
      loadClaimDetail(claimId);
    } else {
      setDetail(null);
      setReviewSuccess(null);
    }
  }, [isOpen, claimId, evaluationId]);

  const loadClaimDetail = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.getClaimDetail(evaluationId, id);
      if (res) {
        setDetail(res);
        if (res.claim?.status) {
          setOverrideStatus(res.claim.status as BackendClaimStatus);
        }
      }
    } catch (err) {
      console.error('Failed to load claim detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHumanReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimId || !overrideReason.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await api.submitClaimHumanReview(
        evaluationId,
        claimId,
        reviewerName,
        overrideStatus,
        overrideReason
      );

      if (res && res.success) {
        setReviewSuccess('Human review override recorded in permanent immutable audit log.');
        setOverrideReason('');
        // Reload details to reflect new version & human review entry
        await loadClaimDetail(claimId);
        if (onClaimUpdated) onClaimUpdated();
      }
    } catch (err) {
      console.error('Failed to submit human review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!isOpen) return null;

  const claim = detail?.claim;
  const verification = detail?.verification;
  const parameters = detail?.parameters;
  const benchmarks = detail?.benchmarks || [];
  const contradictions = detail?.contradictions || [];
  const versions = detail?.versions || [];
  const humanReviews = detail?.humanReviews || [];

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            VERIFIED
          </span>
        );
      case 'PARTIALLY_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            PARTIALLY VERIFIED
          </span>
        );
      case 'UNVERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            UNVERIFIED
          </span>
        );
      case 'CONTRADICTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            CONTRADICTED
          </span>
        );
      case 'INSUFFICIENT_EVIDENCE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            INSUFFICIENT EVIDENCE
          </span>
        );
    }
  };

  const getImportanceBadge = (importance?: string) => {
    switch (importance) {
      case 'CRITICAL':
        return <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">CRITICAL</span>;
      case 'HIGH':
        return <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">MEDIUM</span>;
      default:
        return <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 border border-slate-500/30">LOW</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-3xl bg-[#090D16] border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 bg-[#0C121F]/80 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge(claim?.status)}
              {getImportanceBadge(claim?.importance)}
              <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/50">
                {claim?.claimType || 'CLAIM'}
              </span>
              <span className="text-xs font-mono text-slate-500">ID: {claim?.id}</span>
            </div>
            <h2 className="text-base font-semibold text-slate-100 leading-snug">
              {claim?.claimText || 'Loading claim...'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 bg-[#0A0E18] px-6">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'evidence'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Verification & Evidence
          </button>
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'benchmarks'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Benchmarks & Contradictions ({benchmarks.length + contradictions.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            Audit Trail & Juror Override ({versions.length + humanReviews.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <p className="text-xs font-mono text-cyan-400">Loading claim telemetry & truth analysis...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: Verification & Evidence */}
              {activeTab === 'evidence' && (
                <div className="space-y-6">
                  {/* Scores & Confidence Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[11px] font-mono text-slate-400 uppercase">Verification Score</div>
                      <div className="text-2xl font-bold text-cyan-400 mt-1">
                        {verification?.verificationScore ?? claim?.confidence ?? '--'}%
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Empirical formula</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[11px] font-mono text-slate-400 uppercase">Confidence</div>
                      <div className="text-2xl font-bold text-emerald-400 mt-1">
                        {verification?.confidence ?? claim?.confidence ?? '--'}%
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Evidence certitude</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[11px] font-mono text-slate-400 uppercase">Methodology</div>
                      <div className="text-2xl font-bold text-indigo-400 mt-1">
                        {verification?.methodologyScore ?? 70}%
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">10-point checklist</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[11px] font-mono text-slate-400 uppercase">Consistency</div>
                      <div className="text-2xl font-bold text-amber-400 mt-1">
                        {verification?.consistencyScore ?? 80}%
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Cross-modal sync</div>
                    </div>
                  </div>

                  {/* Multi-Modal Evidence Support Matrix */}
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                    <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      Multi-Modal Evidence Triangulation
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {/* Video Demo Support */}
                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center gap-1.5 font-medium text-slate-300">
                            <Video className="w-3.5 h-3.5 text-blue-400" />
                            Live Demo Support
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-200">
                          {verification?.demoSupport === 'CONFIRMED' && (
                            <span className="text-emerald-400">✓ Confirmed in Demo</span>
                          )}
                          {verification?.demoSupport === 'PARTIAL' && (
                            <span className="text-amber-400">⚡ Partial Observation</span>
                          )}
                          {verification?.demoSupport === 'NOT_DEMONSTRATED' && (
                            <span className="text-slate-400">○ Not Demonstrated</span>
                          )}
                          {verification?.demoSupport === 'CONTRADICTED' && (
                            <span className="text-rose-400">✕ Contradicted in Demo</span>
                          )}
                        </div>
                        {verification?.demoTimestamp && (
                          <div className="text-[10px] font-mono text-slate-500 mt-1">
                            Timestamp: {verification.demoTimestamp}
                          </div>
                        )}
                      </div>

                      {/* Document Support */}
                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center gap-1.5 font-medium text-slate-300">
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            Document Evidence
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-200">
                          {verification?.documentSupport === 'FULL' && (
                            <span className="text-emerald-400">✓ Fully Documented</span>
                          )}
                          {verification?.documentSupport === 'PARTIAL' && (
                            <span className="text-amber-400">⚡ Partially Documented</span>
                          )}
                          {verification?.documentSupport === 'ABSENT' && (
                            <span className="text-slate-400">○ Absent from Docs</span>
                          )}
                          {verification?.documentSupport === 'CONFLICTING' && (
                            <span className="text-rose-400">✕ Conflicting Docs</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Pitch deck / Whitepaper
                        </div>
                      </div>

                      {/* Code Support */}
                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center gap-1.5 font-medium text-slate-300">
                            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                            Code Repository
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-200">
                          {verification?.codeSupport === 'SUPPORTED' && (
                            <span className="text-emerald-400">✓ Verified in Source</span>
                          )}
                          {verification?.codeSupport === 'UNSUPPORTED' && (
                            <span className="text-amber-400">⚡ Uncorroborated Code</span>
                          )}
                          {verification?.codeSupport === 'NONE' && (
                            <span className="text-slate-400">○ No Source Match</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          AST parser verification
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Empirical Normalized Parameters */}
                  {parameters && (
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                      <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Empirical Normalized Parameters
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        {parameters.subject && (
                          <div className="p-2 rounded bg-slate-950/50 border border-slate-800/60">
                            <span className="text-slate-500 block text-[10px]">Subject</span>
                            <span className="font-mono text-slate-200">{parameters.subject}</span>
                          </div>
                        )}
                        {parameters.metric && (
                          <div className="p-2 rounded bg-slate-950/50 border border-slate-800/60">
                            <span className="text-slate-500 block text-[10px]">Metric</span>
                            <span className="font-mono text-cyan-300">{parameters.metric}</span>
                          </div>
                        )}
                        {parameters.value && (
                          <div className="p-2 rounded bg-slate-950/50 border border-slate-800/60">
                            <span className="text-slate-500 block text-[10px]">Target Value</span>
                            <span className="font-mono text-emerald-300">{parameters.value} {parameters.unit || ''}</span>
                          </div>
                        )}
                        {parameters.dataset && (
                          <div className="p-2 rounded bg-slate-950/50 border border-slate-800/60">
                            <span className="text-slate-500 block text-[10px]">Dataset Baseline</span>
                            <span className="font-mono text-slate-200">{parameters.dataset}</span>
                          </div>
                        )}
                        {parameters.condition && (
                          <div className="p-2 rounded bg-slate-950/50 border border-slate-800/60">
                            <span className="text-slate-500 block text-[10px]">Operational Condition</span>
                            <span className="font-mono text-slate-200">{parameters.condition}</span>
                          </div>
                        )}
                        {parameters.evaluationMethod && (
                          <div className="p-2 rounded bg-slate-950/50 border border-slate-800/60">
                            <span className="text-slate-500 block text-[10px]">Evaluation Method</span>
                            <span className="font-mono text-slate-200">{parameters.evaluationMethod}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verification Analytical Verdict */}
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                    <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      Analytical Evaluation Verdict
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {verification?.explanation || claim?.explanation || 'Evaluation completed based on available project artefacts.'}
                    </p>
                  </div>

                  {/* Missing Evidence Gaps */}
                  {verification?.missingEvidence && verification.missingEvidence.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/30 space-y-2">
                      <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Missing Empirical Evidence
                      </div>
                      <ul className="space-y-1.5 text-xs text-amber-200/80">
                        {verification.missingEvidence.map((gap, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-400 mt-0.5">•</span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Judge Question */}
                  {(verification?.recommendedJudgeQuestion || claim?.recommendedJudgeQuestion) && (
                    <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/30 space-y-2">
                      <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-cyan-400" />
                        Targeted Judge Inquiry for Live Q&A
                      </div>
                      <blockquote className="text-sm italic text-cyan-100 font-serif border-l-2 border-cyan-400 pl-3">
                        "{verification?.recommendedJudgeQuestion || claim?.recommendedJudgeQuestion}"
                      </blockquote>
                      <p className="text-[11px] text-cyan-300/60 mt-1">
                        Addresses unverified bounds without assuming bad faith or accusatory terminology.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Benchmarks & Contradictions */}
              {activeTab === 'benchmarks' && (
                <div className="space-y-6">
                  {/* Peer Research Benchmarks */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Database className="w-4 h-4 text-cyan-400" />
                        Peer Research & External Benchmarks ({benchmarks.length})
                      </h3>
                    </div>

                    {benchmarks.length === 0 ? (
                      <div className="p-6 text-center rounded-xl bg-slate-900/30 border border-slate-800 text-slate-500 text-xs">
                        No external peer benchmarks linked to this claim yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {benchmarks.map((bm) => (
                          <div
                            key={bm.id}
                            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-xs font-semibold text-slate-100">{bm.benchmarkSource}</h4>
                                <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                                  Metric: {bm.metric} | Baseline Value: {bm.value}
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                  bm.comparability === 'DIRECTLY_COMPARABLE'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {bm.comparability}
                              </span>
                            </div>
                            {bm.dataset && (
                              <div className="text-xs text-slate-400">
                                <span className="text-slate-500">Dataset/Environment:</span> {bm.dataset}
                              </div>
                            )}
                            {bm.notes && (
                              <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded border border-slate-800/60">
                                {bm.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contradictions & Discrepancies */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Detected Contradictions & Metric Divergences ({contradictions.length})
                    </h3>

                    {contradictions.length === 0 ? (
                      <div className="p-6 text-center rounded-xl bg-slate-900/30 border border-slate-800 text-slate-500 text-xs">
                        No cross-modal or internal contradictions detected for this claim.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {contradictions.map((c) => (
                          <div
                            key={c.id}
                            className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-rose-300">
                                Conflict Type: {c.conflictType}
                              </span>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                  c.severity === 'CRITICAL' || c.severity === 'HIGH'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                {c.severity} SEVERITY
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                                <span className="text-slate-400 font-mono text-[10px] block">
                                  Source A: {c.sourceA}
                                </span>
                                <p className="text-slate-200 mt-1">"{c.statementA}"</p>
                              </div>
                              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                                <span className="text-slate-400 font-mono text-[10px] block">
                                  Source B: {c.sourceB}
                                </span>
                                <p className="text-slate-200 mt-1">"{c.statementB}"</p>
                              </div>
                            </div>

                            <div className="text-xs text-rose-200/90 bg-rose-950/40 p-2 rounded border border-rose-800/40">
                              <span className="font-semibold text-rose-300">Divergence: </span>
                              {c.difference}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Audit Trail & Juror Override */}
              {activeTab === 'audit' && (
                <div className="space-y-6">
                  {/* Juror Human Review Form */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-800/40 space-y-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                        Juror Verification Override & Audit Check
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400">
                      As an authoritative juror, you can calibrate this claim's verification status based on live interview answers or physical inspection. All changes are logged immutably.
                    </p>

                    {reviewSuccess && (
                      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{reviewSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleHumanReviewSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-mono text-slate-400 block mb-1">
                            Reviewer / Juror Identity
                          </label>
                          <input
                            type="text"
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono text-slate-400 block mb-1">
                            New Calibrated Status
                          </label>
                          <select
                            value={overrideStatus}
                            onChange={(e) => setOverrideStatus(e.target.value as BackendClaimStatus)}
                            className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                          >
                            <option value="VERIFIED">VERIFIED</option>
                            <option value="PARTIALLY_VERIFIED">PARTIALLY_VERIFIED</option>
                            <option value="UNVERIFIED">UNVERIFIED</option>
                            <option value="CONTRADICTED">CONTRADICTED</option>
                            <option value="INSUFFICIENT_EVIDENCE">INSUFFICIENT_EVIDENCE</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-mono text-slate-400 block mb-1">
                          Auditor Justification (Required)
                        </label>
                        <textarea
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                          placeholder="Provide empirical justification (e.g., Live demonstration in booth confirmed 22ms inference under rainy test feed)..."
                          rows={3}
                          className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                          required
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingReview || !overrideReason.trim()}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-xs font-semibold text-white transition-colors shadow-lg shadow-cyan-900/30"
                        >
                          {submittingReview ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Recording Override...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              Commit Juror Review
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Version Audit Log */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <History className="w-4 h-4 text-cyan-400" />
                      Claim Version & Override Audit Trail ({versions.length + humanReviews.length})
                    </h3>

                    <div className="space-y-2">
                      {humanReviews.map((hr) => (
                        <div
                          key={hr.id}
                          className="p-3 rounded-lg bg-slate-950/80 border border-cyan-900/40 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px] text-cyan-400">
                            <span className="font-semibold flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5" />
                              {hr.reviewerName}
                            </span>
                            <span className="text-slate-500 font-mono">
                              {new Date(hr.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="text-slate-400">{hr.oldStatus}</span>
                            <ArrowRight className="w-3 h-3 text-cyan-400" />
                            <span className="text-emerald-400 font-semibold">{hr.newStatus}</span>
                          </div>
                          <p className="text-slate-300 text-xs italic bg-slate-900/50 p-2 rounded border border-slate-800/50 mt-1">
                            "{hr.reason}"
                          </p>
                        </div>
                      ))}

                      {versions.map((ver) => (
                        <div
                          key={ver.id}
                          className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-mono">Version v{ver.versionNumber}</span>
                            <span className="text-slate-500 font-mono">
                              {new Date(ver.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-slate-300">
                            Status: <span className="font-mono text-cyan-300">{ver.status}</span>
                          </div>
                          <div className="text-slate-500 text-[11px]">{ver.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
