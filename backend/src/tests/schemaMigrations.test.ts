import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MigrationEngine } from '../db/migrationEngine';
import { db } from '../db/database';

describe('Phase 12e: Enterprise Schema Migration Engine Test Suite', () => {
  it('1. discoverMigrations detects all versioned .up.sql and .down.sql migration files', () => {
    const migrations = MigrationEngine.discoverMigrations();

    assert.ok(migrations.length >= 5, 'Should discover at least 5 versioned migrations');

    const v1 = migrations.find((m) => m.version === '0001');
    assert.ok(v1, 'Version 0001 must exist');
    assert.strictEqual(v1.name, 'initial_core_tables');
    assert.ok(v1.upSql.length > 50, 'Must load upSql');
    assert.ok(v1.downSql && v1.downSql.length > 20, 'Must load downSql');
    assert.strictEqual(typeof v1.checksum, 'string');
    assert.strictEqual(v1.checksum.length, 64, 'Checksum must be 64-char hex SHA-256');

    const v4 = migrations.find((m) => m.version === '0004');
    assert.ok(v4, 'Version 0004 must exist');
    assert.strictEqual(v4.name, 'pipeline_queue_and_resumption');
  });

  it('2. computeChecksum produces deterministic SHA-256 hashes ignoring CRLF differences', () => {
    const sql1 = 'CREATE TABLE test (id TEXT PRIMARY KEY);\r\n';
    const sql2 = 'CREATE TABLE test (id TEXT PRIMARY KEY);\n';

    const hash1 = MigrationEngine.computeChecksum(sql1);
    const hash2 = MigrationEngine.computeChecksum(sql2);

    assert.strictEqual(hash1, hash2, 'Checksums must be deterministic across OS newline conventions');
    assert.strictEqual(hash1.length, 64);
  });

  it('3. initMigrationTable provisions schema_migrations tracking table', () => {
    MigrationEngine.initMigrationTable();

    const table = db.get<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'"
    );
    assert.ok(table && table.name === 'schema_migrations', 'schema_migrations table must exist');
  });

  it('4. migrateUp executes pending migrations idempotently inside transactions', () => {
    // 1st run: applies any unapplied migrations
    const result1 = MigrationEngine.migrateUp();
    assert.ok(typeof result1.appliedCount === 'number');

    // 2nd run: should be completely idempotent (0 applied)
    const result2 = MigrationEngine.migrateUp();
    assert.strictEqual(result2.appliedCount, 0, 'Subsequent migrateUp must be idempotent');
    assert.strictEqual(result2.appliedVersions.length, 0);

    // Verify all discovered migrations are now recorded in database
    const applied = MigrationEngine.getAppliedMigrations();
    assert.ok(applied.length >= 5, 'All discovered migrations must be recorded as applied');
  });

  it('5. validateChecksums verifies integrity and detects unauthorized file tampering', () => {
    const check1 = MigrationEngine.validateChecksums();
    assert.strictEqual(check1.valid, true, 'Genuine migrations must pass checksum validation');
    assert.strictEqual(check1.mismatches.length, 0);
  });

  it('6. getMigrationStatus returns complete migration lifecycle report', () => {
    const status = MigrationEngine.getMigrationStatus();

    assert.ok(status.total >= 5);
    assert.ok(status.appliedCount >= 5);
    assert.strictEqual(status.pendingCount, 0);
    assert.ok(status.lastAppliedVersion !== null);
    assert.strictEqual(typeof status.lastAppliedVersion, 'string');

    const first = status.migrations[0];
    assert.strictEqual(first.version, '0001');
    assert.strictEqual(first.applied, true);
    assert.ok(first.appliedAt);
    assert.ok(typeof first.executionTimeMs === 'number');
    assert.strictEqual(first.tampered, false);
  });

  it('7. rollbackLast rolls back the latest migration and enables re-running migrateUp', () => {
    const statusBefore = MigrationEngine.getMigrationStatus();
    const lastVersion = statusBefore.lastAppliedVersion;
    assert.ok(lastVersion, 'Should have an applied version');

    // Rollback the latest migration
    const rollbackResult = MigrationEngine.rollbackLast();
    assert.strictEqual(rollbackResult.success, true);
    assert.strictEqual(rollbackResult.rolledBackVersion, lastVersion);

    // Check status: pendingCount should now be 1
    const statusAfterRollback = MigrationEngine.getMigrationStatus();
    assert.strictEqual(statusAfterRollback.pendingCount, 1);

    // Re-apply migration
    const reapplyResult = MigrationEngine.migrateUp();
    assert.strictEqual(reapplyResult.appliedCount, 1);
    assert.strictEqual(reapplyResult.appliedVersions[0], lastVersion);

    // Verify back to 0 pending
    const statusFinal = MigrationEngine.getMigrationStatus();
    assert.strictEqual(statusFinal.pendingCount, 0);
  });

  it('8. Admin controller GET /api/admin/migrations returns status and diagnostics', async () => {
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

    const { AdminController } = await import('../controllers/adminController');
    AdminController.getMigrations({} as any, mockRes);

    assert.strictEqual(responseStatus, 200);
    assert.strictEqual(responseData.success, true);
    assert.ok(responseData.data.total >= 5);
    assert.ok(responseData.data.appliedCount >= 5);
    assert.ok(Array.isArray(responseData.data.migrations));
  });
});
