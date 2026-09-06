import React, { useState } from 'react';
import {
  Award,
  Scale,
  ShieldCheck,
  Sliders,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import type {
  OriginalityProfile,
  DimensionWeightConfig,
} from '../../types/originalityIntelligence';

interface MultiDimensionalScoreHeaderProps {
  profile: OriginalityProfile;
  weights: DimensionWeightConfig;
  onUpdateWeights: (newWeights: DimensionWeightConfig) => void;
  onOpenReport: () => void;
  isRecalculating?: boolean;
}

export const MultiDimensionalScoreHeader: React.FC<MultiDimensionalScoreHeaderProps> = ({
  profile,
  weights,
  onUpdateWeights,
  onOpenReport,
  isRecalculating = false,
}) => {
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [tempWeights, setTempWeights] = useState<DimensionWeightConfig>(weights);

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'ORIGINAL':
        return {
          label: 'ORIGINAL',
          color: 'text-emerald-400 bg-emerald-950/60 border-emerald-600/50 shadow-emerald-500/20',
          desc: 'High conceptual & architectural novelty detected. Verified unique contributions.',
        };
      case 'INSPIRED':
        return {
          label: 'INSPIRED',
          color: 'text-cyan-400 bg-cyan-950/60 border-cyan-600/50 shadow-cyan-500/20',
          desc: 'Builds upon established foundations with meaningful architectural or workflow innovations.',
        };
      case 'MODERATELY_SIMILAR':
        return {
          label: 'MODERATELY SIMILAR',
          color: 'text-amber-400 bg-amber-950/60 border-amber-600/50 shadow-amber-500/20',
          desc: 'Substantial structural overlap with existing solutions; balanced by distinctive edge optimizations.',
        };
      case 'HIGHLY_SIMILAR':
        return {
          label: 'HIGHLY SIMILAR',
          color: 'text-orange-400 bg-orange-950/60 border-orange-600/50 shadow-orange-500/20',
          desc: 'High procedural and functional correspondence with public repositories.',
        };
      case 'POTENTIAL_REPLICATION':
        return {
          label: 'POTENTIAL REPLICATION',
          color: 'text-rose-400 bg-rose-950/60 border-rose-600/50 shadow-rose-500/20',
          desc: 'Extensive pipeline, workflow, and structural alignment with public reference implementation.',
        };
      default:
        return {
          label: 'INSUFFICIENT EVIDENCE',
          color: 'text-slate-400 bg-slate-900 border-slate-700 shadow-slate-500/10',
          desc: 'Incomplete comparative reference sources. Definitiveness cannot be asserted.',
        };
    }
  };

  const badge = getClassificationBadge(profile.classification);

  const handleWeightChange = (key: keyof DimensionWeightConfig, val: number) => {
    setTempWeights(prev => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleApplyWeights = () => {
    onUpdateWeights(tempWeights);
    setShowWeightModal(false);
  };

  const handleResetWeights = () => {
    const defaultWeights: DimensionWeightConfig = {
      PROBLEM: 0.05,
      SOLUTION: 0.15,
      FEATURE: 0.15,
      TECHNOLOGY: 0.05,
      ARCHITECTURE: 0.20,
      WORKFLOW: 0.15,
      UI_UX: 0.10,
      TEXTUAL: 0.05,
      IMPLEMENTATION: 0.10,
      NAMING: 0.00,
    };
    setTempWeights(defaultWeights);
    onUpdateWeights(defaultWeights);
    setShowWeightModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-cyan-300">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold font-display text-white">
                Multi-Dimensional Originality Intelligence
              </h2>
              <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-bold shadow-sm ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              10-Dimension Comparative Audit &bull; Public Evidence-Based
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowWeightModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-slate-200 hover:text-white transition-all duration-200"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Configure Weights</span>
          </button>

          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-mono font-semibold text-cyan-300 hover:text-white transition-all duration-200"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Full Report</span>
          </button>
        </div>
      </div>

      {/* Hero 3-Metric Scorecard */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0B0F19]/90 to-slate-950/90 border border-cyan-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-cyan-950/40">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* 1. Originality Index */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left pb-4 md:pb-0 md:pr-6">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-widest font-semibold mb-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Originality Index</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-display font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                {profile.overallOriginalityScore}
              </span>
              <span className="text-xl font-mono text-slate-500 font-semibold">/ 100</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-mono">
              Deterministic score derived from 10 weighted dimensions
            </p>
          </div>

          {/* 2. Overall Similarity */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left py-4 md:py-0 md:px-6">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest font-semibold mb-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Similarity Index</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-display font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                {profile.overallSimilarityScore}
              </span>
              <span className="text-xl font-mono text-slate-500 font-semibold">/ 100</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-mono">
              Aggregate structural, feature & workflow overlap
            </p>
          </div>

          {/* 3. Confidence & Classification */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Evaluation Confidence</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-display font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]">
                {Math.round(profile.confidence * 100)}%
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="text-xs font-mono text-slate-300">
                Classification: <span className="font-bold text-white">{profile.classification.replace(/_/g, ' ')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Narrative Banner (Zero Accusation Standard) */}
        <div className="mt-6 pt-5 border-t border-white/10 flex items-start gap-3 bg-white/[0.02] p-4 rounded-xl">
          <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-300 leading-relaxed font-sans">
            <span className="font-semibold text-white">Objective Evidence Synthesis: </span>
            {profile.explanation}
          </div>
        </div>
      </div>

      {/* Weight Configuration Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#0B0F19] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-display">Configure Dimension Weights</h3>
              </div>
              <button
                onClick={() => setShowWeightModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              Adjust importance weights across dimensions. AI models cannot silently modify configured weights.
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {Object.entries(tempWeights).map(([dimKey, val]) => (
                <div key={dimKey} className="flex items-center justify-between gap-4 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-xs font-mono text-slate-200 font-medium">
                    {dimKey.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="0.40"
                      step="0.05"
                      value={val}
                      onChange={(e) => handleWeightChange(dimKey as keyof DimensionWeightConfig, parseFloat(e.target.value))}
                      className="w-28 accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-cyan-400 w-10 text-right">
                      {Math.round(val * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                onClick={handleResetWeights}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyWeights}
                  disabled={isRecalculating}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-mono text-xs font-bold shadow-lg shadow-cyan-500/25 hover:brightness-110"
                >
                  {isRecalculating ? 'Recalculating...' : 'Apply & Recalculate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
