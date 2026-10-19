import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  FileCode, 
  Video, 
  BookOpen, 
  Cpu, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles 
} from 'lucide-react';
import { SAMPLE_DOSSIER } from '../data/mockData';

export interface SampleScorecardProps {
  data?: typeof SAMPLE_DOSSIER;
}

export const SampleScorecard: React.FC<SampleScorecardProps> = ({
  data = SAMPLE_DOSSIER,
}) => {
  const [selectedRubricId, setSelectedRubricId] = useState<string>(data.rubric[0].id);

  const selectedCategory = data.rubric.find(r => r.id === selectedRubricId) || data.rubric[0];

  const getCitationIcon = (type: string) => {
    switch (type) {
      case 'code': return <FileCode className="w-3.5 h-3.5 text-cyan-400" />;
      case 'video': return <Video className="w-3.5 h-3.5 text-emerald-400" />;
      case 'paper': return <BookOpen className="w-3.5 h-3.5 text-violet-400" />;
      case 'benchmark': return <Cpu className="w-3.5 h-3.5 text-amber-400" />;
      default: return <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <section id="scorecard" className="py-24 relative bg-[#07090E] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>REAL-WORLD EVALUATION ARTIFACT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
            Interactive Jury Dossier: <span className="text-gradient-emerald">AeroPulse PX-4</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Explore a genuine sample evaluation produced by ProjectX-Ray AI. Every score item is substantiated by video seconds, commit SHA diffs, and sandboxed benchmark logs.
          </p>
        </div>

        {/* Main Dossier Container */}
        <div className="rounded-2xl bg-[#090D16] border border-white/10 shadow-2xl overflow-hidden">
          {/* Dossier Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-white/[0.03] to-white/[0.01] border-b border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold">
                    {data.cohort}
                  </span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-xs font-mono text-slate-400">{data.classification}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                  {data.projectTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 font-mono">
                  Author: <span className="text-slate-200">{data.author}</span>
                </p>
              </div>

              {/* Composite Score Pill */}
              <div className="flex items-center gap-5 p-4 rounded-xl bg-black/60 border border-white/10 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                    Composite Verdict
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-gradient-emerald">
                    {data.compositeScore}
                    <span className="text-base text-slate-400 font-normal"> / 100</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {data.verdictRank}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Summary Verdict Callout */}
            <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-sans text-slate-300 leading-relaxed flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white font-mono block mb-0.5">EXECUTIVE JURY SUMMARY</span>
                {data.summaryVerdict}
              </div>
            </div>
          </div>

          {/* Dossier Body: Interactive Rubric Explorer */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Rubric Category Selector */}
            <div className="lg:col-span-5 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Weighted Rubric Categories (Click to Inspect)
              </h4>

              {data.rubric.map((item) => {
                const isSelected = item.id === selectedRubricId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedRubricId(item.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-display">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                          {item.weight}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {item.evidenceCount} verified citations attached
                      </p>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <div className={`text-base font-mono font-bold ${
                        isSelected ? 'text-cyan-300' : 'text-slate-200'
                      }`}>
                        {item.score}<span className="text-xs text-slate-400">/{item.maxScore}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Detailed Citations & Evidence Drawer */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="p-6 rounded-xl bg-black/60 border border-white/10 space-y-5">
                <div className="flex items-start justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                      CATEGORY FORENSIC EVIDENCE
                    </span>
                    <h4 className="text-lg font-bold text-white font-display mt-0.5">
                      {selectedCategory.category}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-cyan-300">
                      {selectedCategory.score}/100
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedCategory.summary}
                </p>

                {/* Citations List */}
                <div>
                  <h5 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                    Immutable Citations & Reference Hashes
                  </h5>
                  <div className="space-y-2.5">
                    {selectedCategory.citations.map((cite, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs font-mono space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCitationIcon(cite.type)}
                            <span className="text-white font-semibold">{cite.reference}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>VERIFIED</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans">
                          {cite.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Engineering Roadmap */}
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Jury Actionable Remediation Roadmap</span>
                  </h5>
                  <span className="text-[10px] font-mono text-slate-400">3 recommendations</span>
                </div>

                <div className="space-y-2">
                  {data.actionableRoadmap.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            item.priority === 'Critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {item.priority}
                          </span>
                          <span className="text-slate-200 font-medium">{item.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{item.impact}</p>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded shrink-0">
                        {item.effort}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dossier Footer with Juror Dissent */}
          <div className="p-6 bg-black/80 border-t border-white/10 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Autonomous Juror Adversarial Dissent Notes
            </span>
            <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
              {data.juryDissentNotes.map((note, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-amber-400">⚠</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
