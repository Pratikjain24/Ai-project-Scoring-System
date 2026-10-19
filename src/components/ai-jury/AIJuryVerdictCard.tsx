import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Users, 
  ChevronRight, 
  Scale, 
  Sparkles,
  Quote,
  CheckCircle2
} from 'lucide-react';
import type { AIJuryScorecard } from '../../types/aiJuryScoring';
import { VERDICT_THRESHOLDS as DEFAULT_THRESHOLDS, type VerdictThreshold } from '../../config/rubricConstants';

interface AIJuryVerdictCardProps {
  scorecard: AIJuryScorecard;
  onOpenMethodology: () => void;
  thresholds?: VerdictThreshold[];
}

export const AIJuryVerdictCard: React.FC<AIJuryVerdictCardProps> = ({
  scorecard,
  onOpenMethodology,
  thresholds = DEFAULT_THRESHOLDS
}) => {
  const [activeJurorTab, setActiveJurorTab] = useState<number>(0);

  const verdictMeta = thresholds.find(t => t.level === scorecard.verdictLevel) || thresholds[1];

  // Circle progress calculation (circumference for radius 54 is ~339.29)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorecard.overallScore / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#0E1626] to-[#0A101D] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              Official Consensus Engine
            </span>
            <span className="text-xs font-mono text-slate-400">
              {scorecard.evaluationEngineVersion}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
              Track: {scorecard.projectTrack.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            AI Jury Verdict & Consolidated Scorecard
          </h1>
          <p className="text-sm text-slate-400 font-sans max-w-2xl">
            Multi-perspective autonomous jury evaluation derived from hardware telemetry, real-time audio transcripts, code audits, and live demonstration execution.
          </p>
        </div>

        {/* Traceability & Methodology Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMethodology}
            className="px-3.5 py-2 rounded-xl text-xs font-mono text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center gap-1.5 shadow-lg group"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Scoring Methodology</span>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Main Scoring Cockpit: Radial Score Gauge + Verdict Headline + Deliberations */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        
        {/* Left Column: Radial Overall Score Gauge & Verdict Level */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center relative overflow-hidden group">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">
            Consensus Overall Score
          </div>

          {/* Circular HUD SVG Meter */}
          <div className="relative w-40 h-40 flex items-center justify-center my-1">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
              {/* Background track */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="10"
                fill="none"
              />
              {/* Animated Glowing Progress Stroke */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke={
                  scorecard.overallScore >= 90 ? '#34d399' :
                  scorecard.overallScore >= 80 ? '#22d3ee' :
                  scorecard.overallScore >= 70 ? '#60a5fa' :
                  scorecard.overallScore >= 50 ? '#fbbf24' : '#f43f5e'
                }
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.4))'
                }}
              />
            </svg>

            {/* Inner Score Number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-extrabold text-5xl text-white tracking-tighter">
                {scorecard.overallScore}
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider">
                OUT OF 100
              </span>
            </div>
          </div>

          {/* Verdict Level Badge */}
          <div className="mt-3">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${verdictMeta.badgeBg} ${verdictMeta.badgeBorder} ${verdictMeta.textColor} ${verdictMeta.glowColor} text-sm font-bold font-mono uppercase tracking-wider`}>
              <Award className="w-4 h-4" />
              <span>Verdict: {scorecard.verdictLevel}</span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2 px-2">
              {verdictMeta.description}
            </p>
          </div>

          {/* Total Evidence Count */}
          <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-around text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Verified Evidence</span>
              <span className="text-cyan-300 font-bold">{scorecard.totalEvidenceCount} items</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Jury Panel</span>
              <span className="text-emerald-300 font-bold">4 Specialized AI Agents</span>
            </div>
          </div>
        </div>

        {/* Center/Right Column: Verdict Headline, Consensus Summary, and Juror Deliberations */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-5">
          
          {/* Verdict Executive Summary */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>CONSENSUS FINDINGS</span>
            </div>
            <h3 className="text-lg font-bold text-white leading-snug">
              {scorecard.verdictHeadline}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {scorecard.verdictSummary}
            </p>

            {/* Official Jury Recommendation Banner */}
            <div className="mt-3 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-mono font-bold text-cyan-300 uppercase tracking-wider block">
                  Actionable Jury Recommendation:
                </span>
                <p className="text-slate-200">
                  {scorecard.juryRecommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Juror Deliberation Carousel / Personas */}
          <div className="p-5 rounded-2xl bg-[#090D17] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Specialized Juror Deliberations ({scorecard.jurors.length} Perspectives)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                Click a juror to inspect their independent critique
              </span>
            </div>

            {/* Juror Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {scorecard.jurors.map((juror, idx) => (
                <button
                  key={juror.jurorId}
                  onClick={() => setActiveJurorTab(idx)}
                  className={`p-2.5 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between ${
                    activeJurorTab === idx
                      ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-md'
                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 truncate">
                      {juror.name.split(' ')[0]} {juror.name.split(' ')[1]?.[0]}.
                    </span>
                    <span className="text-[11px] font-mono font-bold text-white px-1.5 py-0.2 rounded bg-white/10">
                      {juror.voteScore}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate">
                    {juror.role.split('(')[0]}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Juror Statement Box */}
            {scorecard.jurors[activeJurorTab] && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-cyan-500/20 space-y-2.5 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${scorecard.jurors[activeJurorTab].avatarColor} flex items-center justify-center text-xs font-bold text-white shadow`}>
                      {scorecard.jurors[activeJurorTab].name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {scorecard.jurors[activeJurorTab].name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {scorecard.jurors[activeJurorTab].role} • {scorecard.jurors[activeJurorTab].institution}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-semibold">
                      {scorecard.jurors[activeJurorTab].stance}
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      Score: {scorecard.jurors[activeJurorTab].voteScore}/100
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-300 italic">
                  <Quote className="w-4 h-4 text-cyan-400/60 shrink-0 mt-0.5" />
                  <p className="font-sans leading-relaxed">
                    {scorecard.jurors[activeJurorTab].keyQuote}
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 pt-1 font-sans">
                  <strong className="text-slate-200">Core Critique: </strong>
                  {scorecard.jurors[activeJurorTab].coreCritique}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Transparent AI Integrity Banner */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Zero Black-Box Scoring:</span>
          <span>All 8 dimensions are mathematically rooted in 42+ verifiable timestamps, commits & sensor logs.</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Audit Timestamp: {new Date(scorecard.evaluatedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
