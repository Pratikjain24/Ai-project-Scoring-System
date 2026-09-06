import React from 'react';
import { 
  ShieldCheck, 
  FileCode2, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles,
  Award,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import type { TechnicalAuditReport } from '../../types/technicalAudit';

interface AuditSummaryBannerProps {
  report: TechnicalAuditReport;
  onFilterRisks?: () => void;
}

export const AuditSummaryBanner: React.FC<AuditSummaryBannerProps> = ({
  report,
  onFilterRisks,
}) => {
  // Compute letter grade
  const getLetterGrade = (score: number) => {
    if (score >= 93) return { grade: 'A+', label: 'World-Class / Tier 1' };
    if (score >= 90) return { grade: 'A', label: 'Distinguished Engineering' };
    if (score >= 85) return { grade: 'B+', label: 'Enterprise Competent' };
    if (score >= 80) return { grade: 'B', label: 'Solid Implementation' };
    return { grade: 'C', label: 'Requires Remediation' };
  };

  const { grade, label } = getLetterGrade(report.compositeScore);

  return (
    <div className="space-y-6">
      {/* Hero Scorecard Box */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0B0F19]/90 to-slate-950/90 border border-cyan-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-cyan-950/40">
        {/* Background Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Overall Technical Score Gauge & Grade */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-8">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest font-semibold mb-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Institutional Verdict</span>
            </div>

            <div className="flex items-baseline gap-3 my-1">
              <span className="text-6xl sm:text-7xl font-display font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(34,211,238,0.35)]">
                {report.compositeScore}
              </span>
              <div className="flex flex-col text-left">
                <span className="text-xl font-bold font-mono text-cyan-400">/100</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  Grade {grade}
                </span>
              </div>
            </div>

            <div className="text-sm font-semibold text-slate-200 mt-1">
              {label}
            </div>

            {/* Overall Meta Pills */}
            <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{report.overallConfidence}% Calibration Confidence</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{report.totalEvidenceCount} Verified Evidence Nodes</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
                Status: {report.evaluationMaturity}
              </div>
            </div>
          </div>

          {/* Right Column: AI Audit Summary & Empirical Benchmarks */}
          <div className="lg:col-span-8 space-y-5">
            {/* Verdict Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Executive Auditor Assessment
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Engine: {report.auditVersion}
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans font-normal">
                {report.summaryVerdict}
              </p>
            </div>

            {/* Benchmarks Ticker */}
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Empirical Performance Benchmarks
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {report.benchmarks.map((bm, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-all duration-200"
                  >
                    <div className="text-[10px] uppercase font-mono text-slate-400 truncate">
                      {bm.label}
                    </div>
                    <div className="flex items-baseline gap-1 my-0.5">
                      <span className="text-lg sm:text-xl font-mono font-bold text-white">
                        {bm.value}
                      </span>
                      <span className="text-[11px] font-mono text-cyan-400">{bm.unit}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate" title={bm.comparison}>
                      {bm.comparison}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Triad of Strengths, Weaknesses, and Detected Risks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Strengths Card */}
        <div className="rounded-2xl bg-slate-900/60 border border-emerald-500/30 p-5 backdrop-blur-md shadow-lg shadow-emerald-950/20">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Core Strengths ({report.globalStrengths.length})</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              High Impact
            </span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {report.globalStrengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses Card */}
        <div className="rounded-2xl bg-slate-900/60 border border-amber-500/30 p-5 backdrop-blur-md shadow-lg shadow-amber-950/20">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Engineering Gaps ({report.globalWeaknesses.length})</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Actionable
            </span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {report.globalWeaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚠</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Detected Risks Card */}
        <div className="rounded-2xl bg-slate-900/60 border border-rose-500/30 p-5 backdrop-blur-md shadow-lg shadow-rose-950/20">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Detected Risks ({report.detectedRisks.length})</span>
            </div>
            {onFilterRisks && (
              <button
                onClick={onFilterRisks}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1"
              >
                <span>Filter Cards</span>
                <ArrowUpRight className="w-3 h-3 text-rose-300" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {report.detectedRisks.map((risk) => (
              <div
                key={risk.id}
                className="p-3 rounded-xl bg-rose-950/25 border border-rose-500/25 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-200 line-clamp-1">
                    {risk.title}
                  </span>
                  <span
                    className={`text-[9.5px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                      risk.severity === 'critical'
                        ? 'bg-rose-600 text-white'
                        : risk.severity === 'high'
                        ? 'bg-rose-900/80 text-rose-200 border border-rose-500'
                        : 'bg-amber-900/60 text-amber-200 border border-amber-500'
                    }`}
                  >
                    {risk.severity} severity
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {risk.impact}
                </p>
                <div className="text-[10.5px] text-cyan-300 font-mono bg-black/40 p-1.5 rounded border border-white/5">
                  <span className="text-slate-400">Mitigation: </span>
                  {risk.mitigationRecommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
