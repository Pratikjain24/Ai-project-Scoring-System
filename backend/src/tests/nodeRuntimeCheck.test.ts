// =========================================================================
// PROJECTX-RAY AI — NODE RUNTIME CHECK TEST SUITE
// Validates Node >=22 engines enforcement, .npmrc strictness, & node:sqlite
// =========================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { validateNodeRuntime } from '../../../scripts/checkNodeVersion.js';

describe('Phase 17: Node Runtime Check & Engine Enforcement Suite', () => {
  const rootDir = path.resolve(process.cwd());

  // -----------------------------------------------------------------------
  // 1. package.json Engines Field Definition
  // -----------------------------------------------------------------------
  it('1. package.json explicitly declares engines requirement >=22.0.0', () => {
    const pkgPath = path.join(rootDir, 'package.json');
    assert.ok(fs.existsSync(pkgPath), 'package.json must exist');

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    assert.ok(pkg.engines, 'package.json must contain engines field');
    assert.strictEqual(pkg.engines.node, '>=22.0.0', 'node engine must specify >=22.0.0');
    assert.ok(pkg.engines.npm, 'npm engine must be specified');
  });

  // -----------------------------------------------------------------------
  // 2. .npmrc Engine Strictness
  // -----------------------------------------------------------------------
  it('2. .npmrc enforces engine-strict=true to halt invalid installations', () => {
    const npmrcPath = path.join(rootDir, '.npmrc');
    assert.ok(fs.existsSync(npmrcPath), '.npmrc must exist at root');

    const content = fs.readFileSync(npmrcPath, 'utf8');
    assert.ok(content.includes('engine-strict=true'), '.npmrc must enable engine-strict');
  });

  // -----------------------------------------------------------------------
  // 3. Runtime Validator Function Logic
  // -----------------------------------------------------------------------
  it('3. validateNodeRuntime correctly evaluates Node versions and flags Node < 22', () => {
    // Current runtime
    const current = validateNodeRuntime();
    assert.strictEqual(current.isValid, true);
    assert.ok(current.majorVersion >= 22);

    // Simulated versions
    const node22 = validateNodeRuntime('22.11.0');
    assert.strictEqual(node22.isValid, true);

    const node23 = validateNodeRuntime('23.2.0');
    assert.strictEqual(node23.isValid, true);

    const node20 = validateNodeRuntime('20.18.0');
    assert.strictEqual(node20.isValid, false, 'Node 20 must be flagged as invalid');

    const node18 = validateNodeRuntime('18.19.1');
    assert.strictEqual(node18.isValid, false, 'Node 18 must be flagged as invalid');
  });

  // -----------------------------------------------------------------------
  // 4. Native node:sqlite DatabaseSync Support
  // -----------------------------------------------------------------------
  it('4. Node 22 native node:sqlite DatabaseSync is functional in active environment', async () => {
    const { DatabaseSync } = await import('node:sqlite');
    assert.ok(DatabaseSync, 'DatabaseSync must be available in node:sqlite');

    const testDb = new DatabaseSync(':memory:');
    testDb.exec('CREATE TABLE test_runtime (id INTEGER PRIMARY KEY, name TEXT);');
    testDb.prepare('INSERT INTO test_runtime (name) VALUES (?)').run('node22_runtime_check');

    const row = testDb.prepare('SELECT name FROM test_runtime WHERE id = 1').get() as { name: string };
    assert.strictEqual(row.name, 'node22_runtime_check');
    testDb.close();
  });

  // -----------------------------------------------------------------------
  // 5. CLI Script Execution (check:runtime)
  // -----------------------------------------------------------------------
  it('5. npm run check:runtime CLI command executes cleanly with exit code 0', () => {
    const output = execSync('node ./scripts/checkNodeVersion.js', {
      cwd: rootDir,
      encoding: 'utf8',
    });
    assert.ok(output.includes('Node.js runtime validated') || output.includes('native node:sqlite supported'));
  });
});
