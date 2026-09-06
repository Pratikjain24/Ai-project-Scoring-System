import React from 'react';
import { 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  RotateCcw
} from 'lucide-react';
import type { LiveJurySession, LiveScoreSnapshot } from '../../types/liveJury';

interface LiveSummaryCardProps {
  session: LiveJurySession;
  snapshot: LiveScoreSnapshot | null;
  onViewReport: () => void;
  onRestart: () => void;
}

export const LiveSummaryCard: React.FC<LiveSummaryCardProps> = ({
  session,
  snapshot,
  onViewReport,
  onRestart,
}) => {
  return (
    <div className="max-w-4xl mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Live Session Completed & Ratified
          </div>
          <h2 className="text-3xl font-black text-white">Live AI Jury Evaluation Summary</h2>
          <p className="text-sm text-slate-400 mt-1">
            Recorded session finalized. All speech, demonstration features, and claims are permanently bound into Master Scoring.
          </p>
        </div>

        {/* Master Score Block */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 text-center min-w-[200px] shadow-inner">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Official Master Score
          </div>
          <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            83.7
          </div>
          <div className="mt-1 text-xs font-bold text-emerald-400 uppercase">
            Verdict: STRONG
          </div>
        </div>
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-xs text-slate-500">Duration Evaluated</div>
          <div className="text-lg font-bold text-white mt-1">
            {Math.floor(session.durationSeconds / 60)}m {session.durationSeconds % 60}s
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Target: 10m 00s</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-xs text-slate-500">Live Claims Detected</div>
          <div className="text-lg font-bold text-cyan-400 mt-1">
            {snapshot?.claimsDetected ?? 4} Detected
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">3 Unique, 1 Repeated</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-xs text-slate-500">Demo Milestones</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">
            {snapshot?.demoEventsCount ?? 2} Passed
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Physical Hardware Confirmed</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="text-xs text-slate-500">Judge Inquiries</div>
          <div className="text-lg font-bold text-amber-400 mt-1">
            {snapshot?.questionsAnswered ?? 1} Answered
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Technical Completeness: Direct</div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition px-4 py-2 rounded-xl hover:bg-slate-800"
        >
          <RotateCcw className="w-4 h-4" />
          Start New Live Evaluation Session
        </button>

        <button
          onClick={onViewReport}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition"
        >
          <FileText className="w-4 h-4" />
          Open Full Phase 10 Intelligence Report
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
