// Enforce Node.js >= 22.0.0 for native SQLite (node:sqlite) and modern ECMAScript APIs
const [nodeMajor] = process.versions.node.split('.').map(Number);
if (nodeMajor < 22) {
  console.error(`\x1b[41m\x1b[37m[FATAL ERROR] Node.js version ${process.versions.node} is not supported.\nProjectX-Ray AI requires Node.js >= 22.0.0 for native SQLite (node:sqlite).\nPlease upgrade your Node.js runtime.\x1b[0m`);
  process.exit(1);
}

import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { ENV } from './config/env';
import { initSchema } from './db/database';
import { requestLogger, logger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';

import { projectRouter } from './routes/projectRoutes';
import { evaluationRouter } from './routes/evaluationRoutes';
import { evidenceRouter } from './routes/evidenceRoutes';
import { researchRouter } from './routes/researchRoutes';
import { documentRouter } from './routes/documentRoutes';
import { videoRouter } from './routes/videoRoutes';

export const app = express();

// Initialize database schema
initSchema();

import { authenticate, requireRole } from './middleware/auth';

// Global Middleware - Strict CORS Configuration
const configuredOrigins = (ENV.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, curl, health checks)
    if (!origin) return callback(null, true);

    if (ENV.NODE_ENV === 'production') {
      // In production, strictly enforce configured origins without allowing '*' wildcard
      if (configuredOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not permitted by CORS policy.`));
    } else {
      // In development/testing, allow configured origins, wildcard if configured, or localhost
      if (
        configuredOrigins.includes('*') ||
        configuredOrigins.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not permitted by development CORS policy.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Execution-Id', 'X-User-Role'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger);

import { apiRateLimiter, closeRateLimiterRedis } from './middleware/rateLimiter';

// Global Rate Limiting across API endpoints (with automatic failover to memory insurance)
app.use('/api', apiRateLimiter);

// Health Check (Publicly accessible)
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      platform: 'PROJECTX-RAY AI Production Backend',
      environment: ENV.NODE_ENV,
      mockMode: ENV.MOCK_AI,
      timestamp: new Date().toISOString(),
    },
  });
});

import { singleClaimRouter } from './routes/claimVerificationRoutes';
import { rubricRouter } from './routes/juryRoutes';
import { shareRouter } from './routes/reportRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { authRouter } from './routes/authRoutes';
import { storageRouter } from './routes/storageRoutes';

// Public Authentication Endpoints
app.use('/api/auth', authRouter);
app.use('/api/v1/auth', authRouter);

// Cloud Object Storage Endpoints (presigned URLs, local streaming, S3 proxy)
app.use('/api/storage', storageRouter);
app.use('/api/v1/storage', storageRouter);

// Mount Routes (Standard & v1 Versioned) with Authentication & Authorization
app.use('/api/projects', authenticate, projectRouter);
app.use('/api/evaluations', authenticate, evaluationRouter);
app.use('/api/documents', authenticate, documentRouter);
app.use('/api/videos', authenticate, videoRouter);
app.use('/api/evidence', authenticate, evidenceRouter);
app.use('/api/research', authenticate, researchRouter);
app.use('/api/claims', authenticate, singleClaimRouter);
app.use('/api/rubrics', authenticate, rubricRouter);
app.use('/api/report-share', shareRouter);
app.use('/api/admin', authenticate, requireRole('ADMIN'), adminRoutes);

// Versioned /api/v1 aliases
app.use('/api/v1/projects', authenticate, projectRouter);
app.use('/api/v1/evaluations', authenticate, evaluationRouter);
app.use('/api/v1/admin', authenticate, requireRole('ADMIN'), adminRoutes);

// Production Static SPA Serving (Vite compiled bundle)
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath) && ENV.NODE_ENV === 'production') {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    // Preserve API routes and 404s
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

import { pipelineQueue } from './pipeline/pipelineQueue';

// Start server when executed directly
const isTestMode = process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('--test') || arg.includes('.test.ts'));
if (!isTestMode) {
  // Initialize persistent queue (BullMQ + SQLite fallback) and auto-resume interrupted jobs
  pipelineQueue.init().catch((qErr) => {
    logger.error('Pipeline queue initialization error', { module: 'Server', error: qErr });
  });

  const server = app.listen(ENV.PORT, '0.0.0.0', () => {
    logger.info('🚀 PROJECTX-RAY AI Backend Server Active', {
      module: 'Server',
      port: ENV.PORT,
      url: `http://localhost:${ENV.PORT}`,
      mockAi: ENV.MOCK_AI,
      databasePath: ENV.DATABASE_PATH,
      jobQueue: 'Persistent Queue (BullMQ with Redis & SQLite Auto-Resume)',
    });
  });

  process.on('SIGTERM', async () => {
    try {
      await pipelineQueue.close();
      await closeRateLimiterRedis();
    } catch {
      // Ignore
    }
    server.close(() => {
      logger.info('ProjectX-Ray server terminated gracefully.', { module: 'Server' });
    });
  });
}
