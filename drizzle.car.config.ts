import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';
dotenv.config();

const databaseUrl = process.env.CAR_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('CAR_DATABASE_URL environment variable is required');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './apps/car-service/src/app/database/schema/index.ts',
  out: './apps/car-service/drizzle',
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
