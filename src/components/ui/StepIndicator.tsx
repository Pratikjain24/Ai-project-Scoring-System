import React from 'react';
import { Check } from 'lucide-react';

export interface Step {
  id: number;
  name: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <li
              key={step.id}
              className={`relative flex-1 ${index !== steps.length - 1 ? 'pr-4 sm:pr-8' : ''}`}
            >
              <div className="flex items-center">
                <button
                  type="button"
                  disabled={!onStepClick || (!isCompleted && !isCurrent)}
                  onClick={() => onStepClick?.(step.id)}
                  className={`group relative flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-200 ${
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : isCurrent
                      ? 'border-cyan-400 bg-cyan-950 text-cyan-300 ring-4 ring-cyan-500/20'
                      : 'border-slate-800 bg-slate-900 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : (
                    <span className="font-mono">{step.id}</span>
                  )}
                </button>

                {index !== steps.length - 1 && (
                  <div
                    className={`h-0.5 w-full ml-2 transition-colors duration-300 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>

              <div className="mt-2 text-left">
                <span
                  className={`block text-xs font-semibold uppercase tracking-wider ${
                    isCurrent
                      ? 'text-cyan-400'
                      : isCompleted
                      ? 'text-slate-200 dark:text-slate-200 light:text-slate-800'
                      : 'text-slate-500'
                  }`}
                >
                  {step.name}
                </span>
                {step.description && (
                  <span className="hidden sm:block text-[11px] text-slate-400">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
