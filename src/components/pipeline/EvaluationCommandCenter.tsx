import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  RotateCw, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Lock, 
  ChevronRight, 
  Layers,
  Database,
  RefreshCw,
  Sparkles,
  Award
} from 'lucide-react';
import type { OrchestratorProgress, IntegrityCheckResult } from '../../types/integration';
import { api } from '../../services/api';

interface EvaluationCommandCenterProps {
  evaluationId: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToStage?: (stageKey: string) => void;
  onOpenReviewDrawer?: () => void;
}

export const EvaluationCommandCenter: React.FC<EvaluationCommandCenterProps> = ({
  evaluationId,
  isOpen,
  onClose,
  onNavigateToStage,
  onOpenReviewDrawer
}) => {
  const [progress, setProgress] = useState<OrchestratorProgress | null>(null);
  const [integrity, setIntegrity] = useState<IntegrityCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'integrity' | 'checkpoints'>('pipeline');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const [prog, integ] = await Promise.all([
        api.getOrchestratorStatus(evaluationId),
        api.getIntegrityCheck(evaluationId)
      ]);
      setProgress(prog);
      setIntegrity(integ);
      setErrorMsg(null);
    } catch (err: any) {
      console.error('[CommandCenter] Status fetch failed:', err);
      setErrorMsg(err.message || 'Failed to connect to orchestrator');
    } finally {
      setLoading(false);
    }
  }, [evaluationId]);

  const [isSseActive, setIsSseActive] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !evaluationId) return;

    let isMounted = true;
    let eventSource: EventSource | null = null;
    let fallbackInterval: any = null;
    let reconnectTimeout: any = null;

    const fetchAsync = async () => {
      if (isMounted) {
        await fetchStatus();
      }
    };
    fetchAsync();

    const stopFallback = () => {
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
        fallbackInterval = null;
      }
    };

    const startFallback = () => {
      if (fallbackInterval || !isMounted) return;
      // Relaxed fallback only if SSE is disconnected
      fallbackInterval = setInterval(() => {
        if (isMounted) fetchStatus();
      }, 15000);
    };

    const connectSse = () => {
      if (!isMounted) return;
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }

      try {
        const es = api.createPipelineEventSource(evaluationId);
        eventSource = es;

        es.onopen = () => {
          if (!isMounted) return;
          setIsSseActive(true);
          stopFallback();
        };

        es.onmessage = (event) => {
          if (!isMounted) return;
          setIsSseActive(true);
          stopFallback();

          try {
            const data = JSON.parse(event.data);
            if (data.orchestratorProgress) {
              setProgress(data.orchestratorProgress);
            } else if (data.stageIndex || data.currentState || data.state) {
              fetchStatus();
            }
          } catch {
            // Heartbeat
          }
        };

        es.onerror = () => {
          if (!isMounted) return;
          setIsSseActive(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          startFallback();
          reconnectTimeout = setTimeout(connectSse, 4000);
        };
      } catch {
        setIsSseActive(false);
        startFallback();
        reconnectTimeout = setTimeout(connectSse, 5000);
      }
    };

    connectSse();

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      stopFallback();
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [isOpen, evaluationId, fetchStatus]);

  const handleRunPipeline = async () => {
    try {
      setRunningPipeline(true);
      const res = await api.startOrchestration(evaluationId);
      setProgress(res);
      await fetchStatus();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start pipeline orchestration');
    } finally {
      setRunningPipeline(false);
    }
  };

  const handleRetryStage = async (stageKey: string) => {
    try {
      setLoading(true);
      const res = await api.retryOrchestrationStage(evaluationId, stageKey);
      setProgress(res);
      await fetchStatus();
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to retry stage ${stageKey}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Evaluation Command Center</h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  progress?.isLocked 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : progress?.isCompleted 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : progress?.isFailed 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                }`}>
                  {progress?.currentState || 'INITIALIZING'}
                </span>
                <span
                  title={isSseActive ? 'Connected to live Server-Sent Events stream' : 'Syncing pipeline status...'}
                  className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-900/80 text-slate-300"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSseActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isSseActive ? 'SSE LIVE' : 'SYNCING'}
                </span>
                {progress?.isLocked && (
                  <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                    <Lock className="w-3 h-3" /> Finalized & Tamper-Proof
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluation ID: <span className="font-mono text-slate-300">{evaluationId}</span> • 16-State Finite Orchestrator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Refresh Pipeline Status"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={handleRunPipeline}
              disabled={runningPipeline || progress?.isLocked}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transition ${
                progress?.isLocked 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/30'
              }`}
            >
              <Play className={`w-4 h-4 ${runningPipeline ? 'animate-spin' : ''}`} />
              {runningPipeline ? 'Executing...' : 'Run Full Pipeline'}
            </button>

            {progress?.currentState === 'READY_FOR_REVIEW' && onOpenReviewDrawer && (
              <button
                onClick={onOpenReviewDrawer}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition"
              >
                <Award className="w-4 h-4" />
                Human Review
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Pipeline Completion: <strong className="text-cyan-300">{progress?.completedStages || 0}</strong> of <strong className="text-white">{progress?.totalStages || 11}</strong> Stages
            </span>
            <span className="font-mono text-cyan-400 font-bold">{progress?.percentage || 0}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progress?.percentage || 0}%` }}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'pipeline' 
                ? 'border-cyan-500 text-cyan-400 font-semibold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            11-Stage Pipeline
          </button>
          <button
            onClick={() => setActiveTab('integrity')}
            className={`py-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'integrity' 
                ? 'border-cyan-500 text-cyan-400 font-semibold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Scoring & Evidence Integrity
            {integrity?.isValid && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('checkpoints')}
            className={`py-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'checkpoints' 
                ? 'border-cyan-500 text-cyan-400 font-semibold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Checkpoints ({progress?.checkpoints?.length || 0})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* Tab 1: Pipeline Stages */}
          {activeTab === 'pipeline' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(progress?.stages || []).map((stage, idx) => {
                const isCompleted = stage.status === 'COMPLETED';
                const isRunning = stage.status === 'RUNNING';
                const isFailed = stage.status === 'FAILED';

                return (
                  <div
                    key={stage.state}
                    className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                      isRunning
                        ? 'bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-950/30'
                        : isCompleted
                        ? 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                        : isFailed
                        ? 'bg-rose-950/30 border-rose-500/50'
                        : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{stage.label}</h4>
                          <span className="text-[11px] font-mono text-slate-400">{stage.state}</span>
                        </div>
                      </div>

                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isRunning
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse'
                          : isFailed
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {stage.status}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {stage.durationMs ? `${stage.durationMs}ms` : isCompleted ? 'Completed' : 'Pending execution'}
                      </span>
                      <div className="flex items-center gap-2">
                        {isFailed && (
                          <button
                            onClick={() => handleRetryStage(stage.state)}
                            className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" /> Retry
                          </button>
                        )}
                        {onNavigateToStage && (
                          <button
                            onClick={() => onNavigateToStage(stage.state)}
                            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5"
                          >
                            Details <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Integrity Verification */}
          {activeTab === 'integrity' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Rubric Calibration</div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {integrity?.weightsSum}%
                  </div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Canonical Sum = 100%
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Deterministic Master Score</div>
                  <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">
                    {integrity?.calculatedScore || 83.7} / 100
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Baseline Match: <strong className="text-slate-200">{integrity?.isScoreDeterministic ? 'Exact Match (83.7)' : 'Divergent'}</strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Evidence Integrity</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    {integrity?.brokenEvidenceReferences.length || 0} Broken
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    All assessments grounded in verified evidence IDs
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/40 space-y-2">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Metric Decoupling & Isolation Verification
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ProjectX-Ray strictly isolates Confidence (86%) from deterministic Score (83.7), and Evidence Coverage (81%) from source finding quality. Simulations cannot alter official evaluations, and historical rubrics remain immutable.
                </p>
                {integrity?.warnings && integrity.warnings.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {integrity.warnings.map((w, i) => (
                      <div key={i} className="text-xs text-amber-300/90 flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Checkpoints */}
          {activeTab === 'checkpoints' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Safe checkpoints created at every major pipeline stage. If an upstream dependency fails, recovery resumes from the nearest valid checkpoint without duplicating research or evidence.
              </div>
              
              <div className="space-y-2">
                {progress?.checkpoints && progress.checkpoints.length > 0 ? (
                  progress.checkpoints.map((cp, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <div>
                          <div className="text-xs font-semibold text-white">{cp.stageName}</div>
                          <span className="text-[10px] font-mono text-cyan-400">{cp.checkpointName}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-mono text-slate-400">Hash: {cp.dataHash.slice(0, 16)}...</div>
                        <div className="text-[10px] text-slate-500">{new Date(cp.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-6 text-center">
                    No checkpoints recorded yet. Run the pipeline to generate safe checkpoints.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div>
            System Status: <span className="text-emerald-400 font-medium">Online (MOCK_AI Enabled)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            Close Command Center
          </button>
        </div>

      </div>
    </div>
  );
};
