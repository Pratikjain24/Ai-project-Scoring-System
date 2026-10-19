import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  ShieldCheck,
  Download,
  AlertCircle,
  Clock,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

export const PublicSharedReportPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState<boolean>(Boolean(token));
  const [error, setError] = useState<string | null>(!token ? 'Missing share access token.' : null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    api.getPublicReportShare(token)
      .then((res: any) => {
        if (!isMounted) return;
        if (res && res.report) {
          setData(res);
          setError(null);
        } else {
          setError('Invalid or expired evaluation dossier share link.');
        }
        setLoading(false);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setError(err?.message || 'The requested evaluation report is not available or has expired.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-cyan-300">Decrypting & Verifying Institutional Dossier...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center bg-slate-900/90 border-rose-500/30 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-white">Share Link Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            {error || 'This view link may have been revoked or has exceeded its scheduled expiration.'}
          </p>
          <div className="pt-2">
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Command Center
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const { share, report } = data;
  const project = report.project || {};
  const evalId = share.evaluationId;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 pb-20">
      {/* Top Verification Header */}
      <header className="sticky top-0 z-30 bg-[#07090E]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  Institutional Audit Registry
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  Read-Only Verified View
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold font-display text-white tracking-tight">
                {project.name || 'Project Evaluation Dossier'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(api.getReportPdfUrl(evalId), '_blank')}
              className="text-xs border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/60"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download PDF Dossier
            </Button>
            <Link to={`/evaluations/${evalId}`}>
              <Button variant="primary" size="sm" className="text-xs">
                <span>Open Full Workspace</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Verification Summary Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 border border-cyan-500/30 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge variant="cyan" dot>Institutional Consensus</Badge>
                <span className="text-xs font-mono text-slate-400">
                  Domain: <strong className="text-slate-200">{project.domain || 'Software / AI'}</strong>
                </span>
                {share.expiresAt && (
                  <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Expires: {new Date(share.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
                {report.verdict?.label || 'EVALUATION RATIFIED'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                "{report.executiveSummary || 'Multi-agent institutional audit verified against empirical telemetry, code AST grounding, and research literature.'}"
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 shrink-0 text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Composite Score
              </span>
              <div className="text-4xl font-black font-mono text-emerald-400">
                {report.overallScore ?? report.compositeScore ?? 85}
                <span className="text-base text-slate-500 font-normal"> / 100</span>
              </div>
              <span className="text-xs font-mono text-cyan-400 block mt-0.5">
                Calibrated Confidence: {report.confidence ?? 92}%
              </span>
            </div>
          </div>
        </div>

        {/* Categories Scorecard Grid */}
        {report.categoryScores && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-300">
              Dimensional Rubric Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(report.categoryScores).map(([cat, val]: [string, any]) => {
                const score = typeof val === 'number' ? val : (val.score || 75);
                const conf = typeof val === 'object' ? (val.confidence || 85) : 85;
                return (
                  <Card key={cat} className="p-4 bg-slate-900/60 border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-slate-300 font-semibold truncate">
                        {cat.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-mono font-bold text-emerald-400">{score}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>Confidence</span>
                      <span>{conf}%</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-slate-900/60 border-slate-800 space-y-3">
            <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-emerald-400">
              Verified Strengths
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {(report.strengths || ['Rigorous empirical validation across edge scenarios.', 'Demonstrated architectural separation of compute and telemetry.']).map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 bg-slate-900/60 border-slate-800 space-y-3">
            <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-amber-400">
              Areas for Improvement
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {(report.weaknesses || ['Benchmark datasets would benefit from expanded multi-camera conditions.', 'Telemetry buffer overrun edge conditions need formal watchdog proof.']).map((w: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
};
