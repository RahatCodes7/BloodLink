import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const { reports } = require('../../../../lib/db/repositories/index');
const { requireRole, MOD_ROLES } = require('../../../../services/validators');

// PATCH /api/reports/:id { status } — MODERATOR+ only
export async function PATCH(req, { params }) {
  try {
    const user = await getUser(req);
    requireRole(user, MOD_ROLES);
    const body = await req.json();
    if (!['PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED'].includes(body.status)) {
      return fail(400, 'স্ট্যাটাস সঠিক নয়।');
    }
    const row = await reports.setStatus(params.id, body.status, user.id);
    if (!row) return fail(404, 'রিপোর্ট পাওয়া যায়নি।');
    return NextResponse.json({ ok: true, data: { id: row.id, status: row.status } });
  } catch (e) {
    console.error('[api/reports/:id]', e.message);
    return fail(e.status || 500, e.status ? e.message : 'আপডেট হয়নি।');
  }
}
