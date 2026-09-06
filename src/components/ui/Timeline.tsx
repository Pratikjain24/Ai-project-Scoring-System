import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type?: 'positive' | 'warning' | 'negative' | 'neutral';
  tags?: string[];
  metrics?: { label: string; value: string }[];
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className = '' }) => {
  const getIcon = (type?: TimelineEvent['type']) => {
    switch (type) {
      case 'positive':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'negative':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getBorderColor = (type?: TimelineEvent['type']) => {
    switch (type) {
      case 'positive':
        return 'border-emerald-500/40 bg-emerald-950/20';
      case 'warning':
        return 'border-amber-500/40 bg-amber-950/20';
      case 'negative':
        return 'border-rose-500/40 bg-rose-950/20';
      default:
        return 'border-cyan-500/40 bg-cyan-950/20';
    }
  };

  return (
    <div className={`relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 ${className}`}>
      {events.map((event) => (
        <div key={event.id} className="relative group">
          {/* Node dot */}
          <div className={`absolute -left-[27px] top-1 p-1 rounded-full border ${getBorderColor(event.type)} transition-transform group-hover:scale-110`}>
            {getIcon(event.type)}
          </div>

          <div className="bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-50 p-4 rounded-lg border border-slate-800/80 transition-all hover:border-slate-700">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
              <h4 className="text-sm font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900">
                {event.title}
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                <Clock className="w-3 h-3" />
                <span>{event.time}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 leading-relaxed">
              {event.description}
            </p>

            {event.tags && event.tags.length > 0 && (
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                {event.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {event.metrics && event.metrics.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {event.metrics.map((m, idx) => (
                  <div key={idx} className="bg-slate-950/40 p-2 rounded">
                    <span className="block text-[10px] text-slate-500 uppercase">{m.label}</span>
                    <span className="font-mono text-xs font-bold text-slate-200">{m.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
