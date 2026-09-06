import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { AlertOctagon, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export type RiskSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

interface RiskCardProps {
  title: string;
  severity: RiskSeverity;
  category?: string;
  description: string;
  mitigation?: string;
  className?: string;
}

export const RiskCard: React.FC<RiskCardProps> = ({
  title,
  severity,
  category,
  description,
  mitigation,
  className = '',
}) => {
  const getSeverityBadge = (sev: RiskSeverity) => {
    switch (sev) {
      case 'Critical':
        return <Badge variant="rose" dot>Critical Risk</Badge>;
      case 'High':
        return <Badge variant="rose" dot>High Severity</Badge>;
      case 'Medium':
        return <Badge variant="amber" dot>Medium Severity</Badge>;
      case 'Low':
        return <Badge variant="neutral" dot>Low Severity</Badge>;
    }
  };

  const getIcon = (sev: RiskSeverity) => {
    switch (sev) {
      case 'Critical':
        return <AlertOctagon className="w-5 h-5 text-rose-400 flex-shrink-0" />;
      case 'High':
        return <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />;
      case 'Medium':
        return <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />;
      case 'Low':
        return <Info className="w-5 h-5 text-slate-400 flex-shrink-0" />;
    }
  };

  return (
    <Card className={`p-4 sm:p-5 border-slate-800/80 hover:border-slate-700 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 mt-0.5">
            {getIcon(severity)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900">
                {title}
              </h4>
              {category && (
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                  {category}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0">
          {getSeverityBadge(severity)}
        </div>
      </div>

      {mitigation && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 text-xs bg-slate-950/40 p-2.5 rounded border border-slate-800/40">
          <span className="font-semibold text-cyan-400 block mb-0.5">Recommended Mitigation Strategy:</span>
          <span className="text-slate-300 dark:text-slate-300 light:text-slate-600">{mitigation}</span>
        </div>
      )}
    </Card>
  );
};
