import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Lock, 
  FileQuestion, 
  CheckCircle, 
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import { api } from '../../services/api';
import type { EvidenceRequestRecord } from '../../types/integration';

interface HumanReviewDrawerProps {
  evaluationId: string;
  isOpen: boolean;
  onClose: () => void;
  onFinalized?: () => void;
  onEvidenceRequested?: () => void;
}

export const HumanReviewDrawer: React.FC<HumanReviewDrawerProps> = ({
  evaluationId,
  isOpen,
  onClose,
  onFinalized,
  onEvidenceRequested
}) => {
  const [requests, setRequests] = useState<EvidenceRequestRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [submittingReq, setSubmittingReq] = useState(false);
  
  // Evidence Request Form State
  const [showReqForm, setShowReqForm] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqPriority, setReqPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  // Reviewer Note
  const [reviewerNote, setReviewerNote] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchEvidenceRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getEvidenceRequests(evaluationId);
      setRequests(data);
    } catch (err) {
      console.error('[HumanReviewDrawer] Fetch requests failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && evaluationId) {
      fetchEvidenceRequests();
    }
  }, [isOpen, evaluationId]);

  const handleFinalize = async () => {
    if (!confirm('Are you sure you want to finalize this evaluation? This will lock all scores, jury decisions, and reports into an immutable FINAL state.')) {
      return;
    }

    try {
      setFinalizing(true);
      await api.finalizeEvaluation(evaluationId, 'rev_institutional_lead', reviewerNote);
      setActionSuccessMsg('Evaluation finalized successfully! Scores are now permanently locked.');
      if (onFinalized) onFinalized();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(`Finalization failed: ${err.message || err}`);
    } finally {
      setFinalizing(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle || !reqDesc) return;

    try {
      setSubmittingReq(true);
      await api.createEvidenceRequest(evaluationId, {
        title: reqTitle,
        description: reqDesc,
        priority: reqPriority,
        requestedBy: 'Institutional Reviewer'
      });
      setReqTitle('');
      setReqDesc('');
      setShowReqForm(false);
      setActionSuccessMsg('Evidence request registered and dispatched to project team.');
      await fetchEvidenceRequests();
      if (onEvidenceRequested) onEvidenceRequested();
    } catch (err: any) {
      alert(`Failed to create request: ${err.message || err}`);
    } finally {
      setSubmittingReq(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border-l border-slate-700/80 h-full shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Human Review & Ratification</h3>
              <p className="text-xs text-slate-400">
                Gatekeeper Workflow: <span className="font-mono text-cyan-400">READY_FOR_REVIEW → FINAL</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Score & Verdict Snapshot */}
        <div className="p-6 bg-slate-950/40 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">AI Recommended Master Score</div>
              <div className="text-3xl font-bold font-mono text-white mt-1 flex items-baseline gap-2">
                <span>83.7</span>
                <span className="text-sm font-normal text-slate-400">/ 100</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold font-sans ml-2">
                  STRONG
                </span>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs text-slate-400">
                Confidence: <strong className="text-cyan-400">86% (HIGH)</strong>
              </div>
              <div className="text-xs text-slate-400">
                Evidence Coverage: <strong className="text-emerald-400">81%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {actionSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {/* Action 1: Ratify & Finalize */}
          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              1. Approve & Finalize Evaluation
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Once approved, the evaluation transitions to <code className="text-amber-300">FINAL</code>. The Master Score, Jury Verdict, and 22-section Report become tamper-proof and locked against unversioned modification.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-300">Institutional Reviewer Note (Optional)</label>
              <textarea
                value={reviewerNote}
                onChange={(e) => setReviewerNote(e.target.value)}
                placeholder="e.g., Reviewed Jetson Orin edge logs and verified collision reduction telemetry. Approved for municipal grant funding."
                className="w-full text-xs p-3 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                rows={2}
              />
            </div>

            <button
              onClick={handleFinalize}
              disabled={finalizing}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              {finalizing ? 'Finalizing & Locking...' : 'Approve & Lock Evaluation (FINAL)'}
            </button>
          </div>

          {/* Action 2: Evidence Requests */}
          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-amber-400" />
                2. Request Additional Evidence
              </h4>
              <button
                onClick={() => setShowReqForm(!showReqForm)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {showReqForm ? 'Cancel' : 'New Request'}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Request datasets, hardware specifications, test results, or security audits to fill identified evidence gaps.
            </p>

            {showReqForm && (
              <form onSubmit={handleCreateRequest} className="p-3.5 rounded-lg bg-slate-900 border border-slate-700 space-y-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Request Title</label>
                  <input
                    type="text"
                    value={reqTitle}
                    onChange={(e) => setReqTitle(e.target.value)}
                    placeholder="e.g., Provide Jetson thermal test log under 45°C ambient"
                    required
                    className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Detailed Description</label>
                  <textarea
                    value={reqDesc}
                    onChange={(e) => setReqDesc(e.target.value)}
                    placeholder="Specify the testing methodology and telemetry format needed to corroborate Claim #7."
                    required
                    rows={2}
                    className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-400 font-medium">Priority:</label>
                    <select
                      value={reqPriority}
                      onChange={(e: any) => setReqPriority(e.target.value)}
                      className="text-xs p-1 rounded bg-slate-800 border border-slate-700 text-slate-200"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReq}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                  >
                    {submittingReq ? 'Submitting...' : 'Dispatch Request'}
                  </button>
                </div>
              </form>
            )}

            {/* List of active requests */}
            <div className="space-y-2 mt-2">
              {loading ? (
                <div className="text-xs text-slate-400 text-center py-2 animate-pulse">
                  Loading evidence requests...
                </div>
              ) : requests.length > 0 ? (
                requests.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg bg-slate-900/70 border border-slate-700/60 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{r.title}</span>
                        <span className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                          r.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {r.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{r.description}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {r.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 text-center py-2">
                  No active evidence requests pending.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>ProjectX-Ray Reviewer Service</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
};
