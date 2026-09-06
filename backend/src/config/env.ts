import dotenv from 'dotenv';
import path from 'node:path';

// Load .env from root or backend directory
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_PATH: process.env.DATABASE_PATH || path.resolve(process.cwd(), 'projectxray.db'),
  MOCK_AI: process.env.MOCK_AI !== 'false', // Defaults to true
  API_PREFIX: '/api',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '500', 10),
  DEFAULT_CONFIDENCE_THRESHOLD: parseInt(process.env.DEFAULT_CONFIDENCE_THRESHOLD || '70', 10),
} as const;
