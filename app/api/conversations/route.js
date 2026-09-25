import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const { messaging, notifications } = require('../../../lib/db/repositories/index');

// GET /api/conversations — আমার কথোপকথন
export async function GET(req) {
  try {
    const user = await getUser(req);
    if (!user) return fail(401, 'লগইন করুন।');
    const rows = await messaging.listByUser(user.id);
    return ok(rows);
  } catch (e) {
    return fail(500, 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}

// POST /api/conversations { withUserId?, requestId? } — chat শুরু/খুঁজুন
export async function POST(req) {
  try {
    const user = await getUser(req);
    if (!user) return fail(401, 'লগইন করুন।');
    const body = await req.json();
    let otherId = body.withUserId || null;
    if (body.requestId) {
      const { query } = require('../../../lib/db/client');
      const r = await query('SELECT requester_id FROM blood_requests WHERE id=$1 AND deleted_at IS NULL', [body.requestId]);
      if (!r.rows[0]) return fail(404, 'অনুরোধটি পাওয়া যায়নি।');
      otherId = r.rows[0].requester_id;
    }
    if (!otherId) return fail(400, 'প্রাপক দিন।');
    if (otherId === user.id) return fail(400, 'নিজেকে মেসেজ করা যাবে না।');
    // আগের conversation থাকলে সেটাই:
    const mine = await messaging.listByUser(user.id, 50);
    for (const c of mine) {
      const members = await messaging.members(c.id);
      if (members.length === 2 && members.includes(otherId)) {
        return NextResponse.json({ ok: true, data: { id: c.id, existing: true } });
      }
    }
    const conv = await messaging.ensureConversation([user.id, otherId]);
    return NextResponse.json({ ok: true, data: { id: conv.id } }, { status: 201 });
  } catch (e) {
    console.error('[api/conversations]', e.message);
    return fail(e.status || 500, e.status ? e.message : 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}
