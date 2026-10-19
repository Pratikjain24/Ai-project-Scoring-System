// ====================================================
// PROJECTX-RAY AI - DATABASE RESET & SEED CLI
// Usage:
//   npm run db:reset -> Cleanly recreates and seeds local database
// ====================================================

import fs from 'node:fs';
import path from 'node:path';
import { ENV } from '../backend/src/config/env';
import { seedDatabase } from '../backend/src/db/seed';

async function main() {
  console.log('\n🧹 ProjectX-Ray AI - Database Clean & Re-seed\n');

  if (ENV.DATABASE_DIALECT === 'sqlite') {
    const dbPaths = [
      ENV.DATABASE_PATH,
      `${ENV.DATABASE_PATH}-wal`,
      `${ENV.DATABASE_PATH}-shm`,
      path.resolve(process.cwd(), 'projectxray.db'),
      path.resolve(process.cwd(), 'projectxray.db-wal'),
      path.resolve(process.cwd(), 'projectxray.db-shm'),
      path.resolve(process.cwd(), 'backend', 'projectxray.db'),
      path.resolve(process.cwd(), 'backend', 'projectxray.db-wal'),
      path.resolve(process.cwd(), 'backend', 'projectxray.db-shm'),
    ];

    const uniquePaths = Array.from(new Set(dbPaths));
    for (const p of uniquePaths) {
      if (fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
          console.log(`  🗑️ Removed: ${p}`);
        } catch (err) {
          console.warn(`  ⚠️ Could not remove ${p}:`, (err as Error).message);
        }
      }
    }
  }

  console.log('\n🌱 Initializing clean schema and seeding reference projects...\n');
  await seedDatabase();
  console.log('✨ Database reset and seeded successfully!\n');
}

main().catch((err) => {
  console.error('❌ Database reset failed:', err);
  process.exit(1);
});
