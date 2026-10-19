import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal
} from 'lucide-react';
import { SOFTWARE_TRACK_DATA, HARDWARE_TRACK_DATA, type TrackFeature } from '../data/mockData';

export interface DualTrackSectionProps {
  softwareData?: TrackFeature;
  hardwareData?: TrackFeature;
}

export const DualTrackSection: React.FC<DualTrackSectionProps> = ({
  softwareData = SOFTWARE_TRACK_DATA,
  hardwareData = HARDWARE_TRACK_DATA,
}) => {
  const [activeTrack, setActiveTrack] = useState<'software' | 'hardware'>('hardware');

  const currentData: TrackFeature = activeTrack === 'software' ? softwareData : hardwareData;

  return (
    <section id="dual-track" className="py-24 relative bg-[#090D16] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>UNIFIED EVALUATION TAXONOMY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
            One Engine. Dual Diligence for <span className="text-gradient-cyan">Code & Silicon</span>.
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Most evaluation tools only look at web apps or surface code repositories. ProjectX-Ray AI audits full-stack distributed microservices and bare-metal multi-layer embedded hardware with equal depth.
          </p>

          {/* Interactive Track Switcher */}
          <div className="inline-flex items-center p-1.5 rounded-xl bg-black/60 border border-white/10 mt-8">
            <button
              onClick={() => setActiveTrack('software')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTrack === 'software'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>SOFTWARE & CLOUD TRACK</span>
            </button>

            <button
              onClick={() => setActiveTrack('hardware')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTrack === 'hardware'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>HARDWARE & EMBEDDED TRACK</span>
            </button>
          </div>
        </div>

        {/* Track Content Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTrack}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            {/* Left Column: Forensic Checks list */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">
                      {currentData.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {currentData.subtitle}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    activeTrack === 'software' 
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30' 
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {activeTrack === 'software' ? 'AST & Cloud Sandbox' : 'Gerber DRC & BOM Realizer'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {currentData.items.map((item, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl bg-[#0E1320] border border-white/[0.08] hover:border-white/20 transition-all text-xs"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        {item.severity === 'pass' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <h4 className="font-bold text-white text-sm font-display">
                          {item.label}
                        </h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold shrink-0 ${
                        item.severity === 'pass'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {item.severity === 'pass' ? 'VERIFIED' : 'ATTENTION'}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed mb-3">
                      {item.description}
                    </p>

                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] font-mono text-[11px] flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Jury Ground-Truth Metric:</span>
                      <span className="font-bold text-white">{item.verifiedMetric}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Simulated Live Telemetry Stream */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="h-full rounded-2xl bg-black/80 border border-white/10 p-6 flex flex-col justify-between font-mono shadow-2xl relative overflow-hidden">
                {/* Visual scan line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-cyan-400/50 animate-pulse" />

                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span>LIVE TELEMETRY DAEMON</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-emerald-400 text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      RUNNING
                    </span>
                  </div>

                  <div className="space-y-3 text-xs mb-6">
                    {currentData.telemetryStream.map((log, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="text-cyan-400">[{log.timestamp}] {log.module}</span>
                          <span className="text-emerald-400 font-bold">{log.status}</span>
                        </div>
                        <p className="text-slate-200 text-[11px]">{log.event}</p>
                      </div>
                    ))}
                  </div>

                  {/* Architecture Diagram Snippet */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                    <span className="text-[10px] uppercase text-slate-400 tracking-wider block mb-2">
                      {activeTrack === 'software' ? 'Sandboxed Micro-VM Telemetry' : 'Gerber Layer Cross-Section'}
                    </span>
                    <div className="h-24 rounded bg-black/50 border border-white/10 p-3 flex flex-col justify-center space-y-1.5 text-[11px]">
                      {activeTrack === 'software' ? (
                        <>
                          <div className="flex justify-between text-slate-400">
                            <span>VM Instance: firecracker-m6i.metal</span>
                            <span className="text-cyan-400">0.4ms boot</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Target Endpoint: POST /v1/infer</span>
                            <span className="text-emerald-400">99.8% SLA</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Fuzz Testing: 5,000 bad packets</span>
                            <span className="text-emerald-400">0 crashes</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-slate-400">
                            <span>Layer 1 (Top Signal): RF 50Ω Controlled</span>
                            <span className="text-emerald-400">±2% Matched</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Layer 2 (GND Plane): Solid 1oz Copper</span>
                            <span className="text-emerald-400">Continuous</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Layer 3 (PWR Plane): 3.3V Star Routing</span>
                            <span className="text-emerald-400">Low Ripple</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Zero manual paperwork required</span>
                  <span className="text-cyan-400 font-bold">100% Automated</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
