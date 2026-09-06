import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PlusCircle,
  BarChart3,
  Cpu,
  CheckCircle2,
  AlertTriangle,
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
import { MOCK_EVALUATIONS, DASHBOARD_STATS } from '../data/mockEvaluationsList';
import { api } from '../services/api';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = React.useState(MOCK_EVALUATIONS);
  const [backendConnected, setBackendConnected] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let mounted = true;
    api.getHealth()
      .then(() => {
        if (mounted) setBackendConnected(true);
      })
      .catch(() => {
        if (mounted) setBackendConnected(false);
      });

    api.getProjects()
      .then((data) => {
        if (mounted && data && data.length > 0) {
          // If the backend returns projects, adapt them to display
          setProjects(data.map((p: any) => ({
            ...p,
            overallScore: p.overallScore || 84.7,
            originalityScore: p.originalityScore || 68,
            impactScore: p.impactScore || 92,
            technicalScore: p.technicalScore || 87,
            status: p.status || 'Completed',
            updatedAt: p.updatedAt || 'Recently',
          })));
        }
      })
      .catch(() => {
        // Fallback already handled inside api client
      });

    return () => { mounted = false; };
  }, []);

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
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span>{backendConnected ? 'Live Backend API' : 'Local Fallback'}</span>
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

          <div className="flex-shrink-0 flex sm:flex-col gap-3">
            <Link to="/new-evaluation">
              <Button variant="primary" size="md" className="shadow-lg shadow-cyan-500/20 flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                <span>+ New Evaluation</span>
              </Button>
            </Link>
            <Link to="/evaluations">
              <Button variant="outline" size="md" className="flex items-center gap-2 text-xs">
                <span>Browse All Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Command Metrics & Trends Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Evaluations"
          value={DASHBOARD_STATS.totalEvaluations}
          trend={{ value: DASHBOARD_STATS.evaluationsTrend, isPositive: true }}
          icon={Layers}
        />
        <StatCard
          title="Average Score"
          value={`${DASHBOARD_STATS.averageScore} / 100`}
          trend={{ value: DASHBOARD_STATS.scoreTrend, isPositive: true }}
          icon={BarChart3}
        />
        <StatCard
          title="Projects Analyzed"
          value={DASHBOARD_STATS.projectsAnalyzed.total}
          subtitle={`${DASHBOARD_STATS.projectsAnalyzed.software} Software • ${DASHBOARD_STATS.projectsAnalyzed.hardware} Hardware`}
          icon={Cpu}
        />
        <StatCard
          title="Claims Verified"
          value={`${DASHBOARD_STATS.claimsVerified.total}`}
          trend={{ value: `${DASHBOARD_STATS.claimsVerified.verifiedPercentage}% confirmed veracity`, isPositive: true }}
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
              score={DASHBOARD_STATS.averageScore}
              maxScore={100}
              size={180}
              strokeWidth={14}
              confidence={DASHBOARD_STATS.averageConfidence}
              label="Cohort Average Project Score"
              sublabel="Based on 142 multimodal evaluations"
            />
          </div>

          <div className="w-full pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-left">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Jury Consensus</span>
              <span className="text-xs font-bold text-slate-200">Strong Performance</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Confidence Mean</span>
              <span className="text-xs font-bold text-cyan-400 font-mono">{DASHBOARD_STATS.averageConfidence}%</span>
            </div>
          </div>
        </Card>

        {/* Real-time Jury Intelligence Feed */}
        <Card className="p-6 lg:col-span-2 border-slate-800/80 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
                  Multimodal Jury Intelligence Insights
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Autonomous synthesis from cross-referencing slides, code, live speech, and prior art
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-block">
                Auto-updated
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Top Observed Strengths</span>
                </div>
                <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 leading-relaxed">
                  High proficiency in hardware-accelerated edge inference (Jetson / eBPF) across 74% of software submissions.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-amber-950 border border-amber-800/60 text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Frequent Review Flags</span>
                </div>
                <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 leading-relaxed">
                  42% of project pitch decks claim "&gt;95% accuracy" without submitting reproducible validation logs.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 flex items-start gap-3">
              <FileCheck2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-cyan-300">Featured Evaluation: Smart Road Vision</p>
                <p className="text-slate-300">
                  Passed technical pipeline with 84.7 composite score. Ready for institutional juror review.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Want to inspect the evaluation dossier?</span>
            <Link
              to="/evaluations/smart-road-vision"
              className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
            >
              <span>Open Evaluation Workspace</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* 4. Recent Evaluations Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
              Recent Evaluations
            </h2>
            <p className="text-xs text-slate-400">
              Click any project row to open the complete multimodal audit workspace
            </p>
          </div>

          <Link to="/evaluations">
            <Button variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300">
              <span>View All 142 Projects</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Evaluations Table */}
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold font-mono text-[11px]">
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Originality</th>
                  <th className="py-3.5 px-4">Impact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Updated</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {projects.slice(0, 5).map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/evaluations/${project.id}`)}
                    className="cursor-pointer hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900 group-hover:text-cyan-400 transition-colors block text-sm">
                          {project.name}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                          {project.domain}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {project.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono text-sm font-bold ${getScoreColor(project.overallScore)}`}>
                          {project.overallScore.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">/100</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-300">{project.originalityScore}%</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-300">{project.impactScore}%</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(project.status)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {project.updatedAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs text-cyan-400 group-hover:text-cyan-300 font-medium">
                        <span>Workspace</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
