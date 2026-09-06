import React from 'react';

export interface BadgeProps {
  variant?: 'neutral' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  children,
  className = ''
}) => {
  const variantStyles = {
    neutral: 'bg-white/[0.05] border-white/10 text-slate-300',
    cyan: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300',
    emerald: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300',
    amber: 'bg-amber-950/60 border-amber-500/30 text-amber-300',
    rose: 'bg-rose-950/60 border-rose-500/30 text-rose-300',
    purple: 'bg-purple-950/60 border-purple-500/30 text-purple-300'
  };

  const dotColors = {
    neutral: 'bg-slate-400',
    cyan: 'bg-cyan-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    purple: 'bg-purple-400'
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-0.5 gap-1.5'
  };

  return (
    <span className={`inline-flex items-center font-mono font-medium rounded-full border transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      <span>{children}</span>
    </span>
  );
};
