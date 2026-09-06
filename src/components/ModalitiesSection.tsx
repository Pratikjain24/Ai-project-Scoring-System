import React, { useState } from 'react';
import { 
  Video, 
  Camera, 
  UploadCloud, 
  MessageSquareQuote, 
  CheckCircle2, 
  Clock, 
  Radio, 
  ShieldCheck, 
  FileArchive
} from 'lucide-react';

export const ModalitiesSection: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'live' | 'upload'>('live');

  return (
    <section id="modalities" className="py-24 relative bg-[#07090E] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-4">
            <Radio className="w-3.5 h-3.5" />
            <span>FLEXIBLE JURY INGESTION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
            Evaluate In Real-Time or Run Deep <span className="text-gradient-emerald">Overnight Audits</span>.
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Whether you need a live interactive AI judge during a fast-paced demo day or an exhaustive deep-dive audit of a 40-page defense thesis and CAD archive, ProjectX-Ray AI adapts seamlessly.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setActiveMode('live')}
            className={`p-6 rounded-2xl text-left transition-all border ${
              activeMode === 'live'
                ? 'bg-cyan-950/20 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Camera className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-cyan-500/30">
                Synchronous
              </span>
            </div>
            <h3 className="text-xl font-bold text-white font-display mb-1">
              Mode A: Live Camera & Interactive Jury
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Dynamic live stream with continuous computer vision, audio stress analysis, and adaptive real-time interrogative Q&A generated on the fly.
            </p>
          </button>

          <button
            onClick={() => setActiveMode('upload')}
            className={`p-6 rounded-2xl text-left transition-all border ${
              activeMode === 'upload'
                ? 'bg-emerald-950/20 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
                Asynchronous
              </span>
            </div>
            <h3 className="text-xl font-bold text-white font-display mb-1">
              Mode B: Deep Video & Artifact Repository Upload
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Drop 4K recorded presentations, GitHub links, and raw Gerbers. The AI jury executes overnight synthetic trials, fuzz testing, and prior art scans.
            </p>
          </button>
        </div>

        {/* Interactive Mode Showcase */}
        <div className="rounded-2xl bg-[#090D16] border border-white/10 p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          {activeMode === 'live' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Visual Demo of Live Camera Mode */}
              <div className="lg:col-span-7">
                <div className="relative aspect-video rounded-xl bg-black border border-white/10 overflow-hidden shadow-2xl">
                  {/* Grid lines and Reticle */}
                  <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />
                  
                  {/* Live Feed Header */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>LIVE CAM 01: HARDWARE LAB BENCH</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                      CV INFERENCE: 60 FPS
                    </div>
                  </div>

                  {/* Simulated CV Detections on Board */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-3/4 h-3/5 border-2 border-dashed border-cyan-400/60 rounded-xl relative bg-cyan-500/5">
                      <span className="absolute -top-3 left-3 bg-cyan-500 text-black text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                        DEVICE UNDER TEST: MOTOR DRIVER REV 2.1
                      </span>
                      <div className="absolute top-4 right-4 text-[10px] font-mono text-cyan-300 bg-black/60 px-2 py-1 rounded border border-cyan-500/30">
                        FET Temp: 38.4°C [SAFE]
                      </div>
                      <div className="absolute bottom-4 left-4 text-[10px] font-mono text-emerald-300 bg-black/60 px-2 py-1 rounded border border-emerald-500/30">
                        Oscilloscope PWM: 20.0 kHz verified
                      </div>
                    </div>
                  </div>

                  {/* Live Probing Question Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 z-20 p-3.5 rounded-lg bg-black/85 backdrop-blur-md border border-white/10">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 font-bold mb-1">
                      <MessageSquareQuote className="w-3.5 h-3.5" />
                      <span>AI JURY LIVE INTERROGATIVE PROBE:</span>
                    </div>
                    <p className="text-xs text-white font-sans">
                      "I notice your oscilloscope probe is grounded near the high-current switching loop. Can you zoom in on TP2 to prove your signal ripple is below 15mV under full motor torque?"
                    </p>
                  </div>
                </div>
              </div>

              {/* Mode Details */}
              <div className="lg:col-span-5 space-y-4">
                <h4 className="text-xl font-bold text-white font-display">
                  Live Adaptive Interrogation
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  The AI doesn't passively listen. It analyzes vocal confidence, slide pacing, and physical hardware prototypes on camera. If a team brushes past a flaw, the AI generates precision technical follow-up questions in real-time.
                </p>

                <div className="space-y-2.5 pt-2 text-xs font-mono">
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Real-time bounding box tracking for hardware breadboards</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Instant transcription & technical claim isolation</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Adaptive Q&A generation targeted to team weak spots</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Zero latency telemetry streaming via WebRTC</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Asynchronous Upload Visual */}
              <div className="lg:col-span-7">
                <div className="p-6 rounded-xl bg-black/60 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-slate-400">
                    <span>OVERNIGHT SYNTHETIC TRIAL QUEUE</span>
                    <span className="text-emerald-400">STATUS: PROCESSING</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Video className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="text-slate-200">Pitch_Demo_Defense_Final_1080p.mp4</p>
                          <p className="text-[10px] text-slate-400">14m 32s • 1.2 GB • Audio/Slide aligned</p>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-bold">100% INGESTED</span>
                    </div>

                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileArchive className="w-4 h-4 text-cyan-400" />
                        <div>
                          <p className="text-slate-200">Hardware_Gerber_Manufacturing_RevC.zip</p>
                          <p className="text-[10px] text-slate-400">4-layer KiCAD gerbers • DRC verified</p>
                        </div>
                      </div>
                      <span className="text-cyan-400 font-bold">DRC PASSED</span>
                    </div>

                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-violet-400" />
                        <div>
                          <p className="text-slate-200">Synthetic Multi-Agent Jury Deliberation</p>
                          <p className="text-[10px] text-slate-400">3 specialized juror agents cross-voting</p>
                        </div>
                      </div>
                      <span className="text-violet-400 font-bold">98% CONSENSUS</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cryptographic report ready in 4 minutes with line-level code citations.</span>
                  </div>
                </div>
              </div>

              {/* Mode Details */}
              <div className="lg:col-span-5 space-y-4">
                <h4 className="text-xl font-bold text-white font-display">
                  Comprehensive Overnight Diligence
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Ideal for research grants, incubator demo cohorts, and university capstone defenses. Upload bulk student submissions and receive exhaustive institutional dossiers with zero fatigue or human favoritism.
                </p>

                <div className="space-y-2.5 pt-2 text-xs font-mono">
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Ingests 4K recordings, slide PDFs, CAD, and GitHub repos</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Overnight fuzz testing and benchmark micro-VM runs</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Full 240M+ patent and arXiv citation cross-referencing</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Downloadable institutional PDF + interactive web dossier</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
