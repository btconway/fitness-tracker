# Deployment Guide

## Environment Variables

This app requires a `DATABASE_URL` environment variable to connect to a Neon PostgreSQL database.

### Setting up on Vercel

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon database connection string
   - **Format**: `postgresql://user:password@host/database?sslmode=require`
4. Click **Save**
5. Redeploy the application

### Getting a Neon Database

1. Sign up for free at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the project dashboard
4. Use this as your `DATABASE_URL` value

## Database Schema

The app will automatically create the required table on first run:

```sql
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
```

## Error Handling

If `DATABASE_URL` is not set, the app will display a helpful error message with configuration instructions instead of crashing.
