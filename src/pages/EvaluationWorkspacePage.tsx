import React, { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Sparkles,
  Share2,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  Compass,
  Cpu,
  Fingerprint,
  CheckSquare,
  Globe2,
  Tv,
  Scale,
  FileCheck2,
  FileText,
  Search,
  Radio,
  Activity,
  Award,
  Lock,
  RefreshCw,
  ArrowLeft,
  History,
  Sliders,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ScoreCard } from '../components/ui/ScoreCard';
import { RiskCard } from '../components/ui/RiskCard';
import { OverviewRadarChart } from '../components/evaluation/OverviewRadarChart';
import { MOCK_EVALUATIONS } from '../data/mockEvaluationsList';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ApiErrorAlert } from '../components/ui/ApiErrorAlert';

// Existing deep modules
import { ProjectUnderstandingModule } from '../components/project-understanding/ProjectUnderstandingModule';
import { TechnicalAuditorModule } from '../components/technical-auditor/TechnicalAuditorModule';
import { OriginalityIntelligenceModule } from '../components/originality-intelligence/OriginalityIntelligenceModule';
import { ClaimVerificationModule } from '../components/claim-verification/ClaimVerificationModule';
import { ImpactFeasibilityModule } from '../components/impact-feasibility/ImpactFeasibilityModule';
import { PresentationDemoModule } from '../components/presentation-demo/PresentationDemoModule';
import { AIJuryModule } from '../components/ai-jury/AIJuryModule';
import { DocumentIntelligenceModule } from '../components/document-intelligence/DocumentIntelligenceModule';
import { ResearchIntelligenceModule } from '../components/research-intelligence/ResearchIntelligenceModule';
import { ReportWorkspace } from '../components/report/ReportWorkspace';
import { LiveSetupScreen } from '../components/live/LiveSetupScreen';
import { LiveCameraRoom } from '../components/live/LiveCameraRoom';
import { LiveSummaryCard } from '../components/live/LiveSummaryCard';
import { EvaluationCommandCenter } from '../components/pipeline/EvaluationCommandCenter';
import { HumanReviewDrawer } from '../components/pipeline/HumanReviewDrawer';
import { EvaluationErrorCenter } from '../components/pipeline/EvaluationErrorCenter';
import { ScoreCalibrationModal } from '../components/ai-jury/ScoreCalibrationModal';
import { AuditTrailDrawer } from '../components/pipeline/AuditTrailDrawer';
import { EvidenceChecklistModule } from '../components/evidence/EvidenceChecklistModule';
import { EvaluationStreamView } from '../components/pipeline/EvaluationStreamView';
import type { LiveCameraSource, LiveJurySession, LiveScoreSnapshot } from '../types/liveJury';
import type { OrchestratorProgress } from '../types/integration';

export const EvaluationWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Only allow initial mock data if explicitly enabled in development/testing
  const allowDevMock = api.isMockFallbackAllowed();
  const matchingMock = allowDevMock ? MOCK_EVALUATIONS.find(p => p.id === id) : null;
  const [project, setProject] = useState<typeof MOCK_EVALUATIONS[0] | null>(matchingMock || null);
  const [isLoading, setIsLoading] = useState<boolean>(!matchingMock);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastApiError, setLastApiError] = useState<any | null>(null);
  const [evalId, setEvalId] = useState<string>(
    id?.startsWith('eval_') ? id : (id === 'smart-road-vision' ? 'eval_smart-road-vision' : `eval_${id}`)
  );

  const { currentUser, isJudge } = useAuth();
  const [isCalibrationOpen, setIsCalibrationOpen] = useState<boolean>(false);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState<boolean>(false);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState<boolean>(false);

  const loadData = React.useCallback(async (showLoader = false) => {
    if (!id) return;
    if (showLoader) setIsLoading(true);
    setErrorMessage(null);
    setLastApiError(null);

    try {
      // 1. Resolve Evaluation Record from API
      const evalData = await api.getEvaluationById(id);
      const resolvedEvalId = evalData?.id || (id.startsWith('eval_') ? id : (id === 'smart-road-vision' ? 'eval_smart-road-vision' : `eval_${id}`));
      const resolvedProjectId = evalData?.projectId || (id.startsWith('eval_') ? id.replace(/^eval_/, '') : id);

      setEvalId(resolvedEvalId);

      // 2. Fetch Project Metadata & Live Master Scores in parallel
      const [projectData, masterScore] = await Promise.all([
        api.getProjectById(resolvedProjectId).catch(() => null),
        api.getMasterScore(resolvedEvalId).catch(() => null),
      ]);

      setProject((prev: any) => {
        const base = prev || {
          id: resolvedProjectId,
          name: projectData?.name || 'Evaluation Project',
          type: 'Software',
          domain: 'General Technology',
          team: 'Engineering Team',
          overallScore: 0,
          confidence: 0,
          verdict: 'PENDING',
          breakdown: [],
          strengths: ['Robust multi-source cross-referencing and architectural grounding.'],
          weaknesses: ['Benchmark datasets could benefit from broader stress testing.'],
          risks: ['Edge deployment scalability under peak traffic load.'],
          nextSteps: ['Conduct automated multi-tenant stress benchmarking.'],
        };
        const updated = {
          ...base,
          id: resolvedProjectId,
          ...(projectData || {}),
          name: projectData?.name || base.name,
          team: projectData?.teamName || base.team,
          domain: projectData?.domain || base.domain,
          type: projectData?.architectureType
            ? (projectData.architectureType.charAt(0).toUpperCase() + projectData.architectureType.slice(1).toLowerCase())
            : base.type,
          overallScore: evalData?.overallScore ?? masterScore?.masterScore ?? base.overallScore,
          confidence: evalData?.confidence ?? masterScore?.confidence ?? base.confidence,
          verdict: evalData?.verdict ?? (masterScore?.verdict?.label || base.verdict),
          executiveSummary: evalData?.executiveSummary || base.executiveSummary,
          strengths: projectData?.strengths || base.strengths || [],
          weaknesses: projectData?.weaknesses || base.weaknesses || [],
          risks: projectData?.risks || base.risks || [],
          nextSteps: projectData?.nextSteps || base.nextSteps || [],
        };

        // If master score has category breakdown, bind it to the radar chart & scorecards
        if (masterScore?.categoryScores) {
          updated.breakdown = Object.entries(masterScore.categoryScores).map(([cat, val]: [string, any]) => ({
            category: cat.charAt(0).toUpperCase() + cat.slice(1),
            score: typeof val === 'number' ? val : (val.score || 75),
            weight: val.weight || 15,
            confidence: val.confidence || 85,
            evidenceCount: val.evidenceCount || 6,
          }));
        }

        if (masterScore?.strengths && masterScore.strengths.length > 0) {
          updated.strengths = masterScore.strengths;
        }
        if (masterScore?.weaknesses && masterScore.weaknesses.length > 0) {
          updated.weaknesses = masterScore.weaknesses;
        }

        return updated;
      });
    } catch (err: any) {
      setLastApiError(err);
      if (api.isMockFallbackAllowed()) {
        const mockFallback = MOCK_EVALUATIONS.find(p => p.id === id);
        if (mockFallback) {
          console.warn(`[EvaluationWorkspacePage] DEV ONLY: Using mock evaluation for "${id}"`);
          setProject(mockFallback);
          return;
        }
      }
      setErrorMessage(err?.message || `Evaluation "${id}" could not be loaded from backend API.`);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchAsync = async () => {
      if (isMounted) {
        await loadData();
      }
    };
    fetchAsync();
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  // Determine active tab from URL path
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[3] || 'overview';

  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const projectId = project?.id || id || '';

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart2, path: `/evaluations/${projectId}` },
    { key: 'project', label: 'Project DNA', icon: Compass, path: `/evaluations/${projectId}/project` },
    { key: 'technical', label: 'Technical', icon: Cpu, path: `/evaluations/${projectId}/technical` },
    { key: 'originality', label: 'Originality', icon: Fingerprint, path: `/evaluations/${projectId}/originality` },
    { key: 'claims', label: 'Claims', icon: CheckSquare, path: `/evaluations/${projectId}/claims` },
    { key: 'checklist', label: 'Evidence Checklist', icon: ShieldCheck, path: `/evaluations/${projectId}/checklist` },
    { key: 'research', label: 'Research', icon: Search, path: `/evaluations/${projectId}/research` },
    { key: 'impact', label: 'Impact', icon: Globe2, path: `/evaluations/${projectId}/impact` },
    { key: 'presentation', label: 'Presentation', icon: Tv, path: `/evaluations/${projectId}/presentation` },
    { key: 'jury', label: 'AI Jury', icon: Scale, path: `/evaluations/${projectId}/jury` },
    { key: 'live', label: 'Live Jury', icon: Radio, path: `/evaluations/${projectId}/live` },
    { key: 'documents', label: 'Doc Intelligence', icon: FileText, path: `/evaluations/${projectId}/documents` },
    { key: 'report', label: 'Report', icon: FileCheck2, path: `/evaluations/${projectId}/report` },
  ];

  const handleFinalizeEvaluation = async () => {
    if (!currentUser.canFinalize) {
      setNotificationMessage('Only Lead Reviewers (Jury Chair) or Admins have ratification authority.');
      return;
    }
    setIsFinalizing(true);
    try {
      await api.finalizeEvaluation(evalId, `Evaluation ratified and locked by ${currentUser.name} (${currentUser.roleLabel})`);
      setNotificationMessage('Evaluation ratified and permanently locked into the institutional audit registry.');
      loadData();
    } catch (err: any) {
      setNotificationMessage(err?.message || 'Failed to finalize evaluation.');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setNotificationMessage('Evaluation link copied to clipboard!');
    setTimeout(() => setNotificationMessage(null), 3000);
  };

  const handleExport = () => {
    setNotificationMessage('Generating and downloading institutional PDF evaluation dossier...');
    window.open(api.getReportPdfUrl(evalId), '_blank');
    setTimeout(() => setNotificationMessage(null), 4000);
  };

  const [liveRoomState, setLiveRoomState] = useState<'SETUP' | 'ROOM' | 'SUMMARY'>('SETUP');
  const [liveCameraSource, setLiveCameraSource] = useState<LiveCameraSource>('SIMULATED');
  const [liveSessionData, setLiveSessionData] = useState<LiveJurySession | null>(null);
  const [liveSnapshotData, setLiveSnapshotData] = useState<LiveScoreSnapshot | null>(null);

  // Phase 12: Orchestrator & Review Drawer States
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState<OrchestratorProgress | null>(null);
  const [isSseActive, setIsSseActive] = useState<boolean>(false);

  const fetchPipelineProgress = React.useCallback(() => {
    api.getOrchestratorStatus(evalId).then(setPipelineProgress).catch(() => {});
  }, [evalId]);

  // Real-time Pipeline Progress via Server-Sent Events (SSE)
  React.useEffect(() => {
    let isMounted = true;
    let eventSource: EventSource | null = null;
    let fallbackInterval: any = null;
    let reconnectTimeout: any = null;

    // Initial state snapshot
    fetchPipelineProgress();

    const stopFallback = () => {
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
        fallbackInterval = null;
      }
    };

    const startFallback = () => {
      if (fallbackInterval || !isMounted) return;
      // Relaxed heartbeat fallback only if SSE is completely offline
      fallbackInterval = setInterval(() => {
        if (isMounted) {
          fetchPipelineProgress();
        }
      }, 20000);
    };

    const connectSse = () => {
      if (!isMounted) return;

      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }

      try {
        const es = api.createPipelineEventSource(evalId);
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
              setPipelineProgress(data.orchestratorProgress);
            } else if (data.stageIndex || data.currentState || data.state) {
              fetchPipelineProgress();
            }

            // Real-time refresh of master scores & dossier if completed or transitioned
            if (data.isCompleted || data.state === 'COMPLETED' || data.currentState === 'FINAL' || data.currentState === 'READY_FOR_REVIEW') {
              loadData();
              fetchPipelineProgress();
            }
          } catch {
            // Heartbeat comments or ping messages
          }
        };

        es.onerror = () => {
          if (!isMounted) return;
          setIsSseActive(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Only fall back to slow sync while SSE is disconnected
          startFallback();
          // Auto-reconnect after 4s
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
  }, [evalId, fetchPipelineProgress, loadData]);

  const handleNavigateFromStage = (stageKey: string) => {
    setIsCommandCenterOpen(false);
    switch (stageKey) {
      case 'UNDERSTANDING':
        navigate(`/evaluations/${projectId}/project`);
        break;
      case 'ANALYZING_MEDIA':
        navigate(`/evaluations/${projectId}/presentation`);
        break;
      case 'RESEARCHING':
        navigate(`/evaluations/${projectId}/research`);
        break;
      case 'ANALYZING_ORIGINALITY':
        navigate(`/evaluations/${projectId}/originality`);
        break;
      case 'VERIFYING_CLAIMS':
        navigate(`/evaluations/${projectId}/claims`);
        break;
      case 'EVALUATING':
        navigate(`/evaluations/${projectId}/technical`);
        break;
      case 'SCORING':
      case 'JURY_REVIEW':
        navigate(`/evaluations/${projectId}/jury`);
        break;
      case 'REPORT_GENERATING':
        navigate(`/evaluations/${projectId}/report`);
        break;
      default:
        navigate(`/evaluations/${projectId}`);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'live') {
      api.getLiveSession(evalId).then(sess => {
        if (sess) {
          setLiveSessionData(sess);
          if (sess.status === 'COMPLETED') {
            setLiveRoomState('SUMMARY');
          } else if (sess.status === 'LIVE' || sess.status === 'PAUSED') {
            setLiveRoomState('ROOM');
          }
        }
      });
      api.getLiveScoreSnapshot(evalId).then(snap => {
        if (snap) setLiveSnapshotData(snap);
      });
    }
  }, [activeTab, evalId]);

  if (errorMessage && !project) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-4">
          <ApiErrorAlert
            error={lastApiError || errorMessage}
            title="Failed to Load Evaluation"
            onRetry={() => loadData(true)}
            isRetrying={isLoading}
          />
          <div className="text-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/evaluations')}
              className="text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Return to All Evaluations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !project) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-xs font-mono">Loading evaluation workspace...</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Persistent Top Evaluation Header */}
      <div className="rounded-2xl p-5 sm:p-6 bg-slate-900/80 border border-slate-800/80 shadow-lg backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Project title & metadata */}
          <div className="space-y-1.5 max-w-2xl min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {project.type}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {project.domain}
              </span>
              <Badge variant="emerald" dot>
                Analysis Complete
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight uppercase truncate">
              {project.name}
            </h1>

            <p className="text-xs text-slate-400 truncate">
              Submitted by <strong className="text-slate-300">{project.team}</strong> • Updated {project.updatedAt}
            </p>
          </div>

          {/* Right: Overall Score, Confidence, and Actions */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-4">
              {/* Score pill */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                  Overall Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                    {project.overallScore.toFixed(1)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">/100</span>
                </div>
              </div>

              {/* Confidence pill */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                  Confidence
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
                    {project.confidence}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">calibrated</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <div
                title={isSseActive ? 'Real-time Server-Sent Events stream active' : 'Connecting to SSE pipeline stream...'}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border bg-slate-900/90 border-slate-800 text-slate-300 shadow-sm"
              >
                <span className={`w-2 h-2 rounded-full ${isSseActive ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'}`} />
                <span className="text-[10px] tracking-wide font-medium">{isSseActive ? 'SSE LIVE' : 'SYNCING'}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLiveStreamOpen(true)}
                className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-950/40 bg-slate-900/90"
              >
                <Zap className="w-3.5 h-3.5 mr-1 text-amber-400" />
                <span>Live Stream</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCommandCenterOpen(true)}
                className="text-xs border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40 bg-slate-900/90"
              >
                <Activity className="w-3.5 h-3.5 mr-1 text-cyan-400 animate-pulse" />
                <span>Command Center</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReviewDrawerOpen(true)}
                className={`text-xs ${
                  pipelineProgress?.currentState === 'READY_FOR_REVIEW'
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/40 font-bold'
                    : 'text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5 mr-1 text-amber-400" />
                <span>Human Review</span>
              </Button>

              {pipelineProgress?.isLocked && (
                <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800/60 font-semibold">
                  <Lock className="w-3 h-3" /> FINAL (Locked)
                </span>
              )}

              <Button variant="outline" size="sm" onClick={handleShare} className="text-xs">
                <Share2 className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button variant="primary" size="sm" onClick={handleExport} className="text-xs">
                <Download className="w-3.5 h-3.5 mr-1" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </div>

        {notificationMessage && (
          <div className="mt-3 p-2 text-center rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-300 animate-fadeIn">
            {notificationMessage}
          </div>
        )}

        {/* Evaluation Error Center on Pipeline Failure */}
        {pipelineProgress?.isFailed && (
          <EvaluationErrorCenter
            evaluationId={evalId}
            stageName={pipelineProgress.errorStage || 'RESEARCHING'}
            errorMessage={pipelineProgress.errorMessage || 'Primary research provider temporarily unavailable.'}
            onRetry={() => {
              api.retryOrchestrationStage(evalId, pipelineProgress.errorStage || 'READY')
                .then(fetchPipelineProgress)
                .catch(() => {});
            }}
          />
        )}

        {/* Human Reviewer Trust Gate Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-[#0b1322] border border-cyan-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white">
                  Reviewer Governance & Evidence Gate
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${currentUser.badgeColor}`}>
                  {currentUser.name} ({currentUser.roleLabel})
                </span>
                {pipelineProgress?.isLocked ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                    Verdict Ratified & Sealed
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                    Open for Calibration & Audit
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isJudge
                  ? 'As an institutional reviewer, you can adjust category scores with mandatory audit justification, inspect evidence, or ratify findings.'
                  : 'Student Project Owner View: Inspect evidentiary backing, missing proof flags, and jury deliberations.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {isJudge && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCalibrationOpen(true)}
                disabled={pipelineProgress?.isLocked}
                className="text-xs border-cyan-500/50 text-cyan-300 hover:bg-cyan-950/60 shadow-sm"
              >
                <Sliders className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                <span>Calibrate Scores</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAuditTrailOpen(true)}
              className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <History className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>Audit Trail</span>
            </Button>

            <Link to={`/evaluations/${projectId}/checklist`}>
              <Button
                variant="outline"
                size="sm"
                className={`text-xs ${
                  activeTab === 'checklist'
                    ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300 font-bold'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                <span>Evidence Checklist</span>
              </Button>
            </Link>

            {currentUser.canFinalize && !pipelineProgress?.isLocked && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleFinalizeEvaluation}
                disabled={isFinalizing}
                className="text-xs shadow-sm bg-emerald-600 hover:bg-emerald-500 border-emerald-400/40 text-white"
              >
                <Lock className="w-3.5 h-3.5 mr-1" />
                <span>{isFinalizing ? 'Sealing...' : 'Finalize & Ratify'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Persistent Secondary Navigation */}
      <div className="border-b border-slate-800/80 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-slate-950/40 backdrop-blur-sm sticky top-16 z-20 overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-1 min-w-max py-2" aria-label="Workspace Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected =
              tab.key === 'overview'
                ? activeTab === 'overview' || activeTab === '' || location.pathname === `/evaluations/${project.id}`
                : activeTab === tab.key;

            return (
              <Link
                key={tab.key}
                to={tab.path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-950/70 text-cyan-300 font-bold border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. Sub-View Body */}
      <div>
        {/* OVERVIEW TAB */}
        {(activeTab === 'overview' || activeTab === '' || location.pathname === `/evaluations/${project.id}`) && (
          <div className="space-y-8 animate-fadeIn">
            {/* Executive AI Summary Card */}
            <Card className="p-6 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 border-cyan-500/30 shadow-xl">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex-shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold">
                      Executive AI Summary
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Evaluator: Antigravity Multi-Agent Consensus
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                    "{project.executiveSummary}"
                  </h3>
                  <div className="pt-2 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                    <span>Domain: <strong className="text-slate-200">{project.domain}</strong></span>
                    <span>•</span>
                    <span>Total Ingested Evidence: <strong className="text-slate-200 font-mono">{project.evidenceCount} items</strong></span>
                    <span>•</span>
                    <span>Verified Claims: <strong className="text-slate-200 font-mono">{project.verifiedClaimsCount} / {project.claimsCount}</strong></span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Score Breakdown with Radar Chart */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
                    Multi-Dimensional Score Breakdown
                  </h2>
                  <p className="text-xs text-slate-400">
                    Weighted evaluation rubric with verified evidence counts and confidence calibration
                  </p>
                </div>
                <Badge variant="cyan" dot>Transparent Rubric</Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Radar Polygon */}
                <Card className="p-6 flex flex-col items-center justify-center text-center bg-slate-900/60 border-slate-800">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Jury Rubric Radar Profile
                  </div>
                  <OverviewRadarChart
                    data={project.breakdown.map(b => ({ category: b.category, score: b.score }))}
                    size={280}
                  />
                  <div className="mt-4 text-[11px] text-slate-400 font-mono">
                    Balanced profile across problem urgency and technical depth
                  </div>
                </Card>

                {/* Scorecards Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {project.breakdown.map((item, idx) => (
                    <ScoreCard
                      key={idx}
                      title={item.category}
                      score={item.score}
                      weight={item.weight}
                      confidence={item.confidence}
                      evidenceCount={item.evidenceCount}
                      explanation={`Category evaluated with ${item.evidenceCount} corroborating artifacts yielding a calibrated confidence score of ${item.confidence}%.`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths, Weaknesses, Risks, Next Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TOP STRENGTHS */}
              <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                    Top Strengths
                  </h3>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {(project.strengths || []).map((str: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{str}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* TOP WEAKNESSES */}
              <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                    Top Weaknesses
                  </h3>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {(project.weaknesses || []).map((weak: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed">{weak}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* KEY RISKS */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                  Detected Strategic & Technical Risks
                </h3>
                {(project.risks || []).map((risk: string, i: number) => (
                  <RiskCard
                    key={i}
                    title={`Identified Risk #${i + 1}`}
                    severity={i === 0 ? 'High' : 'Medium'}
                    description={risk}
                    mitigation="Address during the planned Q4 pilot bench testing phase."
                  />
                ))}
              </div>

              {/* RECOMMENDED NEXT STEPS */}
              <Card className="p-6 border-slate-800 bg-slate-900/60 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                    Recommended Next Steps
                  </h3>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {(project.nextSteps || []).map((step: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        )}

        {/* PROJECT DNA TAB */}
        {activeTab === 'project' && (
          <ProjectUnderstandingModule
            evaluationId={evalId}
            projectId={project.id}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
            onViewTechnicalAudit={() => navigate(`/evaluations/${project.id}/technical`)}
          />
        )}

        {/* TECHNICAL AUDIT TAB */}
        {activeTab === 'technical' && (
          <TechnicalAuditorModule
            evaluationId={evalId}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
            onViewOriginality={() => navigate(`/evaluations/${project.id}/originality`)}
          />
        )}

        {/* ORIGINALITY TAB (PHASE 6) */}
        {activeTab === 'originality' && (
          <OriginalityIntelligenceModule
            evaluationId={evalId}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
            onViewClaimVerification={() => navigate(`/evaluations/${project.id}/claims`)}
          />
        )}

        {/* CLAIMS TAB */}
        {activeTab === 'claims' && (
          <ClaimVerificationModule
            evaluationId={evalId}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
            onViewImpactFeasibility={() => navigate(`/evaluations/${project.id}/impact`)}
          />
        )}

        {/* EVIDENCE CHECKLIST TAB */}
        {activeTab === 'checklist' && (
          <EvidenceChecklistModule
            evaluationId={evalId}
            projectTitle={project.name}
            architectureType={project.type?.toUpperCase() || 'HYBRID'}
          />
        )}

        {/* RESEARCH INTELLIGENCE TAB (PHASE 5) */}
        {activeTab === 'research' && (
          <ResearchIntelligenceModule
            evaluationId={evalId}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
            onViewClaims={() => navigate(`/evaluations/${project.id}/claims`)}
            onViewTechnical={() => navigate(`/evaluations/${project.id}/technical`)}
          />
        )}

        {/* IMPACT TAB */}
        {activeTab === 'impact' && (
          <ImpactFeasibilityModule
            evaluationId={evalId}
            defaultProjectType={project.type?.toLowerCase() === 'hardware' ? 'hardware' : 'software'}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
          />
        )}

        {/* PRESENTATION TAB */}
        {activeTab === 'presentation' && (
          <PresentationDemoModule
            evaluationId={evalId}
            defaultProjectType={project.type?.toLowerCase() === 'hardware' ? 'hardware' : 'software'}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
            onViewAIJury={() => navigate(`/evaluations/${project.id}/jury`)}
          />
        )}

        {/* AI JURY TAB */}
        {activeTab === 'jury' && (
          <AIJuryModule
            evaluationId={evalId}
            projectId={project.id}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
            onViewDossier={() => navigate(`/evaluations/${project.id}/report`)}
            onViewPresentationDemo={() => navigate(`/evaluations/${project.id}/presentation`)}
          />
        )}

        {/* LIVE CAMERA AI JURY TAB (PHASE 11) */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {liveRoomState === 'SETUP' && (
              <LiveSetupScreen
                evaluationId={evalId}
                projectName={project.name}
                onEnterRoom={(src) => {
                  setLiveCameraSource(src);
                  setLiveRoomState('ROOM');
                }}
              />
            )}

            {liveRoomState === 'ROOM' && (
              <LiveCameraRoom
                evaluationId={evalId}
                projectName={project.name}
                cameraSource={liveCameraSource}
                onViewReport={() => navigate(`/evaluations/${project.id}/report`)}
                onLeaveRoom={() => setLiveRoomState('SETUP')}
              />
            )}

            {liveRoomState === 'SUMMARY' && liveSessionData && (
              <LiveSummaryCard
                session={liveSessionData}
                snapshot={liveSnapshotData}
                onViewReport={() => navigate(`/evaluations/${project.id}/report`)}
                onRestart={() => setLiveRoomState('SETUP')}
              />
            )}
          </div>
        )}

        {/* DOCUMENT INTELLIGENCE TAB */}
        {activeTab === 'documents' && (
          <DocumentIntelligenceModule
            evaluationId={evalId}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
            onViewClaims={() => navigate(`/evaluations/${project.id}/claims`)}
            onViewProjectDNA={() => navigate(`/evaluations/${project.id}/project`)}
          />
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <ReportWorkspace
            evaluationId={evalId}
            projectId={project.id}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
          />
        )}
      </div>

      {/* Phase 12: Command Center Modal */}
      <EvaluationCommandCenter
        evaluationId={evalId}
        isOpen={isCommandCenterOpen}
        onClose={() => setIsCommandCenterOpen(false)}
        onNavigateToStage={handleNavigateFromStage}
        onOpenReviewDrawer={() => {
          setIsCommandCenterOpen(false);
          setIsReviewDrawerOpen(true);
        }}
      />

      {/* Phase 12: Human Review Drawer */}
      <HumanReviewDrawer
        evaluationId={evalId}
        isOpen={isReviewDrawerOpen}
        onClose={() => setIsReviewDrawerOpen(false)}
        onFinalized={() => {
          fetchPipelineProgress();
          setNotificationMessage('Evaluation ratified and locked (FINAL).');
        }}
        onEvidenceRequested={() => {
          setNotificationMessage('Evidence request dispatched to project team.');
        }}
      />

      {/* Score Calibration Modal */}
      <ScoreCalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        evaluationId={evalId}
        categories={
          project?.breakdown && project.breakdown.length > 0
            ? project.breakdown.map((b) => ({
                category: b.category.toUpperCase().replace(/\s+/g, '_'),
                label: b.category,
                score: b.score,
                weight: typeof b.weight === 'number' ? b.weight : parseFloat(b.weight as any) || 15,
              }))
            : [
                { category: 'INNOVATION_RESEARCH', label: 'Innovation & Research', score: 85, weight: 20 },
                { category: 'ENGINEERING_DESIGN', label: 'Engineering & System Design', score: 80, weight: 25 },
                { category: 'CODE_IMPLEMENTATION', label: 'Code & Implementation', score: 78, weight: 20 },
                { category: 'EMPIRICAL_EVIDENCE', label: 'Empirical Telemetry & Testing', score: 72, weight: 20 },
                { category: 'PRESENTATION_COMMERCIAL', label: 'Presentation & Commercialization', score: 82, weight: 15 },
              ]
        }
        onSaved={() => {
          loadData();
          setNotificationMessage('Score calibration committed and logged in the institutional audit registry.');
        }}
      />

      {/* Audit Trail Drawer */}
      <AuditTrailDrawer
        isOpen={isAuditTrailOpen}
        onClose={() => setIsAuditTrailOpen(false)}
        evaluationId={evalId}
      />

      {/* Fast-Path Progress Stream Modal */}
      {isLiveStreamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <span className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Live Agent Execution Console & Pipeline Stream
              </span>
              <button
                onClick={() => setIsLiveStreamOpen(false)}
                className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Close Stream
              </button>
            </div>
            <EvaluationStreamView
              evaluationId={evalId}
              projectId={projectId}
              projectName={project?.name || 'Project Evaluation'}
              projectDomain={project?.domain}
              architectureType={project?.type}
              onCompleted={() => {
                loadData();
              }}
              onClose={() => setIsLiveStreamOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

