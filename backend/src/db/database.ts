import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENV } from '../config/env';
import { createModuleLogger } from '../utils/logger';

const dbLogger = createModuleLogger('Database');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    // Ensure parent directory exists
    const dbDir = path.dirname(ENV.DATABASE_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    dbInstance = new DatabaseSync(ENV.DATABASE_PATH);

    // Enforce relational integrity and performance settings
    dbInstance.exec('PRAGMA foreign_keys = ON;');
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA busy_timeout = 30000;');
    dbInstance.exec('PRAGMA synchronous = NORMAL;');
    dbInstance.exec('PRAGMA cache_size = -64000;');
    dbInstance.exec('PRAGMA temp_store = MEMORY;');
    dbInstance.exec('PRAGMA wal_autocheckpoint = 1000;');
    dbInstance.exec('PRAGMA mmap_size = 268435456;');

    // Auto-run schema migrations
    initSchema(dbInstance);
  }
  return dbInstance;
}

import { MigrationEngine } from './migrationEngine';

export function initSchema(db: DatabaseSync = getDb()): void {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }

  // Execute versioned migrations
  try {
    MigrationEngine.migrateUp();
  } catch (migErr) {
    dbLogger.warn('Versioned migration runner notice', { error: migErr });
  }

  // Migrate projects table if legacy CHECK constraint is present
  try {
    const projectsSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='projects'").get() as { sql?: string } | undefined;
    if (projectsSchema?.sql && !projectsSchema.sql.includes('HYBRID')) {
      db.exec('PRAGMA foreign_keys = OFF;');
      db.exec(`
        CREATE TABLE IF NOT EXISTS projects_migration (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          architecture_type TEXT NOT NULL CHECK(architecture_type IN ('SOFTWARE', 'HARDWARE', 'HYBRID', 'BIOMEDICAL')),
          category TEXT NOT NULL,
          domain TEXT NOT NULL,
          tagline TEXT,
          problem_statement TEXT NOT NULL,
          solution_description TEXT NOT NULL,
          team_name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO projects_migration SELECT * FROM projects;
        DROP TABLE projects;
        ALTER TABLE projects_migration RENAME TO projects;
      `);
      db.exec('PRAGMA foreign_keys = ON;');
    }
  } catch (migErr) {
    dbLogger.warn('Projects table check-constraint migration notice', { error: migErr });
  }

  // Migrate document_architecture table if legacy CHECK constraint is present
  try {
    const docArchSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='document_architecture'").get() as { sql?: string } | undefined;
    if (docArchSchema?.sql && !docArchSchema.sql.includes('BIOMEDICAL')) {
      db.exec('PRAGMA foreign_keys = OFF;');
      db.exec(`
        CREATE TABLE IF NOT EXISTS document_architecture_migration (
          id TEXT PRIMARY KEY,
          document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
          evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
          nodes_json TEXT NOT NULL,
          relationships_json TEXT NOT NULL,
          architecture_type TEXT NOT NULL CHECK(architecture_type IN ('SOFTWARE', 'HARDWARE', 'HYBRID', 'BIOMEDICAL')),
          confidence REAL NOT NULL DEFAULT 1.0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO document_architecture_migration SELECT * FROM document_architecture;
        DROP TABLE document_architecture;
        ALTER TABLE document_architecture_migration RENAME TO document_architecture;
      `);
      db.exec('PRAGMA foreign_keys = ON;');
    }
  } catch (migErr) {
    dbLogger.warn('Document architecture migration notice', { error: migErr });
  }

  // Migrate analysis_events table if legacy CHECK constraint is present
  try {
    const analysisEventsSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='analysis_events'").get() as { sql?: string } | undefined;
    if (analysisEventsSchema?.sql && !analysisEventsSchema.sql.includes('MILESTONE')) {
      db.exec('PRAGMA foreign_keys = OFF;');
      db.exec(`
        CREATE TABLE IF NOT EXISTS analysis_events_migration (
          id TEXT PRIMARY KEY,
          evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
          video_id TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
          timestamp REAL NOT NULL,
          event_type TEXT NOT NULL CHECK(event_type IN (
            'SLIDE_CHANGE', 'SPEECH', 'CLAIM', 'TECHNICAL_MENTION',
            'DEMO', 'MILESTONE', 'ANOMALY', 'ERROR', 'RESULT', 'QUESTION', 'ANSWER', 'SCENE_CHANGE'
          )),
          description TEXT NOT NULL,
          confidence REAL NOT NULL DEFAULT 1.0,
          evidence_ids_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO analysis_events_migration SELECT * FROM analysis_events;
        DROP TABLE analysis_events;
        ALTER TABLE analysis_events_migration RENAME TO analysis_events;
        CREATE INDEX IF NOT EXISTS idx_analysis_events_eval ON analysis_events(evaluation_id);
      `);
      db.exec('PRAGMA foreign_keys = ON;');
    }
  } catch (migErr) {
    dbLogger.warn('Analysis events table check-constraint migration notice', { error: migErr });
  }

  // Ensure persistent pipeline queue table exists
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS pipeline_queue_jobs (
        id TEXT PRIMARY KEY,
        evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        execution_id TEXT NOT NULL,
        options_json TEXT,
        resume_from_stage INTEGER DEFAULT 1,
        status TEXT NOT NULL CHECK(status IN ('WAITING', 'ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED')),
        attempts INTEGER NOT NULL DEFAULT 0,
        max_attempts INTEGER NOT NULL DEFAULT 3,
        last_error TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_pipeline_queue_eval ON pipeline_queue_jobs(evaluation_id);
      CREATE INDEX IF NOT EXISTS idx_pipeline_queue_status ON pipeline_queue_jobs(status);
    `);
  } catch (qErr) {
    dbLogger.warn('Pipeline queue table initialization notice', { error: qErr });
  }
}

import { postgresAdapter, convertSqlPlaceholders, type DatabaseDriverStatus } from './postgresAdapter';

export { postgresAdapter, convertSqlPlaceholders, type DatabaseDriverStatus, MigrationEngine };

export function isPostgresActive(): boolean {
  return ENV.DATABASE_DIALECT === 'postgres' || !!ENV.DATABASE_URL?.startsWith('postgres');
}

export function getDriverStatus(): DatabaseDriverStatus {
  if (isPostgresActive()) {
    return postgresAdapter.getDriverStatus();
  }
  return {
    dialect: 'sqlite',
    poolSize: 1,
    walMode: true,
    busyTimeoutMs: 30000,
    supportsConcurrentWriters: false,
    databaseName: path.basename(ENV.DATABASE_PATH),
    host: 'localhost',
  };
}

export async function testDatabaseConnection(): Promise<{ dialect: string; connected: boolean; latencyMs: number; error?: string }> {
  const t0 = Date.now();
  if (isPostgresActive()) {
    const res = await postgresAdapter.testConnection();
    return { dialect: 'postgres', ...res };
  } else {
    try {
      getDb().prepare('SELECT 1 as ping').get();
      return { dialect: 'sqlite', connected: true, latencyMs: Date.now() - t0 };
    } catch (err: any) {
      return { dialect: 'sqlite', connected: false, latencyMs: Date.now() - t0, error: err?.message };
    }
  }
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
  postgresAdapter.close().catch(() => {});
}

export interface ConcurrencyMetrics {
  dialect: 'sqlite' | 'postgres';
  supportsConcurrentWriters: boolean;
  totalWrites: number;
  activeWrites: number;
  queuedWrites: number;
  peakConcurrentWrites: number;
  busyRetries: number;
  busyTimeoutMs: number;
  walMode: boolean;
  poolSize: number;
}

let totalWritesCount = 0;
let activeWritesCount = 0;
let queuedWritesCount = 0;
let peakConcurrentWritesCount = 0;
let busyRetriesCount = 0;

export function getConcurrencyMetrics(): ConcurrencyMetrics {
  const isPg = isPostgresActive();
  return {
    dialect: isPg ? 'postgres' : 'sqlite',
    supportsConcurrentWriters: isPg,
    totalWrites: totalWritesCount,
    activeWrites: activeWritesCount,
    queuedWrites: queuedWritesCount,
    peakConcurrentWrites: peakConcurrentWritesCount,
    busyRetries: busyRetriesCount,
    busyTimeoutMs: 30000,
    walMode: !isPg,
    poolSize: isPg ? (postgresAdapter.getDriverStatus().poolSize) : 1,
  };
}

// In-process Async Transaction Queue for Serialized Writes
class TransactionQueue {
  private queue: Promise<void> = Promise.resolve();

  async enqueue<T>(fn: () => Promise<T> | T): Promise<T> {
    queuedWritesCount++;
    const previous = this.queue;
    let releaseLock: () => void;
    this.queue = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });

    await previous;
    queuedWritesCount--;
    activeWritesCount++;
    if (activeWritesCount > peakConcurrentWritesCount) {
      peakConcurrentWritesCount = activeWritesCount;
    }
    totalWritesCount++;

    try {
      return await fn();
    } finally {
      activeWritesCount--;
      releaseLock!();
    }
  }
}

const asyncQueue = new TransactionQueue();

/**
 * Type-safe query helper functions
 */
export const db = {
  all<T = any>(sql: string, ...params: any[]): T[] {
    const stmt = getDb().prepare(sql);
    return stmt.all(...params) as T[];
  },

  get<T = any>(sql: string, ...params: any[]): T | undefined {
    const stmt = getDb().prepare(sql);
    return stmt.get(...params) as T | undefined;
  },

  run(sql: string, ...params: any[]): { changes: number | bigint; lastInsertRowid: number | bigint } {
    totalWritesCount++;
    const stmt = getDb().prepare(sql);
    return stmt.run(...params);
  },

  exec(sql: string): void {
    totalWritesCount++;
    getDb().exec(sql);
  },

  /**
   * Executes a synchronous transaction using BEGIN IMMEDIATE to avoid upgrade deadlocks.
   * If SQLITE_BUSY occurs under high concurrency, retries with exponential jitter backoff.
   */
  transaction<T>(fn: () => T, maxRetries = 10): T {
    const database = getDb();
    let attempt = 0;
    activeWritesCount++;
    if (activeWritesCount > peakConcurrentWritesCount) {
      peakConcurrentWritesCount = activeWritesCount;
    }
    totalWritesCount++;

    try {
      while (true) {
        try {
          database.exec('BEGIN IMMEDIATE TRANSACTION;');
          try {
            const result = fn();
            database.exec('COMMIT;');
            return result;
          } catch (innerErr) {
            try {
              database.exec('ROLLBACK;');
            } catch {
              // Rollback failure is ignored if connection was lost
            }
            throw innerErr;
          }
        } catch (err: any) {
          const isBusy = 
            err?.message?.includes('busy') || 
            err?.code === 'SQLITE_BUSY' || 
            err?.message?.includes('database is locked');

          if (isBusy && attempt < maxRetries) {
            attempt++;
            busyRetriesCount++;
            // Exponential jittered backoff: 25ms - 250ms
            const backoffMs = Math.floor(Math.random() * 35) + (attempt * 25);
            const stop = Date.now() + backoffMs;
            while (Date.now() < stop) {
              // Spin-wait before retry
            }
            continue;
          }
          throw err;
        }
      }
    } finally {
      activeWritesCount--;
    }
  },

  /**
   * Executes an asynchronous write transaction serialized through the in-process queue
   */
  async transactionAsync<T>(fn: () => Promise<T> | T): Promise<T> {
    return asyncQueue.enqueue(() => {
      return this.transaction(fn as any);
    });
  }
};
