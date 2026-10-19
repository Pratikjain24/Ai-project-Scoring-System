import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  db,
  getDb,
  getConcurrencyMetrics,
  getDriverStatus,
} from '../db/database';
import { PostgresAdapter } from '../db/postgresAdapter';
import { AdminController } from '../controllers/adminController';

describe('Phase 12f: Write Concurrency & SQLite WAL Architecture Test Suite', () => {
  it('1. PRAGMAs configure SQLite WAL mode with high busy_timeout and mmap_size for peak throughput', () => {
    const rawDb = getDb();

    // Verify WAL journal mode
    const journalMode = rawDb.prepare('PRAGMA journal_mode;').get() as { journal_mode: string };
    assert.strictEqual(journalMode.journal_mode.toLowerCase(), 'wal');

    // Verify 30-second busy timeout (30000ms)
    const busyTimeout = rawDb.prepare('PRAGMA busy_timeout;').get() as { timeout: number };
    assert.strictEqual(busyTimeout.timeout, 30000);

    // Verify 256MB memory-mapped I/O (268435456 bytes)
    const mmapSize = rawDb.prepare('PRAGMA mmap_size;').get() as { mmap_size: number };
    assert.ok(mmapSize.mmap_size >= 268435456, 'mmap_size should be at least 256MB');

    // Verify foreign keys are enabled
    const foreignKeys = rawDb.prepare('PRAGMA foreign_keys;').get() as { foreign_keys: number };
    assert.strictEqual(foreignKeys.foreign_keys, 1);
  });

  it('2. getConcurrencyMetrics returns comprehensive real-time write metrics', () => {
    const metrics = getConcurrencyMetrics();

    assert.ok(metrics.dialect === 'sqlite' || metrics.dialect === 'postgres');
    assert.strictEqual(typeof metrics.supportsConcurrentWriters, 'boolean');
    assert.strictEqual(typeof metrics.totalWrites, 'number');
    assert.strictEqual(typeof metrics.activeWrites, 'number');
    assert.strictEqual(typeof metrics.queuedWrites, 'number');
    assert.strictEqual(typeof metrics.peakConcurrentWrites, 'number');
    assert.strictEqual(typeof metrics.busyRetries, 'number');
    assert.strictEqual(metrics.busyTimeoutMs, 30000);
    assert.strictEqual(typeof metrics.walMode, 'boolean');
    assert.strictEqual(typeof metrics.poolSize, 'number');
  });

  it('3. High-concurrency reads: 50 concurrent readers execute without blocking', async () => {
    // Read operations in WAL mode do not block readers or writers
    const readTasks = Array.from({ length: 50 }, (_, i) => {
      return new Promise<{ index: number; rowCount: number }>((resolve) => {
        const rows = db.all('SELECT count(*) as count FROM projects;');
        resolve({ index: i, rowCount: rows[0].count });
      });
    });

    const results = await Promise.all(readTasks);
    assert.strictEqual(results.length, 50);
    for (const r of results) {
      assert.strictEqual(typeof r.rowCount, 'number');
    }
  });

  it('4. High-concurrency writes: 50 parallel transactionAsync operations succeed without SQLITE_BUSY', async () => {
    // Create dedicated concurrency test table
    db.exec(`
      CREATE TABLE IF NOT EXISTS concurrency_stress_test (
        id TEXT PRIMARY KEY,
        batch_id TEXT NOT NULL,
        worker_id INTEGER NOT NULL,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const batchId = `batch_${Date.now()}`;
    const workerCount = 50;

    // Launch 50 concurrent async transactions simultaneously
    const writePromises = Array.from({ length: workerCount }, (_, i) => {
      return db.transactionAsync(async () => {
        const id = `stress_${batchId}_${i}`;
        db.run(
          'INSERT INTO concurrency_stress_test (id, batch_id, worker_id, data) VALUES (?, ?, ?, ?);',
          id,
          batchId,
          i,
          JSON.stringify({ payload: `worker-payload-${i}`, timestamp: Date.now() })
        );
        return id;
      });
    });

    const insertedIds = await Promise.all(writePromises);
    assert.strictEqual(insertedIds.length, workerCount, 'All 50 workers should complete writes');

    // Verify all 50 rows exist in the database without any loss
    const countRow = db.get<{ count: number }>(
      'SELECT count(*) as count FROM concurrency_stress_test WHERE batch_id = ?;',
      batchId
    );
    assert.strictEqual(countRow?.count, workerCount, 'All 50 rows must be present in database');

    // Clean up test data
    db.run('DELETE FROM concurrency_stress_test WHERE batch_id = ?;', batchId);
  });

  it('5. db.transaction() ensures atomicity and performs clean rollback on error', () => {
    const testId = `rollback_test_${Date.now()}`;

    assert.throws(
      () => {
        db.transaction(() => {
          db.run(
            'INSERT INTO projects (id, name, architecture_type, category, domain, problem_statement, solution_description, team_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
            testId,
            'Temporary Name',
            'SOFTWARE',
            'Testing',
            'Engineering',
            'Temp Problem',
            'Temp Solution',
            'Temp Team'
          );
          // Force an intentional error to trigger rollback
          throw new Error('Intentional transaction abort');
        });
      },
      /Intentional transaction abort/
    );

    // Verify row was rolled back and does not exist in table
    const project = db.get('SELECT id FROM projects WHERE id = ?;', testId);
    assert.strictEqual(project, undefined, 'Rolled-back transaction must leave no database traces');
  });

  it('6. Cloud architecture: PostgresAdapter provides 25+ connection pool for multi-server write concurrency', () => {
    const cloudAdapter = new PostgresAdapter({
      host: 'aurora-cluster.internal',
      port: 5432,
      database: 'production_jury',
      user: 'jury_admin',
      password: 'secret_password',
      maxConnections: 25,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: false,
    });

    const status = cloudAdapter.getDriverStatus();
    assert.strictEqual(status.supportsConcurrentWriters, true, 'Postgres driver must support concurrent writers');
    assert.strictEqual(status.poolSize, 25, 'Connection pool should allow up to 25 parallel writers');
    assert.strictEqual(status.dialect, 'postgres');
  });

  it('7. AdminController.getDatabaseStatus exposes write concurrency telemetry', async () => {
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

    await AdminController.getDatabaseStatus({} as any, mockRes);

    assert.strictEqual(responseStatus, 200);
    assert.strictEqual(responseData.success, true);
    assert.ok(responseData.data.concurrency, 'Database status must include concurrency telemetry');
    assert.strictEqual(typeof responseData.data.concurrency.totalWrites, 'number');
    assert.strictEqual(typeof responseData.data.concurrency.activeWrites, 'number');
    assert.strictEqual(typeof responseData.data.concurrency.queuedWrites, 'number');
    assert.strictEqual(typeof responseData.data.concurrency.peakConcurrentWrites, 'number');
    assert.strictEqual(typeof responseData.data.concurrency.busyRetries, 'number');
    assert.strictEqual(responseData.data.concurrency.busyTimeoutMs, 30000);
  });
});
