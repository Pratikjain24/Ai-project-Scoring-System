import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api, ApiService, ApiError } from '../services/api';
import { ApiErrorAlert } from '../components/ui/ApiErrorAlert';
import { useProjectsQuery, useEvaluationQuery, queryKeys } from '../hooks/useQueries';

describe('Data Fetching & Resilient API Architecture', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('ApiService Request Layer & Error Handling', () => {
    it('successfully fetches and deserializes JSON response from endpoints', async () => {
      const mockData = { id: 'eval_123', overallScore: 88.5 };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: mockData }),
      });

      const result = await api.getEvaluationById('eval_123');
      expect(result).toEqual(mockData);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/evaluations/eval_123',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('injects Authorization bearer token from localStorage', async () => {
      localStorage.setItem('auth_token', 'jwt_test_token_999');
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { ok: true } }),
      });

      await api.getMe();
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/auth/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer jwt_test_token_999',
          }),
        })
      );
    });

    it('throws structured ApiError when backend returns HTTP 404', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Project not found' },
        }),
      });

      await expect(api.getProjectById('missing-project-id')).rejects.toThrow(ApiError);

      try {
        await api.getProjectById('missing-project-id');
      } catch (err: any) {
        expect(err).toBeInstanceOf(ApiError);
        expect(err.code).toBe('NOT_FOUND');
        expect(err.status).toBe(404);
        expect(err.message).toBe('Project not found');
        expect(err.endpoint).toBe('/projects/missing-project-id');
      }
    });

    it('throws structured ApiError when backend returns HTTP 500 server error', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          success: false,
          error: { code: 'INTERNAL_ERROR', message: 'Database connection failed' },
        }),
      });

      await expect(api.getMasterScore('eval_test')).rejects.toThrow(ApiError);

      try {
        await api.getMasterScore('eval_test');
      } catch (err: any) {
        expect(err).toBeInstanceOf(ApiError);
        expect(err.status).toBe(500);
        expect(err.code).toBe('INTERNAL_ERROR');
      }
    });

    it('throws BACKEND_OFFLINE ApiError on network partition or unreachable server', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      try {
        await api.getHealth();
        expect.unreachable('Should have thrown ApiError');
      } catch (err: any) {
        expect(err).toBeInstanceOf(ApiError);
        expect(err.code).toBe('BACKEND_OFFLINE');
        expect(err.status).toBe(0);
        expect(err.message).toContain('Failed to fetch');
      }
    });

    it('notifies status listeners when backend connectivity toggles', async () => {
      const listener = vi.fn();
      const unsubscribe = api.subscribe(listener);

      // Successful request
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { status: 'healthy' } }),
      });
      await api.getHealth();
      expect(listener).toHaveBeenCalledWith(true, undefined);

      // Network failure request
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));
      try {
        await api.getHealth();
      } catch {
        // Expected
      }

      expect(listener).toHaveBeenCalledWith(
        false,
        expect.objectContaining({ code: 'BACKEND_OFFLINE' })
      );

      unsubscribe();
    });

    it('strictly forbids mock data fallbacks in production environment', async () => {
      const customApi = new ApiService();
      vi.spyOn(customApi, 'isMockFallbackAllowed').mockReturnValue(false);

      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Backend server is down'));

      // In production (isMockFallbackAllowed = false), getProjects MUST throw instead of returning MOCK_EVALUATIONS
      await expect(customApi.getProjects()).rejects.toThrow(ApiError);
      await expect(customApi.getProjectById('smart-road-vision')).rejects.toThrow(ApiError);
      await expect(customApi.getEvaluations()).rejects.toThrow(ApiError);
      await expect(customApi.getEvaluationById('smart-road-vision')).rejects.toThrow(ApiError);
    });
  });

  describe('React Query Hooks Integration', () => {
    function createTestQueryClient() {
      return new QueryClient({
        defaultOptions: {
          queries: {
            retry: false, // Turn off retries in fast unit tests
            gcTime: 0,
          },
        },
      });
    }

    it('fetches projects and caches result via useProjectsQuery', async () => {
      const queryClient = createTestQueryClient();
      const mockProjects = [{ id: 'proj_1', name: 'Smart AI Camera', type: 'Software' }];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: mockProjects }),
      });

      const TestComponent = () => {
        const { data, isLoading, isError } = useProjectsQuery();
        if (isLoading) return <div>Loading...</div>;
        if (isError) return <div>Error</div>;
        return (
          <ul>
            {data?.map((p: any) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText('Smart AI Camera')).toBeInTheDocument();
      });

      // Verify cached in QueryClient
      const cached = queryClient.getQueryData(queryKeys.projects);
      expect(cached).toEqual(mockProjects);
    });

    it('propagates error states correctly when evaluation query fails', async () => {
      const queryClient = createTestQueryClient();

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Evaluation eval_missing not found' },
        }),
      });

      const TestComponent = () => {
        const { isError, error } = useEvaluationQuery('eval_missing');
        if (isError) {
          return <div data-testid="error-msg">{(error as any)?.message}</div>;
        }
        return <div>Ready</div>;
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-msg')).toHaveTextContent(
          'Evaluation eval_missing not found'
        );
      });
    });
  });

  describe('ApiErrorAlert UI Component', () => {
    it('renders error information, endpoint, status code, and retry button', () => {
      const retrySpy = vi.fn();
      const error = new ApiError('Database query timeout', 'TIMEOUT', 504, null, '/api/projects');

      render(
        <ApiErrorAlert
          error={error}
          title="Data Synchronization Error"
          onRetry={retrySpy}
        />
      );

      expect(screen.getByText('Data Synchronization Error')).toBeInTheDocument();
      expect(screen.getByText('Database query timeout')).toBeInTheDocument();
      expect(screen.getByText('/api/projects')).toBeInTheDocument();
      expect(screen.getByText('HTTP 504')).toBeInTheDocument();
      expect(screen.getByText('TIMEOUT')).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /Retry Request/i });
      fireEvent.click(retryBtn);
      expect(retrySpy).toHaveBeenCalledTimes(1);
    });

    it('toggles diagnostic payload inspector', () => {
      const error = new ApiError(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        { field: 'title', reason: 'Too short' },
        '/api/projects'
      );

      render(<ApiErrorAlert error={error} />);

      expect(screen.queryByText(/Too short/)).not.toBeInTheDocument();

      const toggleBtn = screen.getByText('Show Diagnostics');
      fireEvent.click(toggleBtn);

      expect(screen.getByText(/Too short/)).toBeInTheDocument();
      expect(screen.getByText('Hide Diagnostics')).toBeInTheDocument();
    });

    it('renders banner variant correctly with dismissal', () => {
      const dismissSpy = vi.fn();
      const error = new ApiError('Backend disconnected', 'BACKEND_OFFLINE', 0);

      render(
        <ApiErrorAlert
          error={error}
          variant="banner"
          onDismiss={dismissSpy}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Backend disconnected')).toBeInTheDocument();

      const dismissBtn = screen.getByRole('button', { name: /Dismiss alert/i });
      fireEvent.click(dismissBtn);
      expect(dismissSpy).toHaveBeenCalledTimes(1);
    });
  });
});
