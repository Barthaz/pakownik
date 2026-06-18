import type { RowDataPacket } from 'mysql2';
import { getPool } from './db.js';

let migrationPromise: Promise<void> | null = null;

async function columnExists(table: string, column: string): Promise<boolean> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column],
  );
  return Number(rows[0]?.cnt) > 0;
}

async function runMigrations(): Promise<void> {
  if (!(await columnExists('users', 'terms_accepted_at'))) {
    const pool = getPool();
    await pool.execute(
      'ALTER TABLE users ADD COLUMN terms_accepted_at DATETIME NULL AFTER password_hash',
    );
  }
}

export function ensureMigrations(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = runMigrations();
  }
  return migrationPromise;
}
