import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './backend/src/db/drizzleSchema.ts',
  out: './backend/src/db/migrations',
  dialect: (process.env.DATABASE_DIALECT === 'postgres' ? 'postgresql' : 'sqlite') as any,
  dbCredentials: {
    url: process.env.DATABASE_URL || (process.env.DATABASE_DIALECT === 'postgres' 
      ? 'postgresql://postgres:password@localhost:5432/projectxray' 
      : './projectxray.db'),
  },
});
