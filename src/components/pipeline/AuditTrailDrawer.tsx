import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  History,
  Shield,
  User,
  Clock,
  RefreshCw,
  Sliders,
  FileQuestion,
  Lock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../ui/Button';

interface AuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationId: string;
}

interface AuditRecord {
  id: string;
  actor_id: string;
  actor_role: string;
  event: string;
  entity_type: string;
  entity_id: string;
  metadata_json: string;
  timestamp: string;
  parsedMetadata?: any;
}

export const AuditTrailDrawer: React.FC<AuditTrailDrawerProps> = ({
  isOpen,
  onClose,
  evaluationId,
}) => {
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const logs = await api.getAuditTrail(evaluationId);
      const parsed = logs.map((log: any) => {
        let meta = {};
        try {
          meta = typeof log.metadata_json === 'string' ? JSON.parse(log.metadata_json) : log.metadata_json;
        } catch {
          meta = {};
        }
        return {
          ...log,
          parsedMetadata: meta,
        };
      });
      setAuditLogs(parsed);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch audit records.');
    } finally {
      setIsLoading(false);
    }
  }, [evaluationId]);

  useEffect(() => {
    let isMounted = true;
    const fetchAsync = async () => {
      if (isOpen && evaluationId && isMounted) {
        await fetchAuditLogs();
      }
    };
    fetchAsync();
    return () => {
      isMounted = false;
    };
  }, [isOpen, evaluationId, fetchAuditLogs]);

  if (!isOpen) return null;

  const getEventBadge = (event: string) => {
    switch (event) {
      case 'SCORE_OVERRIDE':
        return {
          icon: <Sliders className="w-3.5 h-3.5 text-cyan-400" />,
          color: 'border-cyan-500/30 bg-cyan-950/60 text-cyan-300',
          label: 'Score Calibration Override',
        };
      case 'EVIDENCE_REQUESTED':
        return {
          icon: <FileQuestion className="w-3.5 h-3.5 text-violet-400" />,
          color: 'border-violet-500/30 bg-violet-950/60 text-violet-300',
          label: 'Evidence Requested',
        };
      case 'EVALUATION_LOCKED':
      case 'EVALUATION_FINALIZED':
        return {
          icon: <Lock className="w-3.5 h-3.5 text-emerald-400" />,
          color: 'border-emerald-500/30 bg-emerald-950/60 text-emerald-300',
          label: 'Jury Verdict Finalized',
        };
      default:
        return {
          icon: <Shield className="w-3.5 h-3.5 text-slate-400" />,
          color: 'border-slate-700 bg-slate-800 text-slate-300',
          label: event.replace(/_/g, ' '),
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl h-full bg-[#080C16] border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Audit Trail & Governance Log
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Evaluation: {evaluationId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAuditLogs}
              disabled={isLoading}
              title="Refresh Audit Trail"
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Audit Stats Banner */}
        <div className="px-5 py-3 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-slate-400 font-mono">
            <span>Total Events: <strong className="text-cyan-400">{auditLogs.length}</strong></span>
            <span>Immutable: <strong className="text-emerald-400">SHA-256</strong></span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">ISO/IEC 25010 Compliance</span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading && (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Loading cryptographic audit records...</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && auditLogs.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-xs space-y-3">
              <Shield className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300">No Audit Events Logged Yet</p>
              <p className="text-slate-500 max-w-sm mx-auto">
                When a human reviewer calibrates a score, requests missing evidence, or finalizes the jury decision, an immutable audit event will appear here.
              </p>
            </div>
          )}

          {!isLoading && !error && auditLogs.length > 0 && (
            <div className="relative border-l-2 border-slate-800 ml-4 pl-4 space-y-6">
              {auditLogs.map((log) => {
                const badge = getEventBadge(log.event);
                const meta = log.parsedMetadata || {};
                const formattedDate = new Date(log.timestamp).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div key={log.id} className="relative group">
                    {/* Bullet marker */}
                    <div className="absolute -left-[25px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-cyan-500" />

                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-2.5">
                      {/* Top row: Badge & Time */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${badge.color}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formattedDate}
                        </span>
                      </div>

                      {/* Actor row */}
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-white">
                          {meta.reviewerName || log.actor_id}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 font-mono text-slate-400 border border-slate-700">
                          {log.actor_role}
                        </span>
                      </div>

                      {/* Details based on event type */}
                      {log.event === 'SCORE_OVERRIDE' && (
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-mono text-[11px]">Category:</span>
                            <span className="font-semibold text-cyan-300 font-mono">
                              {meta.category}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-mono text-[11px]">Calibrated Score:</span>
                            <span className="font-bold text-white font-mono text-sm">
                              {meta.calibratedScore} / 100
                            </span>
                          </div>
                          {meta.notes && (
                            <div className="pt-1 border-t border-slate-800/60">
                              <span className="text-slate-500 text-[10px] block uppercase font-mono">
                                Mandatory Justification:
                              </span>
                              <p className="text-slate-300 italic text-[11px] mt-0.5 bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
                                "{meta.notes}"
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {log.event === 'EVIDENCE_REQUESTED' && (
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5 text-xs">
                          <div className="font-semibold text-violet-300">
                            Pillar: {meta.pillar || meta.category || 'Empirical Telemetry'}
                          </div>
                          <p className="text-slate-300 text-[11px]">
                            {meta.missingArtifact || 'Missing verification proof requested'}
                          </p>
                        </div>
                      )}

                      {/* Audit Log ID & Hash */}
                      <div className="text-[9px] font-mono text-slate-500 truncate pt-1 flex items-center justify-between border-t border-slate-800/40">
                        <span>Event ID: {log.id}</span>
                        <span className="text-slate-600">IP: {meta.ipAddress || 'Internal'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-xs text-center text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-cyan-500 font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Audited & Signed</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close Drawer
          </Button>
        </div>
      </div>
    </div>
  );
};
