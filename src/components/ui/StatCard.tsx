import React from 'react';
import { Card } from './Card';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon?: LucideIcon;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  badge,
  onClick,
  className = '',
}) => {
  return (
    <Card
      onClick={onClick}
      hoverEffect={!!onClick}
      className={`p-5 flex flex-col justify-between transition-all duration-200 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-500">
            {title}
          </p>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900">
            {value}
          </div>
        </div>

        {Icon && (
          <div className="p-2.5 rounded-lg bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-300 text-cyan-400 dark:text-cyan-400 light:text-cyan-600">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center justify-between text-xs">
        {trend ? (
          <div className={`flex items-center gap-1 font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-slate-400'}`}>
            {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{trend.value}</span>
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-400 light:text-slate-500">{subtitle}</span>
        )}

        {badge && (
          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-800 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>
    </Card>
  );
};
