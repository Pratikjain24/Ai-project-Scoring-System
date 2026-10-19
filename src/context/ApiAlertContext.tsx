import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../services/api';
import { queryNotificationBus, queryClient } from '../services/queryClient';
import type { GlobalApiErrorEvent } from '../services/queryClient';

export interface ApiAlertItem {
  id: string;
  title: string;
  message: string;
  code: string;
  status?: number;
  endpoint?: string;
  timestamp: string;
  queryKey?: readonly unknown[];
  retry?: () => void;
}

interface ApiAlertContextType {
  alerts: ApiAlertItem[];
  isBackendOnline: boolean | null;
  addAlert: (alert: Omit<ApiAlertItem, 'id' | 'timestamp'>) => string;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
  retryQuery: (queryKey?: readonly unknown[]) => void;
}

const ApiAlertContext = createContext<ApiAlertContextType | undefined>(undefined);

export const ApiAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<ApiAlertItem[]>([]);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(api.isConnected);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const retryQuery = useCallback((queryKey?: readonly unknown[]) => {
    if (queryKey) {
      queryClient.refetchQueries({ queryKey });
    } else {
      queryClient.refetchQueries();
    }
  }, []);

  const addAlert = useCallback(
    (alert: Omit<ApiAlertItem, 'id' | 'timestamp'>) => {
      const id = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newItem: ApiAlertItem = {
        ...alert,
        id,
        timestamp: new Date().toLocaleTimeString(),
      };

      setAlerts((prev) => {
        // Prevent duplicate alerts for same endpoint and error code
        const exists = prev.some(
          (a) => a.endpoint === alert.endpoint && a.code === alert.code && a.status === alert.status
        );
        if (exists) return prev;
        return [newItem, ...prev.slice(0, 4)]; // Keep at most 5 recent alerts
      });

      return id;
    },
    []
  );

  // Subscribe to central ApiService connectivity transitions
  useEffect(() => {
    const unsubscribeApi = api.subscribe((online, error) => {
      setIsBackendOnline(online);
      if (!online && error && (error.status === 0 || error.code === 'BACKEND_OFFLINE')) {
        addAlert({
          title: 'Backend Unreachable',
          message: error.message || 'Unable to establish connection to ProjectX-Ray backend service.',
          code: error.code || 'BACKEND_OFFLINE',
          status: error.status || 0,
          endpoint: error.endpoint,
          retry: () => {
            api.checkConnection().then((ok) => {
              if (ok) clearAlerts();
            });
          },
        });
      }
    });

    // Subscribe to TanStack Query & Mutation failures
    const unsubscribeBus = queryNotificationBus.subscribe((event: GlobalApiErrorEvent) => {
      const err = event.error;
      const apiErr = err instanceof ApiError ? err : undefined;

      let title = 'Data Fetching Failed';
      if (apiErr?.code === 'BACKEND_OFFLINE') {
        title = 'Backend Service Disconnected';
      } else if (apiErr?.status === 404) {
        title = 'Resource Not Found (404)';
      } else if (apiErr?.status === 401 || apiErr?.status === 403) {
        title = 'Authentication Error';
      } else if (apiErr?.status && apiErr.status >= 500) {
        title = `Server Error (${apiErr.status})`;
      } else if (apiErr?.code === 'TIMEOUT') {
        title = 'Request Timed Out';
      }

      addAlert({
        title,
        message: err.message,
        code: apiErr?.code || 'FETCH_ERROR',
        status: apiErr?.status,
        endpoint: apiErr?.endpoint,
        queryKey: event.queryKey,
        retry: event.queryKey
          ? () => {
              queryClient.refetchQueries({ queryKey: event.queryKey });
            }
          : undefined,
      });
    });

    return () => {
      unsubscribeApi();
      unsubscribeBus();
    };
  }, [addAlert, clearAlerts]);

  return (
    <ApiAlertContext.Provider
      value={{
        alerts,
        isBackendOnline,
        addAlert,
        dismissAlert,
        clearAlerts,
        retryQuery,
      }}
    >
      {children}
    </ApiAlertContext.Provider>
  );
};

export const useApiAlert = (): ApiAlertContextType => {
  const context = useContext(ApiAlertContext);
  if (!context) {
    throw new Error('useApiAlert must be used within an ApiAlertProvider');
  }
  return context;
};
