import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  TrendingUp, 
  Zap, 
  BarChart3 
} from 'lucide-react';
import type { CanonicalCategoryKey, JuryDecisionData } from '../../types/aiJuryScoring';

interface BenchmarkProject {
  id: string;
  name: string;
  domain: string;
  tagline: string;
  overallScore: number;
  verdict: string;
  confidence: number;
  coverage: number;
  categoryScores: Record<CanonicalCategoryKey, number>;
}

const BENCHMARK_PROJECTS: BenchmarkProject[] = [
  {
    id: 'eval_smart-road-vision',
    name: 'Smart Road Vision',
    domain: 'Computer Vision / Municipal IoT',
    tagline: 'Edge AI roadway distress detection on Jetson Orin with real-time telemetry.',
    overallScore: 83.7,
    verdict: 'STRONG',
    confidence: 86,
    coverage: 81,
    categoryScores: {
      problemNeed: 88,
      technicalQuality: 87,
      originality: 68,
      socialImpact: 92,
      presentation: 76,
      demonstration: 84,
      feasibilityScalability: 79,
      futurePotential: 83,
    },
  },
  {
    id: 'eval_aeropulse_drone',
    name: 'AeroPulse PX-4 Drone',
    domain: 'Robotics / Subterranean Aerospace',
    tagline: 'Autonomous GPS-denied subterranean UAV with EKF sensor fusion and LoRa mesh.',
    overallScore: 79.5,
    verdict: 'PROMISING',
    confidence: 82,
    coverage: 75,
    categoryScores: {
      problemNeed: 91,
      technicalQuality: 85,
      originality: 82,
      socialImpact: 74,
      presentation: 80,
      demonstration: 70,
      feasibilityScalability: 68,
      futurePotential: 85,
    },
  },
  {
    id: 'eval_aegistls_gateway',
    name: 'AegisTLS Gateway',
    domain: 'Cybersecurity / Infrastructure',
    tagline: 'Kernel eBPF high-throughput TLS inspection with zero-copy packet interception.',
    overallScore: 86.2,
    verdict: 'STRONG',
    confidence: 89,
    coverage: 85,
    categoryScores: {
      problemNeed: 85,
      technicalQuality: 92,
      originality: 78,
      socialImpact: 78,
      presentation: 82,
      demonstration: 90,
      feasibilityScalability: 88,
      futurePotential: 86,
    },
  },
];

const CATEGORY_DEFINITIONS: Array<{ key: CanonicalCategoryKey; label: string; weight: number }> = [
  { key: 'problemNeed', label: 'Problem & Need', weight: 15 },
  { key: 'technicalQuality', label: 'Technical Quality', weight: 20 },
  { key: 'originality', label: 'Innovation & Originality', weight: 15 },
  { key: 'socialImpact', label: 'Social Impact', weight: 15 },
  { key: 'presentation', label: 'Presentation Quality', weight: 10 },
  { key: 'demonstration', label: 'Demonstration Quality', weight: 10 },
  { key: 'feasibilityScalability', label: 'Feasibility & Scalability', weight: 10 },
  { key: 'futurePotential', label: 'Future Potential', weight: 5 },
];

interface ProjectComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDecision: JuryDecisionData;
  activeProjectName?: string;
}

export const ProjectComparisonModal: React.FC<ProjectComparisonModalProps> = ({
  isOpen,
  onClose,
  activeDecision,
  activeProjectName = 'Smart Road Vision',
}) => {
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>('eval_aeropulse_drone');

  if (!isOpen) return null;

  // Active Project A scores
  const projectAScores: Record<CanonicalCategoryKey, number> = {
    problemNeed: 88,
    technicalQuality: 87,
    originality: 68,
    socialImpact: 92,
    presentation: 76,
    demonstration: 84,
    feasibilityScalability: 79,
    futurePotential: 83,
  };

  if (activeDecision.categoryScores) {
    activeDecision.categoryScores.forEach(cs => {
      projectAScores[cs.categoryKey] = cs.rawScore;
    });
  }

  const projectA = {
    id: activeDecision.evaluationId || 'eval_smart-road-vision',
    name: activeProjectName,
    domain: 'Computer Vision & Municipal AI',
    overallScore: activeDecision.overallScore,
    verdict: activeDecision.verdict,
    confidence: activeDecision.confidence,
    coverage: activeDecision.evidenceCoverage,
    categoryScores: projectAScores,
  };

  const projectB = BENCHMARK_PROJECTS.find(p => p.id === selectedBenchmarkId) || BENCHMARK_PROJECTS[1];

  const overallDelta = projectA.overallScore - projectB.overallScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-8 bg-[#0B0F19] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Cross-Project Comparative Evaluation
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  Rubric: {activeDecision.rubricVersionId || 'rubric_v1_canonical'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rigorous head-to-head benchmarking under identical category weighting formulas.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benchmark Selector Bar */}
        <div className="px-6 py-3 bg-slate-950 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <span className="text-slate-400">Select Benchmark Project to Compare With:</span>
          <div className="flex items-center gap-2">
            {BENCHMARK_PROJECTS.filter(p => p.id !== projectA.id).map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedBenchmarkId(p.id)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  selectedBenchmarkId === p.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {p.name} ({p.overallScore.toFixed(1)})
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Top Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project A (Active) */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-cyan-500/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500/20 text-cyan-300 border-b border-l border-cyan-500/30 text-[10px] font-mono font-bold uppercase rounded-bl-lg">
                Active Project Under Review
              </div>
              <div className="text-xs font-mono text-slate-400 mb-1">{projectA.domain}</div>
              <h3 className="text-lg font-bold text-white mb-3">{projectA.name}</h3>
              
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-black text-cyan-400 font-mono">
                    {projectA.overallScore.toFixed(1)}
                    <span className="text-sm font-normal text-slate-400"> / 100</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                      {projectA.verdict}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Conf: <b className="text-white">{projectA.confidence}%</b> • Cov: <b className="text-white">{projectA.coverage}%</b>
                    </span>
                  </div>
                </div>

                {overallDelta >= 0 && (
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 justify-end">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{overallDelta.toFixed(1)} pts ahead
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Superior Aggregate Score</span>
                  </div>
                )}
              </div>
            </div>

            {/* Project B (Benchmark) */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-white/10 text-slate-300 border-b border-l border-white/10 text-[10px] font-mono font-bold uppercase rounded-bl-lg">
                Benchmark Standard
              </div>
              <div className="text-xs font-mono text-slate-400 mb-1">{projectB.domain}</div>
              <h3 className="text-lg font-bold text-white mb-3">{projectB.name}</h3>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-black text-slate-200 font-mono">
                    {projectB.overallScore.toFixed(1)}
                    <span className="text-sm font-normal text-slate-400"> / 100</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10 font-bold">
                      {projectB.verdict}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Conf: <b className="text-white">{projectB.confidence}%</b> • Cov: <b className="text-white">{projectB.coverage}%</b>
                    </span>
                  </div>
                </div>

                {overallDelta < 0 && (
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1 justify-end">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{Math.abs(overallDelta).toFixed(1)} pts higher
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Benchmark Advantage</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 8-Category Head-to-Head Comparison */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  8-Category Head-to-Head Scoring Matrix
                </h4>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Sorted by Rubric Category Weight
              </span>
            </div>

            <div className="space-y-3">
              {CATEGORY_DEFINITIONS.map(cat => {
                const scoreA = projectA.categoryScores[cat.key] || 0;
                const scoreB = projectB.categoryScores[cat.key] || 0;
                const delta = scoreA - scoreB;
                const aWins = delta > 0;
                const isTie = delta === 0;

                return (
                  <div 
                    key={cat.key}
                    className="p-3 rounded-lg bg-slate-950/70 border border-white/5 hover:border-white/10 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{cat.label}</span>
                        <span className="text-slate-400 text-[11px]">({cat.weight}% weight)</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          aWins 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : isTie 
                            ? 'bg-slate-800 text-slate-300' 
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {aWins ? `+${delta.toFixed(1)} ${projectA.name} leads` : isTie ? 'Tied' : `+${Math.abs(delta).toFixed(1)} ${projectB.name} leads`}
                        </span>
                      </div>
                    </div>

                    {/* Dual Comparative Progress Bars */}
                    <div className="grid grid-cols-2 gap-3 items-center pt-1">
                      {/* Project A bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono text-slate-400">
                          <span className="truncate max-w-[120px] text-cyan-300">{projectA.name}</span>
                          <span className="font-bold text-white">{scoreA.toFixed(1)}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${aWins ? 'bg-cyan-400' : 'bg-cyan-600/70'}`}
                            style={{ width: `${scoreA}%` }}
                          />
                        </div>
                      </div>

                      {/* Project B bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono text-slate-400">
                          <span className="truncate max-w-[120px] text-slate-300">{projectB.name}</span>
                          <span className="font-bold text-white">{scoreB.toFixed(1)}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${!aWins && !isTie ? 'bg-indigo-400' : 'bg-slate-500'}`}
                            style={{ width: `${scoreB}%` }}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparative Juror Deliberation Insight */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs font-mono space-y-1">
            <div className="text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Jury Deliberation Takeaway</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {overallDelta >= 0 
                ? `${projectA.name} outperforms ${projectB.name} primarily through superior empirical demonstration fidelity and municipal social impact (+${(projectAScores.socialImpact - projectB.categoryScores.socialImpact).toFixed(1)} pts), overcoming lower scores in raw patent originality.`
                : `${projectB.name} holds an advantage over ${projectA.name} driven by deeper kernel execution quality and rigorous stress testing under failure states.`}
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400">
            Comparative Consensus Engine v9.0 • Deterministic Rubric Invariance
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-all"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
};
