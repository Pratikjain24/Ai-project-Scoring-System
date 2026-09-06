import React from 'react';
import { 
  Code2, 
  Cpu, 
  Layers, 
  Activity, 
  ArrowRight, 
  Sparkles, 
  Users, 
  AlertCircle
} from 'lucide-react';
import type { SubmissionDraft, ProjectCategory } from '../../types/submission';

interface ProjectFormProps {
  draft: SubmissionDraft;
  onChange: (fields: Partial<SubmissionDraft>) => void;
  onNext: () => void;
  errors: Record<string, string>;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  draft,
  onChange,
  onNext,
  errors,
}) => {
  const categories: {
    id: ProjectCategory;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'software',
      label: 'Software & Cloud',
      description: 'Distributed systems, microservices, mobile apps, ML/AI pipelines',
      icon: <Code2 className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'hardware',
      label: 'Hardware & Embedded',
      description: 'Custom PCBs, microcontrollers, FPGA, robotics, mechanical rigs',
      icon: <Cpu className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'hybrid',
      label: 'Hybrid / Cyber-Physical',
      description: 'IoT devices, avionics, edge AI nodes with custom silicon & firmware',
      icon: <Layers className="w-4 h-4 text-violet-400" />,
    },
    {
      id: 'biomedical',
      label: 'Biomedical & Silicon',
      description: 'Sensor telemetry, medical instrumentation, microfluidics, ASICs',
      icon: <Activity className="w-4 h-4 text-amber-400" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Prompt */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>STEP 01 // TAXONOMY & CLASSIFICATION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
          Project Identity & Scope
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
          Establish the foundational ground truth for the AI jury. These parameters configure the specialized forensic models and prior art search queries.
        </p>
      </div>

      {/* Category Grid */}
      <div className="space-y-2.5">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-semibold">
          <span>Project Category</span>
          <span className="text-cyan-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const isSelected = draft.projectType === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange({ projectType: cat.id })}
                className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-cyan-950/30 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                    : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] hover:border-white/20'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    isSelected ? 'bg-cyan-500/20' : 'bg-white/5'
                  }`}
                >
                  {cat.icon}
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {cat.label}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Basic Info: Project Name */}
      <div className="space-y-2">
        <label htmlFor="projectName" className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between font-semibold">
          <span>Project Name <span className="text-cyan-400">*</span></span>
          <span className="text-[11px] text-slate-400 lowercase font-mono">e.g. AeroPulse PX-4</span>
        </label>
        <input
          id="projectName"
          type="text"
          value={draft.projectName}
          onChange={(e) => onChange({ projectName: e.target.value })}
          placeholder="Enter official project or system name..."
          className={`w-full px-4 py-3 rounded-xl bg-black/40 border text-white text-sm font-sans placeholder:text-slate-500 focus:outline-none transition-all ${
            errors.projectName
              ? 'border-rose-500 focus:border-rose-400 bg-rose-950/10'
              : 'border-white/10 focus:border-cyan-400 focus:bg-white/[0.03]'
          }`}
        />
        {errors.projectName && (
          <p className="text-xs font-mono text-rose-400 flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.projectName}</span>
          </p>
        )}
      </div>

      {/* Problem Statement */}
      <div className="space-y-2">
        <label htmlFor="problemStatement" className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between font-semibold">
          <span>Problem Statement & Core Hypothesis <span className="text-cyan-400">*</span></span>
          <span className="text-[11px] text-slate-400 font-mono">Target benchmark</span>
        </label>
        <textarea
          id="problemStatement"
          rows={3}
          value={draft.problemStatement}
          onChange={(e) => onChange({ problemStatement: e.target.value })}
          placeholder="What technical problem or inefficiency does this solve? What is the hypothesis being tested?"
          className={`w-full px-4 py-3 rounded-xl bg-black/40 border text-white text-sm font-sans placeholder:text-slate-500 focus:outline-none transition-all resize-y ${
            errors.problemStatement
              ? 'border-rose-500 focus:border-rose-400 bg-rose-950/10'
              : 'border-white/10 focus:border-cyan-400 focus:bg-white/[0.03]'
          }`}
        />
        {errors.problemStatement && (
          <p className="text-xs font-mono text-rose-400 flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.problemStatement}</span>
          </p>
        )}
      </div>

      {/* Project Description */}
      <div className="space-y-2">
        <label htmlFor="projectDescription" className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between font-semibold">
          <span>Technical Architecture Description <span className="text-cyan-400">*</span></span>
          <span className="text-[11px] text-slate-400 font-mono">Key components & novel loops</span>
        </label>
        <textarea
          id="projectDescription"
          rows={4}
          value={draft.projectDescription}
          onChange={(e) => onChange({ projectDescription: e.target.value })}
          placeholder="Detail key architectural decisions, microcontrollers, algorithms, protocols, or edge frameworks used..."
          className={`w-full px-4 py-3 rounded-xl bg-black/40 border text-white text-sm font-sans placeholder:text-slate-500 focus:outline-none transition-all resize-y ${
            errors.projectDescription
              ? 'border-rose-500 focus:border-rose-400 bg-rose-950/10'
              : 'border-white/10 focus:border-cyan-400 focus:bg-white/[0.03]'
          }`}
        />
        {errors.projectDescription && (
          <p className="text-xs font-mono text-rose-400 flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.projectDescription}</span>
          </p>
        )}
      </div>

      {/* Team Information Section */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
          <Users className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
            Team & Institutional Attribution
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="teamName" className="text-xs font-mono text-slate-300">
              Team / Lab Name <span className="text-cyan-400">*</span>
            </label>
            <input
              id="teamName"
              type="text"
              value={draft.teamName}
              onChange={(e) => onChange({ teamName: e.target.value })}
              placeholder="e.g. Stanford BioRobotics Lab"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-sans placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {errors.teamName && (
              <p className="text-[11px] font-mono text-rose-400">{errors.teamName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="leadName" className="text-xs font-mono text-slate-300">
              Lead Presenter / Architect <span className="text-cyan-400">*</span>
            </label>
            <input
              id="leadName"
              type="text"
              value={draft.leadName}
              onChange={(e) => onChange({ leadName: e.target.value })}
              placeholder="e.g. Dr. Elena Vance"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-sans placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {errors.leadName && (
              <p className="text-[11px] font-mono text-rose-400">{errors.leadName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="institution" className="text-xs font-mono text-slate-300">
              University / Company Affiliation
            </label>
            <input
              id="institution"
              type="text"
              value={draft.institution}
              onChange={(e) => onChange({ institution: e.target.value })}
              placeholder="e.g. Stanford University / Autonomous Robotics Cohort"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-sans placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="teamMembers" className="text-xs font-mono text-slate-300">
              Core Contributors & Roles
            </label>
            <input
              id="teamMembers"
              type="text"
              value={draft.teamMembers}
              onChange={(e) => onChange({ teamMembers: e.target.value })}
              placeholder="e.g. Alex (Firmware), Sam (ML Models), Lisa (Hardware)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-sans placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 text-sm group"
        >
          <span>Continue to Evidence & Artifacts</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
