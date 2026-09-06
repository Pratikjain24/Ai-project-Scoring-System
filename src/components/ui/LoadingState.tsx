import React from 'react';

export interface LoadingStateProps {
  lines?: number;
  label?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  lines = 3,
  label = 'Synthesizing evidence telemetry...',
  className = ''
}) => {
  return (
    <div className={`p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4 animate-pulse ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/10" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-white/10 rounded-md w-1/3" />
          <div className="h-2 bg-white/5 rounded-md w-1/4" />
        </div>
      </div>

      <div className="space-y-2 pt-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 bg-white/[0.06] rounded-md"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>

      {label && (
        <div className="text-[11px] font-mono text-cyan-400/80 pt-1">
          {label}
        </div>
      )}
    </div>
  );
};
