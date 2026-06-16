import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const sql = await fs.readFile(path.resolve(__dirname, '../sql/schema.sql'), 'utf-8');
  const pool = getPool();

  const statements = sql
    .split(';')
    .map((part) =>
      part
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim(),
    )
    .filter(Boolean);

  for (const statement of statements) {
    await pool.execute(statement);
  }

  console.log(`Applied ${statements.length} SQL statements.`);
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
