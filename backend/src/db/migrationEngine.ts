// ====================================================
// PROJECTX-RAY AI - ENTERPRISE SCHEMA MIGRATION ENGINE
// Versioned forward migrations, rollback tracking, SHA-256 checksum validation,
// and transactional DDL execution across SQLite and PostgreSQL
// ====================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { db } from './database';
import { createModuleLogger } from '../utils/logger';

const logger = createModuleLogger('MigrationEngine');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface MigrationFile {
  version: string;
  name: string;
  upPath: string;
  downPath?: string;
  upSql: string;
  downSql?: string;
  checksum: string;
}

export interface AppliedMigrationRecord {
  id: number;
  version: string;
  name: string;
  applied_at: string;
  checksum: string;
  execution_time_ms: number;
  status: string;
}

export interface MigrationStatusReport {
  total: number;
  appliedCount: number;
  pendingCount: number;
  lastAppliedVersion: string | null;
  migrations: Array<{
    version: string;
    name: string;
    applied: boolean;
    appliedAt?: string;
    executionTimeMs?: number;
    checksum: string;
    tampered?: boolean;
  }>;
}

export class MigrationEngine {
  private static migrationsDir = path.resolve(__dirname, 'migrations');

  /**
   * Override migrations directory (primarily for testing or custom paths)
   */
  static setMigrationsDir(dir: string): void {
    this.migrationsDir = dir;
  }

  static getMigrationsDir(): string {
    return this.migrationsDir;
  }

  /**
   * Computes SHA-256 checksum of SQL content
   */
  static computeChecksum(content: string): string {
    return crypto.createHash('sha256').update(content.trim().replace(/\r\n/g, '\n')).digest('hex');
  }

  /**
   * Initializes the versioned migration tracking table
   */
  static initMigrationTable(): void {
    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        checksum TEXT NOT NULL,
        execution_time_ms INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'SUCCESS'
      );
    `);
  }

  /**
   * Scans and discovers versioned migration files in the migrations directory
   */
  static discoverMigrations(): MigrationFile[] {
    const dir = this.migrationsDir;
    if (!fs.existsSync(dir)) {
      return [];
    }

    const files = fs.readdirSync(dir);
    const upFiles = files.filter((f) => f.endsWith('.up.sql')).sort();

    const discovered: MigrationFile[] = [];

    for (const file of upFiles) {
      const match = file.match(/^(\d+)_(.+)\.up\.sql$/);
      if (!match) continue;

      const version = match[1];
      const name = match[2];
      const upPath = path.join(dir, file);
      const upSql = fs.readFileSync(upPath, 'utf8');
      const checksum = this.computeChecksum(upSql);

      const downFileName = `${version}_${name}.down.sql`;
      const downPath = path.join(dir, downFileName);
      let downSql: string | undefined;

      if (fs.existsSync(downPath)) {
        downSql = fs.readFileSync(downPath, 'utf8');
      }

      discovered.push({
        version,
        name,
        upPath,
        downPath: downSql ? downPath : undefined,
        upSql,
        downSql,
        checksum,
      });
    }

    return discovered;
  }

  /**
   * Fetches all migrations recorded in the database
   */
  static getAppliedMigrations(): AppliedMigrationRecord[] {
    this.initMigrationTable();
    return db.all<AppliedMigrationRecord>(
      'SELECT id, version, name, applied_at, checksum, execution_time_ms, status FROM schema_migrations ORDER BY id ASC'
    );
  }

  /**
   * Returns list of discovered migrations that have not yet been applied
   */
  static getPendingMigrations(): MigrationFile[] {
    const all = this.discoverMigrations();
    const applied = this.getAppliedMigrations();
    const appliedVersions = new Set(applied.map((m) => m.version));

    return all.filter((m) => !appliedVersions.has(m.version));
  }

  /**
   * Validates that applied migrations match current on-disk checksums (tamper detection)
   */
  static validateChecksums(): { valid: boolean; mismatches: string[] } {
    const all = this.discoverMigrations();
    const applied = this.getAppliedMigrations();
    const fileMap = new Map(all.map((m) => [m.version, m]));

    const mismatches: string[] = [];

    for (const record of applied) {
      const file = fileMap.get(record.version);
      if (file && file.checksum !== record.checksum) {
        mismatches.push(
          `Migration ${record.version}_${record.name} checksum mismatch! Database: ${record.checksum.slice(
            0,
            8
          )}..., Disk: ${file.checksum.slice(0, 8)}...`
        );
      }
    }

    return {
      valid: mismatches.length === 0,
      mismatches,
    };
  }

  /**
   * Executes all pending migrations in ascending order inside atomic transactions
   */
  static migrateUp(): { appliedCount: number; appliedVersions: string[] } {
    this.initMigrationTable();

    const { valid, mismatches } = this.validateChecksums();
    if (!valid) {
      logger.warn('Migration checksum mismatch detected', { mismatches });
    }

    const pending = this.getPendingMigrations();
    if (pending.length === 0) {
      logger.info('Database schema is up-to-date; no pending migrations');
      return { appliedCount: 0, appliedVersions: [] };
    }

    const appliedVersions: string[] = [];

    for (const migration of pending) {
      logger.info(`Applying migration: ${migration.version}_${migration.name}`);
      const t0 = Date.now();

      db.transaction(() => {
        // Execute DDL batch
        db.exec(migration.upSql);

        const durationMs = Date.now() - t0;

        // Record migration
        db.run(
          `INSERT INTO schema_migrations (version, name, checksum, execution_time_ms, status)
           VALUES (?, ?, ?, ?, 'SUCCESS')`,
          migration.version,
          migration.name,
          migration.checksum,
          durationMs
        );
      });

      appliedVersions.push(migration.version);
      logger.info(`Successfully applied migration ${migration.version}_${migration.name} (${Date.now() - t0}ms)`);
    }

    return { appliedCount: appliedVersions.length, appliedVersions };
  }

  /**
   * Rolls back the single most recently applied migration using its .down.sql script
   */
  static rollbackLast(): { success: boolean; rolledBackVersion: string | null; message: string } {
    this.initMigrationTable();

    const applied = this.getAppliedMigrations();
    if (applied.length === 0) {
      return { success: false, rolledBackVersion: null, message: 'No applied migrations to rollback' };
    }

    const last = applied[applied.length - 1];
    const all = this.discoverMigrations();
    const match = all.find((m) => m.version === last.version);

    if (!match || !match.downSql) {
      throw new Error(
        `Cannot rollback migration ${last.version}_${last.name}: missing corresponding .down.sql rollback script.`
      );
    }

    logger.warn(`Rolling back migration: ${last.version}_${last.name}`);
    const t0 = Date.now();

    db.transaction(() => {
      // Execute rollback SQL
      db.exec(match.downSql!);

      // Delete from schema_migrations
      db.run('DELETE FROM schema_migrations WHERE version = ?', last.version);
    });

    logger.info(`Successfully rolled back migration ${last.version} (${Date.now() - t0}ms)`);

    return {
      success: true,
      rolledBackVersion: last.version,
      message: `Successfully rolled back migration ${last.version}_${last.name}`,
    };
  }

  /**
   * Generates a comprehensive status report for administrative dashboards
   */
  static getMigrationStatus(): MigrationStatusReport {
    this.initMigrationTable();

    const all = this.discoverMigrations();
    const applied = this.getAppliedMigrations();
    const appliedMap = new Map(applied.map((a) => [a.version, a]));

    const reportItems = all.map((m) => {
      const rec = appliedMap.get(m.version);
      return {
        version: m.version,
        name: m.name,
        applied: !!rec,
        appliedAt: rec?.applied_at,
        executionTimeMs: rec?.execution_time_ms,
        checksum: m.checksum,
        tampered: rec ? rec.checksum !== m.checksum : false,
      };
    });

    const lastApplied = applied.length > 0 ? applied[applied.length - 1].version : null;

    return {
      total: all.length,
      appliedCount: applied.length,
      pendingCount: all.length - applied.length,
      lastAppliedVersion: lastApplied,
      migrations: reportItems,
    };
  }
}
