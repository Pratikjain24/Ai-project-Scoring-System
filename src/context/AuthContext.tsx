import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { AuthModal } from '../components/auth/AuthModal';

export type UserRole = 'STUDENT' | 'JUROR' | 'LEAD_REVIEWER' | 'ADMIN';

export interface UserPersona {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  email: string;
  title: string;
  organization: string;
  avatarInitials: string;
  badgeColor: string;
  canCalibrate: boolean;
  canFinalize: boolean;
  canManageAdmin: boolean;
}

export const INSTITUTIONAL_PERSONAS: UserPersona[] = [
  {
    id: 'usr_chair_evelyn',
    name: 'Dr. Evelyn Reed',
    role: 'LEAD_REVIEWER',
    roleLabel: 'Jury Chair & Lead Reviewer',
    email: 'e.reed@mit.edu',
    title: 'Professor of Autonomous Systems & Jury Chair',
    organization: 'MIT / Civic Tech Review Board',
    avatarInitials: 'ER',
    badgeColor: 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300',
    canCalibrate: true,
    canFinalize: true,
    canManageAdmin: true,
  },
  {
    id: 'usr_juror_marcus',
    name: 'Marcus Vance',
    role: 'JUROR',
    roleLabel: 'Specialist Juror',
    email: 'm.vance@stanford.edu',
    title: 'Senior Fellow, Embedded AI Systems',
    organization: 'Stanford Robotics Center',
    avatarInitials: 'MV',
    badgeColor: 'border-violet-500/40 bg-violet-950/60 text-violet-300',
    canCalibrate: true,
    canFinalize: false,
    canManageAdmin: false,
  },
  {
    id: 'usr_student_alex',
    name: 'Alex Chen',
    role: 'STUDENT',
    roleLabel: 'Student Project Owner',
    email: 'alex.chen@mit.edu',
    title: 'Master’s Candidate & Project Lead',
    organization: 'VisionGrid Labs (MIT cohort)',
    avatarInitials: 'AC',
    badgeColor: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300',
    canCalibrate: false,
    canFinalize: false,
    canManageAdmin: false,
  },
  {
    id: 'usr_admin_system',
    name: 'DevOps Admin',
    role: 'ADMIN',
    roleLabel: 'System Administrator',
    email: 'admin@projectxray.ai',
    title: 'Platform Infrastructure Lead',
    organization: 'ProjectX-Ray AI Engineering',
    avatarInitials: 'DA',
    badgeColor: 'border-amber-500/40 bg-amber-950/60 text-amber-300',
    canCalibrate: true,
    canFinalize: true,
    canManageAdmin: true,
  },
];

function derivePersonaFromUser(user: any): UserPersona {
  const matching = INSTITUTIONAL_PERSONAS.find(
    p => p.id === user.id || p.email.toLowerCase() === user.email?.toLowerCase()
  );
  if (matching) return matching;

  const role: UserRole = user.role || 'STUDENT';
  const name: string = user.name || 'Project Evaluator';
  const initials = name
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'PE';

  return {
    id: user.id || `usr_${Date.now()}`,
    name,
    role,
    roleLabel:
      role === 'LEAD_REVIEWER'
        ? 'Jury Chair & Lead Reviewer'
        : role === 'JUROR'
        ? 'Specialist Juror'
        : role === 'ADMIN'
        ? 'System Administrator'
        : 'Student Project Lead',
    email: user.email || 'evaluator@projectxray.ai',
    title: user.title || 'Independent Evaluator',
    organization: user.organization || 'Institutional Cohort',
    avatarInitials: initials,
    badgeColor:
      role === 'LEAD_REVIEWER'
        ? 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300'
        : role === 'JUROR'
        ? 'border-violet-500/40 bg-violet-950/60 text-violet-300'
        : role === 'ADMIN'
        ? 'border-amber-500/40 bg-amber-950/60 text-amber-300'
        : 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300',
    canCalibrate: role === 'LEAD_REVIEWER' || role === 'JUROR' || role === 'ADMIN',
    canFinalize: role === 'LEAD_REVIEWER' || role === 'ADMIN',
    canManageAdmin: role === 'ADMIN' || role === 'LEAD_REVIEWER',
  };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  role?: UserRole;
  organization?: string;
  title?: string;
}

interface AuthContextType {
  currentUser: UserPersona;
  allPersonas: UserPersona[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isJudge: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'LOGIN' | 'REGISTER';
  openAuthModal: (mode?: 'LOGIN' | 'REGISTER') => void;
  closeAuthModal: () => void;
  switchPersona: (personaId: string) => Promise<void>;
  loginWithPersona: (personaId: string) => Promise<void>;
  loginWithCredentials: (email: string, password?: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserPersona>(() => {
    const savedUserJson = localStorage.getItem('auth_user');
    if (savedUserJson) {
      try {
        return JSON.parse(savedUserJson);
      } catch {
        // Ignored
      }
    }
    const savedId = localStorage.getItem('auth_persona_id');
    const matched = INSTITUTIONAL_PERSONAS.find(p => p.id === savedId);
    return matched || INSTITUTIONAL_PERSONAS[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('auth_token'));
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const refreshTimerRef = useRef<any>(null);

  const openAuthModal = useCallback((mode: 'LOGIN' | 'REGISTER' = 'LOGIN') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Update localStorage when currentUser changes
  useEffect(() => {
    localStorage.setItem('auth_user', JSON.stringify(currentUser));
    localStorage.setItem('auth_persona_id', currentUser.id);
    localStorage.setItem('auth_role', currentUser.role);
  }, [currentUser]);

  // Silent Token Refresh routine
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const res = await api.refreshToken();
      if (res?.token) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Setup periodic silent token refresh (every 30 minutes)
  useEffect(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    // Refresh token silently every 30 minutes
    refreshTimerRef.current = setInterval(() => {
      if (localStorage.getItem('auth_token') || localStorage.getItem('auth_refresh_token')) {
        refreshToken();
      }
    }, 30 * 60 * 1000);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [refreshToken]);

  // Auto-bootstrap active persona session on initial browser startup
  useEffect(() => {
    const isTest = typeof (globalThis as any).vi !== 'undefined' || (import.meta as any).env?.MODE === 'test';
    if (isTest) return;

    const token = localStorage.getItem('auth_token');
    const isLoggedOut = localStorage.getItem('auth_logged_out') === 'true';
    if (!isLoggedOut && (!token || token === 'usr_lead_evaluator_jwt' || !token.includes('.'))) {
      const persona = currentUser || INSTITUTIONAL_PERSONAS[0];
      api.login({ personaId: persona.id, email: persona.email })
        .then((res) => {
          if (res?.token) {
            setIsAuthenticated(true);
          }
        })
        .catch(() => {
          // Ignore startup network delay
        });
    }
  }, [currentUser]);

  // Persona quick switch & login
  const switchPersona = useCallback(async (personaId: string) => {
    const nextPersona = INSTITUTIONAL_PERSONAS.find(p => p.id === personaId);
    if (!nextPersona) return;

    localStorage.removeItem('auth_logged_out');
    setIsLoading(true);
    try {
      const res = await api.login({ personaId: nextPersona.id, email: nextPersona.email });
      if (res?.token) {
        setIsAuthenticated(true);
      }
      setCurrentUser(nextPersona);
    } catch (err: any) {
      console.warn('[AuthContext] Persona switch token sync error:', err?.message);
      // Still allow client-side persona switch for testing/mocking
      setCurrentUser(nextPersona);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithPersona = switchPersona;

  // Credential login
  const loginWithCredentials = useCallback(async (email: string, password?: string) => {
    localStorage.removeItem('auth_logged_out');
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res?.token) {
        setIsAuthenticated(true);
      }
      if (res?.user) {
        const derived = derivePersonaFromUser(res.user);
        setCurrentUser(derived);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // User registration
  const register = useCallback(async (payload: RegisterPayload) => {
    localStorage.removeItem('auth_logged_out');
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      if (res?.token) {
        setIsAuthenticated(true);
      }
      if (res?.user) {
        const derived = derivePersonaFromUser(res.user);
        setCurrentUser(derived);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } finally {
      setIsAuthenticated(false);
      localStorage.setItem('auth_logged_out', 'true');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_refresh_token');
      // Reset to default guest/student persona
      setCurrentUser(INSTITUTIONAL_PERSONAS[2]); // Student persona
      setIsLoading(false);
    }
  }, []);

  const isJudge = currentUser.role === 'LEAD_REVIEWER' || currentUser.role === 'JUROR' || currentUser.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allPersonas: INSTITUTIONAL_PERSONAS,
        isAuthenticated,
        isLoading,
        isJudge,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        switchPersona,
        loginWithPersona,
        loginWithCredentials,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
