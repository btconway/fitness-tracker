import { neon } from '@neondatabase/serverless';

// During build time, DATABASE_URL might not be set
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/fitness_tracker';

export const sql = neon(DATABASE_URL);

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS fitness_logs (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      date DATE NOT NULL,
      type VARCHAR(50) NOT NULL,
      value TEXT NOT NULL,
      rounds INTEGER,
      note TEXT
    );
  `;
}
