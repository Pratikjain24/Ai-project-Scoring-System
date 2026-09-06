import React from 'react';
import { Bot, Lightbulb, Compass, Users, Calendar, Sparkles } from 'lucide-react';
import type { ProjectSummary } from '../../types/projectUnderstanding';

interface ProjectSummaryCardProps {
  summary: ProjectSummary;
}

export const ProjectSummaryCard: React.FC<ProjectSummaryCardProps> = ({ summary }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D121F] via-[#090D16] to-[#0D121F] border border-cyan-500/30 p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Decorative gradient corner beam */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/10 via-blue-600/5 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-32 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent" />

      {/* Top Badge & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-xs font-mono uppercase tracking-widest font-semibold text-cyan-400">
            Autonomous Ingestion Verdict // AI-Generated Executive Summary
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-300">{summary.team}</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{summary.submissionDate}</span>
          </span>
        </div>
      </div>

      {/* Project Title & Tagline */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight mb-2">
          {summary.projectName}
        </h2>
        <p className="text-sm md:text-base text-cyan-200/90 font-mono font-medium leading-relaxed">
          {summary.tagline}
        </p>
      </div>

      {/* Main Executive Summary Paragraph */}
      <div className="bg-black/40 rounded-xl p-4 md:p-5 border border-white/5 mb-6 text-slate-300 text-sm md:text-base leading-relaxed">
        {summary.executiveSummary}
      </div>

      {/* Dual Deep Insights Grid: Core Hypothesis + Novelty Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Hypothesis */}
        <div className="rounded-xl bg-blue-950/20 border border-blue-500/20 p-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-blue-400 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
            <span>Primary Scientific / Engineering Hypothesis</span>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            {summary.primaryHypothesis}
          </p>
        </div>

        {/* Novelty Statement */}
        <div className="rounded-xl bg-purple-950/20 border border-purple-500/20 p-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-purple-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Extracted Novelty & Differentiation Vector</span>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            {summary.noveltyStatement}
          </p>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-cyan-500" />
          <span>Synthesis Model: ProjectX-Ray Multi-Modal Transformer Engine (v4.2-DeepJury)</span>
        </span>
        <span className="text-cyan-400/80">Deterministic Attributed Output</span>
      </div>
    </div>
  );
};
