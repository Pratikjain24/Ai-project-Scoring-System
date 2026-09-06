import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { initSchema } from './db/database';
import { requestLogger } from './middleware/logger';
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

// Global Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Execution-Id'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger);

// Health Check
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

// Mount Routes (Standard & v1 Versioned)
app.use('/api/projects', projectRouter);
app.use('/api/evaluations', evaluationRouter);
app.use('/api/documents', documentRouter);
app.use('/api/videos', videoRouter);
app.use('/api/evidence', evidenceRouter);
app.use('/api/research', researchRouter);
app.use('/api/claims', singleClaimRouter);
app.use('/api/rubrics', rubricRouter);
app.use('/api/report-share', shareRouter);
app.use('/api/admin', adminRoutes);

// Versioned /api/v1 aliases
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/evaluations', evaluationRouter);
app.use('/api/v1/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server when executed directly
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(ENV.PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 PROJECTX-RAY AI Backend Server Active`);
    console.log(`📡 URL: http://localhost:${ENV.PORT}`);
    console.log(`🛡️ Mock AI Engine: ${ENV.MOCK_AI ? 'ENABLED (Deterministic)' : 'DISABLED (External Providers)'}`);
    console.log(`🗄️ Database: SQLite at ${ENV.DATABASE_PATH}`);
    console.log(`====================================================`);
  });

  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('ProjectX-Ray server terminated gracefully.');
    });
  });
}
