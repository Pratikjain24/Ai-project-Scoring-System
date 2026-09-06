import React from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  Info, 
  Database 
} from 'lucide-react';
import type { MasterCategoryScore } from '../../types/aiJuryScoring';

interface ConfidenceCoverageAuditProps {
  confidence: number;
  confidenceLevel: string;
  evidenceCoverage: number;
  scoreReliability: string;
  categoryScores: MasterCategoryScore[];
}

export const ConfidenceCoverageAudit: React.FC<ConfidenceCoverageAuditProps> = ({
  confidence,
  confidenceLevel,
  evidenceCoverage,
  scoreReliability,
  categoryScores,
}) => {
  const factors = [
    {
      name: 'Corroborated Evidence Coverage',
      score: 81,
      weight: '25%',
      description: 'Breadth of empirical artifacts supporting rubric claims across all dimensions.',
      status: 'HIGH',
    },
    {
      name: 'Source Quality & Reliability',
      score: 88,
      weight: '20%',
      description: 'Institutional authority and experimental rigor of ingested evidence items.',
      status: 'HIGH',
    },
    {
      name: 'Multi-Modal Source Diversity',
      score: 92,
      weight: '20%',
      description: 'Presence of documents, video analysis, live telemetry, and literature benchmarking.',
      status: 'OPTIMAL',
    },
    {
      name: 'Direct Live Observation Verification',
      score: 88,
      weight: '20%',
      description: 'Features directly audited during live demonstration execution.',
      status: 'HIGH',
    },
    {
      name: 'Cross-Source Consistency',
      score: 85,
      weight: '15%',
      description: 'Zero detected contradictions between whitepapers, video timestamps, and code.',
      status: 'HIGH',
    },
  ];

  const deductions = [
    {
      name: 'Unresolved High-Impact Claim Penalty',
      penalty: '-5%',
      reason: 'Claim "sub-50ms latency under 8 concurrent streams" verified only on 2 streams.',
    },
    {
      name: 'Missing Critical Evidence Penalty',
      penalty: '-3%',
      reason: 'Lack of published independent third-party dataset benchmark.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner explaining Quality vs Confidence vs Coverage */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-bold text-slate-100 uppercase tracking-wider font-mono">
              Core Methodological Separation
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">
              <strong>Quality Score</strong> evaluates the project's excellence. 
              <strong> Confidence</strong> evaluates our certainty in the data. 
              <strong> Evidence Coverage</strong> evaluates how much of the rubric is backed by empirical artifacts. 
              A low-confidence score remains the observed score with low confidence—scores are <em>never</em> silently down-weighted.
            </p>
          </div>
        </div>
      </div>

      {/* Dual Gauges: Overall Confidence & Evidence Coverage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Confidence Cockpit */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-mono uppercase text-slate-100">
                Multi-Factor Confidence Calibration
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              {confidenceLevel} LEVEL
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-cyan-400">
              {confidence}%
            </span>
            <span className="text-xs font-mono text-slate-400">calibrated certainty</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Composite confidence does <strong>not</strong> simply average category confidence. It integrates source diversity, evidence quality, and explicit penalties for unresolved critical claims.
          </p>

          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Underlying Positive Weight Factors
            </div>
            {factors.map((f, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">{f.name} ({f.weight})</span>
                  <span className="text-cyan-400 font-bold">{f.score}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${f.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Penalties / Deductions */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Deductions & Penalties
            </div>
            {deductions.map((d, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-300">{d.penalty}</span>
                    <span className="font-medium text-slate-200">{d.name}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{d.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Coverage Cockpit */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold font-mono uppercase text-slate-100">
                Evidence Coverage Score
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-500/30">
              FULLY SUPPORTED
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-purple-400">
              {evidenceCoverage}%
            </span>
            <span className="text-xs font-mono text-slate-400">empirical support coverage</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
            <strong className="text-purple-300">Important Note:</strong> High evidence coverage does not guarantee high project quality. It only measures how well the evaluation is supported by corroborating data.
          </div>

          {/* Per-Category Coverage Bars */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Category Support Coverage
            </div>
            {categoryScores.map((cat) => (
              <div key={cat.categoryKey} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">{cat.categoryLabel}</span>
                  <span className="text-purple-400 font-bold">{cat.evidenceCoverage}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${cat.evidenceCoverage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Score Reliability Card */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Score Reliability Audit
            </span>
            <p className="text-xs text-slate-300 font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              {scoreReliability}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
