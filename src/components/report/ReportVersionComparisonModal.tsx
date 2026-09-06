import React, { useState, useEffect } from 'react';
import { 
  X, 
  GitCompare, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import type { ReportDiff, ReportVersionMeta } from '../../types/report';

interface ReportVersionComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationId: string;
  versions: ReportVersionMeta[];
  currentVersion: number;
}

export const ReportVersionComparisonModal: React.FC<ReportVersionComparisonModalProps> = ({
  isOpen,
  onClose,
  evaluationId,
  versions = [],
  currentVersion
}) => {
  const [baseVersion, setBaseVersion] = useState<number>(1);
  const [targetVersion, setTargetVersion] = useState<number>(currentVersion || 3);
  const [diff, setDiff] = useState<ReportDiff | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (versions.length > 1) {
        const sorted = [...versions].sort((a, b) => a.version - b.version);
        setBaseVersion(sorted[0].version);
        setTargetVersion(sorted[sorted.length - 1].version);
      }
    }
  }, [isOpen, versions]);

  useEffect(() => {
    if (isOpen && baseVersion && targetVersion && baseVersion !== targetVersion) {
      loadDiff();
    }
  }, [isOpen, baseVersion, targetVersion]);

  const loadDiff = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.compareReportVersions(evaluationId, baseVersion, targetVersion);
      setDiff(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to compare report versions');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                Report Version Comparison & Diff
              </h2>
              <p className="text-xs text-slate-400">
                Track score evolution, newly verified evidence & resolved risks across audit iterations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Version Pickers */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Base:</span>
              <select
                value={baseVersion}
                onChange={(e) => setBaseVersion(parseInt(e.target.value, 10))}
                className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
              >
                {versions.map(v => (
                  <option key={v.version} value={v.version}>
                    v{v.version} ({v.overallScore.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-500" />

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Target:</span>
              <select
                value={targetVersion}
                onChange={(e) => setTargetVersion(parseInt(e.target.value, 10))}
                className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono"
              >
                {versions.map(v => (
                  <option key={v.version} value={v.version}>
                    v{v.version} ({v.overallScore.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Comparing iteration v{baseVersion} with v{targetVersion}
          </div>
        </div>

        {/* Diff Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading && (
            <div className="p-12 text-center text-slate-400 text-sm animate-pulse font-mono">
              Computing diff between versions...
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {!isLoading && diff && (
            <>
              {/* Overall Score Delta Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                    Master Evaluation Score Delta
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl font-bold font-mono text-slate-400">
                      v{baseVersion} → v{targetVersion}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 text-sm font-bold font-mono px-3 py-1.5 rounded-lg ${
                    diff.scoreDifference > 0 
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                      : diff.scoreDifference < 0 
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {diff.scoreDifference > 0 && <TrendingUp className="w-4 h-4" />}
                    {diff.scoreDifference < 0 && <TrendingDown className="w-4 h-4" />}
                    {diff.scoreDifference === 0 && <Minus className="w-4 h-4" />}
                    {diff.scoreDifference > 0 ? `+${diff.scoreDifference.toFixed(1)} pts` : `${diff.scoreDifference.toFixed(1)} pts`}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                    Verdict: {diff.previousVerdict} → {diff.currentVerdict}
                  </span>
                </div>
              </div>

              {/* Category Deltas Grid */}
              {diff.categoryScoreDiffs && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                    Category Score Deltas
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(diff.categoryScoreDiffs).map(([catKey, val]) => {
                      const isPositive = val.delta > 0;
                      const isNegative = val.delta < 0;
                      return (
                        <div 
                          key={catKey}
                          className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-xs font-medium text-slate-300 capitalize">
                              {catKey.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {val.v1.toFixed(1)} → {val.v2.toFixed(1)}
                            </div>
                          </div>
                          <span className={`text-xs font-mono font-bold ${
                            isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-500'
                          }`}>
                            {isPositive ? `+${val.delta.toFixed(1)}` : val.delta.toFixed(1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Added Evidence */}
              {diff.addedEvidenceIds && diff.addedEvidenceIds.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    New Verifiable Evidence Added (+{diff.addedEvidenceIds.length})
                  </h4>
                  <div className="space-y-1.5">
                    {diff.addedEvidenceIds.map((evId) => (
                      <div key={evId} className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-200 font-mono">
                        Evidence Reference: {evId}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reclassified Claims */}
              {diff.reclassifiedClaims && diff.reclassifiedClaims.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Claims Reclassified to Proven (+{diff.reclassifiedClaims.length})
                  </h4>
                  <div className="space-y-2">
                    {diff.reclassifiedClaims.map((rc) => (
                      <div key={rc.claimId} className="p-3 rounded-lg bg-sky-950/20 border border-sky-500/30 flex items-center justify-between text-xs">
                        <span className="text-slate-200 font-medium">{rc.claimId}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-900/60 text-sky-300 border border-sky-700">
                          {rc.fromStatus} → {rc.toStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
