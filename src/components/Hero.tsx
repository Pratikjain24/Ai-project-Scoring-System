import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Search, 
  Cpu, 
  ShieldCheck, 
  Terminal, 
  Radio, 
  ChevronRight,
  Activity
} from 'lucide-react';

interface HeroProps {
  onStartEvaluation: () => void;
  onSeeHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartEvaluation, onSeeHowItWorks }) => {
  const [activeHudTab, setActiveHudTab] = useState<'scan' | 'claims' | 'priorArt'>('scan');

  const claimsList = [
    { claim: '"42 FPS edge inference on Hailo-8 NPU"', status: 'VERIFIED', time: '84ms latency', pass: true },
    { claim: '"Sub-100ms wildfire smoke alarm"', status: 'VERIFIED', time: '92.4% precision', pass: true },
    { claim: '"Zero false triggers under direct sunlight"', status: 'CONDITIONAL', time: '94.8% on haze split', pass: 'warning' },
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background ambient lighting & grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-cyan-500/15 via-violet-500/10 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-emerald-500/10 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-14 md:mb-20">
          {/* Institutional Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>INSTITUTIONAL-GRADE JURY FOR SOFTWARE & HARDWARE</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">TRUTH-DRIVEN EVALUATION</span>
          </motion.div>

          {/* Primary Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white mb-6 leading-[1.08]"
          >
            Your AI <span className="text-gradient-cyan">Project Jury</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl font-mono text-cyan-300/90 font-medium mb-6 tracking-wide"
          >
            Observe. Research. Verify. Score. Improve.
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal"
          >
            The autonomous evaluation platform that audits code repositories, KiCAD schematics, live video demos, and prior art across 240M+ patents and papers to deliver auditable, evidence-backed verdicts.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
          >
            <button
              onClick={onStartEvaluation}
              className="w-full sm:w-auto px-7 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-3 text-sm sm:text-base group"
            >
              <Sparkles className="w-4 h-4 text-cyan-100" />
              <span>Start Evaluation</span>
              <ArrowRight className="w-4 h-4 text-cyan-100 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onSeeHowItWorks}
              className="w-full sm:w-auto px-7 py-4 rounded-xl font-semibold text-slate-200 bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2.5 text-sm sm:text-base backdrop-blur-md"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
              <span>See How It Works</span>
            </button>
          </motion.div>

          {/* Micro-metrics under CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/[0.06] text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-white">0% Hallucination</p>
                <p className="text-[11px] text-slate-400">Cryptographic citations</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                <Search className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-white">240M+ Papers</p>
                <p className="text-[11px] text-slate-400">ArXiv & USPTO scan</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-white">Code & Hardware</p>
                <p className="text-[11px] text-slate-400">PCB + AST Sandbox</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Radio className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-white">Live & Recorded</p>
                <p className="text-[11px] text-slate-400">60FPS Vision Telemetry</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Futuristic Interactive Jury HUD Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Exterior Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-75" />

          {/* Main Terminal Window */}
          <div className="relative rounded-2xl bg-[#090D16]/95 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden">
            {/* Header bar */}
            <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3.5 bg-white/[0.02] border-b border-white/[0.08] gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />
                <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>JURY_EVALUATION_SESSION // AEROPULSE_PX4</span>
                </span>
              </div>

              {/* HUD Switcher Tabs */}
              <div className="flex items-center bg-black/40 p-1 rounded-lg border border-white/[0.06] text-xs font-mono">
                <button
                  onClick={() => setActiveHudTab('scan')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeHudTab === 'scan'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Live Telemetry
                </button>
                <button
                  onClick={() => setActiveHudTab('claims')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeHudTab === 'claims'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Claim Verifier (3)
                </button>
                <button
                  onClick={() => setActiveHudTab('priorArt')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeHudTab === 'priorArt'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Prior Art Scan
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-4 sm:p-6 lg:p-8">
              {activeHudTab === 'scan' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Multimodal Stream & Reticle Visualizer */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="relative aspect-video rounded-xl bg-black/60 border border-white/10 overflow-hidden group">
                      {/* Reticle / Radar Overlay */}
                      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-32 h-32 rounded-full border border-cyan-500/30 animate-ping opacity-25" />
                        <div className="w-48 h-48 rounded-full border border-dashed border-cyan-500/40" />
                        <div className="w-16 h-16 rounded-full border border-emerald-500/50 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                      </div>

                      {/* Computer Vision Bounding Boxes */}
                      <div className="absolute top-6 left-8 border border-cyan-400/80 bg-cyan-500/10 px-2 py-1 rounded text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>MCU: ESP32-S3-WROOM-1 [PASS]</span>
                      </div>

                      <div className="absolute bottom-10 right-8 border border-emerald-400/80 bg-emerald-500/10 px-2 py-1 rounded text-[10px] font-mono text-emerald-300 flex items-center gap-1.5 shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>NPU: Hailo-8 M.2 (84ms infer)</span>
                      </div>

                      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-slate-300">
                        <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        <span>LIVE MULTIMODAL FEED: 1080p @ 60 FPS</span>
                      </div>
                      
                      <div className="absolute top-4 right-4 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>SYNCHRONIZED WITH AUDIO CADENCE</span>
                      </div>
                    </div>

                    {/* Real-time Telemetry Log Ticker */}
                    <div className="bg-black/50 rounded-xl p-3 border border-white/[0.06] font-mono text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-white/[0.06]">
                        <span>REAL-TIME JURY TELEMETRY FEED</span>
                        <span className="text-cyan-400">LATENCY: 14MS</span>
                      </div>
                      <div className="text-emerald-400 flex items-center gap-2">
                        <span>[10:04:19]</span>
                        <span>✔ AST scan verified: 0 dynamic memory leaks detected in sensor_fusion.cpp</span>
                      </div>
                      <div className="text-cyan-300 flex items-center gap-2">
                        <span>[10:04:22]</span>
                        <span>⚡ Benchmarking micro-VM: 41.8 FPS confirmed under simulated smoke haze</span>
                      </div>
                      <div className="text-violet-400 flex items-center gap-2">
                        <span>[10:04:27]</span>
                        <span>◈ Cross-checking 240M papers: Patent US-2024-00912 overlap isolated to gimbal</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Composite Jury Scorecard */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 rounded-xl p-5 backdrop-blur-md">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                            Composite Jury Verdict
                          </span>
                          <h4 className="text-lg font-bold text-white font-display mt-0.5">
                            AeroPulse PX-4
                          </h4>
                          <p className="text-xs text-slate-400">Stanford BioRobotics & Embedded Systems</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-extrabold font-mono text-gradient-emerald">
                            92.4
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 font-medium">
                            / 100 TIER 1
                          </span>
                        </div>
                      </div>

                      {/* Criteria Score bars */}
                      <div className="space-y-2.5 text-xs font-mono">
                        <div>
                          <div className="flex justify-between text-slate-300 mb-1">
                            <span>Technical Rigor & Code</span>
                            <span className="text-cyan-400">96/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400 rounded-full w-[96%]" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-300 mb-1">
                            <span>Claim Veracity & Benchmarks</span>
                            <span className="text-emerald-400">91/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full w-[91%]" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-300 mb-1">
                            <span>Originality & Prior Art</span>
                            <span className="text-violet-400">89/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-400 rounded-full w-[89%]" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-300 mb-1">
                            <span>Presentation & Defense</span>
                            <span className="text-amber-400">93/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full w-[93%]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Auditable proof pill */}
                    <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs">
                      <div className="flex items-center gap-2 text-cyan-300 font-semibold mb-1 font-mono">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>Auditable Cryptographic Proof</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        18 citations verified. No subjective human drift. Every score point is tied to GitHub commit SHA or 1080p video timestamp.
                      </p>
                      <button 
                        onClick={onStartEvaluation}
                        className="mt-3 text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1 group font-semibold"
                      >
                        <span>Inspect Full Evidence Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeHudTab === 'claims' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs text-slate-400 font-mono">
                    <span>EXTRACTED PRESENTATION CLAIMS</span>
                    <span>EMPIRICAL BENCHMARK STATUS</span>
                  </div>
                  {claimsList.map((item, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <p className="font-mono text-slate-200 font-semibold">{item.claim}</p>
                        <p className="text-slate-400 text-[11px]">Replication in sandboxed Firecracker micro-VM with simulated noise</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] text-slate-300 bg-white/5 px-2.5 py-1 rounded">
                          {item.time}
                        </span>
                        <span className={`px-2.5 py-1 rounded font-mono font-bold text-[10px] ${
                          item.pass === true 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeHudTab === 'priorArt' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs">
                    <h5 className="font-mono font-bold text-violet-300 mb-1">
                      AUTONOMOUS PRIOR ART GRAPH: 240,000,000+ PAPERS SEARCHED
                    </h5>
                    <p className="text-slate-300 text-[12px]">
                      Project claims "first edge drone detection". Autonomous agents crawled IEEE, ArXiv, and USPTO patents to map originality.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/10">
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>US-2024-00912-A1</span>
                        <span className="text-emerald-400">8% Overlap (Novel)</span>
                      </div>
                      <p className="text-slate-200 text-[11px]">Patent matches quadcopter gimbal stabilization, but custom Hailo-8 dual IR optical pipeline is novel.</p>
                    </div>
                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/10">
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>arXiv:2308.11429</span>
                        <span className="text-cyan-400">12% Overlap (Distinct)</span>
                      </div>
                      <p className="text-slate-200 text-[11px]">Edge smoke segmentation model architecture derived from YOLOv8-Fire with custom quantization kernels.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Terminal Status Footer */}
            <div className="px-4 sm:px-6 py-2.5 bg-black/80 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>MULTIMODAL ARTIFACT PIPELINE: SYNCHRONIZED</span>
              </div>
              <span className="text-cyan-400 font-semibold cursor-pointer hover:underline" onClick={onStartEvaluation}>
                Run Custom Project Scan →
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
