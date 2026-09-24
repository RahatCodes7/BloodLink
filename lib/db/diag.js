// node lib/db/diag.js — DB/auth setup ডায়াগনসিস ( secret প্রিন্ট করে না )
const fs = require('fs');
const path = require('path');
// .env.local হাতে পড়ুন (plain node auto-load করে না; Next.js করে)
for (const f of ['.env.local', '.env']) {
  const p = path.join(process.cwd(), f);
  if (fs.existsSync(p)) {
    console.log('found file:', f);
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}
if (!fs.existsSync(path.join(process.cwd(), '.env.local'))) console.log('MISSING: .env.local (project root-এ নেই)');
const { query, closePool } = require('./client');

(async () => {
  const out = {};
  out.hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  out.host = (process.env.DATABASE_URL || '').replace(/:\/\/.*@/, '://***@').slice(0, 80);
  out.hasSessionSecret = Boolean(process.env.SESSION_SECRET);
  try {
    const r = await query(`SELECT table_name FROM information_schema.tables WHERE table_schema IN ('public') AND table_name IN ('users','blood_requests','campaigns','donor_profiles')`);
    out.tables = r.rows.map(x => x.table_name);
  } catch (e) { out.dbError = e.message.slice(0, 200); }
  console.log(JSON.stringify(out, null, 2));
  await closePool();
})().catch(e => { console.error('FATAL', e.message.slice(0, 200)); process.exit(1); });
