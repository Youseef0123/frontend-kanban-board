import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
      "Please create a Neon database and add DATABASE_URL to your .env.local and Vercel environment variables.",
  );
}

export const sql = neon(process.env.DATABASE_URL);

export async function ensureSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id          SERIAL PRIMARY KEY,
      title       TEXT        NOT NULL,
      description TEXT        NOT NULL DEFAULT '',
      column      TEXT        NOT NULL DEFAULT 'backlog',
      priority    TEXT        NOT NULL DEFAULT 'medium',
      "order"     INTEGER     NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Seed initial data only if the table is completely empty
  const rows = await sql`SELECT COUNT(*) AS cnt FROM tasks`;
  const count = Number((rows[0] as { cnt: string }).cnt);
  if (count === 0) {
    await sql`
      INSERT INTO tasks (title, description, column, priority, "order", created_at) VALUES
        ('API integration',      'Integrate third-party payment gateway API with error handling and retry logic.', 'backlog',     'high',   12, '2024-01-10T09:00:00.000Z'),
        ('Unit tests',           'Write unit tests for auth middleware and user service layer.',                   'in_progress', 'low',    19, '2024-01-11T10:30:00.000Z'),
        ('Performance audit',    'Run Lighthouse audit, fix LCP issues, lazy-load below-the-fold images.',        'in_progress', 'low',    17, '2024-01-12T11:00:00.000Z'),
        ('Database schema',      'Design and implement normalized PostgreSQL schema with proper indexing.',        'review',      'medium', 14, '2024-01-13T12:00:00.000Z'),
        ('User authentication',  'Implement JWT-based authentication with refresh token rotation.',                'done',        'high',   20, '2024-01-14T13:00:00.000Z')
    `;
  }
}
