import dotenv from 'dotenv';
import path from 'node:path';

// Load .env from root or backend directory
dotenv.config();

/**
 * Development-only fallback signing key.
 * In production a strong JWT_SECRET MUST be supplied; `assertProductionConfig`
 * refuses to boot otherwise so we never silently run with a public key.
 */
const DEV_FALLBACK_JWT_SECRET = 'projectxray-local-development-secret-do-not-use-in-production';

const isTestEnv = process.env.NODE_ENV === 'test' || process.argv.some(a => a.includes('--test') || a.includes('.test.ts'));
const nodeEnv = isTestEnv ? 'test' : (process.env.NODE_ENV || 'development');
const jwtSecret = process.env.JWT_SECRET?.trim() || (nodeEnv === 'production' ? '' : DEV_FALLBACK_JWT_SECRET);

export const ENV = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: nodeEnv,
  DATABASE_PATH: process.env.DATABASE_PATH || path.resolve(process.cwd(), 'projectxray.db'),
  DATABASE_DIALECT: (process.env.DATABASE_DIALECT || (process.env.DATABASE_URL?.startsWith('postgres') ? 'postgres' : 'sqlite')) as 'sqlite' | 'postgres',
  DATABASE_URL: process.env.DATABASE_URL || '',
  PG_HOST: process.env.PG_HOST || 'localhost',
  PG_PORT: parseInt(process.env.PG_PORT || '5432', 10),
  PG_DATABASE: process.env.PG_DATABASE || 'projectxray',
  PG_USER: process.env.PG_USER || 'postgres',
  PG_PASSWORD: process.env.PG_PASSWORD || '',
  PG_MAX_POOL: parseInt(process.env.PG_MAX_POOL || '25', 10),
  PG_SSL: process.env.PG_SSL === 'true',
  MOCK_AI: process.env.MOCK_AI !== 'false', // Defaults to true
  API_PREFIX: '/api',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '500', 10),
  DEFAULT_CONFIDENCE_THRESHOLD: parseInt(process.env.DEFAULT_CONFIDENCE_THRESHOLD || '70', 10),

  // Authentication (Scenario 14: RS256 Asymmetric Keys & Zero-Trust)
  JWT_SECRET: jwtSecret,
  JWT_TTL_SECONDS: parseInt(process.env.JWT_TTL_SECONDS || String(60 * 60 * 12), 10),
  JWT_ALGORITHM: (process.env.JWT_ALGORITHM || 'RS256') as 'RS256' | 'HS256',
  JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY || '',
  JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY || '',
  /**
   * Dev auth bypass is permanently disabled. Zero-trust security requires
   * cryptographic authentication in every environment.
   */
  ALLOW_DEV_AUTH_BYPASS: false,

  // AI Provider Credentials & Configuration (Scenario 10)
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'gemini',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || '',

  // Local AI (Ollama / vLLM / LM Studio / LocalAI) Zero-Cost & Offline Real LLM Engine
  LOCAL_AI_BASE_URL: process.env.LOCAL_AI_BASE_URL || process.env.OLLAMA_BASE_URL || '',
  LOCAL_AI_MODEL: process.env.LOCAL_AI_MODEL || 'llama3',

  // Redis & BullMQ Job Queue Configuration (Scenario 13 & Roadmap)
  REDIS_URL: process.env.REDIS_URL || '',
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
  REDIS_DB: parseInt(process.env.REDIS_DB || '0', 10),
  PIPELINE_CONCURRENCY: parseInt(process.env.PIPELINE_CONCURRENCY || '2', 10),
  QUEUE_NAME: process.env.QUEUE_NAME || 'evaluation-pipeline-queue',

  // Rate Limiting (Redis-backed via rate-limiter-flexible)
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || String(15 * 60 * 1000), 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || (nodeEnv === 'development' ? '10000' : '100'),
    10
  ),
  RATE_LIMIT_AUTH_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_AUTH_MAX_REQUESTS || (nodeEnv === 'development' ? '1000' : '10'),
    10
  ),

  // Audio Processing & Whisper Speech-to-Text Configuration
  WHISPER_PROVIDER: process.env.WHISPER_PROVIDER || 'auto', // 'whisper_api' | 'whisper_cpp' | 'ai_audio' | 'auto'
  WHISPER_CPP_PATH: process.env.WHISPER_CPP_PATH || '',
  WHISPER_MODEL_PATH: process.env.WHISPER_MODEL_PATH || '',
  FFMPEG_PATH: process.env.FFMPEG_PATH || 'ffmpeg',
  FFPROBE_PATH: process.env.FFPROBE_PATH || 'ffprobe',

  // Cloud Object Storage (AWS S3, MinIO, Cloudflare R2, Local Disk)
  STORAGE_DRIVER: (process.env.STORAGE_DRIVER || 'local') as 'local' | 's3' | 'minio' | 'r2' | 'memory',
  STORAGE_LOCAL_DIR: process.env.STORAGE_LOCAL_DIR || path.resolve(process.cwd(), 'uploads'),
  STORAGE_S3_BUCKET: process.env.STORAGE_S3_BUCKET || process.env.S3_BUCKET || 'projectxray-uploads',
  STORAGE_S3_REGION: process.env.STORAGE_S3_REGION || process.env.AWS_REGION || 'us-east-1',
  STORAGE_S3_ENDPOINT: process.env.STORAGE_S3_ENDPOINT || process.env.S3_ENDPOINT || '',
  STORAGE_S3_ACCESS_KEY: process.env.STORAGE_S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || '',
  STORAGE_S3_SECRET_KEY: process.env.STORAGE_S3_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
  STORAGE_S3_FORCE_PATH_STYLE: process.env.STORAGE_S3_FORCE_PATH_STYLE === 'true' || process.env.MINIO_MODE === 'true',
  STORAGE_PRESIGNED_URL_TTL_SECONDS: parseInt(process.env.STORAGE_PRESIGNED_URL_TTL_SECONDS || '900', 10),
  STORAGE_PUBLIC_URL_BASE: process.env.STORAGE_PUBLIC_URL_BASE || '',
} as const;

export const isProduction = (): boolean => ENV.NODE_ENV === 'production';

/**
 * Fail-fast production configuration guard.
 * Called once at server boot; throws if security-critical settings are missing.
 */
export function assertProductionConfig(): void {
  if (!isProduction()) return;

  const problems: string[] = [];

  if (!ENV.JWT_SECRET) {
    problems.push('JWT_SECRET is required in production (generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))").');
  } else if (ENV.JWT_SECRET.length < 32) {
    problems.push('JWT_SECRET must be at least 32 characters in production.');
  }

  if (ENV.CORS_ORIGIN.trim() === '*') {
    problems.push('CORS_ORIGIN must not be a wildcard in production.');
  }

  if (problems.length > 0) {
    throw new Error(
      `Refusing to start: insecure production configuration.\n - ${problems.join('\n - ')}`
    );
  }
}
