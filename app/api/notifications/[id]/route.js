import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const { notifications } = require('../../../../lib/db/repositories/index');

// PATCH /api/notifications/:id { read: true } — নিজেরটা
export async function PATCH(req, { params }) {
  try {
    const user = await getUser(req);
    if (!user) return fail(401, 'লগইন করুন।');
    const row = await notifications.markRead(user.id, params.id);
    if (!row) return fail(404, 'পাওয়া যায়নি।');
    return NextResponse.json({ ok: true, data: { id: row.id } });
  } catch (e) {
    return fail(500, 'আপডেট হয়নি।');
  }
}
