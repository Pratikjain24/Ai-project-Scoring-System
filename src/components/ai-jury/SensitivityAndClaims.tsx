import React from 'react';
import { 
  Zap, 
  AlertCircle 
} from 'lucide-react';
import type { ScoreSensitivityAnalysis, ClaimImpactItem } from '../../types/aiJuryScoring';

interface SensitivityAndClaimsProps {
  sensitivity: ScoreSensitivityAnalysis;
  claimImpact: ClaimImpactItem[];
}

export const SensitivityAndClaims: React.FC<SensitivityAndClaimsProps> = ({
  sensitivity,
  claimImpact,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Impact Analysis
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            Current Score: {sensitivity.currentScore}
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-100 mt-1">
          Score Sensitivity & Material Claim Impact
        </h2>
        <p className="text-xs text-slate-400">
          Identifies high-leverage rubric dimensions and unresolved empirical claims that could materially alter the consensus verdict.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: High Sensitivity Areas */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-mono uppercase text-slate-100">
                High-Sensitivity Dimensions
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">What could change the score?</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Categories with large mathematical weight and empirical validation headroom hold the highest potential to shift the project into a different tier.
          </p>

          <div className="space-y-3">
            {sensitivity.highSensitivityAreas.map((area, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {area.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Weight: {area.weight}%
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      area.sensitivityLevel === 'HIGH'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {area.sensitivityLevel} SENSITIVITY
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  {area.potentialImpactDescription}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Claim Impact Analysis */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold font-mono uppercase text-slate-100">
                Material Claim Impact
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {claimImpact.length} unresolved {claimImpact.length === 1 ? 'claim' : 'claims'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Claims that remain partially verified or unverified in live conditions without triggering automatic score penalties, but which gate sub-dimension upgrades.
          </p>

          <div className="space-y-3">
            {claimImpact.map((item, i) => (
              <div
                key={item.claimId || i}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {item.claimId}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 font-bold uppercase">
                      {item.currentStatus.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Impact: ±{item.potentialScoreImpact} pts
                    </span>
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-200 leading-snug">
                  "{item.claimText}"
                </p>

                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  <strong className="text-slate-300 font-mono text-[11px]">Evaluation Note: </strong>
                  {item.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
