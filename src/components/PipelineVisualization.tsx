import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCode, 
  Search, 
  CheckCircle, 
  Cpu, 
  Award, 
  Zap, 
  Database,
  Layers
} from 'lucide-react';
import { PIPELINE_STEPS } from '../data/mockData';

export interface PipelineVisualizationProps {
  steps?: typeof PIPELINE_STEPS;
}

export const PipelineVisualization: React.FC<PipelineVisualizationProps> = ({
  steps = PIPELINE_STEPS,
}) => {
  const [activeStepId, setActiveStepId] = useState<string>(steps[0]?.id || '');

  const activeStep = steps.find(s => s.id === activeStepId) || steps[0];

  const getStepIcon = (id: string) => {
    switch (id) {
      case 'intake': return <FileCode className="w-5 h-5" />;
      case 'research': return <Search className="w-5 h-5" />;
      case 'verification': return <CheckCircle className="w-5 h-5" />;
      case 'rigor': return <Cpu className="w-5 h-5" />;
      case 'verdict': return <Award className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <section id="pipeline" className="py-24 relative border-t border-white/[0.06] bg-[#080B12]">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-500/[0.04] blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>5-STAGE AUTONOMOUS PIPELINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
            How The AI Jury Deconstructs <span className="text-gradient-cyan">Every Project</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            From raw repository commits and physical PCB traces to patent graph cross-examination. Each phase runs asynchronously with auditable cryptographic proofs.
          </p>
        </div>

        {/* Pipeline Stepper Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          {steps.map((step) => {
            const isSelected = step.id === activeStepId;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStepId(step.id)}
                className={`relative p-4 rounded-xl text-left transition-all duration-300 border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white/[0.08] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.2)]'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/20'
                }`}
              >
                {/* Active Indicator Top Bar */}
                {isSelected && (
                  <motion.div
                    layoutId="pipeline-active-indicator"
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-t-xl"
                  />
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-400'
                  }`}>
                    STAGE {step.number}
                  </span>
                  <div className={`p-1.5 rounded-lg ${
                    isSelected ? 'text-cyan-300 bg-cyan-500/20' : 'text-slate-400'
                  }`}>
                    {getStepIcon(step.id)}
                  </div>
                </div>

                <div>
                  <h3 className={`text-sm font-semibold mb-1 transition-colors ${
                    isSelected ? 'text-white' : 'text-slate-300'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1 font-mono">
                    {step.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Deep Inspector Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-gradient-to-b from-[#0E1422] to-[#0A0E17] border border-white/10 p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Background subtle grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
              {/* Left Column: Stage description & Sources */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
                      STAGE {activeStep.number} ARCHITECTURE
                    </span>
                    <span className="h-3 w-px bg-white/10" />
                    <span className="text-xs font-mono text-emerald-400">
                      STATUS: ONLINE & ACTIVE
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
                    {activeStep.title}
                  </h3>
                  <p className="text-sm font-mono text-cyan-300/90 mb-4">
                    {activeStep.tagline}
                  </p>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {activeStep.description}
                  </p>
                </div>

                {/* Ingested Sources / Connectors */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Active Telemetry Inputs & Verifiers</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeStep.sources.map((source, i) => (
                      <div
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-slate-200 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{source}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Example Stage Output Verdict */}
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/25">
                  <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono font-semibold mb-1">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Real-World Stage Verification Output</span>
                  </div>
                  <p className="text-xs font-mono text-slate-200">
                    "{activeStep.verdictSample}"
                  </p>
                </div>
              </div>

              {/* Right Column: Key Operational Metrics */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="bg-black/50 border border-white/10 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between pb-2 border-b border-white/10">
                    <span>Performance Benchmarks</span>
                    <span className="text-cyan-400">JURY ENGINE V4.2</span>
                  </h4>
                  <div className="space-y-4">
                    {activeStep.metrics.map((metric, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-slate-300">{metric.label}</span>
                        <span className="text-sm font-mono font-bold text-white bg-white/[0.05] px-2.5 py-1 rounded border border-white/10">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold mb-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Automated Consensus Multi-Agent Jury</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Three specialized model checkpoints (Architect AI, Verification AI, Citation AI) vote independently before ratifying the verdict.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
