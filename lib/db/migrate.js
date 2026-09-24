// Migration runner: node lib/db/migrate.js
// migrations/ ফোল্ডারের *.sql ফাইল ক্রমানুসারে চালায় + schema_migrations-এ ট্র্যাক করে।
// CockroachDB / Postgres উভয়ে চলে (standard SQL only)।
const fs = require('fs');
const path = require('path');
const { query, closePool } = require('./client');

async function migrate() {
  await query(`CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  const applied = new Set((await query('SELECT version FROM schema_migrations')).rows.map(r => r.version));
  for (const f of files) {
    if (applied.has(f)) { console.log('skip', f); continue; }
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    console.log('apply', f);
    await query('BEGIN');
    try {
      await query(sql);
      await query('INSERT INTO schema_migrations(version) VALUES ($1)', [f]);
      await query('COMMIT');
    } catch (e) {
      await query('ROLLBACK');
      throw new Error(`${f}: ${e.message}`);
    }
  }
  console.log('migrations ok');
}

if (require.main === module) {
  migrate().then(() => closePool().then(() => process.exit(0))).catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { migrate };
