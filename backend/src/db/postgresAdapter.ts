// ====================================================
// PROJECTX-RAY AI - POSTGRESQL PRODUCTION ADAPTER & MIGRATION ENGINE
// Enterprise Cloud Database Adapter supporting AWS RDS, Supabase, Neon, Cloud SQL
// Provides connection pooling, automatic SQL dialect conversion, and schema migration
// ====================================================

import pg from 'pg';
import { ENV } from '../config/env';
import { createModuleLogger } from '../utils/logger';

const { Pool } = pg;
const logger = createModuleLogger('PostgresAdapter');

export interface PostgresConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  maxConnections: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  ssl: boolean | { rejectUnauthorized: boolean };
}

export interface DatabaseDriverStatus {
  dialect: 'sqlite' | 'postgres';
  poolSize: number;
  walMode: boolean;
  busyTimeoutMs: number;
  supportsConcurrentWriters: boolean;
  connected?: boolean;
  latencyMs?: number;
  databaseName?: string;
  host?: string;
}

/**
 * Resolves PostgreSQL configuration from ENV / DATABASE_URL
 */
export function getPostgresConfig(): PostgresConfig {
  const connStr = ENV.DATABASE_URL?.trim();
  const isProd = ENV.NODE_ENV === 'production';

  return {
    connectionString: connStr || undefined,
    host: ENV.PG_HOST || 'localhost',
    port: ENV.PG_PORT || 5432,
    database: ENV.PG_DATABASE || 'projectxray',
    user: ENV.PG_USER || 'postgres',
    password: ENV.PG_PASSWORD || '',
    maxConnections: ENV.PG_MAX_POOL || 25,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: ENV.PG_SSL ? { rejectUnauthorized: false } : (isProd && connStr ? { rejectUnauthorized: false } : false),
  };
}

/**
 * Converts SQLite-style positional `?` placeholders into PostgreSQL `$1, $2, $3...` placeholders,
 * safely ignoring any `?` inside single-quoted string literals.
 */
export function convertSqlPlaceholders(sql: string): string {
  let paramIndex = 1;
  let inString = false;
  let result = '';

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (char === "'") {
      // Check for escaped quote ''
      if (inString && sql[i + 1] === "'") {
        result += "''";
        i++;
        continue;
      }
      inString = !inString;
      result += char;
    } else if (char === '?' && !inString) {
      result += `$${paramIndex++}`;
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * PostgreSQL Production Adapter implementing unified database execution methods
 */
export class PostgresAdapter {
  private pool: pg.Pool | null = null;
  private config: PostgresConfig;

  constructor(config: PostgresConfig = getPostgresConfig()) {
    this.config = config;
  }

  /**
   * Lazily initializes connection pool
   */
  public getPool(): pg.Pool {
    if (!this.pool) {
      const poolConfig: pg.PoolConfig = this.config.connectionString
        ? {
            connectionString: this.config.connectionString,
            max: this.config.maxConnections,
            idleTimeoutMillis: this.config.idleTimeoutMillis,
            connectionTimeoutMillis: this.config.connectionTimeoutMillis,
            ssl: this.config.ssl,
          }
        : {
            host: this.config.host,
            port: this.config.port,
            database: this.config.database,
            user: this.config.user,
            password: this.config.password,
            max: this.config.maxConnections,
            idleTimeoutMillis: this.config.idleTimeoutMillis,
            connectionTimeoutMillis: this.config.connectionTimeoutMillis,
            ssl: this.config.ssl,
          };

      this.pool = new Pool(poolConfig);

      this.pool.on('error', (err) => {
        logger.error('Unexpected error on idle PostgreSQL client', { error: err.message });
      });
    }

    return this.pool;
  }

  /**
   * Proactively verifies connectivity and returns ping latency
   */
  async testConnection(timeoutMs = 3000): Promise<{ connected: boolean; latencyMs: number; error?: string }> {
    const t0 = Date.now();
    try {
      const pool = this.getPool();
      const res = await Promise.race([
        pool.query('SELECT 1 as ping'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Postgres ping timed out after ${timeoutMs}ms`)), timeoutMs)
        ),
      ]);
      const latencyMs = Date.now() - t0;
      return { connected: !!res, latencyMs };
    } catch (err: any) {
      return { connected: false, latencyMs: Date.now() - t0, error: err?.message || String(err) };
    }
  }

  /**
   * Returns standardized driver status diagnostics
   */
  getDriverStatus(): DatabaseDriverStatus {
    return {
      dialect: 'postgres',
      poolSize: this.config.maxConnections,
      walMode: false,
      busyTimeoutMs: 10000,
      supportsConcurrentWriters: true,
      databaseName: this.config.database,
      host: this.config.host,
    };
  }

  /**
   * Fetches single row
   */
  async get<T = any>(sql: string, ...params: any[]): Promise<T | undefined> {
    const convertedSql = convertSqlPlaceholders(sql);
    const pool = this.getPool();
    const res = await pool.query(convertedSql, params);
    return res.rows[0] as T | undefined;
  }

  /**
   * Fetches all matching rows
   */
  async all<T = any>(sql: string, ...params: any[]): Promise<T[]> {
    const convertedSql = convertSqlPlaceholders(sql);
    const pool = this.getPool();
    const res = await pool.query(convertedSql, params);
    return res.rows as T[];
  }

  /**
   * Executes INSERT / UPDATE / DELETE statement
   */
  async run(sql: string, ...params: any[]): Promise<{ changes: number; lastInsertRowid: number | bigint }> {
    const convertedSql = convertSqlPlaceholders(sql);
    const pool = this.getPool();
    const res = await pool.query(convertedSql, params);
    return {
      changes: res.rowCount ?? 0,
      lastInsertRowid: (res.rows[0] as any)?.id ?? 0,
    };
  }

  /**
   * Executes raw DDL or batch SQL statements
   */
  async exec(sql: string): Promise<void> {
    const pool = this.getPool();
    await pool.query(sql);
  }

  /**
   * Executes an atomic transaction on a dedicated pooled client
   */
  async transaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const pool = this.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Initializes PostgreSQL schema DDL
   */
  async initSchema(): Promise<void> {
    const ddl = PostgresProductionBlueprint.getMigrationDDL();
    await this.exec(ddl);
  }

  /**
   * Closes the connection pool
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

/**
 * Singleton production Postgres adapter
 */
export const postgresAdapter = new PostgresAdapter();

/**
 * Complete PostgreSQL Enterprise Migration Blueprint
 */
export class PostgresProductionBlueprint {
  static getMigrationDDL(): string {
    return `
-- ====================================================
-- PROJECTX-RAY AI - POSTGRESQL PRODUCTION MIGRATION
-- Run against AWS RDS / Supabase / Neon / Google Cloud SQL
-- ====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Core Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  architecture_type VARCHAR(32) NOT NULL CHECK(architecture_type IN ('SOFTWARE', 'HARDWARE', 'HYBRID', 'BIOMEDICAL')),
  category VARCHAR(128) NOT NULL,
  domain VARCHAR(128) NOT NULL,
  tagline TEXT,
  problem_statement TEXT NOT NULL,
  solution_description TEXT NOT NULL,
  team_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evaluations Table with Row-Level MVCC
CREATE TABLE IF NOT EXISTS evaluations (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  overall_score DOUBLE PRECISION,
  verdict VARCHAR(64),
  confidence_score DOUBLE PRECISION,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Atomic Claims with JSONB Evidence Arrays
CREATE TABLE IF NOT EXISTS claims (
  id VARCHAR(64) PRIMARY KEY,
  evaluation_id VARCHAR(64) NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  claim_text TEXT NOT NULL,
  claim_type VARCHAR(64) NOT NULL,
  importance VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'UNVERIFIED',
  confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  project_evidence TEXT NOT NULL,
  external_evidence TEXT,
  explanation TEXT NOT NULL,
  recommended_judge_question TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Non-Cyclical Bipartite Evidence Graph
CREATE TABLE IF NOT EXISTS claim_evidence (
  id VARCHAR(64) PRIMARY KEY,
  claim_id VARCHAR(64) NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  evidence_id VARCHAR(64) NOT NULL,
  relationship VARCHAR(32) NOT NULL CHECK(relationship IN ('SUPPORTING', 'CONTRADICTING', 'NEUTRAL')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents Ingestion Table
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  evaluation_id VARCHAR(64) NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(64) NOT NULL,
  file_size BIGINT NOT NULL,
  file_path TEXT NOT NULL,
  ocr_applied BOOLEAN DEFAULT FALSE,
  parsed_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Architecture Nodes & Relationships
CREATE TABLE IF NOT EXISTS document_architecture (
  id VARCHAR(64) PRIMARY KEY,
  document_id VARCHAR(64) REFERENCES documents(id) ON DELETE CASCADE,
  evaluation_id VARCHAR(64) NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  nodes_json JSONB NOT NULL,
  relationships_json JSONB NOT NULL,
  architecture_type VARCHAR(32) NOT NULL CHECK(architecture_type IN ('SOFTWARE', 'HARDWARE', 'HYBRID', 'BIOMEDICAL')),
  confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Multimodal Videos Table
CREATE TABLE IF NOT EXISTS videos (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  evaluation_id VARCHAR(64) NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  duration_seconds DOUBLE PRECISION DEFAULT 0,
  transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Multimodal Analysis Events Table
CREATE TABLE IF NOT EXISTS analysis_events (
  id VARCHAR(64) PRIMARY KEY,
  evaluation_id VARCHAR(64) NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  video_id VARCHAR(64) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  timestamp DOUBLE PRECISION NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  evidence_ids_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Persistent Job Queue Table
CREATE TABLE IF NOT EXISTS pipeline_queue_jobs (
  id VARCHAR(64) PRIMARY KEY,
  evaluation_id VARCHAR(64) NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  execution_id VARCHAR(128) NOT NULL,
  options_json JSONB,
  resume_from_stage INTEGER DEFAULT 1,
  status VARCHAR(32) NOT NULL CHECK(status IN ('WAITING', 'ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Accelerated Querying and Concurrency
CREATE INDEX IF NOT EXISTS idx_claims_evaluation_id ON claims(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_claim_id ON claim_evidence(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_evidence_id ON claim_evidence(evidence_id);
CREATE INDEX IF NOT EXISTS idx_documents_eval ON documents(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_videos_eval ON videos(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_analysis_events_eval ON analysis_events(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_queue_eval ON pipeline_queue_jobs(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_queue_status ON pipeline_queue_jobs(status);
    `;
  }

  static getDriverStatus(): DatabaseDriverStatus {
    return postgresAdapter.getDriverStatus();
  }
}
