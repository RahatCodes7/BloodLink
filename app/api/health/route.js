import { NextResponse } from 'next/server';
import { createRequire } from 'module';

export const runtime = 'nodejs';

// GET /api/health — DB সংযোগ ডায়াগনসিস (secret/credential ফাঁস করে না)
export async function GET() {
  const out = { ok: true, env: {}, db: null };
  try {
    const require = createRequire(import.meta.url);
    const { query } = require('../../../lib/db/client');
    out.env.hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
    out.env.hasSessionSecret = Boolean(process.env.SESSION_SECRET);
    out.env.hasVapid = Boolean(process.env.VAPID_PRIVATE_KEY);
    const t = await query(`SELECT
      (SELECT count(*)::int FROM users) users,
      (SELECT count(*)::int FROM donor_profiles) donors,
      (SELECT count(*)::int FROM blood_requests) requests,
      (SELECT count(*)::int FROM divisions) divisions,
      (SELECT count(*)::int FROM districts) districts,
      (SELECT count(*)::int FROM upazilas) upazilas,
      (SELECT count(*)::int FROM campaigns) campaigns,
      (SELECT count(*)::int FROM push_subscriptions) push`);
    out.db = t.rows[0];
  } catch (e) {
    out.ok = false;
    out.dbError = String(e.message).slice(0, 200);
  }
  return NextResponse.json(out);
}
