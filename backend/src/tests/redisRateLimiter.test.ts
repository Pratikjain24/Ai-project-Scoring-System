import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import {
  createRateLimiter,
  apiRateLimiter,
  authRateLimiter,
  defaultKeyGenerator,
  defaultSkipPredicate,
  getRateLimiterStatus,
  resetRateLimit,
} from '../middleware/rateLimiter';
import { app } from '../server';

// Mock Express Request & Response helper
function createMockContext(overrides: Partial<Request> = {}) {
  const req = {
    method: 'GET',
    url: '/api/projects',
    path: '/api/projects',
    originalUrl: '/api/projects',
    ip: '192.168.1.50',
    headers: {},
    socket: { remoteAddress: '192.168.1.50' },
    ...overrides,
  } as unknown as Request;

  const headers: Record<string, any> = {};
  let statusCode = 200;
  let responseBody: any = null;

  const res = {
    setHeader(key: string, value: any) {
      headers[key.toLowerCase()] = value;
      return res;
    },
    getHeader(key: string) {
      return headers[key.toLowerCase()];
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(body: any) {
      responseBody = body;
      return res;
    },
  } as unknown as Response;

  return { req, res, getHeaders: () => headers, getStatusCode: () => statusCode, getBody: () => responseBody };
}

describe('Phase 12c: Enterprise Redis-Backed Rate Limiter Test Suite', () => {
  const testIp = '10.0.0.99';

  beforeEach(async () => {
    await resetRateLimit(testIp);
    await resetRateLimit('user_test_456');
  });

  it('1. Rate limiter tracks requests and injects standard X-RateLimit headers', async () => {
    const limiter = createRateLimiter({
      windowMs: 60000,
      maxRequests: 3,
      keyPrefix: 'rlflx:test_headers',
      preferMemory: true,
    });

    const ctx1 = createMockContext({ ip: testIp });
    let nextCalled1 = false;
    await limiter(ctx1.req, ctx1.res, () => { nextCalled1 = true; });

    assert.ok(nextCalled1, 'First request should proceed to next()');
    assert.strictEqual(ctx1.getHeaders()['x-ratelimit-limit'], 3);
    assert.strictEqual(ctx1.getHeaders()['x-ratelimit-remaining'], 2);
    assert.ok(ctx1.getHeaders()['x-ratelimit-reset'], 'Should include reset timestamp');

    const ctx2 = createMockContext({ ip: testIp });
    let nextCalled2 = false;
    await limiter(ctx2.req, ctx2.res, () => { nextCalled2 = true; });

    assert.ok(nextCalled2, 'Second request should proceed to next()');
    assert.strictEqual(ctx2.getHeaders()['x-ratelimit-remaining'], 1);

    const ctx3 = createMockContext({ ip: testIp });
    let nextCalled3 = false;
    await limiter(ctx3.req, ctx3.res, () => { nextCalled3 = true; });

    assert.ok(nextCalled3, 'Third request should proceed to next()');
    assert.strictEqual(ctx3.getHeaders()['x-ratelimit-remaining'], 0);
  });

  it('2. Rate limiter rejects requests with HTTP 429 and Retry-After header when threshold is exceeded', async () => {
    const limiter = createRateLimiter({
      windowMs: 60000,
      maxRequests: 2,
      keyPrefix: 'rlflx:test_rejection',
      message: 'Custom rate limit exceeded message',
      preferMemory: true,
    });

    // 1st request
    const ctx1 = createMockContext({ ip: testIp });
    await limiter(ctx1.req, ctx1.res, () => {});
    assert.strictEqual(ctx1.getStatusCode(), 200);

    // 2nd request
    const ctx2 = createMockContext({ ip: testIp });
    await limiter(ctx2.req, ctx2.res, () => {});
    assert.strictEqual(ctx2.getStatusCode(), 200);

    // 3rd request: exceeded
    const ctx3 = createMockContext({ ip: testIp });
    let nextCalled = false;
    await limiter(ctx3.req, ctx3.res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false, 'Should block execution and NOT call next()');
    assert.strictEqual(ctx3.getStatusCode(), 429, 'Should return HTTP 429');
    assert.strictEqual(ctx3.getHeaders()['x-ratelimit-remaining'], 0);
    assert.ok(ctx3.getHeaders()['retry-after'] >= 1, 'Should set Retry-After header in seconds');

    const body = ctx3.getBody();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'RATE_LIMIT_EXCEEDED');
    assert.strictEqual(body.error.message, 'Custom rate limit exceeded message');
    assert.ok(body.error.retryAfterSeconds >= 1);
  });

  it('3. RateLimiterRedis gracefully falls back to in-memory insurance limiter when Redis is offline', async () => {
    // Tests createRateLimiter without preferMemory (uses RateLimiterRedis with insuranceLimiter)
    const hybridLimiter = createRateLimiter({
      windowMs: 30000,
      maxRequests: 2,
      keyPrefix: 'rlflx:test_redis_fallback',
      preferMemory: false,
    });

    const ctx1 = createMockContext({ ip: testIp });
    let nextCalled1 = false;
    await hybridLimiter(ctx1.req, ctx1.res, () => { nextCalled1 = true; });
    assert.ok(nextCalled1, 'Should succeed via insurance limiter');

    const ctx2 = createMockContext({ ip: testIp });
    let nextCalled2 = false;
    await hybridLimiter(ctx2.req, ctx2.res, () => { nextCalled2 = true; });
    assert.ok(nextCalled2, 'Should succeed for second hit');

    const ctx3 = createMockContext({ ip: testIp });
    let nextCalled3 = false;
    await hybridLimiter(ctx3.req, ctx3.res, () => { nextCalled3 = true; });
    assert.strictEqual(nextCalled3, false, 'Should block third hit even under fallback');
    assert.strictEqual(ctx3.getStatusCode(), 429);
  });

  it('4. defaultSkipPredicate bypasses /api/health and OPTIONS preflight requests', () => {
    const healthReq1 = { method: 'GET', path: '/api/health', originalUrl: '/api/health' } as Request;
    const healthReq2 = { method: 'GET', path: '/health', originalUrl: '/health' } as Request;
    const optionsReq = { method: 'OPTIONS', path: '/api/projects', originalUrl: '/api/projects' } as Request;
    const normalReq = { method: 'GET', path: '/api/projects', originalUrl: '/api/projects' } as Request;

    assert.strictEqual(defaultSkipPredicate(healthReq1), true, '/api/health should skip');
    assert.strictEqual(defaultSkipPredicate(healthReq2), true, '/health should skip');
    assert.strictEqual(defaultSkipPredicate(optionsReq), true, 'OPTIONS should skip');
    assert.strictEqual(defaultSkipPredicate(normalReq), false, 'Normal API route should not skip');
  });

  it('5. defaultKeyGenerator prioritizes authenticated user ID and respects proxy headers', () => {
    // Authenticated user
    const authReq = {
      user: { id: 'user_999' },
      ip: '192.168.1.1',
      headers: {},
    } as unknown as Request;
    assert.strictEqual(defaultKeyGenerator(authReq), 'user_user_999');

    // X-Forwarded-For proxy header
    const forwardedReq = {
      headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' },
      ip: '10.0.0.1',
    } as unknown as Request;
    assert.strictEqual(defaultKeyGenerator(forwardedReq), '203.0.113.195');

    // X-Real-IP proxy header
    const realIpReq = {
      headers: { 'x-real-ip': '198.51.100.44' },
      ip: '10.0.0.1',
    } as unknown as Request;
    assert.strictEqual(defaultKeyGenerator(realIpReq), '198.51.100.44');

    // Localhost IPv6 normalization
    const ipv6Req = {
      headers: {},
      ip: '::1',
    } as unknown as Request;
    assert.strictEqual(defaultKeyGenerator(ipv6Req), '127.0.0.1');
  });

  it('6. resetRateLimit clears consumed points allowing blocked clients to resume', async () => {
    const key = '10.0.0.77';
    const limiter = createRateLimiter({
      windowMs: 60000,
      maxRequests: 1,
      keyPrefix: 'rlflx:test_reset',
      preferMemory: true,
    });

    // 1st request succeeds
    const ctx1 = createMockContext({ ip: key });
    await limiter(ctx1.req, ctx1.res, () => {});
    assert.strictEqual(ctx1.getStatusCode(), 200);

    // 2nd request is blocked
    const ctx2 = createMockContext({ ip: key });
    await limiter(ctx2.req, ctx2.res, () => {});
    assert.strictEqual(ctx2.getStatusCode(), 429);

    // Reset rate limit key
    await resetRateLimit(key, 'rlflx:test_reset');

    // 3rd request now succeeds after reset
    const ctx3 = createMockContext({ ip: key });
    let nextCalled = false;
    await limiter(ctx3.req, ctx3.res, () => { nextCalled = true; });
    assert.ok(nextCalled, 'Request should proceed after key reset');
    assert.strictEqual(ctx3.getStatusCode(), 200);
  });

  it('7. getRateLimiterStatus returns engine diagnostics and registered limiters', () => {
    const status = getRateLimiterStatus();

    assert.ok(status.mode === 'REDIS_DISTRIBUTED' || status.mode === 'FALLBACK_MEMORY_INSURANCE');
    assert.strictEqual(typeof status.redisConnected, 'boolean');
    assert.ok(Array.isArray(status.activeLimiters));
    assert.ok(status.defaults.windowMs > 0);
    assert.ok(status.defaults.maxRequests > 0);
    assert.ok(status.defaults.authMaxRequests > 0);
  });

  it('8. apiRateLimiter skips health check endpoint without consuming rate limit points', async () => {
    const healthCtx = createMockContext({
      path: '/api/health',
      url: '/api/health',
      originalUrl: '/api/health',
      ip: testIp,
    });
    let healthNextCalled = false;
    await apiRateLimiter(healthCtx.req, healthCtx.res, () => { healthNextCalled = true; });

    assert.ok(healthNextCalled, 'apiRateLimiter must call next() for /api/health');
    assert.strictEqual(
      healthCtx.getHeaders()['x-ratelimit-remaining'],
      undefined,
      'Should not consume or inject rate limit headers for bypassed health route'
    );
  });

  it('9. authRateLimiter enforces tighter security limits for authentication endpoints', async () => {
    const authKey = '198.51.100.222';
    await resetRateLimit(authKey);

    const ctx = createMockContext({
      ip: authKey,
      path: '/api/auth/login',
      originalUrl: '/api/auth/login',
    });
    let nextCalled = false;
    await authRateLimiter(ctx.req, ctx.res, () => { nextCalled = true; });

    assert.ok(nextCalled, 'Initial auth request proceeds');
    assert.ok(
      ctx.getHeaders()['x-ratelimit-limit'] <= 50,
      'Auth limiter must configure a tighter threshold than standard API'
    );
  });

  it('10. Admin controller exposes rate limiter status and allows programmatic reset', async () => {
    const mockReq: any = { body: { key: '10.0.0.99' } };
    let responseStatus = 0;
    let responseData: any = null;

    const mockRes: any = {
      status: (code: number) => {
        responseStatus = code;
        return mockRes;
      },
      json: (data: any) => {
        responseData = data;
      },
    };

    const { AdminController } = await import('../controllers/adminController');

    // Test GET /api/admin/rate-limits
    AdminController.getRateLimits({} as any, mockRes);
    assert.strictEqual(responseStatus, 200);
    assert.strictEqual(responseData.success, true);
    assert.ok(responseData.data.activeLimiters.length >= 1);

    // Test POST /api/admin/rate-limits/reset
    await AdminController.resetRateLimitKey(mockReq, mockRes);
    assert.strictEqual(responseStatus, 200);
    assert.strictEqual(responseData.success, true);
    assert.strictEqual(responseData.data.key, '10.0.0.99');
  });
});

