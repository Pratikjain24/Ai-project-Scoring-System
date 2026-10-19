// ====================================================
// PROJECTX-RAY AI - AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// Strict Zero-Trust Architecture: Every protected route requires
// a cryptographically verified RS256/HS256 JWT checked against
// the active Redis/SQLite Token Blacklist.
// Zero developer bypasses permitted in any environment.
// ====================================================

import type { Request, Response, NextFunction } from 'express';
import { TokenError, verifyToken } from '../services/tokenService';
import { TokenBlacklistService } from '../services/tokenBlacklistService';
import type { AuthContext, UserRole } from '../models/integration';

// Extend Express Request interface to include auth context
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

function unauthorized(res: Response, message: string, code: string = 'UNAUTHORIZED'): void {
  res.status(401).json({
    success: false,
    error: { code, message },
  });
}

/**
 * Authentication middleware.
 *
 * Strict Zero-Trust Security Boundary: Fails closed in EVERY environment.
 * A missing, malformed, expired, revoked, or incorrectly signed token is
 * always rejected with HTTP 401. Dev bypasses are strictly prohibited.
 * Roles are derived exclusively from cryptographically verified claims.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization ?? '';
  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice('Bearer '.length).trim();
  } else if (typeof req.query.token === 'string' && req.query.token.trim()) {
    token = req.query.token.trim();
  }

  if (!token) {
    unauthorized(res, 'Authentication required. Provide a valid Bearer token in the Authorization header or token query parameter.');
    return;
  }

  try {
    const claims = verifyToken(token);

    // Verify token against Redis / SQLite Token Blacklist
    const isRevoked = await TokenBlacklistService.isTokenRevoked(claims.jti, claims.sub, claims.iat);
    if (isRevoked) {
      unauthorized(res, 'Token has been revoked. Please sign in again.', 'TOKEN_REVOKED');
      return;
    }

    req.auth = {
      userId: claims.sub,
      role: claims.role,
      email: claims.email,
      organizationId: claims.org,
    };
    return next();
  } catch (err: any) {
    const reason = err instanceof TokenError ? err.reason : 'INVALID_SIGNATURE';
    const message =
      reason === 'TOKEN_EXPIRED'
        ? 'Session token has expired. Please sign in again.'
        : 'Invalid authentication token.';
    unauthorized(res, message, reason);
    return;
  }
}

/**
 * Role-Based Access Control (RBAC) middleware.
 * Enforces that the authenticated user holds one of the required roles.
 * Requires `authenticate` to have run first.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      unauthorized(res, 'Authentication required before accessing this protected resource.');
      return;
    }

    // ADMIN is a superset role and always retains full access.
    if (req.auth.role === 'ADMIN' || roles.includes(req.auth.role)) {
      return next();
    }

    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: `Access denied. Requires one of roles: ${roles.join(', ')}. Current role: ${req.auth.role}.`,
      },
    });
  };
}
