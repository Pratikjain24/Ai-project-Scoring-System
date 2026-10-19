// ====================================================
// PROJECTX-RAY AI - AUTH & SECURITY TEST SUITE
// Scenario 14: Asymmetric RS256 JWT, Zero-Trust (Dev Bypass Removal),
// and Redis/SQLite Token Blacklist Revocation Architecture
// ====================================================

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import express, { type Request, type Response } from 'express';
import { 
  signToken, 
  verifyToken, 
  issueTokenPair, 
  refreshAccessToken, 
  getPublicKeyPem, 
  getPrivateKeyPem, 
  resetRsaKeys, 
  loadOrGenerateRsaKeys,
  TokenError 
} from '../services/tokenService';
import { TokenBlacklistService } from '../services/tokenBlacklistService';
import { authenticate, requireRole } from '../middleware/auth';
import { authRouter } from '../routes/authRoutes';
import { ENV } from '../config/env';
import { generateKeyPairSync } from 'node:crypto';

describe('Phase 14: Auth & Security Hardening (RS256, Zero-Trust, Redis Blacklist)', () => {
  beforeEach(() => {
    TokenBlacklistService.clearMemory();
  });

  it('1. Asymmetric Cryptography: generates and exports 2048-bit RSA SPKI/PKCS8 PEM keypair', () => {
    const keys = loadOrGenerateRsaKeys();
    assert.ok(keys.publicKey.includes('BEGIN PUBLIC KEY'), 'Public key must be in SPKI PEM format');
    assert.ok(keys.privateKey.includes('BEGIN PRIVATE KEY'), 'Private key must be in PKCS8 PEM format');
    assert.strictEqual(getPublicKeyPem(), keys.publicKey);
    assert.strictEqual(getPrivateKeyPem(), keys.privateKey);
  });

  it('2. RS256 JWT Signing & Verification: issues valid RS256 token and verifies cryptographic signature', () => {
    const subject = {
      userId: 'usr_architect_marcus',
      role: 'JUROR' as const,
      email: 'm.vance@stanford.edu',
      organizationId: 'Stanford Robotics Center'
    };

    const token = signToken(subject);
    const parts = token.split('.');
    assert.strictEqual(parts.length, 3, 'JWT must have 3 segments');

    // Decode header
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    assert.strictEqual(header.alg, 'RS256', 'Default signing algorithm must be asymmetric RS256');
    assert.strictEqual(header.typ, 'JWT');

    // Verify token with public key
    const claims = verifyToken(token);
    assert.strictEqual(claims.sub, subject.userId);
    assert.strictEqual(claims.role, 'JUROR');
    assert.strictEqual(claims.email, subject.email);
    assert.strictEqual(claims.org, subject.organizationId);
    assert.strictEqual(claims.iss, 'projectxray.ai');
    assert.strictEqual(claims.aud, 'projectxray.api');
    assert.ok(claims.exp > claims.iat);
    assert.ok(typeof claims.jti === 'string' && claims.jti.length > 0);
  });

  it('3. Cryptographic Tamper Defense: rejects modified payload and mismatched public keys', () => {
    const token = signToken({
      userId: 'usr_student_alex',
      role: 'STUDENT',
      email: 'alex.chen@mit.edu'
    });

    const parts = token.split('.');
    // Tamper with role: escalate to ADMIN
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    payload.role = 'ADMIN';
    const tamperedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    assert.throws(
      () => verifyToken(tamperedToken),
      (err: any) => err instanceof TokenError && err.reason === 'INVALID_SIGNATURE',
      'Tampered payload must fail signature verification'
    );

    // Verify against a different generated public key
    const foreignKeyPair = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    assert.throws(
      () => verifyToken(token, foreignKeyPair.publicKey),
      (err: any) => err instanceof TokenError && err.reason === 'INVALID_SIGNATURE',
      'Token verified against a foreign public key must fail signature verification'
    );
  });

  it('4. Backward Compatibility & Algorithm Confusion Defense: verifies legacy HS256 and rejects alg: none', () => {
    // 1. Valid HS256 token
    const hsToken = signToken(
      { userId: 'usr_legacy', role: 'STUDENT', email: 'legacy@projectxray.ai' },
      ENV.JWT_SECRET,
      3600,
      undefined,
      'HS256'
    );
    const hsParts = hsToken.split('.');
    const hsHeader = JSON.parse(Buffer.from(hsParts[0], 'base64url').toString('utf8'));
    assert.strictEqual(hsHeader.alg, 'HS256');

    const verifiedHs = verifyToken(hsToken, ENV.JWT_SECRET);
    assert.strictEqual(verifiedHs.sub, 'usr_legacy');

    // 2. Reject alg: none attack
    const noneHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const nonePayload = Buffer.from(JSON.stringify({ sub: 'admin', role: 'ADMIN', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    const noneToken = `${noneHeader}.${nonePayload}.`;

    assert.throws(
      () => verifyToken(noneToken),
      (err: any) => err instanceof TokenError && err.reason === 'UNSUPPORTED_ALGORITHM',
      'Algorithm none exploit must be rejected with UNSUPPORTED_ALGORITHM'
    );
  });

  it('5. Zero-Trust Enforcement: requests without a token are unconditionally rejected with 401 (Dev Bypass Removed)', async () => {
    const app = express();
    app.use(express.json());
    app.get('/api/test-protected', authenticate, (req: Request, res: Response) => {
      res.json({ success: true, user: req.auth });
    });

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;

    try {
      // 1. Request with no auth header
      const resNoAuth = await fetch(`http://127.0.0.1:${port}/api/test-protected`);
      assert.strictEqual(resNoAuth.status, 401, 'Request with missing token must return 401');
      const bodyNoAuth = await resNoAuth.json();
      assert.strictEqual(bodyNoAuth.error.code, 'UNAUTHORIZED');

      // 2. Request with malformed Bearer
      const resBad = await fetch(`http://127.0.0.1:${port}/api/test-protected`, {
        headers: { Authorization: 'Bearer not-a-valid-token' }
      });
      assert.strictEqual(resBad.status, 401);

      // 3. Request with valid RS256 token succeeds
      const validToken = signToken({ userId: 'usr_valid', role: 'STUDENT', email: 'valid@mit.edu' });
      const resValid = await fetch(`http://127.0.0.1:${port}/api/test-protected`, {
        headers: { Authorization: `Bearer ${validToken}` }
      });
      assert.strictEqual(resValid.status, 200);
      const bodyValid = await resValid.json();
      assert.strictEqual(bodyValid.success, true);
      assert.strictEqual(bodyValid.user.userId, 'usr_valid');
    } finally {
      await new Promise<void>((resolve) => server.close(resolve));
    }
  });

  it('6. Token Revocation List: revoking token by JTI immediately blocks subsequent authenticated access', async () => {
    const app = express();
    app.use(express.json());
    app.get('/api/sensitive', authenticate, (req: Request, res: Response) => {
      res.json({ success: true, data: 'classified' });
    });

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;

    try {
      const token = signToken({ userId: 'usr_revokable', role: 'JUROR', email: 'juror@projectxray.ai' });
      const claims = verifyToken(token);

      // Verify token initially succeeds
      const resInitial = await fetch(`http://127.0.0.1:${port}/api/sensitive`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      assert.strictEqual(resInitial.status, 200);

      // Revoke the token by JTI
      const revokeRes = await TokenBlacklistService.revokeToken(claims.jti, 'SUSPICIOUS_ACTIVITY', claims.exp);
      assert.strictEqual(revokeRes.success, true);

      // Check blacklist service directly
      const isRevoked = await TokenBlacklistService.isTokenRevoked(claims.jti);
      assert.strictEqual(isRevoked, true, 'Token must be reported as revoked');

      // Subsequent request with the same token must be rejected with 401 TOKEN_REVOKED
      const resAfter = await fetch(`http://127.0.0.1:${port}/api/sensitive`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      assert.strictEqual(resAfter.status, 401, 'Revoked token must be rejected with 401');
      const bodyAfter = await resAfter.json();
      assert.strictEqual(bodyAfter.error.code, 'TOKEN_REVOKED');
      assert.ok(bodyAfter.error.message.includes('revoked'));
    } finally {
      await new Promise<void>((resolve) => server.close(resolve));
    }
  });

  it('7. User Session Revocation: revoking all user sessions invalidates all tokens issued prior to timestamp', async () => {
    const userId = 'usr_compromised_account';
    
    // Token issued at T - 10 seconds
    const issuedAt = Math.floor(Date.now() / 1000) - 10;
    const token = signToken(
      { userId, role: 'STUDENT', email: 'student@mit.edu' },
      undefined,
      3600,
      issuedAt
    );
    const claims = verifyToken(token);

    // Initial check: not revoked
    assert.strictEqual(await TokenBlacklistService.isTokenRevoked(claims.jti, userId, claims.iat), false);

    // Revoke all sessions for this user
    await TokenBlacklistService.revokeAllUserSessions(userId, 'PASSWORD_RESET');

    // Check: token issued before revocation is now revoked
    const revoked = await TokenBlacklistService.isTokenRevoked(claims.jti, userId, claims.iat);
    assert.strictEqual(revoked, true, 'Token issued prior to user revocation must be rejected');

    // Token issued after revocation should be valid
    const newToken = signToken(
      { userId, role: 'STUDENT', email: 'student@mit.edu' },
      undefined,
      3600,
      Math.floor(Date.now() / 1000) + 5
    );
    const newClaims = verifyToken(newToken);
    const newRevoked = await TokenBlacklistService.isTokenRevoked(newClaims.jti, userId, newClaims.iat);
    assert.strictEqual(newRevoked, false, 'Fresh token issued after revocation must be accepted');
  });

  it('8. Dual-Mode Fallback & Blacklist Diagnostics: reports telemetry and active storage mode', async () => {
    const stats = await TokenBlacklistService.getBlacklistStats();
    assert.ok(typeof stats.connected === 'boolean');
    assert.ok(['REDIS_DISTRIBUTED', 'PERSISTENT_FALLBACK'].includes(stats.mode));
    assert.ok(typeof stats.totalRevokedTokens === 'number');
    assert.ok(typeof stats.activeRevokedUsers === 'number');
  });

  it('9. Auth Endpoints: /api/auth/logout revokes token and /api/auth/public-key provides SPKI key', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);

    const server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;

    try {
      // 1. Public Key Endpoint
      const resKey = await fetch(`http://127.0.0.1:${port}/api/auth/public-key`);
      assert.strictEqual(resKey.status, 200);
      const bodyKey = await resKey.json();
      assert.strictEqual(bodyKey.success, true);
      assert.strictEqual(bodyKey.data.algorithm, 'RS256');
      assert.ok(bodyKey.data.publicKey.includes('BEGIN PUBLIC KEY'));

      // 2. Login -> Logout flow
      const resLogin = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId: 'usr_student_alex' })
      });
      assert.strictEqual(resLogin.status, 200);
      const loginData = await resLogin.json();
      const accessToken = loginData.data.token;
      assert.strictEqual(loginData.data.algorithm, 'RS256');

      // Logout with Bearer token
      const resLogout = await fetch(`http://127.0.0.1:${port}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      assert.strictEqual(resLogout.status, 200);

      // Verify the access token was revoked
      const claims = verifyToken(accessToken);
      const isRevoked = await TokenBlacklistService.isTokenRevoked(claims.jti);
      assert.strictEqual(isRevoked, true, 'Logged out access token must be blacklisted');
    } finally {
      await new Promise<void>((resolve) => server.close(resolve));
    }
  });
});
