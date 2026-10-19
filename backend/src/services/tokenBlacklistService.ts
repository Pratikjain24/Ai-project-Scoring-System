// ====================================================
// PROJECTX-RAY AI - TOKEN BLACKLIST & REVOCATION SERVICE
// Dual-Mode Token Revocation: Primary Redis (Distributed)
// with High-Speed In-Memory & Persistent SQLite Fallback
// ====================================================

import type Redis from 'ioredis';
import { createRedisClient, testRedisConnection } from '../pipeline/redisConfig';
import { getDb } from '../db/database';
import { createModuleLogger } from '../utils/logger';
import type { TokenClaims } from './tokenService';

const logger = createModuleLogger('TokenBlacklist');

export interface BlacklistStats {
  connected: boolean;
  mode: 'REDIS_DISTRIBUTED' | 'PERSISTENT_FALLBACK';
  totalRevokedTokens: number;
  activeRevokedUsers: number;
  lastChecked: string;
}

export class TokenBlacklistService {
  private static redisClient: Redis | null = null;
  private static isRedisAvailable: boolean = false;
  private static redisCheckTime: number = 0;
  private static memoryRevokedTokens = new Map<string, { expiresAt: number; reason: string }>();
  private static memoryRevokedUsers = new Map<string, number>();

  /**
   * Initializes or returns Redis client with connection health check caching (30s)
   */
  private static async getRedis(): Promise<Redis | null> {
    const now = Date.now();
    if (this.redisClient && now - this.redisCheckTime < 30000) {
      return this.isRedisAvailable ? this.redisClient : null;
    }

    try {
      if (!this.redisClient) {
        this.redisClient = createRedisClient();
      }

      const healthy = await testRedisConnection(800);
      this.isRedisAvailable = healthy;
      this.redisCheckTime = now;

      if (healthy) {
        return this.redisClient;
      }
    } catch (err: any) {
      this.isRedisAvailable = false;
      this.redisCheckTime = now;
      logger.debug('Redis unreachable, using in-memory and SQLite persistent blacklist', { error: err.message });
    }

    return null;
  }

  /**
   * Ensure SQLite blacklist tables exist on boot
   */
  private static ensureTables(): void {
    try {
      const db = getDb();
      db.exec(`
        CREATE TABLE IF NOT EXISTS token_blacklist (
          jti TEXT PRIMARY KEY,
          user_id TEXT,
          expires_at INTEGER NOT NULL,
          reason TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS user_session_revocations (
          user_id TEXT PRIMARY KEY,
          revoked_before INTEGER NOT NULL,
          reason TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (err: any) {
      logger.warn('Failed to ensure SQLite blacklist schema', { error: err.message });
    }
  }

  /**
   * Revoke a specific token by JTI or TokenClaims
   */
  static async revokeToken(
    tokenOrClaimsOrJti: string | TokenClaims,
    reason: string = 'REVOKED',
    expiresAt?: number
  ): Promise<{ success: boolean; jti: string; expiresAt: number }> {
    this.ensureTables();

    let jti: string;
    let userId: string = 'unknown';
    let exp: number = expiresAt || Math.floor(Date.now() / 1000) + 86400 * 7;

    if (typeof tokenOrClaimsOrJti === 'object' && 'jti' in tokenOrClaimsOrJti) {
      jti = tokenOrClaimsOrJti.jti;
      userId = tokenOrClaimsOrJti.sub;
      exp = tokenOrClaimsOrJti.exp;
    } else if (typeof tokenOrClaimsOrJti === 'string') {
      if (tokenOrClaimsOrJti.includes('.')) {
        // Parse unverified claims to extract jti and exp
        try {
          const parts = tokenOrClaimsOrJti.split('.');
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          jti = payload.jti || `jti_${Date.now()}`;
          userId = payload.sub || 'unknown';
          exp = payload.exp || exp;
        } catch {
          jti = tokenOrClaimsOrJti;
        }
      } else {
        jti = tokenOrClaimsOrJti;
      }
    } else {
      throw new Error('Invalid token identifier provided for revocation.');
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const ttlSeconds = Math.max(exp - nowSeconds, 60);

    // 1. Store in memory map
    this.memoryRevokedTokens.set(jti, { expiresAt: exp, reason });

    // 2. Store in Redis if available
    try {
      const redis = await this.getRedis();
      if (redis) {
        await redis.set(`blacklist:token:${jti}`, JSON.stringify({ reason, userId, exp }), 'EX', ttlSeconds);
        logger.info('Token revoked via Redis', { jti, userId, reason, ttlSeconds });
      }
    } catch (err: any) {
      logger.warn('Failed to store revocation in Redis, recorded locally', { error: err.message, jti });
    }

    // 3. Persist to SQLite
    try {
      const db = getDb();
      db.prepare(`
        INSERT OR REPLACE INTO token_blacklist (jti, user_id, expires_at, reason)
        VALUES (?, ?, ?, ?)
      `).run(jti, userId, exp, reason);
    } catch (err: any) {
      logger.warn('Failed to persist token revocation to SQLite', { error: err.message, jti });
    }

    return { success: true, jti, expiresAt: exp };
  }

  /**
   * Check if a token has been revoked
   */
  static async isTokenRevoked(
    jti: string,
    userId?: string,
    issuedAtSeconds?: number
  ): Promise<boolean> {
    const nowSeconds = Math.floor(Date.now() / 1000);

    // 1. Check in-memory token cache
    const memToken = this.memoryRevokedTokens.get(jti);
    if (memToken) {
      if (memToken.expiresAt > nowSeconds) {
        return true;
      } else {
        this.memoryRevokedTokens.delete(jti);
      }
    }

    // 2. Check in-memory user revocation
    if (userId && issuedAtSeconds !== undefined) {
      const userRevokedBefore = this.memoryRevokedUsers.get(userId);
      if (userRevokedBefore !== undefined && issuedAtSeconds <= userRevokedBefore) {
        return true;
      }
    }

    // 3. Check Redis
    try {
      const redis = await this.getRedis();
      if (redis) {
        const tokenExists = await redis.exists(`blacklist:token:${jti}`);
        if (tokenExists === 1) {
          return true;
        }

        if (userId && issuedAtSeconds !== undefined) {
          const userRevokedBeforeStr = await redis.get(`blacklist:user:${userId}`);
          if (userRevokedBeforeStr) {
            const userRevokedBefore = parseInt(userRevokedBeforeStr, 10);
            if (issuedAtSeconds <= userRevokedBefore) {
              return true;
            }
          }
        }
      }
    } catch (err: any) {
      logger.debug('Redis blacklist check failed, falling back to SQLite', { error: err.message });
    }

    // 4. Check SQLite persistent store
    try {
      this.ensureTables();
      const db = getDb();
      const row = db.prepare(`
        SELECT 1 FROM token_blacklist WHERE jti = ? AND expires_at > ?
      `).get(jti, nowSeconds);

      if (row) {
        return true;
      }

      if (userId && issuedAtSeconds !== undefined) {
        const userRow = db.prepare(`
          SELECT revoked_before FROM user_session_revocations WHERE user_id = ?
        `).get(userId) as { revoked_before: number } | undefined;

        if (userRow && issuedAtSeconds <= userRow.revoked_before) {
          return true;
        }
      }
    } catch (err: any) {
      logger.warn('SQLite blacklist check error', { error: err.message });
    }

    return false;
  }

  /**
   * Revoke all active sessions for a specific user
   */
  static async revokeAllUserSessions(
    userId: string,
    reason: string = 'USER_SESSION_REVOKED_ALL'
  ): Promise<{ success: boolean; userId: string; revokedBefore: number }> {
    this.ensureTables();
    const nowSeconds = Math.floor(Date.now() / 1000);

    // 1. Store in memory
    this.memoryRevokedUsers.set(userId, nowSeconds);

    // 2. Store in Redis
    try {
      const redis = await this.getRedis();
      if (redis) {
        // Keep user revocation marker in Redis for 30 days
        await redis.set(`blacklist:user:${userId}`, nowSeconds.toString(), 'EX', 86400 * 30);
      }
    } catch (err: any) {
      logger.warn('Failed to set user revocation in Redis', { error: err.message, userId });
    }

    // 3. Persist to SQLite
    try {
      const db = getDb();
      db.prepare(`
        INSERT OR REPLACE INTO user_session_revocations (user_id, revoked_before, reason)
        VALUES (?, ?, ?)
      `).run(userId, nowSeconds, reason);
    } catch (err: any) {
      logger.warn('Failed to persist user session revocation to SQLite', { error: err.message, userId });
    }

    return { success: true, userId, revokedBefore: nowSeconds };
  }

  /**
   * Return telemetry and diagnostics regarding the token blacklist
   */
  static async getBlacklistStats(): Promise<BlacklistStats> {
    this.ensureTables();
    const nowSeconds = Math.floor(Date.now() / 1000);
    let totalRevokedTokens = this.memoryRevokedTokens.size;
    let activeRevokedUsers = this.memoryRevokedUsers.size;

    try {
      const db = getDb();
      const countRow = db.prepare(`
        SELECT COUNT(*) as count FROM token_blacklist WHERE expires_at > ?
      `).get(nowSeconds) as { count: number } | undefined;

      const userCountRow = db.prepare(`
        SELECT COUNT(*) as count FROM user_session_revocations
      `).get() as { count: number } | undefined;

      if (countRow) totalRevokedTokens = Math.max(totalRevokedTokens, countRow.count);
      if (userCountRow) activeRevokedUsers = Math.max(activeRevokedUsers, userCountRow.count);
    } catch {
      // Fallback to in-memory counts
    }

    const redis = await this.getRedis();

    return {
      connected: this.isRedisAvailable,
      mode: this.isRedisAvailable ? 'REDIS_DISTRIBUTED' : 'PERSISTENT_FALLBACK',
      totalRevokedTokens,
      activeRevokedUsers,
      lastChecked: new Date().toISOString(),
    };
  }

  /**
   * Reset in-memory maps (primarily for tests)
   */
  static clearMemory(): void {
    this.memoryRevokedTokens.clear();
    this.memoryRevokedUsers.clear();
  }
}
