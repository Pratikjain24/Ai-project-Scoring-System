import React from 'react';
import { Sliders, RotateCcw, Calculator, Layers } from 'lucide-react';
import type { ScoringDimension, WeightPreset, DimensionId } from '../../types/aiJuryScoring';
import { WEIGHT_PRESETS } from '../../data/mockAiJuryScoring';

interface WeightedBreakdownBarProps {
  dimensions: ScoringDimension[];
  activeWeights: Record<DimensionId, number>;
  onUpdateWeight: (dimensionId: DimensionId, newWeight: number) => void;
  onApplyPreset: (preset: WeightPreset) => void;
  onResetWeights: () => void;
  calculatedOverallScore: number;
}

export const WeightedBreakdownBar: React.FC<WeightedBreakdownBarProps> = ({
  dimensions,
  activeWeights,
  onUpdateWeight,
  onApplyPreset,
  onResetWeights,
  calculatedOverallScore
}) => {
  // Segment color mapping for the 8 dimensions
  const colorMap: Record<DimensionId, { bg: string; text: string; hex: string }> = {
    'problem-need': { bg: 'bg-blue-500', text: 'text-blue-400', hex: '#3b82f6' },
    'technical-quality': { bg: 'bg-emerald-500', text: 'text-emerald-400', hex: '#10b981' },
    'innovation-originality': { bg: 'bg-purple-500', text: 'text-purple-400', hex: '#a855f7' },
    'social-impact': { bg: 'bg-rose-500', text: 'text-rose-400', hex: '#f43f5e' },
    'presentation': { bg: 'bg-amber-500', text: 'text-amber-400', hex: '#f59e0b' },
    'demonstration-quality': { bg: 'bg-cyan-500', text: 'text-cyan-400', hex: '#06b6d4' },
    'feasibility-scalability': { bg: 'bg-indigo-500', text: 'text-indigo-400', hex: '#6366f1' },
    'future-potential': { bg: 'bg-teal-500', text: 'text-teal-400', hex: '#14b8a6' }
  };

  // Compute total weight to ensure it equals 100%
  const totalWeight = Object.values(activeWeights).reduce((sum, w) => sum + w, 0);

  return (
    <div className="rounded-2xl bg-[#0B0F19]/90 border border-white/10 p-6 backdrop-blur-md shadow-xl space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Weighted Scoring Calculation</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                Sum = {calculatedOverallScore.toFixed(1)} pts
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Formula: Overall = Σ (Score_i × Weight_i) / 100
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rubric Presets:</span>
          </div>
          {WEIGHT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-white/5 hover:bg-cyan-950/60 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all"
              title={preset.description}
            >
              {preset.name.split(' ')[0]}
            </button>
          ))}
          <button
            onClick={onResetWeights}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            title="Reset to default weights"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Score Composition (100 Max Points)</span>
          </span>
          <span className={`font-semibold ${totalWeight === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
            Assigned Weight Total: {totalWeight}% {totalWeight !== 100 && '(Adjust to 100%)'}
          </span>
        </div>

        {/* The Multi-Segment Bar */}
        <div className="w-full h-7 rounded-xl bg-slate-900 border border-white/10 p-1 flex gap-1 overflow-hidden shadow-inner">
          {dimensions.map((dim) => {
            const weight = activeWeights[dim.id] ?? dim.weight;
            const weightedPoints = (dim.score * weight) / 100;
            // Width is relative to 100 total points
            const widthPct = Math.max(weightedPoints, 2);

            return (
              <div
                key={dim.id}
                style={{ width: `${widthPct}%` }}
                className={`h-full rounded-lg ${colorMap[dim.id].bg} transition-all duration-300 relative group flex items-center justify-center`}
                title={`${dim.name}: ${dim.score} raw × ${weight}% weight = ${weightedPoints.toFixed(1)} pts`}
              >
                {widthPct > 6 && (
                  <span className="text-[10px] font-mono font-bold text-white drop-shadow truncate px-1">
                    {weightedPoints.toFixed(1)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of Dimension Weight Contributions with Inline Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {dimensions.map((dim) => {
          const weight = activeWeights[dim.id] ?? dim.weight;
          const weightedContribution = (dim.score * weight) / 100;
          const colors = colorMap[dim.id];

          return (
            <div
              key={dim.id}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`w-2 h-2 rounded-full ${colors.bg}`} />
                  <span className="text-xs font-bold text-white truncate" title={dim.name}>
                    {dim.shortName}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {weightedContribution.toFixed(1)} <span className="text-[10px] text-slate-400">pts</span>
                </span>
              </div>

              {/* Raw score & weight slider */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Score: <strong className="text-white">{dim.score}</strong>/100</span>
                <span>Weight: <strong className={colors.text}>{weight}%</strong></span>
              </div>

              {/* Slider to adjust weight */}
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={weight}
                onChange={(e) => onUpdateWeight(dim.id, Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
