import React from 'react';
import {
  FileText,
  X,
  Download,
  Printer,
  AlertTriangle,
  Award,
} from 'lucide-react';
import type { OriginalityBundle } from '../../types/originalityIntelligence';

interface OriginalityReportModalProps {
  bundle: OriginalityBundle;
  onClose: () => void;
}

export const OriginalityReportModal: React.FC<OriginalityReportModalProps> = ({
  bundle,
  onClose,
}) => {
  const { profile, dimensions, contributions } = bundle;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Originality_Report_${profile.evaluationId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#090D16] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Originality & Multi-Dimensional Similarity Dossier
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Evaluation ID: {profile.evaluationId} &bull; Generated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Print Dossier"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadJson}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Download JSON Report"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-200 text-xs font-sans">
          {/* Executive Overview */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-white font-display text-sm">Executive Originality Synthesis</span>
              </div>
              <span className="px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/40">
                {profile.classification.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center py-2 border-y border-white/10">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Originality Index</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                  {profile.overallOriginalityScore}%
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Similarity Score</span>
                <div className="text-2xl font-bold font-mono text-amber-400 mt-0.5">
                  {profile.overallSimilarityScore}%
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Confidence</span>
                <div className="text-2xl font-bold font-mono text-cyan-400 mt-0.5">
                  {Math.round(profile.confidence * 100)}%
                </div>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed font-sans text-xs">
              {profile.explanation}
            </p>
          </div>

          {/* Dimension Breakdown Table */}
          <div className="space-y-3">
            <h4 className="font-bold font-display text-white text-sm">Dimension Evaluation Summary</h4>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-white/5 font-mono text-slate-400 uppercase text-[10px]">
                  <tr className="border-b border-white/10">
                    <th className="p-2.5">Dimension</th>
                    <th className="p-2.5">Score</th>
                    <th className="p-2.5">Confidence</th>
                    <th className="p-2.5">Analytical Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {dimensions.map((d) => (
                    <tr key={d.id}>
                      <td className="p-2.5 font-bold text-white">{d.dimension.replace(/_/g, ' ')}</td>
                      <td className="p-2.5">
                        <span className={d.score >= 70 ? 'text-rose-400' : d.score >= 40 ? 'text-amber-400' : 'text-emerald-400'}>
                          {d.score}%
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-400">{Math.round(d.confidence * 100)}%</td>
                      <td className="p-2.5 text-slate-300 font-sans text-[11px] max-w-md">{d.explanation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unique Contributions */}
          <div className="space-y-3">
            <h4 className="font-bold font-display text-white text-sm">Verified Novel Contributions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contributions.map((uc) => (
                <div key={uc.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-emerald-400">{uc.contributionType.replace(/_/g, ' ')}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">{uc.importance}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] font-sans leading-relaxed">{uc.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Limitations & Non-Accusation Disclosures */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Evidence Limitations & Fair Audit Disclosure</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
              This intelligence evaluation is strictly restricted to publicly accessible open-source repositories,
              academic pre-prints, patent claims, and demonstrative video feeds. Common open-source frameworks (such as
              OpenCV, YOLO, and React) are common architectural utilities and do not imply conceptual derivation.
              The findings serve as a structured advisory investigation for evaluators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
