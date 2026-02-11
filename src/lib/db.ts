import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(process.env.DATABASE_URL);

export async function initDb() {
  await sql(`
    CREATE TABLE IF NOT EXISTS fitness_logs (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      date DATE NOT NULL,
      type VARCHAR(50) NOT NULL,
      value TEXT NOT NULL,
      note TEXT
    );
  `);
}
