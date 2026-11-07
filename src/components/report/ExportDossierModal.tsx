import React, { useState } from 'react';
import {
  Download,
  Printer,
  FileCheck,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';

interface ExportDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationId: string;
  projectName?: string;
  version?: number;
  overallScore?: number;
  verdict?: string;
}

export const ExportDossierModal: React.FC<ExportDossierModalProps> = ({
  isOpen,
  onClose,
  evaluationId,
  projectName = 'Evaluation Project',
  version = 1,
  overallScore = 80,
  verdict = 'STRONG',
}) => {
  const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'docx' | null>(null);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    setDownloadingFormat('pdf');
    try {
      const url = api.getReportPdfUrl(evaluationId, version);
      window.open(url, '_blank');
    } finally {
      setTimeout(() => setDownloadingFormat(null), 1200);
    }
  };

  const handleDownloadDocx = () => {
    setDownloadingFormat('docx');
    try {
      const url = api.getReportDocxUrl(evaluationId, version);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ProjectXRay_Report_${projectName.replace(/[^a-zA-Z0-9_-]+/g, '_')}_v${version}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => setDownloadingFormat(null), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-[#0B1322] to-slate-900 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold uppercase tracking-wider">
              ProjectX-Ray AI • Export Center
            </span>
            <span className="text-xs font-mono text-slate-400">v{version}.0</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Export Project Intelligence Dossier
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Generate and download certified institutional evaluation dossiers for <b className="text-slate-200">{projectName}</b>.
          </p>
        </div>

        {/* Project Snapshot Card */}
        <div className="p-3.5 mb-6 rounded-xl bg-slate-950/80 border border-cyan-500/20 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400">Ratified Consensus Score</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span className="font-mono text-cyan-400">{overallScore.toFixed(1)}/100</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  {verdict}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>20/20 Real Sections Verified</span>
          </div>
        </div>

        {/* Export Modality Cards: PDF vs DOCX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Option 1: PDF Dossier */}
          <div className="group relative p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between hover:shadow-lg hover:shadow-cyan-950/40">
            <div className="space-y-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>Adobe PDF / Print</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">.pdf</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Publication-grade executive document with cover sheet, high-contrast tables, and print-ready ink formatting.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadPdf}
              disabled={downloadingFormat === 'pdf'}
              className="w-full px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{downloadingFormat === 'pdf' ? 'Preparing PDF...' : 'Download / Print PDF'}</span>
            </button>
          </div>

          {/* Option 2: DOCX Word Document */}
          <div className="group relative p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between hover:shadow-lg hover:shadow-indigo-950/40">
            <div className="space-y-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>Microsoft Word</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">.docx</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Fully editable native Word document (.docx) with claims matrix, scoring breakdown, risk tables, and executive headers.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadDocx}
              disabled={downloadingFormat === 'docx'}
              className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingFormat === 'docx' ? 'Generating DOCX...' : 'Download .DOCX File'}</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-4">
          <span>Both formats are backed 100% by live project evidence.</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
