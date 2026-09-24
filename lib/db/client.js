// BloodLink DB client — CockroachDB (PostgreSQL-compatible).
// কোনো CockroachDB-specific SQL এখানে নেই; শুধু standard pg ব্যবহার।
// DATABASE_URL কখনো ব্রাউজারে পাঠাবেন না — শুধু server-side (API routes / Server Actions / scripts) থেকে import করুন.
// node script সরাসরি চালালে .env.local হাতে লোড করুন (Next.js নিজে লোড করে):
try { require('dotenv').config({ path: require('path').join(process.cwd(), '.env.local') }); } catch {}
const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. See .env.example');
  }
  pool = new Pool({
    connectionString,
    max: Number(process.env.DB_POOL_MAX || 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.DB_SSL === 'disable' ? false : { rejectUnauthorized: false }
  });
  pool.on('error', (err) => console.error('[db] pool error', err.message));
  return pool;
}

/** Parameterized query — সব query এখান দিয়ে যাবে (SQL injection প্রতিরোধ)। */
async function query(text, params = []) {
  const p = getPool();
  const start = Date.now();
  const res = await p.query(text, params);
  if (process.env.DB_LOG === '1') console.log('[db]', Date.now() - start + 'ms', text.slice(0, 80));
  return res;
}

/** Transaction helper: await tx(async (client) => {...}) */
async function tx(fn) {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    const out = await fn(client);
    await client.query('COMMIT');
    return out;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function closePool() {
  if (pool) { await pool.end(); pool = null; }
}

module.exports = { getPool, query, tx, closePool };
