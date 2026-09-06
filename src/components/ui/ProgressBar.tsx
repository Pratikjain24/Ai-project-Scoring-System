import React from 'react';

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'gradient';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'cyan',
  size = 'sm',
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variantStyles = {
    cyan: 'bg-cyan-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    gradient: 'bg-gradient-to-r from-cyan-400 to-emerald-400'
  };

  const sizeStyles = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2'
  };

  return (
    <div className={`w-full rounded-full bg-slate-800/80 overflow-hidden ${sizeStyles[size]} ${className}`}>
      <div
        className={`h-full rounded-full ${variantStyles[variant]} transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
