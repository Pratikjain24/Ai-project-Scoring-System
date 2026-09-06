import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  technicalDetails?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Analysis Stream Interrupted',
  message = 'An unexpected evaluation anomaly occurred while processing pipeline telemetry. Your artifacts are preserved.',
  technicalDetails,
  onRetry,
  className = '',
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`p-6 sm:p-8 rounded-xl bg-rose-950/20 border border-rose-900/50 text-center max-w-lg mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-full bg-rose-900/40 border border-rose-700/60 flex items-center justify-center text-rose-400 mx-auto mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <div className="mt-5 flex justify-center">
          <Button variant="outline" size="sm" onClick={onRetry} className="border-rose-700/60 text-rose-300 hover:bg-rose-900/30">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Retry Analysis
          </Button>
        </div>
      )}

      {technicalDetails && (
        <div className="mt-4 pt-3 border-t border-rose-900/40 text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-[11px] font-mono text-rose-400 hover:text-rose-300"
          >
            <span>{showDetails ? 'Hide Diagnostic Logs' : 'View Diagnostic Logs'}</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDetails && (
            <pre className="mt-2 p-2.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap">
              {technicalDetails}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
