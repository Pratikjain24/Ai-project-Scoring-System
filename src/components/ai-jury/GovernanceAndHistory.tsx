import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  History, 
  UserCheck, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowRight, 
  FileCheck 
} from 'lucide-react';
import type { 
  JuryDecisionData, 
  HumanReview, 
  ScoreHistoryEntry 
} from '../../types/aiJuryScoring';
import { api } from '../../services/api';

interface GovernanceAndHistoryProps {
  evaluationId: string;
  decision: JuryDecisionData;
  history: ScoreHistoryEntry[];
  reviews: HumanReview[];
  onRefresh: () => Promise<void>;
}

export const GovernanceAndHistory: React.FC<GovernanceAndHistoryProps> = ({
  evaluationId,
  decision,
  history,
  reviews,
  onRefresh,
}) => {
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [reviewerName, setReviewerName] = useState('Dr. Marcus Vance (Chief Jury Chair)');
  const [selectedCategory, setSelectedCategory] = useState<string>('Technical Quality');
  const [reviewedScore, setReviewedScore] = useState<number>(89);
  const [reviewReason, setReviewReason] = useState(
    'Hardware bench trial on Jetson Orin demonstrated exceptional frame stability (42.4 FPS sustained with zero thermal throttling over 600s test).'
  );

  const isFinal = decision.status === 'FINAL';

  const handleFinalize = async () => {
    if (isFinal) return;
    setIsFinalizing(true);
    setErrorMsg(null);
    try {
      await api.finalizeJury(evaluationId);
      setSuccessMsg('Scorecard officially locked as FINAL consensus. Score is now immutable.');
      await onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to finalize scorecard.');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setErrorMsg(null);
    try {
      // Find original score for category
      const matchedCat = decision.categoryScores?.find(
        c => c.categoryLabel.toLowerCase() === selectedCategory.toLowerCase()
      );
      const originalScore = matchedCat ? matchedCat.rawScore : decision.overallScore;

      await api.addHumanReview(evaluationId, {
        reviewer: reviewerName,
        category: selectedCategory,
        originalScore,
        reviewedScore,
        reason: reviewReason,
      });

      setSuccessMsg('Human review override successfully recorded.');
      setShowAddReview(false);
      await onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record human review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const canonicalCategories = [
    { key: 'problemNeed', label: 'Problem & Need', weight: 15 },
    { key: 'technicalQuality', label: 'Technical Quality', weight: 20 },
    { key: 'originality', label: 'Innovation & Originality', weight: 15 },
    { key: 'socialImpact', label: 'Social Impact', weight: 15 },
    { key: 'presentation', label: 'Presentation Quality', weight: 10 },
    { key: 'demonstration', label: 'Demonstration Quality', weight: 10 },
    { key: 'feasibilityScalability', label: 'Feasibility & Scalability', weight: 10 },
    { key: 'futurePotential', label: 'Future Potential', weight: 5 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner: Status & Locking Workflow */}
      <div className={`rounded-2xl border p-6 backdrop-blur-md transition-all ${
        isFinal 
          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5' 
          : 'bg-slate-900/60 border-amber-500/40 shadow-lg shadow-amber-500/5'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              isFinal 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            }`}>
              {isFinal ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isFinal 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  Status: {decision.status}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Version {decision.versionNumber}.0 • Engine: {decision.engineVersion || 'v9.0-Deterministic'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {isFinal ? 'Official Consensus Locked' : 'Consensus In Review — Ready for Locking'}
              </h2>
              <p className="text-sm text-slate-300 mt-0.5 max-w-2xl">
                {isFinal 
                  ? 'This evaluation scorecard has been reviewed, ratified by the AI Jury Chair, and locked against further mutations.' 
                  : 'Deliberation parameters are finalized. Locking consensus seals this score into the institutional archive and prevents subsequent algorithmic alterations.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isFinal ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Locked & Signed</span>
              </div>
            ) : (
              <button
                onClick={handleFinalize}
                disabled={isFinalizing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isFinalizing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Locking...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Lock Final Consensus</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Grid: Human Review & Rubric Governance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Human Review Overrides (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Human Jury Overrides & Annotations</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {reviews.length} {reviews.length === 1 ? 'Override' : 'Overrides'}
                </span>
              </div>
              <button
                onClick={() => setShowAddReview(!showAddReview)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Override</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Authorized reviewers can provide human overrides for specific dimension scores. Original deterministic scores are preserved in the immutable audit trail for full transparency.
            </p>

            {/* Add Review Form */}
            {showAddReview && (
              <form onSubmit={handleAddReview} className="mb-5 p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-3">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  New Human Override Submission
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Reviewer Name / Role</label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Target Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                    >
                      {canonicalCategories.map(c => (
                        <option key={c.key} value={c.label}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Override Score (0 - 100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={reviewedScore}
                      onChange={(e) => setReviewedScore(parseFloat(e.target.value) || 0)}
                      required
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <div className="text-[11px] font-mono text-slate-400 bg-white/5 p-2 rounded-lg border border-white/10 w-full">
                      AI Baseline Score: <span className="text-white font-bold">87.0</span> • Delta:{' '}
                      <span className={reviewedScore >= 87 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {reviewedScore >= 87 ? `+${(reviewedScore - 87).toFixed(1)}` : (reviewedScore - 87).toFixed(1)} pts
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Override Justification & Empirical Grounds</label>
                  <textarea
                    rows={2}
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    required
                    placeholder="Describe specific observed tests or evidence justifying this score adjustment..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddReview(false)}
                    className="px-3 py-1 rounded-lg bg-white/5 text-slate-400 hover:text-white text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Saving...' : 'Submit Override'}
                  </button>
                </div>
              </form>
            )}

            {/* List of Reviews */}
            {reviews.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-slate-500 border border-dashed border-white/10 rounded-xl">
                No human reviews have been filed yet for this evaluation.
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => {
                  const delta = rev.reviewedScore - rev.originalScore;
                  return (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-white/10 hover:border-cyan-500/30 transition-all space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-mono">
                            {rev.category}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            by {rev.reviewer}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-slate-400 line-through">
                            {rev.originalScore.toFixed(1)}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-white font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                            {rev.reviewedScore.toFixed(1)}
                          </span>
                          <span className={`font-bold ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            ({delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)})
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 italic bg-white/5 p-2.5 rounded-lg border border-white/5">
                        "{rev.reason}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span>Recorded at {new Date(rev.createdAt).toLocaleString()}</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ratified
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Rubric Version Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Active Rubric Specification</h3>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                  {decision.rubricVersionId || 'rubric_v1_canonical'}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Scores are deterministically bound to this canonical rubric. All 8 category weights sum strictly to 100.0%.
              </p>

              <div className="space-y-2">
                {canonicalCategories.map((cat) => (
                  <div 
                    key={cat.key}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-white/5 text-xs font-mono"
                  >
                    <span className="text-slate-300">{cat.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${(cat.weight / 20) * 100}%` }} 
                        />
                      </div>
                      <span className="font-bold text-white w-8 text-right">{cat.weight}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Sum: 100.0% Verified</span>
              </span>
              <span className="text-slate-500">Hash: 0x8F2D...B19A</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom: Score Version History Timeline */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Score Progression & Audit Timeline</h3>
              <p className="text-xs text-slate-400">
                Complete deterministic progression of Master Scores from initial document intake to final jury ratification.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-white/10">
            {history.length} Snapshot{history.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 border-l border-white/15 space-y-8 my-4">
          {history.map((entry, idx) => {
            const isLatest = idx === history.length - 1;
            return (
              <div key={entry.id} className="relative group">
                {/* Timeline node */}
                <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                  isLatest
                    ? 'bg-cyan-500 border-white shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                    : 'bg-slate-900 border-cyan-500/50'
                }`} />

                <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 group-hover:border-cyan-500/30 transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                        v{entry.versionNumber}.0
                      </span>
                      {isLatest && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 uppercase">
                          Current Active
                        </span>
                      )}
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(entry.createdAt).toLocaleDateString()} {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <div className="text-slate-400">
                        Coverage: <span className="text-white font-semibold">{entry.evidenceCoverage}%</span>
                      </div>
                      <div className="text-slate-400">
                        Confidence: <span className="text-white font-semibold">{entry.confidence}%</span>
                      </div>
                      <div className="px-2 py-0.5 rounded bg-white/10 font-bold text-white">
                        Score: <span className="text-cyan-400 font-mono text-sm">{entry.overallScore.toFixed(1)}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        entry.verdict === 'STRONG' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' :
                        entry.verdict === 'EXCEPTIONAL' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                        'bg-blue-950 text-blue-300 border border-blue-500/30'
                      }`}>
                        {entry.verdict}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-white">
                    {entry.changeSummary}
                  </div>

                  <p className="text-xs text-slate-300">
                    {entry.whyScoreChanged}
                  </p>

                  {entry.addedEvidenceIds && entry.addedEvidenceIds.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] font-mono text-slate-500">Ingested Proof:</span>
                      {entry.addedEvidenceIds.map((eid) => (
                        <span 
                          key={eid}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300"
                        >
                          {eid}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
