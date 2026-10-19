import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  convertSqlPlaceholders,
  getPostgresConfig,
  PostgresAdapter,
  PostgresProductionBlueprint,
} from '../db/postgresAdapter';
import {
  db,
  getDb,
  getDriverStatus,
  testDatabaseConnection,
  isPostgresActive,
} from '../db/database';

describe('Phase 12d: Enterprise Database Engine & PostgreSQL Adapter Test Suite', () => {
  it('1. convertSqlPlaceholders converts unquoted ? to positional parameters $1, $2, $3', () => {
    const rawSql = 'SELECT * FROM projects WHERE id = ? AND architecture_type = ? AND category = ?;';
    const converted = convertSqlPlaceholders(rawSql);

    assert.strictEqual(
      converted,
      'SELECT * FROM projects WHERE id = $1 AND architecture_type = $2 AND category = $3;'
    );
  });

  it('2. convertSqlPlaceholders preserves question marks inside single-quoted string literals', () => {
    const queryWithString = "SELECT * FROM claims WHERE claim_text = 'Did the model achieve 95% accuracy?' AND status = ?;";
    const converted = convertSqlPlaceholders(queryWithString);

    assert.strictEqual(
      converted,
      "SELECT * FROM claims WHERE claim_text = 'Did the model achieve 95% accuracy?' AND status = $1;"
    );
  });

  it('3. convertSqlPlaceholders handles escaped single quotes inside strings correctly', () => {
    const queryWithEscapedQuote = "SELECT * FROM reports WHERE title = 'It''s a breakthrough?' AND user_id = ? AND status = ?;";
    const converted = convertSqlPlaceholders(queryWithEscapedQuote);

    assert.strictEqual(
      converted,
      "SELECT * FROM reports WHERE title = 'It''s a breakthrough?' AND user_id = $1 AND status = $2;"
    );
  });

  it('4. getPostgresConfig properly resolves default pool and connection parameters', () => {
    const config = getPostgresConfig();

    assert.ok(typeof config.host === 'string');
    assert.ok(typeof config.port === 'number');
    assert.ok(config.port > 0);
    assert.ok(typeof config.database === 'string');
    assert.ok(config.maxConnections >= 1);
    assert.ok(config.idleTimeoutMillis >= 1000);
    assert.ok(config.connectionTimeoutMillis >= 1000);
  });

  it('5. PostgresProductionBlueprint provides comprehensive DDL with multi-table relational schema and indices', () => {
    const ddl = PostgresProductionBlueprint.getMigrationDDL();

    // Verify key tables are provisioned
    assert.ok(ddl.includes('CREATE TABLE IF NOT EXISTS projects'), 'Must create projects table');
    assert.ok(ddl.includes('CREATE TABLE IF NOT EXISTS evaluations'), 'Must create evaluations table');
    assert.ok(ddl.includes('CREATE TABLE IF NOT EXISTS claims'), 'Must create claims table');
    assert.ok(ddl.includes('CREATE TABLE IF NOT EXISTS claim_evidence'), 'Must create claim_evidence table');
    assert.ok(ddl.includes('CREATE TABLE IF NOT EXISTS documents'), 'Must create documents table');
    assert.ok(ddl.includes('CREATE TABLE IF NOT EXISTS document_architecture'), 'Must create document_architecture table');
    assert.ok(ddl.includes('CREATE TABLE IF NOT EXISTS videos'), 'Must create videos table');
    assert.ok(ddl.includes('CREATE TABLE IF NOT EXISTS analysis_events'), 'Must create analysis_events table');
    assert.ok(ddl.includes('CREATE TABLE IF NOT EXISTS pipeline_queue_jobs'), 'Must create pipeline_queue_jobs table');

    // Verify performance indices
    assert.ok(ddl.includes('idx_claims_evaluation_id'), 'Must create claim evaluation index');
    assert.ok(ddl.includes('idx_pipeline_queue_status'), 'Must create queue status index');
  });

  it('6. PostgresAdapter instance returns driver status supporting concurrent cloud writers', () => {
    const adapter = new PostgresAdapter({
      host: 'cloud-postgres.internal',
      port: 5432,
      database: 'cloud_projectxray',
      user: 'cloud_user',
      password: 'password',
      maxConnections: 50,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: false,
    });

    const status = adapter.getDriverStatus();
    assert.ok(status.poolSize >= 25, 'Pool size must reflect configuration');
    assert.strictEqual(status.supportsConcurrentWriters, true, 'PostgreSQL must support concurrent writers');
    assert.strictEqual(status.databaseName, 'cloud_projectxray');
  });

  it('7. SQLite native engine maintains WAL mode, foreign keys, and synchronous query execution', () => {
    const rawDb = getDb();

    // Verify WAL journal mode
    const walResult = rawDb.prepare('PRAGMA journal_mode;').get() as { journal_mode: string };
    assert.strictEqual(walResult.journal_mode.toLowerCase(), 'wal', 'SQLite must operate in WAL mode');

    // Verify Foreign keys enabled
    const fkResult = rawDb.prepare('PRAGMA foreign_keys;').get() as { foreign_keys: number };
    assert.strictEqual(fkResult.foreign_keys, 1, 'Foreign keys must be enforced');

    // Verify synchronous query methods
    const projects = db.all('SELECT id, name FROM projects LIMIT 2');
    assert.ok(Array.isArray(projects), 'db.all must return an array');

    const singleProject = db.get('SELECT id, name FROM projects LIMIT 1');
    assert.ok(singleProject && typeof singleProject.id === 'string', 'db.get must return single record');
  });

  it('8. SQLite transactions rollback cleanly on error without corrupting state', () => {
    const testId = `rollback_test_${Date.now()}`;

    assert.throws(() => {
      db.transaction(() => {
        db.run(
          `INSERT INTO projects (id, name, architecture_type, category, domain, problem_statement, solution_description, team_name)
           VALUES (?, ?, 'SOFTWARE', 'Test', 'Test', 'Prob', 'Sol', 'Team')`,
          testId,
          'Rollback Test Project'
        );

        // Force intentional exception to trigger rollback
        throw new Error('Simulated transaction failure');
      });
    }, /Simulated transaction failure/);

    // Verify row was NOT committed
    const found = db.get('SELECT id FROM projects WHERE id = ?', testId);
    assert.strictEqual(found, undefined, 'Rolled-back record must not exist in database');
  });

  it('9. testDatabaseConnection returns live health metrics for the active engine', async () => {
    const health = await testDatabaseConnection();

    assert.ok(health.dialect === 'sqlite' || health.dialect === 'postgres');
    assert.strictEqual(health.connected, true, 'Active database engine must be connected');
    assert.ok(typeof health.latencyMs === 'number');
    assert.ok(health.latencyMs >= 0);
  });

  it('10. Admin controller GET /api/admin/database returns engine diagnostics and driver status', async () => {
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
    await AdminController.getDatabaseStatus({} as any, mockRes);

    assert.strictEqual(responseStatus, 200);
    assert.strictEqual(responseData.success, true);
    assert.ok(responseData.data.dialect === 'sqlite' || responseData.data.dialect === 'postgres');
    assert.strictEqual(typeof responseData.data.poolSize, 'number');
    assert.strictEqual(typeof responseData.data.supportsConcurrentWriters, 'boolean');
    assert.strictEqual(responseData.data.health.connected, true);
  });

  it('11. Drizzle ORM schema defines all relational cloud tables with strict column typings', async () => {
    const drizzle = await import('../db/drizzleSchema');

    assert.ok(drizzle.projects, 'Drizzle projects table must exist');
    assert.ok(drizzle.evaluations, 'Drizzle evaluations table must exist');
    assert.ok(drizzle.claims, 'Drizzle claims table must exist');
    assert.ok(drizzle.claimEvidence, 'Drizzle claimEvidence table must exist');
    assert.ok(drizzle.documents, 'Drizzle documents table must exist');
    assert.ok(drizzle.documentArchitecture, 'Drizzle documentArchitecture table must exist');
    assert.ok(drizzle.videos, 'Drizzle videos table must exist');
    assert.ok(drizzle.analysisEvents, 'Drizzle analysisEvents table must exist');
    assert.ok(drizzle.pipelineQueueJobs, 'Drizzle pipelineQueueJobs table must exist');
  });
});
