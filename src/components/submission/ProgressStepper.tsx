import React from 'react';
import { Check, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick: (step: number) => void;
  lastSaved?: string;
  onBackToLanding: () => void;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  currentStep,
  onStepClick,
  lastSaved,
  onBackToLanding,
}) => {
  const steps = [
    { num: 1, title: 'Project Info', sub: 'Classification & Scope' },
    { num: 2, title: 'Evidence', sub: 'Artifacts & Repos' },
    { num: 3, title: 'Evaluation Mode', sub: 'Jury Modality' },
    { num: 4, title: 'Review & Start', sub: 'Final Diligence' },
  ];

  return (
    <div className="w-full border-b border-white/10 bg-[#080B12]/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top bar with back button & autosave status */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06] text-xs">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-300 font-mono transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Platform Overview</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>
                {lastSaved ? `Draft saved locally at ${lastSaved}` : 'Local Enclave Autosave Active'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zero-Hallucination Pipeline</span>
            </div>
          </div>
        </div>

        {/* Stepper items */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {steps.map((step) => {
            const isCompleted = step.num < currentStep;
            const isCurrent = step.num === currentStep;
            const isClickable = step.num <= currentStep;

            return (
              <button
                key={step.num}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.num)}
                className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.18)]'
                    : isCompleted
                    ? 'bg-white/[0.03] border-white/15 hover:bg-white/[0.06] cursor-pointer'
                    : 'bg-white/[0.01] border-white/[0.05] opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all ${
                    isCurrent
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/40'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-white/5 text-slate-400 border border-white/10'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : `0${step.num}`}
                </div>

                {/* Step Text */}
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-display font-semibold truncate ${
                        isCurrent ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                    {isCurrent && <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{step.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
