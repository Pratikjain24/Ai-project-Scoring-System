import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  DollarSign, 
  FileQuestion, 
  ListChecks, 
  X,
  Award
} from 'lucide-react';
import type { 
  EvaluatorRisk, 
  EvaluatorEvidenceGap, 
  EvaluatorRecommendation,
  CostLineItem
} from '../../types/specialistEvaluation';

interface RiskMatrixAndRecommendationsProps {
  risks: EvaluatorRisk[];
  evidenceGaps: EvaluatorEvidenceGap[];
  recommendations: EvaluatorRecommendation[];
  costKnown: CostLineItem[];
  costEstimated: CostLineItem[];
  costUnknown: CostLineItem[];
  whyStrong: string[];
  whyWeak: string[];
  whatMustFix: string[];
  whatMakesExceptional: string[];
}

export const RiskMatrixAndRecommendations: React.FC<RiskMatrixAndRecommendationsProps> = ({
  risks,
  evidenceGaps,
  recommendations,
  costKnown,
  costEstimated,
  costUnknown,
  whyStrong,
  whyWeak,
  whatMustFix,
  whatMakesExceptional,
}) => {
  const [activeSection, setActiveSection] = useState<'risks' | 'gaps' | 'recs' | 'cost' | 'decision'>('decision');
  const [selectedRisk, setSelectedRisk] = useState<EvaluatorRisk | null>(null);

  const criticalRisks = risks.filter(r => r.severity === 'CRITICAL');
  const highRisks = risks.filter(r => r.severity === 'HIGH');
  const mediumRisks = risks.filter(r => r.severity === 'MEDIUM' || r.severity === 'LOW');

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Strip */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-white/10 text-xs font-mono">
        <button
          onClick={() => setActiveSection('decision')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeSection === 'decision'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-md shadow-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Decision Summary</span>
        </button>

        <button
          onClick={() => setActiveSection('recs')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeSection === 'recs'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-md shadow-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ListChecks className="w-3.5 h-3.5" />
          <span>Recommendation Center ({recommendations.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('risks')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeSection === 'risks'
              ? 'bg-gradient-to-r from-rose-500 to-amber-600 text-white font-bold shadow-md shadow-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Risk Matrix ({risks.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('gaps')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeSection === 'gaps'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold shadow-md shadow-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileQuestion className="w-3.5 h-3.5" />
          <span>Evidence Gaps ({evidenceGaps.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('cost')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            activeSection === 'cost'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-md shadow-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Cost Analysis ({costKnown.length + costEstimated.length})</span>
        </button>
      </div>

      {/* 1. DECISION SUMMARY TAB */}
      {activeSection === 'decision' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
          {/* Why It Is Strong */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/30 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Why It Is Strong</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              {whyStrong.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Why It Is Weak */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-rose-500/30 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Why It Is Weak</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              {whyWeak.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What Must Be Fixed */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-amber-500/30 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>What Must Be Fixed (Gating Blockers)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              {whatMustFix.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What Would Make It Exceptional */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-cyan-500/30 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>What Would Make It Exceptional</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-200">
              {whatMakesExceptional.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 2. RECOMMENDATION CENTER */}
      {activeSection === 'recs' && (
        <div className="space-y-3 animate-fadeIn">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-white/20 transition-all space-y-2.5 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                      rec.priority === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : rec.priority === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {rec.priority} PRIORITY
                  </span>
                  <h4 className="text-sm font-bold text-white font-display">
                    {rec.title}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-rose-400 font-bold block">
                    Diagnostic Vulnerability:
                  </span>
                  <p className="text-slate-300 leading-relaxed">{rec.problem}</p>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold block">
                    Prescribed Engineering Action:
                  </span>
                  <p className="text-slate-300 leading-relaxed">{rec.action}</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs font-mono flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Expected Measurable Benefit:</strong> {rec.expectedBenefit}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. RISK MATRIX TAB (Severity x Likelihood) */}
      {activeSection === 'risks' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Summary matrix summary pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center justify-between">
              <span>CRITICAL SEVERITY</span>
              <strong className="text-lg font-bold text-rose-400">{criticalRisks.length}</strong>
            </div>
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center justify-between">
              <span>HIGH SEVERITY</span>
              <strong className="text-lg font-bold text-amber-400">{highRisks.length}</strong>
            </div>
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 text-blue-200 text-xs font-mono flex items-center justify-between">
              <span>MODERATE / LOW</span>
              <strong className="text-lg font-bold text-blue-400">{mediumRisks.length}</strong>
            </div>
          </div>

          <div className="space-y-3">
            {risks.map((risk) => (
              <div
                key={risk.id}
                onClick={() => setSelectedRisk(risk)}
                className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-white/20 transition-all cursor-pointer space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                      {risk.category}
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {risk.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        risk.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300'
                          : risk.severity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {risk.severity} SEVERITY
                    </span>
                    <span className="text-slate-400">Likelihood: <strong className="text-white">{risk.likelihood}</strong></span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {risk.description}
                </p>

                <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-xs text-emerald-300 font-mono flex items-center justify-between">
                  <span><strong>Mitigation Playbook:</strong> {risk.mitigation}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. EVIDENCE GAPS TAB */}
      {activeSection === 'gaps' && (
        <div className="space-y-3 animate-fadeIn">
          {evidenceGaps.map((gap) => (
            <div
              key={gap.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-amber-500/30 space-y-2.5 shadow-xl"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    {gap.importance} IMPORTANCE
                  </span>
                  <span className="text-xs font-mono uppercase text-slate-400">Domain: {gap.category}</span>
                </div>
                <span className="text-xs font-mono text-cyan-400">{gap.confidence}% Jury Certainty</span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  Missing Empirical Verification:
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {gap.description}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1 text-xs">
                <span className="text-[10px] uppercase font-mono text-amber-400 font-bold block">
                  Expected Artifact Required for Validation:
                </span>
                <p className="text-slate-200 font-mono text-[11px] leading-relaxed">
                  {gap.expectedEvidence}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. COST ANALYSIS TAB (KNOWN, ESTIMATED, UNKNOWN) */}
      {activeSection === 'cost' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Known Costs */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/30 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase font-bold text-emerald-400">
                  Known Unit Costs
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SUBSTANTIATED
                </span>
              </div>
              <div className="space-y-2">
                {costKnown.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white">{c.name}</span>
                      <span className="text-emerald-300 font-mono">{c.amount}</span>
                    </div>
                    {c.details && <p className="text-[11px] text-slate-400">{c.details}</p>}
                    {c.source && <span className="text-[10px] font-mono text-cyan-400/80 block">Source: {c.source}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Costs */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-cyan-500/30 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase font-bold text-cyan-400">
                  Estimated Operating Costs
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PROJECTED
                </span>
              </div>
              <div className="space-y-2">
                {costEstimated.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white">{c.name}</span>
                      <span className="text-cyan-300 font-mono">{c.amount}</span>
                    </div>
                    {c.details && <p className="text-[11px] text-slate-400">{c.details}</p>}
                    {c.source && <span className="text-[10px] font-mono text-cyan-400/80 block">Source: {c.source}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Unknown Costs */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-amber-500/30 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase font-bold text-amber-400">
                  Unmeasured Cost Elements
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  UNKNOWN
                </span>
              </div>
              <div className="space-y-2">
                {costUnknown.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white">{c.name}</span>
                      <span className="text-amber-300 font-mono">UNMEASURED</span>
                    </div>
                    {c.details && <p className="text-[11px] text-slate-400">{c.details}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Detail Modal */}
      {selectedRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-slate-900 border border-white/20 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white font-display">
                  {selectedRisk.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRisk(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3 font-mono text-slate-400">
                <span>Category: <strong className="text-white">{selectedRisk.category}</strong></span>
                <span>·</span>
                <span>Severity: <strong className="text-rose-400">{selectedRisk.severity}</strong></span>
                <span>·</span>
                <span>Likelihood: <strong className="text-amber-400">{selectedRisk.likelihood}</strong></span>
              </div>
              <p className="text-slate-200 leading-relaxed font-sans text-sm">
                {selectedRisk.description}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 font-mono space-y-1">
              <span className="font-bold uppercase text-emerald-400 block">Prescribed Mitigation:</span>
              <p className="leading-relaxed">{selectedRisk.mitigation}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRisk(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-semibold transition-colors"
              >
                Close Risk Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
