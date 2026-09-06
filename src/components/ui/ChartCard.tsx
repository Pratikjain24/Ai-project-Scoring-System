import React from 'react';
import { Card } from './Card';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  badge,
  actions,
  children,
  footer,
  className = '',
}) => {
  return (
    <Card className={`p-5 flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
              {title}
            </h3>
            {badge && (
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="py-4 flex-1 flex flex-col justify-center min-h-[220px]">
        {children}
      </div>

      {footer && (
        <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          {footer}
        </div>
      )}
    </Card>
  );
};
