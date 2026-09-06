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
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ScoreCard } from '../components/ui/ScoreCard';
import { RiskCard } from '../components/ui/RiskCard';
import { OverviewRadarChart } from '../components/evaluation/OverviewRadarChart';
import { MOCK_EVALUATIONS } from '../data/mockEvaluationsList';
import { api } from '../services/api';

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
import type { LiveCameraSource, LiveJurySession, LiveScoreSnapshot } from '../types/liveJury';
import type { OrchestratorProgress } from '../types/integration';

export const EvaluationWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Find project by id or fallback to smart-road-vision
  const fallbackProject = MOCK_EVALUATIONS.find(p => p.id === id) || MOCK_EVALUATIONS[0];
  const [project, setProject] = useState(fallbackProject);

  React.useEffect(() => {
    let isMounted = true;
    const loadProjectData = async () => {
      if (!id) return;
      try {
        const data = await api.getProjectById(id);
        if (data && isMounted) {
          setProject(prev => ({
            ...prev,
            ...data,
            name: data.name || prev.name,
            team: data.teamName || prev.team,
            domain: data.domain || prev.domain,
            type: data.architectureType ? (data.architectureType.charAt(0).toUpperCase() + data.architectureType.slice(1).toLowerCase()) : prev.type,
          }));
        }
      } catch (e) {
        // Fallback remains active
      }
    };
    loadProjectData();
    return () => { isMounted = false; };
  }, [id]);

  // Determine active tab from URL path
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[3] || 'overview';

  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart2, path: `/evaluations/${project.id}` },
    { key: 'project', label: 'Project DNA', icon: Compass, path: `/evaluations/${project.id}/project` },
    { key: 'technical', label: 'Technical', icon: Cpu, path: `/evaluations/${project.id}/technical` },
    { key: 'originality', label: 'Originality', icon: Fingerprint, path: `/evaluations/${project.id}/originality` },
    { key: 'claims', label: 'Claims', icon: CheckSquare, path: `/evaluations/${project.id}/claims` },
    { key: 'research', label: 'Research', icon: Search, path: `/evaluations/${project.id}/research` },
    { key: 'impact', label: 'Impact', icon: Globe2, path: `/evaluations/${project.id}/impact` },
    { key: 'presentation', label: 'Presentation', icon: Tv, path: `/evaluations/${project.id}/presentation` },
    { key: 'jury', label: 'AI Jury', icon: Scale, path: `/evaluations/${project.id}/jury` },
    { key: 'live', label: 'Live Jury', icon: Radio, path: `/evaluations/${project.id}/live` },
    { key: 'documents', label: 'Doc Intelligence', icon: FileText, path: `/evaluations/${project.id}/documents` },
    { key: 'report', label: 'Report', icon: FileCheck2, path: `/evaluations/${project.id}/report` },
  ];

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setNotificationMessage('Evaluation link copied to clipboard!');
    setTimeout(() => setNotificationMessage(null), 3000);
  };

  const handleExport = () => {
    setNotificationMessage('Exporting institutional PDF summary...');
    setTimeout(() => setNotificationMessage(null), 3000);
  };

  const [liveRoomState, setLiveRoomState] = useState<'SETUP' | 'ROOM' | 'SUMMARY'>('SETUP');
  const [liveCameraSource, setLiveCameraSource] = useState<LiveCameraSource>('SIMULATED');
  const [liveSessionData, setLiveSessionData] = useState<LiveJurySession | null>(null);
  const [liveSnapshotData, setLiveSnapshotData] = useState<LiveScoreSnapshot | null>(null);

  // Phase 12: Orchestrator & Review Drawer States
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState<OrchestratorProgress | null>(null);

  const evalId = project.id === 'smart-road-vision' ? 'eval_smart-road-vision' : `eval_${project.id}`;

  const fetchPipelineProgress = () => {
    api.getOrchestratorStatus(evalId).then(setPipelineProgress).catch(() => {});
  };

  React.useEffect(() => {
    fetchPipelineProgress();
    const interval = setInterval(fetchPipelineProgress, 5000);
    return () => clearInterval(interval);
  }, [evalId]);

  const handleNavigateFromStage = (stageKey: string) => {
    setIsCommandCenterOpen(false);
    switch (stageKey) {
      case 'UNDERSTANDING':
        navigate(`/evaluations/${project.id}/project`);
        break;
      case 'ANALYZING_MEDIA':
        navigate(`/evaluations/${project.id}/presentation`);
        break;
      case 'RESEARCHING':
        navigate(`/evaluations/${project.id}/research`);
        break;
      case 'ANALYZING_ORIGINALITY':
        navigate(`/evaluations/${project.id}/originality`);
        break;
      case 'VERIFYING_CLAIMS':
        navigate(`/evaluations/${project.id}/claims`);
        break;
      case 'EVALUATING':
        navigate(`/evaluations/${project.id}/technical`);
        break;
      case 'SCORING':
      case 'JURY_REVIEW':
        navigate(`/evaluations/${project.id}/jury`);
        break;
      case 'REPORT_GENERATING':
        navigate(`/evaluations/${project.id}/report`);
        break;
      default:
        navigate(`/evaluations/${project.id}`);
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
                  {project.strengths.map((str, i) => (
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
                  {project.weaknesses.map((weak, i) => (
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
                {project.risks.map((risk, i) => (
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
                  {project.nextSteps.map((step, i) => (
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
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
            onViewTechnicalAudit={() => navigate(`/evaluations/${project.id}/technical`)}
          />
        )}

        {/* TECHNICAL AUDIT TAB */}
        {activeTab === 'technical' && (
          <TechnicalAuditorModule
            evaluationId={project.id === 'smart-road-vision' ? 'eval_smart-road-vision' : `eval_${project.id}`}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
            onViewOriginality={() => navigate(`/evaluations/${project.id}/originality`)}
          />
        )}

        {/* ORIGINALITY TAB (PHASE 6) */}
        {activeTab === 'originality' && (
          <OriginalityIntelligenceModule
            evaluationId={project.id === 'smart-road-vision' ? 'eval_smart-road-vision' : `eval_${project.id}`}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
            onViewClaimVerification={() => navigate(`/evaluations/${project.id}/claims`)}
          />
        )}

        {/* CLAIMS TAB */}
        {activeTab === 'claims' && (
          <ClaimVerificationModule
            evaluationId={project.id === 'smart-road-vision' ? 'eval_smart-road-vision' : `eval_${project.id}`}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
            onViewImpactFeasibility={() => navigate(`/evaluations/${project.id}/impact`)}
          />
        )}

        {/* RESEARCH INTELLIGENCE TAB (PHASE 5) */}
        {activeTab === 'research' && (
          <ResearchIntelligenceModule
            evaluationId={project.id === 'smart-road-vision' ? 'eval_smart-road-vision' : `eval_${project.id}`}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
            onViewClaims={() => navigate(`/evaluations/${project.id}/claims`)}
            onViewTechnical={() => navigate(`/evaluations/${project.id}/technical`)}
          />
        )}

        {/* IMPACT TAB */}
        {activeTab === 'impact' && (
          <ImpactFeasibilityModule
            evaluationId={project.id === 'smart-road-vision' ? 'eval_smart-road-vision' : `eval_${project.id}`}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
          />
        )}

        {/* PRESENTATION TAB */}
        {activeTab === 'presentation' && (
          <PresentationDemoModule
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
            onViewAIJury={() => navigate(`/evaluations/${project.id}/jury`)}
          />
        )}

        {/* AI JURY TAB */}
        {activeTab === 'jury' && (
          <AIJuryModule
            evaluationId={project.id === 'smart-road-vision' ? 'eval_smart-road-vision' : `eval_${project.id}`}
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
            evaluationId={project.id === 'smart-road-vision' ? 'eval_smart-road-vision' : `eval_${project.id}`}
            onBackToOverview={() => navigate(`/evaluations/${project.id}`)}
            onViewClaims={() => navigate(`/evaluations/${project.id}/claims`)}
            onViewProjectDNA={() => navigate(`/evaluations/${project.id}/project`)}
          />
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <ReportWorkspace
            evaluationId={project.id === 'smart-road-vision' ? 'eval_smart-road-vision' : `eval_${project.id}`}
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
    </div>
  );
};
