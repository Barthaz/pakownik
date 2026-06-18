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

async function tableExists(table: string): Promise<boolean> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table],
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

  if (!(await tableExists('family_member_shares'))) {
    const pool = getPool();
    await pool.execute(`
      CREATE TABLE family_member_shares (
        id VARCHAR(36) PRIMARY KEY,
        family_member_id VARCHAR(36) NOT NULL,
        shared_with_email VARCHAR(255) NOT NULL,
        shared_by_user_id VARCHAR(36) NOT NULL,
        recipient_user_id VARCHAR(36) NULL,
        permission ENUM('readonly', 'full_edit') NOT NULL DEFAULT 'full_edit',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE,
        FOREIGN KEY (shared_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (family_member_id, shared_with_email),
        INDEX idx_family_member_shares_recipient (recipient_user_id),
        INDEX idx_family_member_shares_email (shared_with_email)
      )
    `);
  }
}

export function ensureMigrations(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = runMigrations();
  }
  return migrationPromise;
}
