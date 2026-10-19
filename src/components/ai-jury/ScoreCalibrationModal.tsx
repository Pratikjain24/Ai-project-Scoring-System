import React, { useState } from 'react';
import {
  X,
  Sliders,
  Scale,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export interface CategoryScoreItem {
  category: string;
  label: string;
  score: number;
  weight?: number;
}

interface ScoreCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationId: string;
  categories: CategoryScoreItem[];
  onSaved: () => void;
}

export const ScoreCalibrationModal: React.FC<ScoreCalibrationModalProps> = ({
  isOpen,
  onClose,
  evaluationId,
  categories,
  onSaved,
}) => {
  const { currentUser, isJudge } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0]?.category || 'INNOVATION_RESEARCH'
  );
  
  const currentCategoryObj = categories.find((c) => c.category === selectedCategory) || categories[0];
  const originalAiScore = Math.round(currentCategoryObj?.score || 75);

  const [calibratedScore, setCalibratedScore] = useState<number>(originalAiScore);
  const [rationale, setRationale] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // When category changes, reset score
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const catObj = categories.find((c) => c.category === cat);
    setCalibratedScore(Math.round(catObj?.score || 75));
    setErrorMsg(null);
  };

  if (!isOpen) return null;

  const scoreDelta = calibratedScore - originalAiScore;
  const isReasonSufficient = rationale.trim().length >= 15;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReasonSufficient) {
      setErrorMsg('Mandatory audit policy: Please provide at least 15 characters of academic/technical rationale.');
      return;
    }
    if (!isJudge) {
      setErrorMsg('Unauthorized: Only Lead Reviewers, Jurors, and Admins can calibrate scores.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.saveHumanReview(evaluationId, {
        reviewerId: currentUser.id,
        reviewerName: currentUser.name,
        reviewerRole: currentUser.role,
        category: selectedCategory,
        calibratedScore,
        notes: rationale.trim(),
        verdict: calibratedScore >= 80 ? 'APPROVED' : calibratedScore >= 60 ? 'CONDITIONAL' : 'REJECTED',
      });

      setSuccessMsg(`Score calibration for ${currentCategoryObj?.label || selectedCategory} recorded successfully!`);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit score calibration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#090D17] border border-cyan-500/40 p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 uppercase tracking-widest font-bold flex items-center gap-1">
                <Scale className="w-3 h-3" />
                Human Reviewer Gate
              </span>
              <span className="text-xs font-mono text-slate-400">
                Institutional Audit Policy v2.4
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Calibrate Evaluation Score
            </h2>
            <p className="text-xs text-slate-400">
              Logged as <strong className="text-cyan-400">{currentUser.name}</strong> ({currentUser.roleLabel}). All overrides are cryptographically timestamped in the audit trail.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error / Success Banners */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!isJudge && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Your current persona (<strong>{currentUser.role}</strong>) does not have score override authority. Switch to <strong>Dr. Evelyn Reed</strong> (Lead Reviewer) or <strong>Marcus Vance</strong> (Juror) in the top bar to calibrate scores.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Select Dimension / Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = cat.category === selectedCategory;
                return (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => handleCategoryChange(cat.category)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950/50'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-medium truncate">{cat.label}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      AI: {Math.round(cat.score)}/100
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Score Comparison Display */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10 items-center text-center">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Original AI Score</span>
              <span className="text-2xl font-extrabold text-slate-300 font-mono">{originalAiScore}</span>
              <span className="text-[10px] text-slate-500 font-mono"> / 100</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <ArrowRight className="w-5 h-5 text-slate-500" />
              <span
                className={`text-xs font-mono font-bold mt-1 ${
                  scoreDelta > 0
                    ? 'text-emerald-400'
                    : scoreDelta < 0
                    ? 'text-red-400'
                    : 'text-slate-400'
                }`}
              >
                {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} pts
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase block">Calibrated Score</span>
              <span className="text-2xl font-extrabold text-cyan-400 font-mono">{calibratedScore}</span>
              <span className="text-[10px] text-slate-500 font-mono"> / 100</span>
            </div>
          </div>

          {/* Score Adjustment Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Adjust Calibrated Score
              </span>
              <span className="font-mono text-cyan-400 font-bold">{calibratedScore} / 100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={calibratedScore}
              disabled={!isJudge}
              onChange={(e) => setCalibratedScore(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 (Deficient)</span>
              <span>50 (Acceptable)</span>
              <span>80 (Superior)</span>
              <span>100 (Exemplary)</span>
            </div>
          </div>

          {/* Mandatory Rationale Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Calibration Rationale & Justification</span>
                <span className="text-red-400">*</span>
              </label>
              <span
                className={`text-[10px] font-mono ${
                  isReasonSufficient ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {rationale.trim().length} / 15 chars min
              </span>
            </div>
            <textarea
              rows={3}
              value={rationale}
              disabled={!isJudge}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="e.g., Live demonstration and benchmark telemetry proved sustained 60 FPS inference under high occlusion, exceeding AI's conservative evaluation..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-40"
            />
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-cyan-500/70 shrink-0" />
              All calibrations are immutably recorded in the institutional audit log with your persona credentials.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !isReasonSufficient || !isJudge}
              className="shadow-lg shadow-cyan-500/20"
            >
              {isSubmitting ? 'Recording Audit Event...' : 'Commit Score Calibration'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
