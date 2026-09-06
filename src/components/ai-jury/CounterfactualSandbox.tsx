import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle 
} from 'lucide-react';
import type { MasterCategoryScore, CanonicalCategoryKey, VerdictRank } from '../../types/aiJuryScoring';

interface CounterfactualSandboxProps {
  initialScores: MasterCategoryScore[];
  officialOverallScore: number;
}

export const CounterfactualSandbox: React.FC<CounterfactualSandboxProps> = ({
  initialScores,
  officialOverallScore,
}) => {
  // Sandbox raw scores state
  const [simulatedRaws, setSimulatedRaws] = useState<Record<CanonicalCategoryKey, number>>(() => {
    const initial: Record<string, number> = {};
    initialScores.forEach(s => {
      initial[s.categoryKey] = s.rawScore;
    });
    return initial as Record<CanonicalCategoryKey, number>;
  });

  // Calculate live simulated score
  const { simulatedScore, difference, changedCategories, projectedVerdict } = useMemo(() => {
    let totalWeighted = 0;
    const changed: CanonicalCategoryKey[] = [];

    initialScores.forEach(s => {
      const currentRaw = simulatedRaws[s.categoryKey] !== undefined ? simulatedRaws[s.categoryKey] : s.rawScore;
      if (currentRaw !== s.rawScore) {
        changed.push(s.categoryKey);
      }
      totalWeighted += (currentRaw * s.weight) / 100;
    });

    const simScore = parseFloat(totalWeighted.toFixed(1));
    const diff = parseFloat((simScore - officialOverallScore).toFixed(1));

    let verdict: VerdictRank = 'PROMISING';
    if (simScore >= 90) verdict = 'EXCEPTIONAL';
    else if (simScore >= 80) verdict = 'STRONG';
    else if (simScore >= 70) verdict = 'PROMISING';
    else if (simScore >= 50) verdict = 'NEEDS_IMPROVEMENT';
    else verdict = 'WEAK';

    return {
      simulatedScore: simScore,
      difference: diff,
      changedCategories: changed,
      projectedVerdict: verdict,
    };
  }, [simulatedRaws, initialScores, officialOverallScore]);

  const handleSliderChange = (catKey: CanonicalCategoryKey, val: number) => {
    setSimulatedRaws(prev => ({
      ...prev,
      [catKey]: val,
    }));
  };

  const handleReset = () => {
    const resetState: Record<string, number> = {};
    initialScores.forEach(s => {
      resetState[s.categoryKey] = s.rawScore;
    });
    setSimulatedRaws(resetState as Record<CanonicalCategoryKey, number>);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-950 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                SIMULATION
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                NOT OFFICIAL SCORE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Testing counterfactual "what-if" scenarios does not alter the immutable official evaluation record.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          disabled={changedCategories.length === 0}
          className="px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sliders</span>
        </button>
      </div>

      {/* Comparison Scoreboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Official Score */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
            Official Master Score
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-black font-mono text-slate-300">
              {officialOverallScore}
            </span>
            <span className="text-xs font-mono text-slate-500">/100</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 block mt-1">Official Consensus</span>
        </div>

        {/* Delta */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
            Scenario Score Delta
          </span>
          <div className="flex items-center justify-center gap-1">
            {difference > 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : difference < 0 ? (
              <TrendingDown className="w-5 h-5 text-rose-400" />
            ) : null}
            <span
              className={`text-3xl font-black font-mono ${
                difference > 0
                  ? 'text-emerald-400'
                  : difference < 0
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {difference > 0 ? `+${difference}` : difference}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 block mt-1">
            {changedCategories.length} {changedCategories.length === 1 ? 'category' : 'categories'} adjusted
          </span>
        </div>

        {/* Simulated Score */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-amber-500/30 text-center bg-gradient-to-b from-slate-900/90 to-amber-950/20">
          <span className="text-[10px] uppercase font-mono text-amber-400 block mb-1">
            Simulated Project Score
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-black font-mono text-amber-300">
              {simulatedScore}
            </span>
            <span className="text-xs font-mono text-slate-500">/100</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-300 block mt-1">
            Tier: {projectedVerdict}
          </span>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-mono uppercase text-slate-100">
              Controlled Category What-If Sliders
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Real-time mathematical weighted recalculation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initialScores.map((cat) => {
            const currentVal = simulatedRaws[cat.categoryKey] !== undefined ? simulatedRaws[cat.categoryKey] : cat.rawScore;
            const isChanged = currentVal !== cat.rawScore;
            const diffFromOriginal = currentVal - cat.rawScore;
            const weightedImpact = ((diffFromOriginal * cat.weight) / 100).toFixed(2);

            return (
              <div
                key={cat.categoryKey}
                className={`p-4 rounded-xl border transition-all ${
                  isChanged
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-200 block">
                      {cat.categoryLabel}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Weight: {cat.weight}% • Official: {cat.rawScore}/100
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-mono font-bold text-white">
                      {currentVal}
                    </span>
                    {isChanged && (
                      <span
                        className={`text-[10px] font-mono ml-1.5 font-bold ${
                          diffFromOriginal > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        ({diffFromOriginal > 0 ? `+${diffFromOriginal}` : diffFromOriginal} pts → {diffFromOriginal > 0 ? `+${weightedImpact}` : weightedImpact} total)
                      </span>
                    )}
                  </div>
                </div>

                {/* Slider Input */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={currentVal}
                  onChange={(e) => handleSliderChange(cat.categoryKey, parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
