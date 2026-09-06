import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Download, 
  Code2, 
  Cpu, 
  Info,
  Scale,
  Award
} from 'lucide-react';
import type { OriginalityReport } from '../../types/originalityIntelligence';

interface OriginalityScoreHeaderProps {
  report: OriginalityReport;
  onSelectProjectType: (type: 'software' | 'hardware') => void;
  onExportDossier: () => void;
}

export const OriginalityScoreHeader: React.FC<OriginalityScoreHeaderProps> = ({
  report,
  onSelectProjectType,
  onExportDossier,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Project Selector & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-cyan-300">
            {report.projectType === 'software' ? 'SW' : 'HW'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold font-display text-white">
                {report.projectName}
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-700/40 text-cyan-300 font-semibold">
                {report.projectType.toUpperCase()} PRIOR ART AUDIT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-xl">
              Corpus: {report.scannedCorpusCount}
            </p>
          </div>
        </div>

        {/* Project Switcher & Export */}
        <div className="flex items-center gap-2.5 flex-wrap">
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

          <button
            onClick={onExportDossier}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-slate-200 hover:text-white transition-all duration-200 shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Hero 3-Metric Scorecard */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0B0F19]/90 to-slate-950/90 border border-cyan-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-cyan-950/40">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* 1. Originality Score */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left pb-4 md:pb-0 md:pr-6">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-widest font-semibold mb-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Originality Index</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-display font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                {report.originalityScore}%
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold uppercase px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">
                High Novelty
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-sans">
              Degree of unique architectural synthesis, original engineering, and un-replicated core logic.
            </p>
          </div>

          {/* 2. Similarity Score */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left py-4 md:py-0 md:px-6">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest font-semibold mb-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Aggregate Similarity</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-display font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]">
                {report.similarityScore}%
              </span>
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                Low Overlap
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-sans">
              Proximity to published open-source libraries, standard protocols, and academic literature.
            </p>
          </div>

          {/* 3. Confidence Score */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-widest font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Jury Calibration Confidence</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-display font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(99,102,241,0.35)]">
                {report.confidenceScore}%
              </span>
              <span className="text-xs font-mono text-indigo-400 font-semibold uppercase px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/30">
                Calibrated
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-sans">
              Algorithmic certainty based on AST cross-matching, patent text semantics, and citation graphs.
            </p>
          </div>
        </div>

        {/* Verdict Synthesis */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Originality Synthesis Verdict</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {report.verdictSynthesis}
          </p>
        </div>
      </div>

      {/* Ethical Review Standard Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-mono font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
            Institutional Non-Accusatory Classification Standard
          </div>
          <p className="text-slate-300 leading-relaxed">
            {report.disclaimer} Evaluation results strictly use five objective evidentiary tiers:
            <span className="inline-flex items-center gap-2 ml-1 flex-wrap mt-1">
              <strong className="text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/30">Original</strong>
              <strong className="text-cyan-400 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-500/30">Inspired</strong>
              <strong className="text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/30">Moderately Similar</strong>
              <strong className="text-orange-400 bg-orange-950/50 px-1.5 py-0.5 rounded border border-orange-500/30">Highly Similar</strong>
              <strong className="text-rose-400 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-500/30">Potential Replication</strong>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
