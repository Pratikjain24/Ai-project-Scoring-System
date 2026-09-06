import React from 'react';
import { 
  Download, 
  Printer, 
  Share2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import type { EvaluationReport } from '../../types/report';

interface ReportHeaderBannerProps {
  report: EvaluationReport;
  onDownloadPdf: () => void;
  onPrint: () => void;
  onShare: () => void;
  onRegenerate: () => void;
  isGenerating?: boolean;
}

export const ReportHeaderBanner: React.FC<ReportHeaderBannerProps> = ({
  report,
  onDownloadPdf,
  onPrint,
  onShare,
  onRegenerate,
  isGenerating = false,
}) => {
  const isVerified = report.consistencyCheck?.status === 'VERIFIED';

  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-[#0C1222] to-slate-900 border border-cyan-500/30 p-6 shadow-2xl overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left info */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold uppercase tracking-wider">
              ProjectX-Ray AI • Project Intelligence Report
            </span>
            <span className="text-xs font-mono text-slate-400">
              v{report.version}.0
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              Status: {report.status}
            </span>
            {report.qualityCheck && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30" title="Report Completeness & Evidence Rigor">
                QA Score: <b>{report.qualityCheck.overallScore}/100</b> ({report.qualityCheck.rating})
              </span>
            )}
            {isVerified ? (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Consistency Verified</span>
              </span>
            ) : (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Consistency Warning</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {report.projectName}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {report.sections?.executiveSummary?.coreSummary || 'Edge AI roadway defect detection and real-time municipal telemetry.'}
          </p>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-4 flex-wrap pt-1">
            <span>Domain: <b className="text-slate-200">{report.domain}</b></span>
            <span>Type: <b className="text-slate-200">{report.projectType}</b></span>
            <span>Stage: <b className="text-cyan-300">{report.sections?.projectProfile?.stage || 'Validated Prototype'}</b></span>
            <span>Rubric: <b className="text-slate-200">{report.rubricVersion}</b></span>
          </div>
        </div>

        {/* Right metrics + actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Composite score pill */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-white/10 p-4 rounded-xl shrink-0">
            <div className="text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">
                Master Score
              </div>
              <div className="text-3xl font-black text-cyan-400 font-mono">
                {report.overallScore.toFixed(1)}
                <span className="text-xs font-normal text-slate-500"> /100</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                {report.overallVerdict}
              </span>
            </div>

            <div className="h-12 w-px bg-white/10" />

            <div className="text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">
                Confidence
              </div>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {report.overallConfidence}%
              </div>
              <span className="text-[10px] font-mono text-slate-400">7 Factors</span>
            </div>

            <div className="h-12 w-px bg-white/10" />

            <div className="text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">
                Coverage
              </div>
              <div className="text-xl font-bold text-indigo-400 font-mono">
                {report.evidenceCoverage.toFixed(1)}%
              </div>
              <span className="text-[10px] font-mono text-slate-400">Audited</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={onDownloadPdf}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20"
                title="Download publication-grade HTML/PDF report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>

              <button
                onClick={onPrint}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
                title="Open browser print dialog"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={onShare}
                className="px-3 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
                title="Generate secure shareable view-only link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>

            <button
              onClick={onRegenerate}
              disabled={isGenerating}
              className="w-full px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Re-Generating Report...' : 'Re-Run Generation Pipeline'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
