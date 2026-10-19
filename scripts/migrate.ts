// ====================================================
// PROJECTX-RAY AI - DATABASE MIGRATION CLI
// Usage:
//   npm run db:migrate        -> Apply all pending migrations
//   npm run db:rollback       -> Rollback the most recently applied migration
//   npm run db:migrate:status -> View current status and checksum validations
// ====================================================

import { MigrationEngine } from '../backend/src/db/migrationEngine';
import { getDriverStatus } from '../backend/src/db/database';

async function main() {
  const command = process.argv[2] || 'up';
  const driver = getDriverStatus();

  console.log(`\n📦 ProjectX-Ray Migration Engine (${driver.dialect.toUpperCase()} - ${driver.supportsConcurrentWriters ? 'Cloud Concurrent' : 'WAL Single-Writer'})\n`);

  try {
    switch (command.toLowerCase()) {
      case 'up':
      case 'migrate': {
        const result = MigrationEngine.migrateUp();
        if (result.appliedCount === 0) {
          console.log('✅ Database is already up to date. Zero migrations pending.\n');
        } else {
          console.log(`🎉 Successfully applied ${result.appliedCount} migration(s):`);
          result.appliedVersions.forEach((v) => console.log(`  - Version ${v}`));
          console.log('');
        }
        break;
      }

      case 'down':
      case 'rollback': {
        const result = MigrationEngine.rollbackLast();
        if (!result.success) {
          console.log(`ℹ️  ${result.message}\n`);
        } else {
          console.log(`⏪ ${result.message}\n`);
        }
        break;
      }

      case 'status': {
        const status = MigrationEngine.getMigrationStatus();
        console.log(`Status Overview:`);
        console.log(`  Total Defined:   ${status.total}`);
        console.log(`  Applied:         ${status.appliedCount}`);
        console.log(`  Pending:         ${status.pendingCount}`);
        console.log(`  Last Version:    ${status.lastAppliedVersion || 'None'}\n`);

        console.log(`Migration History:`);
        status.migrations.forEach((m) => {
          const icon = m.applied ? '🟢 APPLIED' : '⚪ PENDING';
          const tamperNote = m.tampered ? ' ⚠️ [CHECKSUM MISMATCH]' : '';
          console.log(`  [${m.version}] ${m.name.padEnd(40)} ${icon}${tamperNote} (${m.appliedAt || 'Not yet run'})`);
        });
        console.log('');
        break;
      }

      default:
        console.log(`Unknown command: '${command}'. Available commands: up | down | status\n`);
        process.exit(1);
    }
  } catch (err: any) {
    console.error(`❌ Migration failed:`, err?.message || err);
    process.exit(1);
  }
}

main();
