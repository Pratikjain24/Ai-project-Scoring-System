import React, { useState } from 'react';
import {
  AlertTriangle,
  WifiOff,
  ServerCrash,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Card } from './Card';
import type { ApiError } from '../../services/api';

export interface ApiErrorAlertProps {
  error: ApiError | Error | string | null;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  isRetrying?: boolean;
  className?: string;
  variant?: 'banner' | 'card' | 'inline';
}

export const ApiErrorAlert: React.FC<ApiErrorAlertProps> = ({
  error,
  title,
  onRetry,
  onDismiss,
  isRetrying = false,
  className = '',
  variant = 'card',
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const apiError = typeof error === 'object' && error && 'code' in error ? (error as ApiError) : null;
  const status = apiError?.status;
  const code = apiError?.code || 'FETCH_ERROR';
  const endpoint = apiError?.endpoint;
  const details = apiError?.details;

  const isOffline = code === 'BACKEND_OFFLINE' || status === 0;
  const isTimeout = code === 'TIMEOUT' || status === 408;
  const isServer = status && status >= 500;

  const defaultTitle = isOffline
    ? 'Backend Offline'
    : isTimeout
    ? 'Request Timed Out'
    : isServer
    ? `Server Error (${status})`
    : 'Data Fetching Error';

  const displayTitle = title || defaultTitle;

  const getIcon = () => {
    if (isOffline) return <WifiOff className="w-5 h-5 text-rose-400 shrink-0" />;
    if (isServer) return <ServerCrash className="w-5 h-5 text-rose-400 shrink-0" />;
    if (isTimeout) return <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
    return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
  };

  if (variant === 'banner') {
    return (
      <div
        className={`w-full bg-rose-950/80 border-b border-rose-800/60 px-4 py-3 text-rose-100 flex items-center justify-between shadow-lg backdrop-blur-md transition-all ${className}`}
        role="alert"
      >
        <div className="flex items-center gap-3 min-w-0">
          {getIcon()}
          <div className="truncate">
            <span className="font-semibold text-white mr-2">{displayTitle}:</span>
            <span className="text-rose-200 text-sm">{errorMessage}</span>
            {endpoint && (
              <span className="ml-2 font-mono text-xs text-rose-300/80 bg-rose-900/40 px-1.5 py-0.5 rounded">
                {endpoint}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
              className="bg-rose-900/40 border-rose-700/60 hover:bg-rose-800/60 text-white text-xs h-7 gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>Retry</span>
            </Button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-rose-300 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card
      className={`border-rose-900/40 bg-gradient-to-br from-rose-950/30 via-slate-900/80 to-slate-950/90 p-5 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-white text-base tracking-tight">{displayTitle}</h4>
              <Badge variant={isOffline ? 'rose' : 'amber'} size="sm">
                {code}
              </Badge>
              {status ? (
                <Badge variant="neutral" size="sm">
                  HTTP {status}
                </Badge>
              ) : null}
            </div>

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-3">{errorMessage}</p>

          {endpoint && (
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 font-mono">
              <span className="text-slate-500">Target Endpoint:</span>
              <span className="bg-slate-800/80 text-cyan-300 px-2 py-0.5 rounded border border-slate-700/50">
                {endpoint}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            {onRetry && (
              <Button
                variant="primary"
                size="sm"
                onClick={onRetry}
                disabled={isRetrying}
                className="gap-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-medium shadow-md shadow-rose-950/50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Retrying Connection...' : 'Retry Request'}</span>
              </Button>
            )}

            {(details || apiError?.timestamp) && (
              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors ml-auto"
              >
                <span>{showDetails ? 'Hide Diagnostics' : 'Show Diagnostics'}</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {showDetails && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
              <div className="bg-slate-950/90 rounded-lg p-3 border border-slate-800/60 overflow-x-auto text-slate-400 space-y-1">
                <div>
                  <span className="text-slate-500">Error Code:</span> <span className="text-rose-400">{code}</span>
                </div>
                {apiError?.timestamp && (
                  <div>
                    <span className="text-slate-500">Logged At:</span>{' '}
                    <span className="text-slate-300">{apiError.timestamp}</span>
                  </div>
                )}
                {details && (
                  <div>
                    <span className="text-slate-500">Payload:</span>
                    <pre className="text-slate-300 mt-1 whitespace-pre-wrap">
                      {typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
