import React from 'react';
import { 
  Camera, 
  Video, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Radio, 
  Sparkles, 
  Clock
} from 'lucide-react';
import type { SubmissionDraft, EvaluationModeType } from '../../types/submission';

interface ModeSelectorProps {
  draft: SubmissionDraft;
  onChange: (fields: Partial<SubmissionDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  draft,
  onChange,
  onNext,
  onBack,
}) => {
  const modes: {
    id: EvaluationModeType;
    title: string;
    badge: string;
    badgeColor: string;
    description: string;
    specs: string[];
    turnaround: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'live_camera',
      title: 'Mode A: Live Camera Jury',
      badge: 'Interactive & Synchronous',
      badgeColor: 'cyan',
      description:
        'The AI jury opens a secure low-latency WebRTC video stream. Present your prototype, hardware breadboard, or software terminal live. The AI probes team claims with dynamic technical Q&A.',
      specs: [
        '60 FPS synchronized computer vision inspection',
        'Hardware prototype & probe bounding boxes',
        'Adaptive vocal confidence & pacing telemetry',
        'Direct live interrogative technical questions',
      ],
      turnaround: 'Immediate live feedback (~15 mins)',
      icon: <Camera className="w-6 h-6 text-cyan-400" />,
    },
    {
      id: 'upload_video',
      title: 'Mode B: Asynchronous Deep Video Jury',
      badge: 'Overnight Synthetic Trial',
      badgeColor: 'emerald',
      description:
        'Submit a recorded 4K demonstration video. The autonomous AI jury executes multi-agent synthetic trials overnight, spinning up benchmark micro-VMs and cross-referencing 240M+ papers.',
      specs: [
        'Frame-by-frame presentation & slide alignment',
        'Full sandboxed benchmark reproduction in micro-VM',
        'ArXiv, USPTO & WIPO patent graph cross-matching',
        'Multi-agent adversarial consensus deliberation',
      ],
      turnaround: 'Exhaustive dossier in 15–30 minutes',
      icon: <Video className="w-6 h-6 text-emerald-400" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-3">
          <Radio className="w-3.5 h-3.5" />
          <span>STEP 03 // JURY MODALITY & DELIBERATION PROTOCOL</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
          Select Evaluation Modality
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
          Choose between an interactive real-time defense or a deep asynchronous multi-agent forensic audit. Both modes support software, hardware, and hybrid architectures.
        </p>
      </div>

      {/* Two Large Selectable Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modes.map((mode) => {
          const isSelected = draft.evaluationMode === mode.id;
          return (
            <div
              key={mode.id}
              onClick={() => onChange({ evaluationMode: mode.id })}
              className={`p-6 sm:p-7 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                isSelected
                  ? mode.id === 'live_camera'
                    ? 'bg-cyan-950/30 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.18)]'
                    : 'bg-emerald-950/30 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.18)]'
                  : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04] hover:border-white/20'
              }`}
            >
              {/* Radio Indicator top right */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
                    isSelected
                      ? mode.id === 'live_camera'
                        ? 'bg-cyan-500/20 border-cyan-400/80'
                        : 'bg-emerald-500/20 border-emerald-400/80'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  {mode.icon}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      isSelected
                        ? mode.id === 'live_camera'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    {mode.badge}
                  </span>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? mode.id === 'live_camera'
                          ? 'border-cyan-400 bg-cyan-400 text-black'
                          : 'border-emerald-400 bg-emerald-400 text-black'
                        : 'border-white/20 bg-transparent'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-3 mb-6">
                <h3 className="text-xl font-bold text-white font-display">
                  {mode.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {mode.description}
                </p>

                {/* Specs List */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  {mode.specs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs font-mono text-slate-300"
                    >
                      <Sparkles
                        className={`w-3 h-3 shrink-0 ${
                          mode.id === 'live_camera' ? 'text-cyan-400' : 'text-emerald-400'
                        }`}
                      />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Turnaround Footer */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Turnaround:</span>
                </div>
                <span className="text-white font-semibold">{mode.turnaround}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional Custom Instructions / Focus Areas */}
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
        <label htmlFor="customInstructions" className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between font-semibold">
          <span>Optional Jury Focus Areas or Domain Nuances</span>
          <span className="text-[10px] text-slate-400 font-mono">Specialized evaluation rubrics</span>
        </label>
        <textarea
          id="customInstructions"
          rows={2}
          value={draft.customInstructions || ''}
          onChange={(e) => onChange({ customInstructions: e.target.value })}
          placeholder="e.g. Focus especially on RF return path impedance and battery power budget during rotor stall..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-sans placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 resize-y"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Evidence</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/25 transition-all flex items-center gap-2 text-xs group"
        >
          <span>Continue to Final Review</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
