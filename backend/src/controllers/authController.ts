// ====================================================
// PROJECTX-RAY AI - AUTHENTICATION CONTROLLER
// Asymmetric RS256 JWT issuance, refresh, verification,
// public key distribution, and Redis token revocation.
// ====================================================

import type { Request, Response } from 'express';
import { ENV } from '../config/env';
import { 
  signToken, 
  issueTokenPair, 
  refreshAccessToken, 
  getPublicKeyPem, 
  TOKEN_ISSUER, 
  TOKEN_AUDIENCE 
} from '../services/tokenService';
import { TokenBlacklistService } from '../services/tokenBlacklistService';
import { AuthorizationService } from '../services/authorizationService';
import type { UserRole } from '../models/integration';

export interface PersonaDef {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  title: string;
  organization: string;
}

export const INSTITUTIONAL_PERSONAS_BACKEND: PersonaDef[] = [
  {
    id: 'usr_chair_evelyn',
    name: 'Dr. Evelyn Reed',
    role: 'LEAD_REVIEWER',
    email: 'e.reed@mit.edu',
    title: 'Professor of Autonomous Systems & Jury Chair',
    organization: 'MIT / Civic Tech Review Board',
  },
  {
    id: 'usr_juror_marcus',
    name: 'Marcus Vance',
    role: 'JUROR',
    email: 'm.vance@stanford.edu',
    title: 'Senior Fellow, Embedded AI Systems',
    organization: 'Stanford Robotics Center',
  },
  {
    id: 'usr_student_alex',
    name: 'Alex Chen',
    role: 'STUDENT',
    email: 'alex.chen@mit.edu',
    title: 'Master’s Candidate & Project Lead',
    organization: 'VisionGrid Labs (MIT cohort)',
  },
  {
    id: 'usr_admin_system',
    name: 'DevOps Admin',
    role: 'ADMIN',
    email: 'admin@projectxray.ai',
    title: 'Platform Infrastructure Lead',
    organization: 'ProjectX-Ray AI Engineering',
  },
];

function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join('='));
    }
  });
  return list;
}

export class AuthController {
  /**
   * Issue a signed RS256 JWT for a persona or user credentials,
   * setting an HttpOnly refresh cookie for secure persistent auth.
   */
  static login(req: Request, res: Response): void {
    const { email, personaId, role } = req.body || {};

    const targetPersona = INSTITUTIONAL_PERSONAS_BACKEND.find(
      p => p.id === personaId || (email && p.email.toLowerCase() === email.toLowerCase())
    );

    const subjectRole: UserRole = targetPersona ? targetPersona.role : (role || 'STUDENT');
    const subjectId: string = targetPersona ? targetPersona.id : `usr_${Date.now()}`;
    const subjectEmail: string = targetPersona ? targetPersona.email : (email || 'user@projectxray.ai');
    const subjectOrg: string = targetPersona ? targetPersona.organization : 'Academic Cohort';
    const subjectName: string = targetPersona ? targetPersona.name : 'Authorized User';

    try {
      const tokenPair = issueTokenPair({
        userId: subjectId,
        role: subjectRole,
        email: subjectEmail,
        organizationId: subjectOrg,
      });

      // Set HttpOnly refresh cookie
      res.cookie('refreshToken', tokenPair.refreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        data: {
          token: tokenPair.accessToken,
          refreshToken: tokenPair.refreshToken,
          tokenType: 'Bearer',
          algorithm: 'RS256',
          expiresIn: tokenPair.expiresIn,
          user: {
            id: subjectId,
            email: subjectEmail,
            role: subjectRole,
            organization: subjectOrg,
            name: subjectName,
          },
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'TOKEN_SIGN_FAILED', message: err?.message || 'Failed to sign authentication token' },
      });
    }
  }

  /**
   * Register a new user and return signed RS256 token pair + HttpOnly cookie
   */
  static register(req: Request, res: Response): void {
    const { name, email, role = 'STUDENT', organization = 'Academic Institution', title = 'Project Member' } = req.body || {};

    if (!name || !email) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_REGISTRATION', message: 'Name and email are required for registration.' },
      });
      return;
    }

    const subjectId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const subjectRole: UserRole = ['STUDENT', 'JUROR', 'LEAD_REVIEWER', 'ADMIN'].includes(role) ? role : 'STUDENT';

    try {
      const tokenPair = issueTokenPair({
        userId: subjectId,
        role: subjectRole,
        email,
        organizationId: organization,
      });

      // Set HttpOnly refresh cookie
      res.cookie('refreshToken', tokenPair.refreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        data: {
          token: tokenPair.accessToken,
          refreshToken: tokenPair.refreshToken,
          tokenType: 'Bearer',
          algorithm: 'RS256',
          expiresIn: tokenPair.expiresIn,
          user: {
            id: subjectId,
            name,
            email,
            role: subjectRole,
            organization,
            title,
          },
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'REGISTRATION_FAILED', message: err?.message || 'Failed to complete registration' },
      });
    }
  }

  /**
   * Renew expired access token using cryptographically signed refresh token
   */
  static refresh(req: Request, res: Response): void {
    const cookies = parseCookies(req.headers.cookie);
    const tokenToUse = req.body?.refreshToken || cookies.refreshToken;

    if (!tokenToUse || typeof tokenToUse !== 'string') {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_REFRESH_TOKEN', message: 'refreshToken is required via cookie or request body' },
      });
      return;
    }

    try {
      const refreshed = refreshAccessToken(tokenToUse);

      // Re-set HttpOnly refresh cookie with refreshed token
      res.cookie('refreshToken', refreshed.refreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        data: {
          token: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          tokenType: 'Bearer',
          algorithm: 'RS256',
          expiresIn: refreshed.expiresIn,
        },
      });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        error: { code: 'REFRESH_FAILED', message: err?.message || 'Invalid or expired refresh token' },
      });
    }
  }

  /**
   * Clear session and revoke token in Redis / SQLite blacklist
   */
  static async logout(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization ?? '';
    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice('Bearer '.length).trim();
    }
    const cookies = parseCookies(req.headers.cookie);
    const refreshToken = cookies.refreshToken;

    if (token) {
      try {
        await TokenBlacklistService.revokeToken(token, 'USER_LOGOUT');
      } catch {
        // Ignore revocation error if token already malformed
      }
    }

    if (refreshToken) {
      try {
        await TokenBlacklistService.revokeToken(refreshToken, 'USER_LOGOUT_REFRESH');
      } catch {
        // Ignore
      }
    }

    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully; session token revoked and cookie cleared.' },
    });
  }

  /**
   * Revoke a specific token or all user sessions
   */
  static async revoke(req: Request, res: Response): Promise<void> {
    const { token, jti, userId, reason = 'EXPLICIT_REVOCATION' } = req.body || {};

    try {
      if (userId) {
        // Non-admin can only revoke their own sessions
        if (req.auth?.role !== 'ADMIN' && req.auth?.userId !== userId) {
          res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'You can only revoke your own user sessions.' },
          });
          return;
        }

        const result = await TokenBlacklistService.revokeAllUserSessions(userId, reason);
        res.status(200).json({ success: true, data: result });
        return;
      }

      if (token || jti) {
        const result = await TokenBlacklistService.revokeToken(token || jti, reason);
        res.status(200).json({ success: true, data: result });
        return;
      }

      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Provide token, jti, or userId to revoke.' },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'REVOCATION_FAILED', message: err.message },
      });
    }
  }

  /**
   * Returns the SPKI PEM encoded RSA public key for verification by third parties or microservices
   */
  static getPublicKey(_req: Request, res: Response): void {
    res.status(200).json({
      success: true,
      data: {
        algorithm: 'RS256',
        publicKey: getPublicKeyPem(),
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
      },
    });
  }

  /**
   * Returns telemetry on the active token blacklist (Redis/SQLite)
   */
  static async getBlacklistStatus(_req: Request, res: Response): Promise<void> {
    const stats = await TokenBlacklistService.getBlacklistStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  }

  /**
   * Return pre-signed institutional personas for quick viva switching and testing
   */
  static getPersonas(_req: Request, res: Response): void {
    const personasWithTokens = INSTITUTIONAL_PERSONAS_BACKEND.map(p => {
      const token = signToken({
        userId: p.id,
        role: p.role,
        email: p.email,
        organizationId: p.organization,
      });
      return {
        ...p,
        token,
      };
    });

    res.status(200).json({
      success: true,
      data: personasWithTokens,
    });
  }

  /**
   * Inspect current token and permissions
   */
  static getMe(req: Request, res: Response): void {
    if (!req.auth) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'No authenticated context available' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: req.auth,
        permissions: {
          canFinalizeEvaluation: AuthorizationService.canFinalizeEvaluation(req.auth),
          canManageSystem: AuthorizationService.canManageSystem(req.auth),
        },
      },
    });
  }
}
