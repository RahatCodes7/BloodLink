import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const { saved } = require('../../../lib/db/repositories/index');

// GET /api/saved — নিজের সংরক্ষিত (request সহ)
export async function GET(req) {
  try {
    const user = await getUser(req);
    if (!user) return fail(401, 'লগইন করুন।');
    const rows = await saved.listByUser(user.id, 50, 0);
    return ok(rows.map(r => ({ ...r, urgency: String(r.urgency || '').toLowerCase(), hospital: r.hospital_name || r.location_text || '' })));
  } catch (e) {
    return fail(500, 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}

// POST /api/saved { request_id } — toggle (saved: true/false ফেরত)
export async function POST(req) {
  try {
    const user = await getUser(req);
    if (!user) return fail(401, 'লগইন করুন।');
    const body = await req.json();
    if (!body.request_id) return fail(400, 'request_id দিন।');
    const added = await saved.add(user.id, body.request_id);
    if (added) return NextResponse.json({ ok: true, data: { saved: true } }, { status: 201 });
    await saved.remove(user.id, body.request_id);
    return ok({ saved: false });
  } catch (e) {
    return fail(500, 'সংরক্ষণ করা যায়নি।');
  }
}

// DELETE /api/saved { request_id } — সরান
export async function DELETE(req) {
  try {
    const user = await getUser(req);
    if (!user) return fail(401, 'লগইন করুন।');
    const body = await req.json();
    await saved.remove(user.id, body.request_id);
    return ok({ removed: true });
  } catch (e) {
    return fail(500, 'সরানো যায়নি।');
  }
}
