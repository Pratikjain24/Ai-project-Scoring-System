import React from 'react';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  confidence?: number;
  label?: string;
  sublabel?: string;
  animate?: boolean;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  maxScore = 100,
  size = 180,
  strokeWidth = 12,
  confidence,
  label = 'Overall Score',
  sublabel,
  animate = true,
}) => {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color logic
  const getColor = (val: number) => {
    if (val >= 85) return { stroke: '#10B981', glow: 'rgba(16, 185, 129, 0.3)', text: 'text-emerald-400' };
    if (val >= 70) return { stroke: '#06B6D4', glow: 'rgba(6, 182, 212, 0.3)', text: 'text-cyan-400' };
    if (val >= 50) return { stroke: '#F59E0B', glow: 'rgba(245, 158, 11, 0.3)', text: 'text-amber-400' };
    return { stroke: '#F43F5E', glow: 'rgba(244, 63, 94, 0.3)', text: 'text-rose-400' };
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="rotate-[-90deg] transition-all duration-700 ease-out"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-800/60 dark:text-slate-800/80 light:text-slate-200"
          />
          {/* Active progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={animate ? strokeDashoffset : strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: `drop-shadow(0 0 8px ${color.glow})`,
              transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
          <span className="text-3xl sm:text-4xl font-black tracking-tight font-mono text-slate-100 dark:text-slate-100 light:text-slate-900">
            {score.toFixed(1)}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-500">
            out of {maxScore}
          </span>
        </div>
      </div>

      {label && (
        <div className="mt-3 font-semibold text-sm text-slate-200 dark:text-slate-200 light:text-slate-800">
          {label}
        </div>
      )}

      {confidence !== undefined && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Confidence: <strong className="text-slate-200 dark:text-slate-200 light:text-slate-800 font-mono">{confidence}%</strong></span>
        </div>
      )}

      {sublabel && (
        <div className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-400 mt-0.5">
          {sublabel}
        </div>
      )}
    </div>
  );
};
