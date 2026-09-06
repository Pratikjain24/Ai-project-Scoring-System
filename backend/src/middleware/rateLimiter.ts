// ====================================================
// PROJECTX-RAY AI - PHASE 12: SLIDING-WINDOW RATE LIMITER
// ====================================================

import type { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export function createRateLimiter(options: { windowMs: number; maxRequests: number; message?: string }) {
  const hits = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'anonymous';
    const now = Date.now();

    let entry = hits.get(ip);
    if (!entry || now > entry.resetTime) {
      entry = { count: 1, resetTime: now + options.windowMs };
      hits.set(ip, entry);
      return next();
    }

    if (entry.count >= options.maxRequests) {
      res.setHeader('Retry-After', Math.ceil((entry.resetTime - now) / 1000));
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: options.message || 'Too many requests. Please slow down and retry later.'
        }
      });
    }

    entry.count += 1;
    next();
  };
}
