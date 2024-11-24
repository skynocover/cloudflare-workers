import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  dialect: 'sqlite', // 'mysql' | 'sqlite' | 'turso'
  out: './drizzle',
  driver: 'd1-http',
  schema: './src/database/schema.ts',
});
