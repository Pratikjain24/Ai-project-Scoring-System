import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { ApiError } from './api';

export interface GlobalApiErrorEvent {
  id: string;
  error: ApiError | Error;
  queryKey?: readonly unknown[];
  actionType: 'query' | 'mutation';
  timestamp: string;
}

type ErrorListener = (event: GlobalApiErrorEvent) => void;

class QueryNotificationBus {
  private listeners: Set<ErrorListener> = new Set();

  public subscribe(listener: ErrorListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public broadcast(event: GlobalApiErrorEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('[QueryNotificationBus] Error in listener:', err);
      }
    }
  }
}

export const queryNotificationBus = new QueryNotificationBus();

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const apiError = error instanceof ApiError ? error : new ApiError(error.message, 'QUERY_ERROR');
      queryNotificationBus.broadcast({
        id: `err_q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        error: apiError,
        queryKey: query.queryKey,
        actionType: 'query',
        timestamp: new Date().toISOString(),
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      const apiError = error instanceof ApiError ? error : new ApiError(error.message, 'MUTATION_ERROR');
      queryNotificationBus.broadcast({
        id: `err_m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        error: apiError,
        queryKey: mutation.options.mutationKey,
        actionType: 'mutation',
        timestamp: new Date().toISOString(),
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds fresh cache
      gcTime: 5 * 60 * 1000, // 5 minutes cache retention
      retry: (failureCount, error) => {
        // Do not retry client 4xx errors
        if (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
});
