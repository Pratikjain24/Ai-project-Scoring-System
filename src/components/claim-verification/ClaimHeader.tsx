import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  ShieldCheck, 
  Download, 
  Code2, 
  Cpu,
  Sparkles,
  Layers
} from 'lucide-react';
import type { ClaimVerificationReport, ClaimStatus } from '../../types/claimVerification';

interface ClaimHeaderProps {
  report: ClaimVerificationReport;
  selectedStatus: ClaimStatus | 'all';
  onSelectStatus: (status: ClaimStatus | 'all') => void;
  onSelectProjectType: (type: 'software' | 'hardware') => void;
  onExportDossier: () => void;
  docketCount: number;
  onOpenDocket: () => void;
}

export const ClaimHeader: React.FC<ClaimHeaderProps> = ({
  report,
  selectedStatus,
  onSelectStatus,
  onSelectProjectType,
  onExportDossier,
  docketCount,
  onOpenDocket,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Project Selector & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-emerald-300">
            {report.projectType === 'software' ? 'SW' : 'HW'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold font-display text-white">
                {report.projectName}
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 font-semibold">
                {report.projectType.toUpperCase()} CLAIM AUDITOR
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Audited {report.totalClaimsCount} factual propositions extracted from deck, README & schematics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Project Switcher */}
          <div className="p-1 rounded-2xl bg-slate-900 border border-white/10 flex items-center shadow-inner">
            <button
              onClick={() => onSelectProjectType('software')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 ${
                report.projectType === 'software'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Software</span>
            </button>
            <button
              onClick={() => onSelectProjectType('hardware')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 ${
                report.projectType === 'hardware'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-600 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Hardware</span>
            </button>
          </div>

          {/* Docket button */}
          <button
            onClick={onOpenDocket}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-mono font-semibold text-amber-300 transition-all"
          >
            <span>Jury Docket ({docketCount})</span>
          </button>

          {/* Export Action */}
          <button
            onClick={onExportDossier}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-slate-200 hover:text-white transition-all duration-200 shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Hero 3-Box Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Box 1: Overall Verified Ratio */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-md shadow-xl shadow-emerald-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Claim Substantiation Index
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {report.statusBreakdown.verified} of {report.totalClaimsCount} Verified
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-display font-black text-white">
              {report.overallVerificationRate}%
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              Empirically Substantive
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-snug">
            Proportion of examined factual claims supported by verifiable codebase AST, test records, or physical schematics.
          </p>
        </div>

        {/* Box 2: Calibration Confidence */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md shadow-xl shadow-cyan-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Epistemic Confidence
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Calibrated
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-display font-black text-white">
              {report.averageConfidence}%
            </span>
            <span className="text-xs font-mono text-cyan-400 font-semibold">
              High Evidentiary Certainty
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-snug">
            AI jury certainty score derived from independent code validation, runtime traces, and external peer-reviewed literature.
          </p>
        </div>

        {/* Box 3: Contested & Fragile Claims */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-md shadow-xl shadow-amber-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-amber-400 font-semibold tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Contested & Fragile Claims
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Requires Inquiry
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-display font-black text-white">
              {report.totalClaimsCount - report.statusBreakdown.verified}
            </span>
            <span className="text-xs font-mono text-amber-400 font-semibold">
              Gaps / Nuances Flagged
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-snug">
            Claims exhibiting partial validity, missing implementation, or empirical contradiction. Questions generated in "Ask the Judge".
          </p>
        </div>
      </div>

      {/* 5-Status Filter Strip */}
      <div className="p-2 rounded-2xl bg-slate-900 border border-white/10 flex flex-wrap items-center gap-2 text-xs font-mono">
        <button
          onClick={() => onSelectStatus('all')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            selectedStatus === 'all'
              ? 'bg-white/15 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Claims ({report.totalClaimsCount})</span>
        </button>

        <button
          onClick={() => onSelectStatus('verified')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            selectedStatus === 'verified'
              ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
              : 'text-slate-400 hover:text-emerald-300'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified ({report.statusBreakdown.verified})</span>
        </button>

        <button
          onClick={() => onSelectStatus('partially-verified')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            selectedStatus === 'partially-verified'
              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
              : 'text-slate-400 hover:text-amber-300'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Partially Verified ({report.statusBreakdown['partially-verified']})</span>
        </button>

        <button
          onClick={() => onSelectStatus('unverified')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            selectedStatus === 'unverified'
              ? 'bg-slate-500/20 text-slate-200 font-bold border border-slate-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Unverified ({report.statusBreakdown.unverified})</span>
        </button>

        <button
          onClick={() => onSelectStatus('contradicted')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            selectedStatus === 'contradicted'
              ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
              : 'text-slate-400 hover:text-rose-300'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Contradicted ({report.statusBreakdown.contradicted})</span>
        </button>

        <button
          onClick={() => onSelectStatus('insufficient-evidence')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            selectedStatus === 'insufficient-evidence'
              ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
              : 'text-slate-400 hover:text-purple-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Insufficient Evidence ({report.statusBreakdown['insufficient-evidence']})</span>
        </button>
      </div>
    </div>
  );
};
