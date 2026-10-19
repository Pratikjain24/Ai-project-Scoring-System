// ====================================================
// PROJECTX-RAY AI - TOKEN & CREDENTIAL SERVICE
// Asymmetric RS256 JWT signing/verification with RSA keypair
// management, backwards-compatible HS256 fallback, and
// scrypt password hashing built on Node's native crypto module.
// ====================================================

import { 
  createHmac, 
  createSign, 
  createVerify, 
  generateKeyPairSync, 
  randomBytes, 
  randomUUID, 
  scryptSync, 
  timingSafeEqual 
} from 'node:crypto';
import { ENV } from '../config/env';
import type { UserRole } from '../models/integration';

export const TOKEN_ISSUER = 'projectxray.ai';
export const TOKEN_AUDIENCE = 'projectxray.api';
export const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60 * 12; // 12 hours
export const MIN_SECRET_LENGTH = 32;

export type TokenFailureReason =
  | 'SECRET_NOT_CONFIGURED'
  | 'MALFORMED_TOKEN'
  | 'UNSUPPORTED_ALGORITHM'
  | 'INVALID_SIGNATURE'
  | 'TOKEN_EXPIRED'
  | 'INVALID_ISSUER'
  | 'INVALID_AUDIENCE'
  | 'MISSING_CLAIMS';

export class TokenError extends Error {
  public readonly reason: TokenFailureReason;

  constructor(reason: TokenFailureReason, message?: string) {
    super(message ?? reason);
    this.name = 'TokenError';
    this.reason = reason;
  }
}

export interface TokenClaims {
  sub: string;
  role: UserRole;
  email: string;
  org?: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  jti: string;
}

export interface TokenSubject {
  userId: string;
  role: UserRole;
  email: string;
  organizationId?: string;
}

import fs from 'node:fs';
import path from 'node:path';

// ----------------------------------------------------
// Asymmetric RSA Key Management (RS256)
// ----------------------------------------------------

let activePrivateKeyPem: string | null = null;
let activePublicKeyPem: string | null = null;

export function loadOrGenerateRsaKeys(): { privateKey: string; publicKey: string } {
  if (activePrivateKeyPem && activePublicKeyPem) {
    return { privateKey: activePrivateKeyPem, publicKey: activePublicKeyPem };
  }

  // Check if configured via environment variables
  if (ENV.JWT_PRIVATE_KEY && ENV.JWT_PUBLIC_KEY) {
    activePrivateKeyPem = ENV.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
    activePublicKeyPem = ENV.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
    return { privateKey: activePrivateKeyPem, publicKey: activePublicKeyPem };
  }

  // Check if persisted on local disk (for dev server stability across restarts)
  const isTest = process.env.NODE_ENV === 'test' || process.argv.some(a => a.includes('--test') || a.includes('.test.ts'));
  const keysFilePath = path.resolve(process.cwd(), 'backend', '.jwt_keys.json');

  if (!isTest) {
    try {
      if (fs.existsSync(keysFilePath)) {
        const saved = JSON.parse(fs.readFileSync(keysFilePath, 'utf8'));
        if (saved.privateKey && saved.publicKey) {
          activePrivateKeyPem = saved.privateKey;
          activePublicKeyPem = saved.publicKey;
          return { privateKey: activePrivateKeyPem, publicKey: activePublicKeyPem };
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  // Generate a cryptographically secure 2048-bit RSA keypair
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  activePrivateKeyPem = privateKey;
  activePublicKeyPem = publicKey;

  if (!isTest) {
    try {
      fs.writeFileSync(keysFilePath, JSON.stringify({ privateKey, publicKey }), 'utf8');
    } catch {
      // Ignore write errors
    }
  }

  return { privateKey, publicKey };
}

export function getPublicKeyPem(): string {
  return loadOrGenerateRsaKeys().publicKey;
}

export function getPrivateKeyPem(): string {
  return loadOrGenerateRsaKeys().privateKey;
}

export function resetRsaKeys(newPrivateKey?: string, newPublicKey?: string): void {
  activePrivateKeyPem = newPrivateKey || null;
  activePublicKeyPem = newPublicKey || null;
}

/** Encode a buffer/string as unpadded base64url. */
function base64UrlEncode(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Decode unpadded base64url back into bytes. */
function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, 'base64');
}

function signHmacSha256(signingInput: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(signingInput).digest();
}

export function isSecretConfigured(secret: string | undefined): boolean {
  return typeof secret === 'string' && secret.trim().length >= 16;
}

/**
 * Decode token claims without signature verification.
 * Useful for extracting JTI or claims during revocation or auditing.
 */
export function decodeTokenClaims(token: string): TokenClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1]).toString('utf8'));
  } catch {
    return null;
  }
}

/**
 * Issue a signed JWT for an authenticated subject.
 * Defaults to asymmetric RS256 with native RSA-SHA256 signing.
 */
export function signToken(
  subject: TokenSubject,
  secretOrKey?: string,
  ttlSeconds: number = DEFAULT_TOKEN_TTL_SECONDS,
  nowSeconds: number = Math.floor(Date.now() / 1000),
  preferredAlg?: 'RS256' | 'HS256'
): string {
  const alg: 'RS256' | 'HS256' = preferredAlg || (ENV.JWT_ALGORITHM === 'HS256' && secretOrKey && !secretOrKey.includes('BEGIN') ? 'HS256' : 'RS256');
  const header = { alg, typ: 'JWT' };
  const claims: TokenClaims = {
    sub: subject.userId,
    role: subject.role,
    email: subject.email,
    org: subject.organizationId,
    iat: nowSeconds,
    exp: nowSeconds + ttlSeconds,
    iss: TOKEN_ISSUER,
    aud: TOKEN_AUDIENCE,
    jti: randomUUID(),
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(claims));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  let signature: string;
  if (alg === 'RS256') {
    const privateKey = (secretOrKey && secretOrKey.includes('BEGIN PRIVATE KEY'))
      ? secretOrKey
      : getPrivateKeyPem();
    const signer = createSign('RSA-SHA256');
    signer.update(signingInput);
    signer.end();
    signature = signer.sign(privateKey, 'base64url');
  } else {
    const secret = secretOrKey || ENV.JWT_SECRET;
    if (!isSecretConfigured(secret)) {
      throw new TokenError(
        'SECRET_NOT_CONFIGURED',
        `Refusing to sign token: JWT secret is missing or shorter than 16 characters.`
      );
    }
    signature = base64UrlEncode(signHmacSha256(signingInput, secret));
  }

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export const DEFAULT_REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

/**
 * Issue a matched Access Token and cryptographically signed Refresh Token pair.
 * Both tokens are signed with asymmetric RS256 by default.
 */
export function issueTokenPair(
  subject: TokenSubject,
  secretOrKey?: string,
  accessTtlSeconds: number = DEFAULT_TOKEN_TTL_SECONDS,
  refreshTtlSeconds: number = DEFAULT_REFRESH_TOKEN_TTL_SECONDS,
  preferredAlg?: 'RS256' | 'HS256'
): TokenPair {
  const accessToken = signToken(subject, secretOrKey, accessTtlSeconds, undefined, preferredAlg);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const alg: 'RS256' | 'HS256' = preferredAlg || (ENV.JWT_ALGORITHM === 'HS256' && secretOrKey && !secretOrKey.includes('BEGIN') ? 'HS256' : 'RS256');

  const refreshHeader = { alg, typ: 'JWT-REFRESH' };
  const refreshClaims: TokenClaims = {
    sub: subject.userId,
    role: subject.role,
    email: subject.email,
    org: subject.organizationId,
    iat: nowSeconds,
    exp: nowSeconds + refreshTtlSeconds,
    iss: TOKEN_ISSUER,
    aud: TOKEN_AUDIENCE,
    jti: randomUUID(),
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(refreshHeader));
  const encodedPayload = base64UrlEncode(JSON.stringify(refreshClaims));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  let signature: string;
  if (alg === 'RS256') {
    const privateKey = (secretOrKey && secretOrKey.includes('BEGIN PRIVATE KEY'))
      ? secretOrKey
      : getPrivateKeyPem();
    const signer = createSign('RSA-SHA256');
    signer.update(signingInput);
    signer.end();
    signature = signer.sign(privateKey, 'base64url');
  } else {
    const secret = secretOrKey || ENV.JWT_SECRET;
    signature = base64UrlEncode(signHmacSha256(signingInput, secret));
  }

  const refreshToken = `${encodedHeader}.${encodedPayload}.${signature}`;

  return {
    accessToken,
    refreshToken,
    expiresIn: accessTtlSeconds,
    tokenType: 'Bearer',
  };
}

/**
 * Validates a refresh token and issues a renewed TokenPair.
 */
export function refreshAccessToken(
  refreshTokenString: string, 
  secretOrPublicKey?: string,
  preferredAlg?: 'RS256' | 'HS256'
): TokenPair {
  const claims = verifyToken(refreshTokenString, secretOrPublicKey);
  return issueTokenPair(
    {
      userId: claims.sub,
      role: claims.role,
      email: claims.email,
      organizationId: claims.org,
    },
    secretOrPublicKey,
    DEFAULT_TOKEN_TTL_SECONDS,
    DEFAULT_REFRESH_TOKEN_TTL_SECONDS,
    preferredAlg
  );
}

/**
 * Verify a signed JWT (RS256 asymmetric or HS256) and return its claims.
 * Throws TokenError with a precise reason on any failure.
 */
export function verifyToken(
  token: string,
  secretOrPublicKey?: string,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): TokenClaims {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new TokenError('MALFORMED_TOKEN', 'Token must have exactly three dot-separated segments.');
  }

  const [encodedHeader, encodedPayload, providedSignature] = parts;

  let header: { alg?: string; typ?: string };
  try {
    header = JSON.parse(base64UrlDecode(encodedHeader).toString('utf8'));
  } catch {
    throw new TokenError('MALFORMED_TOKEN', 'Token header is not valid JSON.');
  }

  // Reject "alg: none" and any unsupported algorithm
  if (!header || (header.alg !== 'RS256' && header.alg !== 'HS256')) {
    throw new TokenError(
      'UNSUPPORTED_ALGORITHM',
      `Unsupported token algorithm: ${header?.alg ?? 'none'}. Only RS256 and HS256 are accepted.`
    );
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`;

  if (header.alg === 'RS256') {
    const publicKey = (secretOrPublicKey && secretOrPublicKey.includes('BEGIN PUBLIC KEY'))
      ? secretOrPublicKey
      : getPublicKeyPem();

    try {
      const verifier = createVerify('RSA-SHA256');
      verifier.update(signingInput);
      verifier.end();
      const verified = verifier.verify(publicKey, providedSignature, 'base64url');
      if (!verified) {
        throw new TokenError('INVALID_SIGNATURE', 'RS256 signature verification failed.');
      }
    } catch (err: any) {
      if (err instanceof TokenError) throw err;
      throw new TokenError('INVALID_SIGNATURE', 'Invalid RS256 signature.');
    }
  } else if (header.alg === 'HS256') {
    const secret = secretOrPublicKey || ENV.JWT_SECRET;
    if (!isSecretConfigured(secret)) {
      throw new TokenError(
        'SECRET_NOT_CONFIGURED',
        'Server has no JWT secret configured; unable to verify tokens.'
      );
    }

    const expectedSignature = signHmacSha256(signingInput, secret);
    const providedSignatureBytes = base64UrlDecode(providedSignature);

    if (
      providedSignatureBytes.length !== expectedSignature.length ||
      !timingSafeEqual(providedSignatureBytes, expectedSignature)
    ) {
      throw new TokenError('INVALID_SIGNATURE', 'Token signature does not match the expected value.');
    }
  }

  let claims: TokenClaims;
  try {
    claims = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8'));
  } catch {
    throw new TokenError('MALFORMED_TOKEN', 'Token payload is not valid JSON.');
  }

  if (!claims || typeof claims.sub !== 'string' || !claims.sub) {
    throw new TokenError('MISSING_CLAIMS', 'Token is missing the required "sub" claim.');
  }
  if (typeof claims.role !== 'string' || !claims.role) {
    throw new TokenError('MISSING_CLAIMS', 'Token is missing the required "role" claim.');
  }
  if (typeof claims.exp !== 'number') {
    throw new TokenError('MISSING_CLAIMS', 'Token is missing a numeric "exp" claim.');
  }

  if (claims.exp <= nowSeconds) {
    throw new TokenError('TOKEN_EXPIRED', 'Token has expired.');
  }
  if (typeof claims.iat === 'number' && claims.iat > nowSeconds + 60) {
    throw new TokenError('MALFORMED_TOKEN', 'Token "iat" is in the future.');
  }
  if (claims.iss !== TOKEN_ISSUER) {
    throw new TokenError('INVALID_ISSUER', 'Token was issued by an untrusted issuer.');
  }
  if (claims.aud !== TOKEN_AUDIENCE) {
    throw new TokenError('INVALID_AUDIENCE', 'Token audience does not match this API.');
  }

  return claims;
}

// ----------------------------------------------------
// Password credential hashing (scrypt)
// ----------------------------------------------------

const SCRYPT_PREFIX = 'scrypt';
const SCRYPT_KEY_LENGTH = 64;

/** Hash a plaintext password into `scrypt$<salt>$<derivedKeyHex>`. */
export function hashPassword(password: string, salt: string = randomBytes(16).toString('hex')): string {
  const derivedKey = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('hex');
  return `${SCRYPT_PREFIX}$${salt}$${derivedKey}`;
}

/** Constant-time verification of a password against a stored scrypt hash. */
export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!storedHash) return false;

  const segments = storedHash.split('$');
  if (segments.length !== 3 || segments[0] !== SCRYPT_PREFIX) return false;

  const [, salt, expectedHex] = segments;
  let expected: Buffer;
  try {
    expected = Buffer.from(expectedHex, 'hex');
  } catch {
    return false;
  }
  if (expected.length !== SCRYPT_KEY_LENGTH) return false;

  const derived = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  return timingSafeEqual(derived, expected);
}

/** Generate a strong random secret suitable for JWT_SECRET. */
export function generateSecret(): string {
  return randomBytes(48).toString('hex');
}
