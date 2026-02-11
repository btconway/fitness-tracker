import { neon } from '@neondatabase/serverless';

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('⚠️  DATABASE_URL environment variable is not set!');
  console.error('To fix: Add DATABASE_URL to your Vercel environment variables');
  console.error('Format: postgresql://user:password@host/database');
}

const DATABASE_URL = process.env.DATABASE_URL || '';

// Only create SQL client if DATABASE_URL is actually set and valid
let sql: ReturnType<typeof neon> | null = null;
try {
  if (DATABASE_URL && DATABASE_URL.startsWith('postgres')) {
    sql = neon(DATABASE_URL);
  }
} catch (error) {
  console.error('Failed to initialize database client:', error);
}

export { sql };

// Helper to check if database is configured
export function isDatabaseConfigured(): boolean {
  return !!DATABASE_URL && DATABASE_URL !== '';
}

export async function initDb() {
  if (!sql) {
    console.error('Cannot initialize database: DATABASE_URL not configured');
    return;
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS fitness_logs (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        date DATE NOT NULL,
        type VARCHAR(50) NOT NULL,
        value TEXT NOT NULL,
        rounds INTEGER,
        pullup_sets TEXT,
        pushup_sets TEXT,
        note TEXT
      );
    `;
    
    // Add rounds column if it doesn't exist (migration)
    try {
      await sql`ALTER TABLE fitness_logs ADD COLUMN IF NOT EXISTS rounds INTEGER`;
    } catch {
      // Column might already exist, ignore error
    }
    
    // Add pullup_sets column if it doesn't exist (migration)
    try {
      await sql`ALTER TABLE fitness_logs ADD COLUMN IF NOT EXISTS pullup_sets TEXT`;
    } catch {
      // Column might already exist, ignore error
    }
    
    // Add pushup_sets column if it doesn't exist (migration)
    try {
      await sql`ALTER TABLE fitness_logs ADD COLUMN IF NOT EXISTS pushup_sets TEXT`;
    } catch {
      // Column might already exist, ignore error
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}
