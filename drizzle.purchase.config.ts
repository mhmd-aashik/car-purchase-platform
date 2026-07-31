import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';
dotenv.config();

const databaseUrl = process.env.PURCHASE_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('PURCHASE_DATABASE_URL environment variable is required');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './apps/purchase-service/src/app/database/schema/index.ts',
  out: './apps/purchase-service/drizzle',
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
