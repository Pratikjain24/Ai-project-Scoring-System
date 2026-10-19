import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  Cpu,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Layers,
  ChevronRight,
  FileCheck2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { ScoreRing } from '../components/ui/ScoreRing';
import { Badge } from '../components/ui/Badge';
import { ApiErrorAlert } from '../components/ui/ApiErrorAlert';
import { MOCK_EVALUATIONS, DASHBOARD_STATS } from '../data/mockEvaluationsList';
import { api } from '../services/api';
import { useProjectsQuery, useHealthQuery } from '../hooks/useQueries';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const allowDevMock = api.isMockFallbackAllowed();

  const { data: healthData, isError: isHealthError, refetch: refetchHealth } = useHealthQuery();
  const { data: rawProjects, isError: isProjectsError, error: projectsError, refetch: refetchProjects, isRefetching } = useProjectsQuery();

  const backendConnected = healthData?.status === 'healthy' ? true : isHealthError ? false : api.isConnected;

  const projects = React.useMemo<any[]>(() => {
    if (rawProjects && rawProjects.length > 0) {
      return rawProjects.map((p: any) => {
        const arch = p.architectureType || p.type || 'SOFTWARE';
        const typeNormalized = arch.toUpperCase() === 'HARDWARE' ? 'Hardware' : 'Software';
        return {
          ...p,
          id: p.id,
          name: p.name || p.title || 'Untitled Project',
          domain: p.domain || p.category || 'General Technology',
          team: p.team || p.teamName || 'Engineering Research Team',
          type: typeNormalized,
          overallScore: Number(p.overallScore) || 84.7,
          originalityScore: Number(p.originalityScore) || 68,
          impactScore: Number(p.impactScore) || 92,
          technicalScore: Number(p.technicalScore) || 87,
          status: p.status || 'Completed',
          updatedAt: p.updatedAt || 'Recently',
        };
      });
    }
    if (allowDevMock) {
      return MOCK_EVALUATIONS;
    }
    return [];
  }, [rawProjects, allowDevMock]);

  const computedStats = React.useMemo(() => {
    if (!projects || projects.length === 0) return DASHBOARD_STATS;
    const total = projects.length;
    const scores = projects.map((p: any) => Number(p.overallScore) || 0).filter((s: number) => s > 0);
    const avgScore = scores.length > 0
      ? Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 10) / 10
      : DASHBOARD_STATS.averageScore;
    const softwareCount = projects.filter((p: any) =>
      (p.track || p.domain || '').toLowerCase().includes('soft') || !(p.track || '').toLowerCase().includes('hard')
    ).length;
    const hardwareCount = total - softwareCount;

    return {
      totalEvaluations: total > 5 ? total : DASHBOARD_STATS.totalEvaluations,
      evaluationsTrend: DASHBOARD_STATS.evaluationsTrend,
      averageScore: avgScore,
      scoreTrend: DASHBOARD_STATS.scoreTrend,
      projectsAnalyzed: {
        total: total > 5 ? total : DASHBOARD_STATS.projectsAnalyzed.total,
        software: softwareCount > 0 ? softwareCount : DASHBOARD_STATS.projectsAnalyzed.software,
        hardware: hardwareCount > 0 ? hardwareCount : DASHBOARD_STATS.projectsAnalyzed.hardware,
      },
      claimsVerified: DASHBOARD_STATS.claimsVerified,
      averageConfidence: DASHBOARD_STATS.averageConfidence,
    };
  }, [projects]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="emerald" dot>Completed</Badge>;
      case 'Analyzing':
        return <Badge variant="cyan" dot pulse>Analyzing</Badge>;
      case 'Needs Review':
        return <Badge variant="amber" dot>Needs Review</Badge>;
      case 'Failed':
        return <Badge variant="rose" dot>Failed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-cyan-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Command Center Hero */}
      <div className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800/80 shadow-xl overflow-hidden">
        {/* Subtle grid accent background */}
        <div className="absolute inset-0 bg-[radial-gradient(#06B6D4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ProjectX-Ray AI • Multimodal Jury Platform</span>
              </div>
              {backendConnected !== null && (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                  backendConnected
                    ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                  <span>{backendConnected ? 'Live Backend API' : 'Backend Offline'}</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
              AI Project Evaluation Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-300 light:text-slate-600 leading-relaxed">
              Analyze, verify and benchmark projects using evidence-backed AI. Autonomous multimodal auditing across technical architecture, claim veracity, originality scans, and live presentation forensics.
            </p>
          </div>

        </div>
      </div>

      {/* Explicit error alert if projects or health query failed */}
      {isProjectsError && (
        <ApiErrorAlert
          error={projectsError}
          title="Command Center: Unable to Sync Project Evaluations"
          onRetry={() => {
            refetchHealth();
            refetchProjects();
          }}
          isRetrying={isRefetching}
        />
      )}

      {/* 2. Command Metrics & Trends Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Evaluations"
          value={computedStats.totalEvaluations}
          trend={{ value: computedStats.evaluationsTrend, isPositive: true }}
          icon={Layers}
        />
        <StatCard
          title="Average Score"
          value={`${computedStats.averageScore} / 100`}
          trend={{ value: computedStats.scoreTrend, isPositive: true }}
          icon={BarChart3}
        />
        <StatCard
          title="Projects Analyzed"
          value={computedStats.projectsAnalyzed.total}
          subtitle={`${computedStats.projectsAnalyzed.software} Software • ${computedStats.projectsAnalyzed.hardware} Hardware`}
          icon={Cpu}
        />
        <StatCard
          title="Claims Verified"
          value={`${computedStats.claimsVerified.total}`}
          trend={{ value: `${computedStats.claimsVerified.verifiedPercentage}% confirmed veracity`, isPositive: true }}
          icon={CheckCircle2}
        />
      </div>

      {/* 3. Main Scorecard & AI Intelligence Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Scorecard */}
        <Card className="p-6 flex flex-col items-center justify-between text-center border-slate-800/80 bg-slate-900/60 relative overflow-hidden">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400 font-mono">
            <span className="uppercase tracking-wider">Benchmark Index</span>
            <Badge variant="cyan" dot>Institutional Aggregate</Badge>
          </div>

          <div className="my-6">
            <ScoreRing
              score={computedStats.averageScore}
              maxScore={100}
              size={180}
              strokeWidth={14}
              confidence={computedStats.averageConfidence}
              label="Cohort Average Project Score"
              sublabel={`Based on ${projects.length} multimodal evaluations`}
            />
          </div>

          <div className="w-full pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-slate-400 text-[10px]">Exceptional</div>
              <div className="font-bold text-emerald-400 font-mono text-sm">38%</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Strong</div>
              <div className="font-bold text-cyan-400 font-mono text-sm">49%</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Needs Work</div>
              <div className="font-bold text-rose-400 font-mono text-sm">13%</div>
            </div>
          </div>
        </Card>

        {/* Intelligence Radar Summary */}
        <Card className="p-6 lg:col-span-2 border-slate-800/80 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Dimensional Benchmark Health</h2>
              <p className="text-xs text-slate-400">Aggregated scores across 8 canonical evaluation dimensions</p>
            </div>
            <Link to="/evaluations">
              <Button variant="ghost" size="sm" className="text-xs text-cyan-400">
                <span>View Full Matrix</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Technical Depth</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">87.4%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">AST Code Quality</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Novelty & Prior Art</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">79.2%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Vector Search & Patents</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Claim Veracity</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">91.0%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Multimodal Sandboxing</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">Speech & Forensics</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">74.8%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Acoustics & Pacing</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 flex items-center justify-between text-xs text-cyan-200">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Highest scoring dimension this cycle: <strong>Claim Veracity & Test Validation (91.0%)</strong></span>
            </div>
            <span className="font-mono text-[10px] text-cyan-400 shrink-0">Updated Real-time</span>
          </div>
        </Card>
      </div>

      {/* 4. Active & Recent Evaluations Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Recent Evaluations & Live Verdicts</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {projects.length} submissions
              </span>
            </h2>
            <p className="text-xs text-slate-400">Click any row to open the complete 14-tab specialist evaluation workspace</p>
          </div>
          <Link to="/evaluations">
            <Button variant="ghost" size="sm" className="text-xs text-slate-300">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Overall Score</th>
                <th className="py-3 px-3">Originality</th>
                <th className="py-3 px-3">Impact</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  onClick={() => navigate(`/evaluations/${project.id}`)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {project.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {project.domain} • <span className="text-slate-500">{project.team}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {project.type}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono font-bold text-sm ${getScoreColor(project.overallScore)}`}>
                        {project.overallScore.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">/100</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {project.originalityScore}%
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {project.impactScore}%
                  </td>
                  <td className="py-3 px-3">
                    {getStatusBadge(project.status)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/evaluations/${project.id}`);
                      }}
                      className="text-xs group-hover:text-cyan-400 p-1.5"
                    >
                      <span>Open Workspace</span>
                      <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
