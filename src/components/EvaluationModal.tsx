import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Award, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({ isOpen, onClose }) => {
  const [selectedPreset, setSelectedPreset] = useState<'aeropulse' | 'tls' | 'bci'>('aeropulse');
  const [stage, setStage] = useState<'input' | 'evaluating' | 'complete'>('input');
  const [progress, setProgress] = useState(0);
  const [activeStepText, setActiveStepText] = useState('Initializing jury cluster...');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStage('input');
        setProgress(0);
        setConsoleLogs([]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const runEvaluation = () => {
    setStage('evaluating');
    setProgress(10);
    setConsoleLogs([
      '>> Connected to ProjectX-Ray AI Cluster (3 Nodes)',
      '>> Mounting isolated Firecracker micro-VM container...',
    ]);

    const steps = [
      { p: 25, msg: 'Ingesting repository AST & parsing 44k LOC...', log: '>> AST parse complete: 182 files analyzed; 0 unhandled memory leaks.' },
      { p: 45, msg: 'Querying 240M+ papers on Semantic Scholar & USPTO...', log: '>> Patent cross-check: Found 1 prior art match (US-2024-00912). Novelty confirmed.' },
      { p: 70, msg: 'Executing benchmark replication in Firecracker micro-VM...', log: '>> Replication benchmark complete: 41.8 FPS confirmed at 2.4 Watts.' },
      { p: 90, msg: 'Adversarial multi-agent jury voting and citation hashing...', log: '>> Juror consensus reached (98.7% confidence). Generating auditable report.' },
      { p: 100, msg: 'Institutional Dossier generated successfully!', log: '>> Manifest signed: sha256:7f83b165...9ac4. Verdict ratified.' }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setProgress(step.p);
        setActiveStepText(step.msg);
        setConsoleLogs(prev => [...prev, step.log]);

        if (idx === steps.length - 1) {
          setTimeout(() => {
            setStage('complete');
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
              });
            } catch {
              // Ignore confetti error if any
            }
          }, 800);
        }
      }, (idx + 1) * 900);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl rounded-2xl bg-[#090D16] border border-white/10 shadow-2xl overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm">
                ProjectX-Ray AI Evaluation Sandbox
              </h3>
              <p className="text-[10px] font-mono text-cyan-400">SESSION: SIMULATED_TRIAL_V4</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {stage === 'input' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
                  Select a Sample Project Dossier to Evaluate
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setSelectedPreset('aeropulse')}
                    className={`p-3.5 rounded-xl text-left border transition-all ${
                      selectedPreset === 'aeropulse'
                        ? 'bg-cyan-950/30 border-cyan-400 text-white'
                        : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">AeroPulse PX-4 Drone System</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        Hardware + Embedded AI
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      ESP32-S3 + Hailo-8 NPU • 4-layer KiCad PCB • 14min presentation video
                    </p>
                  </button>

                  <button
                    onClick={() => setSelectedPreset('tls')}
                    className={`p-3.5 rounded-xl text-left border transition-all ${
                      selectedPreset === 'tls'
                        ? 'bg-cyan-950/30 border-cyan-400 text-white'
                        : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">Post-Quantum TLS Proxy (Kyber-1024)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/30">
                        Distributed Cloud Rust
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Async Tokio worker pool • Formal verification • 4.8ms handshake benchmark
                    </p>
                  </button>

                  <button
                    onClick={() => setSelectedPreset('bci')}
                    className={`p-3.5 rounded-xl text-left border transition-all ${
                      selectedPreset === 'bci'
                        ? 'bg-cyan-950/30 border-cyan-400 text-white'
                        : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">NeuralMesh: Ultra-low Power BCI Sensor</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        Biomedical Silicon
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Analog front-end IC • Micro-volt EEG filtering • Bluetooth Low Energy
                    </p>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={runEvaluation}
                  className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Launch Simulated AI Jury Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {stage === 'evaluating' && (
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-bold">{activeStepText}</span>
                  <span className="text-white">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Console log box */}
              <div className="p-4 rounded-xl bg-black/70 border border-white/10 font-mono text-xs text-slate-300 space-y-1.5 h-48 overflow-y-auto">
                {consoleLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {stage === 'complete' && (
            <div className="space-y-6 py-2 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-white font-display">
                  Evaluation Verdict Ratified
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  SHA-256 HASH VERIFIED • 0% SUBJECTIVE DRIFT
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/50 border border-white/10 max-w-sm mx-auto space-y-2">
                <div className="text-3xl font-extrabold font-mono text-gradient-emerald">
                  92.4 / 100
                </div>
                <p className="text-xs font-mono text-emerald-400 font-bold">
                  Institutional Tier 1 High Distinction
                </p>
                <p className="text-[11px] text-slate-400">
                  18 cryptographically verifiable citations attached to report.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href="#scorecard"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Explore Full Dossier on Page</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setStage('input')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Test Another Preset</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
