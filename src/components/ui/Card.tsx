import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-[#0B0F19]/90 border border-white/[0.08] p-5 sm:p-6 backdrop-blur-md shadow-sm transition-all duration-200 ${
        hoverEffect ? 'hover:border-white/20 hover:bg-[#0E1422] cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between gap-3 pb-4 border-b border-white/[0.06] mb-4 ${className}`}>
    <div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 font-sans mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
