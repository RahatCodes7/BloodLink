import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const { reports } = require('../../../lib/db/repositories/index');
const { requireRole, MOD_ROLES } = require('../../../services/validators');

// POST /api/reports { request_id, reason, description } — login
export async function POST(req) {
  try {
    const user = await getUser(req);
    if (!user) return fail(401, 'লগইন করুন।');
    const body = await req.json();
    if (!body.request_id || !body.reason) return fail(400, 'কারণ দিন।');
    const row = await reports.create({
      reporterId: user.id, targetType: 'BLOOD_REQUEST', targetId: body.request_id,
      reason: String(body.reason).slice(0, 60), description: String(body.description || '').slice(0, 1000) || null
    });
    try {
      const { adminLogs } = require('../../../lib/db/repositories/index');
      await adminLogs.log({ adminId: null, action: 'report_submitted', targetType: 'BLOOD_REQUEST', targetId: body.request_id, metadata: { by: user.id } });
    } catch {}
    return NextResponse.json({ ok: true, data: { id: row.id } }, { status: 201 });
  } catch (e) {
    console.error('[api/reports]', e.message);
    return fail(e.status || 500, e.status ? e.message : 'রিপোর্ট জমা হয়নি।');
  }
}

// GET /api/reports?status= — MODERATOR+ only
export async function GET(req) {
  try {
    const user = await getUser(req);
    requireRole(user, MOD_ROLES);
    const { searchParams } = new URL(req.url);
    const rows = await reports.list({ status: searchParams.get('status') || undefined });
    return ok(rows);
  } catch (e) {
    return fail(e.status || 500, e.status ? e.message : 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}
