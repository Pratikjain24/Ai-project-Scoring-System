// ====================================================
// PROJECTX-RAY AI - PHASE 12: DISTRIBUTED REDIS RATE LIMITER
// Backed by Redis (ioredis) with in-memory fallback (rate-limiter-flexible)
// ====================================================

import type { Request, Response, NextFunction } from 'express';
import {
  RateLimiterRedis,
  RateLimiterMemory,
  RateLimiterRes,
  type RateLimiterAbstract,
} from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { getRedisConnectionOptions, getRedisStatus } from '../pipeline/redisConfig';
import { ENV } from '../config/env';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('RateLimiter');

export interface RateLimiterOptions {
  windowMs?: number;
  maxRequests?: number;
  keyPrefix?: string;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  blockDurationSeconds?: number;
  preferMemory?: boolean;
}

export interface RateLimiterStatusInfo {
  mode: 'REDIS_DISTRIBUTED' | 'FALLBACK_MEMORY_INSURANCE';
  redisConnected: boolean;
  activeLimiters: string[];
  defaults: {
    windowMs: number;
    maxRequests: number;
    authMaxRequests: number;
  };
}

let sharedRedisClient: Redis | null = null;
const registeredLimiters = new Map<string, { redisLimiter: RateLimiterAbstract; memoryLimiter: RateLimiterMemory }>();

/**
 * Lazily initializes and provides a shared ioredis connection for all rate limiters
 */
function getSharedRedisClient(): Redis {
  if (!sharedRedisClient) {
    const isTest =
      ENV.NODE_ENV === 'test' ||
      process.argv.some((arg) => arg.includes('--test') || arg.includes('.test.ts'));

    const baseOpts = getRedisConnectionOptions();
    if (isTest) {
      baseOpts.retryStrategy = () => null; // Do not stall tests retrying offline Redis
      baseOpts.connectTimeout = 300;
    }
    if (ENV.REDIS_URL && ENV.REDIS_URL.trim().length > 0) {
      sharedRedisClient = new Redis(ENV.REDIS_URL, baseOpts);
    } else {
      sharedRedisClient = new Redis(baseOpts);
    }
    sharedRedisClient.on('error', (err) => {
      logger.warn('RateLimiter Redis client error (falling back to memory insurance)', {
        module: 'RateLimiter',
        error: err.message,
      });
    });
  }
  return sharedRedisClient;
}

/**
 * Standard key derivation from request context:
 * Priority: Authenticated User ID > X-Forwarded-For > X-Real-IP > req.ip > remoteAddress
 */
export function defaultKeyGenerator(req: Request): string {
  // If user is authenticated via JWT middleware
  const auth = (req as any).auth || (req as any).user;
  if (auth && (auth.id || auth.userId || auth.sub)) {
    return `user_${auth.id || auth.userId || auth.sub}`;
  }

  // Also check Bearer token in header to key by token subject if present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const rawToken = authHeader.slice(7).trim();
    try {
      const parts = rawToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        if (payload?.sub) {
          return `user_${payload.sub}`;
        }
      }
    } catch {
      // Ignore token parse error
    }
  }

  // Check standard client IP proxy headers
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const rawIp = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    if (rawIp && rawIp.trim()) {
      return rawIp.trim();
    }
  }

  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }

  const ip = req.ip || req.socket?.remoteAddress || '127.0.0.1';
  // Normalize IPv6 localhost
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }
  return ip;
}

/**
 * Standard bypass predicate (e.g. CORS preflight OPTIONS, health checks)
 */
export function defaultSkipPredicate(req: Request): boolean {
  if (req.method === 'OPTIONS') return true;

  const path = req.path || req.originalUrl || '';
  if (path === '/api/health' || path === '/health' || path.startsWith('/api/health/')) {
    return true;
  }

  if (path.includes('/rate-limits/reset')) {
    return true;
  }

  // In local development, bypass rate limiting for localhost requests to avoid dev friction
  if (ENV.NODE_ENV === 'development') {
    const ip = req.ip || req.socket?.remoteAddress || '';
    if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || req.hostname === 'localhost') {
      return true;
    }
  }

  return false;
}

/**
 * Factory creating an Express middleware backed by Redis with atomic Lua scripts
 * and seamless in-memory fallback via insuranceLimiter.
 */
export function createRateLimiter(options: RateLimiterOptions = {}) {
  const windowMs = options.windowMs ?? ENV.RATE_LIMIT_WINDOW_MS;
  const durationSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const maxRequests = options.maxRequests ?? ENV.RATE_LIMIT_MAX_REQUESTS;
  const keyPrefix = options.keyPrefix || 'rlflx:api';
  const blockDurationSeconds = options.blockDurationSeconds ?? durationSeconds;
  const keyGen = options.keyGenerator || defaultKeyGenerator;
  const skipFn = options.skip || defaultSkipPredicate;

  // 1. In-memory insurance limiter (always ready for instantaneous zero-downtime fallback)
  const memoryLimiter = new RateLimiterMemory({
    keyPrefix: `${keyPrefix}:mem`,
    points: maxRequests,
    duration: durationSeconds,
    blockDuration: blockDurationSeconds,
  });

  let activeLimiter: RateLimiterAbstract = memoryLimiter;

  if (!options.preferMemory) {
    try {
      const redisClient = getSharedRedisClient();
      activeLimiter = new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix,
        points: maxRequests,
        duration: durationSeconds,
        blockDuration: blockDurationSeconds,
        insuranceLimiter: memoryLimiter,
        rejectIfRedisNotReady: true,
      });
    } catch (err: any) {
      logger.warn('Failed to initialize RateLimiterRedis; utilizing memory fallback', {
        module: 'RateLimiter',
        error: err.message,
      });
      activeLimiter = memoryLimiter;
    }
  }

  registeredLimiters.set(keyPrefix, { redisLimiter: activeLimiter, memoryLimiter });

  // 2. Return Express middleware
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (skipFn(req)) {
      return next();
    }

    const key = keyGen(req);

    try {
      const rateLimiterRes: RateLimiterRes = await activeLimiter.consume(key, 1);

      // Inject standard rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimiterRes.remainingPoints));
      res.setHeader(
        'X-RateLimit-Reset',
        Math.ceil((Date.now() + (rateLimiterRes.msBeforeNext || 0)) / 1000)
      );

      next();
    } catch (err: any) {
      if (err instanceof RateLimiterRes || (err && typeof err.msBeforeNext === 'number')) {
        const msBeforeNext = err.msBeforeNext || 1000;
        const retryAfterSeconds = Math.max(1, Math.ceil(msBeforeNext / 1000));

        // Inject rate limit exceeded headers
        res.setHeader('Retry-After', retryAfterSeconds);
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', Math.ceil((Date.now() + msBeforeNext) / 1000));

        logger.warn('Rate limit exceeded', {
          module: 'RateLimiter',
          key,
          endpoint: req.originalUrl || req.url,
          retryAfterSeconds,
          keyPrefix,
        });

        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message:
              options.message ||
              `Too many requests. Please slow down and retry in ${retryAfterSeconds} second${
                retryAfterSeconds === 1 ? '' : 's'
              }.`,
            retryAfterSeconds,
          },
        });
        return;
      }

      // Unexpected operational error: fail open so legitimate traffic isn't dropped
      logger.error('Unexpected error in RateLimiter middleware, failing open', {
        module: 'RateLimiter',
        error: err?.message || String(err),
      });
      next();
    }
  };
}

/**
 * Global API Rate Limiter
 * Default: 100 requests per 15 minutes (or configured via ENV)
 */
export const apiRateLimiter = createRateLimiter({
  keyPrefix: 'rlflx:api',
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  maxRequests: ENV.RATE_LIMIT_MAX_REQUESTS,
});

/**
 * Sensitive Authentication Endpoints Rate Limiter (Brute-force protection)
 * Default: 10 requests per 15 minutes (or configured via ENV)
 */
export const authRateLimiter = createRateLimiter({
  keyPrefix: 'rlflx:auth',
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  maxRequests: ENV.RATE_LIMIT_AUTH_MAX_REQUESTS,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
});

/**
 * Compute-Intensive / Heavy Upload Operations Rate Limiter (e.g. video / OCR pipelines)
 * Default: 20 requests per 5 minutes
 */
export const heavyOperationRateLimiter = createRateLimiter({
  keyPrefix: 'rlflx:heavy',
  windowMs: 5 * 60 * 1000,
  maxRequests: 20,
  message: 'Heavy operation capacity reached. Please wait before triggering additional batch analyses.',
});

/**
 * Introspection diagnostic helper returning current rate limiting engine status
 */
export function getRateLimiterStatus(): RateLimiterStatusInfo {
  const redisStat = getRedisStatus();
  return {
    mode: redisStat.connected ? 'REDIS_DISTRIBUTED' : 'FALLBACK_MEMORY_INSURANCE',
    redisConnected: redisStat.connected,
    activeLimiters: Array.from(registeredLimiters.keys()),
    defaults: {
      windowMs: ENV.RATE_LIMIT_WINDOW_MS,
      maxRequests: ENV.RATE_LIMIT_MAX_REQUESTS,
      authMaxRequests: ENV.RATE_LIMIT_AUTH_MAX_REQUESTS,
    },
  };
}

/**
 * Programmatically resets rate limit points for a given key across registered limiters.
 * Useful for admin unblocks and test assertions.
 */
export async function resetRateLimit(key: string, keyPrefix?: string): Promise<boolean> {
  let cleared = false;
  for (const [prefix, { redisLimiter, memoryLimiter }] of registeredLimiters.entries()) {
    if (!keyPrefix || prefix === keyPrefix) {
      try {
        await redisLimiter.delete(key);
        cleared = true;
      } catch {
        // Ignore
      }
      try {
        await memoryLimiter.delete(key);
        cleared = true;
      } catch {
        // Ignore
      }
    }
  }
  return cleared;
}

/**
 * Gracefully disconnects the shared Redis client instance
 */
export async function closeRateLimiterRedis(): Promise<void> {
  if (sharedRedisClient) {
    try {
      await sharedRedisClient.quit();
    } catch {
      sharedRedisClient.disconnect();
    }
    sharedRedisClient = null;
  }
}
