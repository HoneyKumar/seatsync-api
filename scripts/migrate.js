require('dotenv').config();

const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

const MIGRATION_DIR = path.join(__dirname, '..', 'migrations');

async function migrate() {
  await pool.query(`CREATE Table IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`);
  const result = await pool.query('SELECT filename from schema_migrations');
  const applied = new Set(result.rows.map((row) => row.filename));
  const files = fs
    .readdirSync(MIGRATION_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();
  let appliedCount = 0;

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATION_DIR, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT into schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`Applied ${file}`);
      appliedCount++;
    } catch (err) {
      await client.query('ROLLBACK'); // undo everything from this file
      throw new Error(`Migration ${file} failed: ${err.message}`);
    } finally {
      client.release(); // ALWAYS return the connection to the pool
    }
  }

  if (appliedCount === 0) {
    console.log('Database is up to date');
  }
}

migrate()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
