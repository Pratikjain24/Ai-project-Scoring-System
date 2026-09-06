import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENV } from '../config/env';

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

    // Auto-run schema migrations
    initSchema(dbInstance);
  }
  return dbInstance;
}

export function initSchema(db: DatabaseSync = getDb()): void {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

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
    const stmt = getDb().prepare(sql);
    return stmt.run(...params);
  },

  exec(sql: string): void {
    getDb().exec(sql);
  },

  transaction<T>(fn: () => T): T {
    const database = getDb();
    database.exec('BEGIN TRANSACTION;');
    try {
      const result = fn();
      database.exec('COMMIT;');
      return result;
    } catch (err) {
      database.exec('ROLLBACK;');
      throw err;
    }
  }
};
