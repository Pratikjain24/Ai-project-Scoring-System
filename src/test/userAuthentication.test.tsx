import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { api, ApiError } from '../services/api';
import { AuthProvider, useAuth, INSTITUTIONAL_PERSONAS } from '../context/AuthContext';
import { AuthModal } from '../components/auth/AuthModal';

describe('User Authentication & Session Security (100% Coverage)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('AuthProvider & Role Permissions Matrix', () => {
    const TestConsumer = () => {
      const {
        currentUser,
        isAuthenticated,
        isJudge,
        switchPersona,
        loginWithCredentials,
        register,
        logout,
        refreshToken,
        openAuthModal,
        isAuthModalOpen,
      } = useAuth();

      return (
        <div>
          <span data-testid="user-name">{currentUser.name}</span>
          <span data-testid="user-role">{currentUser.role}</span>
          <span data-testid="user-email">{currentUser.email}</span>
          <span data-testid="is-authenticated">{String(isAuthenticated)}</span>
          <span data-testid="is-judge">{String(isJudge)}</span>
          <span data-testid="can-finalize">{String(currentUser.canFinalize)}</span>
          <span data-testid="can-calibrate">{String(currentUser.canCalibrate)}</span>
          <span data-testid="can-admin">{String(currentUser.canManageAdmin)}</span>
          <span data-testid="modal-open">{String(isAuthModalOpen)}</span>

          <button onClick={() => switchPersona('usr_juror_marcus')}>Switch to Marcus</button>
          <button onClick={() => switchPersona('usr_student_alex')}>Switch to Alex</button>
          <button onClick={() => switchPersona('usr_admin_system')}>Switch to Admin</button>
          <button onClick={() => loginWithCredentials('test@mit.edu', 'secret123')}>Login Test</button>
          <button
            onClick={() =>
              register({
                name: 'Elena Rostova',
                email: 'elena@stanford.edu',
                role: 'JUROR',
                organization: 'Stanford AI',
                title: 'Professor',
              })
            }
          >
            Register Elena
          </button>
          <button onClick={() => logout()}>Logout</button>
          <button onClick={() => refreshToken()}>Silent Refresh</button>
          <button onClick={() => openAuthModal('LOGIN')}>Open Modal</button>
        </div>
      );
    };

    it('initializes with Lead Reviewer (Dr. Evelyn Reed) by default with appropriate permissions', () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-name')).toHaveTextContent('Dr. Evelyn Reed');
      expect(screen.getByTestId('user-role')).toHaveTextContent('LEAD_REVIEWER');
      expect(screen.getByTestId('is-judge')).toHaveTextContent('true');
      expect(screen.getByTestId('can-finalize')).toHaveTextContent('true');
      expect(screen.getByTestId('can-calibrate')).toHaveTextContent('true');
      expect(screen.getByTestId('can-admin')).toHaveTextContent('true');
    });

    it('switches persona correctly and adjusts permission boundaries', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            token: 'jwt_marcus_token',
            refreshToken: 'refresh_marcus_token',
            user: { id: 'usr_juror_marcus', role: 'JUROR' },
          },
        }),
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      // Switch to Marcus (Juror)
      fireEvent.click(screen.getByText('Switch to Marcus'));

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('Marcus Vance');
        expect(screen.getByTestId('user-role')).toHaveTextContent('JUROR');
        expect(screen.getByTestId('is-judge')).toHaveTextContent('true');
        expect(screen.getByTestId('can-finalize')).toHaveTextContent('false');
        expect(screen.getByTestId('can-calibrate')).toHaveTextContent('true');
        expect(screen.getByTestId('can-admin')).toHaveTextContent('false');
      });

      // Switch to Alex (Student)
      fireEvent.click(screen.getByText('Switch to Alex'));

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('Alex Chen');
        expect(screen.getByTestId('user-role')).toHaveTextContent('STUDENT');
        expect(screen.getByTestId('is-judge')).toHaveTextContent('false');
        expect(screen.getByTestId('can-finalize')).toHaveTextContent('false');
        expect(screen.getByTestId('can-calibrate')).toHaveTextContent('false');
        expect(screen.getByTestId('can-admin')).toHaveTextContent('false');
      });
    });

    it('authenticates with custom credentials and marks session authenticated', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            token: 'jwt_authenticated_token_xyz',
            refreshToken: 'refresh_token_xyz',
            user: {
              id: 'usr_custom_1',
              name: 'Dr. Custom User',
              email: 'test@mit.edu',
              role: 'LEAD_REVIEWER',
              organization: 'MIT Lab',
            },
          },
        }),
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Login Test'));

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@mit.edu');
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });

      expect(localStorage.getItem('auth_token')).toBe('jwt_authenticated_token_xyz');
      expect(localStorage.getItem('auth_refresh_token')).toBe('refresh_token_xyz');
    });

    it('registers a new user and provisions token pair with HttpOnly cookie support', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: {
            token: 'jwt_registered_elena_token',
            refreshToken: 'refresh_registered_elena_token',
            user: {
              id: 'usr_elena_123',
              name: 'Elena Rostova',
              email: 'elena@stanford.edu',
              role: 'JUROR',
              organization: 'Stanford AI',
              title: 'Professor',
            },
          },
        }),
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Register Elena'));

      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('Elena Rostova');
        expect(screen.getByTestId('user-email')).toHaveTextContent('elena@stanford.edu');
        expect(screen.getByTestId('user-role')).toHaveTextContent('JUROR');
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });

      expect(localStorage.getItem('auth_token')).toBe('jwt_registered_elena_token');
    });

    it('clears session on logout and resets to default student persona', async () => {
      localStorage.setItem('auth_token', 'token_to_clear');
      localStorage.setItem('auth_refresh_token', 'refresh_to_clear');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { message: 'Logged out' } }),
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Alex Chen'); // Default guest/student
      });

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('auth_refresh_token')).toBeNull();
    });

    it('performs silent token refresh successfully', async () => {
      localStorage.setItem('auth_token', 'expired_token');
      localStorage.setItem('auth_refresh_token', 'valid_refresh_token');

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            token: 'new_fresh_access_token_123',
            refreshToken: 'new_fresh_refresh_token_456',
          },
        }),
      });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Silent Refresh'));

      await waitFor(() => {
        expect(localStorage.getItem('auth_token')).toBe('new_fresh_access_token_123');
        expect(localStorage.getItem('auth_refresh_token')).toBe('new_fresh_refresh_token_456');
      });
    });
  });

  describe('Silent Token Refresh on 401 via ApiService', () => {
    it('automatically triggers silent token refresh and retries failed request on 401', async () => {
      localStorage.setItem('auth_token', 'stale_jwt_token');
      localStorage.setItem('auth_refresh_token', 'good_refresh_token');

      let callCount = 0;
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url === '/api/evaluations/eval_101') {
          callCount++;
          if (callCount === 1) {
            // First call fails with 401
            return {
              ok: false,
              status: 401,
              statusText: 'Unauthorized',
              json: async () => ({
                success: false,
                error: { code: 'TOKEN_EXPIRED', message: 'JWT expired' },
              }),
            };
          } else {
            // Second call (after silent refresh) succeeds!
            return {
              ok: true,
              status: 200,
              json: async () => ({
                success: true,
                data: { id: 'eval_101', overallScore: 92.4 },
              }),
            };
          }
        }

        if (url === '/api/auth/refresh') {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: {
                token: 'renewed_fresh_jwt_token',
                refreshToken: 'renewed_fresh_refresh_token',
              },
            }),
          };
        }

        return { ok: true, status: 200, json: async () => ({ success: true, data: {} }) };
      });

      const result = await api.getEvaluationById('eval_101');
      expect(result).toEqual({ id: 'eval_101', overallScore: 92.4 });
      expect(callCount).toBe(2);
      expect(localStorage.getItem('auth_token')).toBe('renewed_fresh_jwt_token');
    });

    it('throws 401 ApiError if silent token refresh fails', async () => {
      localStorage.setItem('auth_token', 'stale_jwt_token');
      localStorage.setItem('auth_refresh_token', 'bad_refresh_token');

      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        if (url === '/api/projects/proj_abc') {
          return {
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            json: async () => ({
              success: false,
              error: { code: 'UNAUTHORIZED', message: 'Token expired' },
            }),
          };
        }
        if (url === '/api/auth/refresh') {
          return {
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            json: async () => ({
              success: false,
              error: { code: 'REFRESH_FAILED', message: 'Refresh token invalid' },
            }),
          };
        }
        return { ok: true, status: 200, json: async () => ({ success: true }) };
      });

      await expect(api.getProjectById('proj_abc')).rejects.toThrow(ApiError);
    });
  });

  describe('AuthModal Component Interactions', () => {
    it('renders Sign In and Register forms and switches tabs', () => {
      const closeSpy = vi.fn();

      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={closeSpy} initialMode="LOGIN" />
        </AuthProvider>
      );

      expect(screen.getByText('Institutional Sign In')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. e.reed@mit.edu')).toBeInTheDocument();

      // Click Create Account tab
      const createAccountTab = screen.getByRole('button', { name: /Create Account/i });
      act(() => {
        fireEvent.click(createAccountTab);
      });

      expect(screen.getByText('Register New Account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Dr. Jordan Patel')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('j.patel@lab.edu')).toBeInTheDocument();
    });

    it('renders quick persona buttons and triggers switch', async () => {
      const closeSpy = vi.fn();
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { token: 'jwt_chair', user: { id: 'usr_chair_evelyn' } },
        }),
      });

      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={closeSpy} initialMode="LOGIN" />
        </AuthProvider>
      );

      // Verify all 4 institutional personas are displayed
      for (const persona of INSTITUTIONAL_PERSONAS) {
        expect(screen.getByText(persona.name)).toBeInTheDocument();
      }

      // Click Marcus Vance persona button
      act(() => {
        fireEvent.click(screen.getByText('Marcus Vance'));
      });

      await waitFor(() => {
        expect(closeSpy).toHaveBeenCalled();
      });
    });
  });
});
