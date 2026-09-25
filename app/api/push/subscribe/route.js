import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const pushSvc = require('../../../../services/push');

// POST /api/push/subscribe { endpoint, p256dh, auth }
export async function POST(req) {
  try {
    const user = await getUser(req).catch(() => null);
    const body = await req.json();
    if (!body.endpoint || !body.p256dh || !body.auth) return fail(400, 'সাবস্ক্রিপশন তথ্য অসম্পূর্ণ।');
    const row = await pushSvc.saveSubscription({
      userId: user ? user.id : null,
      endpoint: body.endpoint, p256dh: body.p256dh, auth: body.auth
    });
    return NextResponse.json({ ok: true, data: { id: row.id } }, { status: 201 });
  } catch (e) {
    return fail(e.status || 500, e.status ? e.message : 'সাবস্ক্রাইব করা যায়নি।');
  }
}

// DELETE /api/push/subscribe { endpoint } — unsubscribe
export async function DELETE(req) {
  try {
    const body = await req.json();
    await pushSvc.removeSubscription(body.endpoint);
    return ok({ removed: true });
  } catch (e) {
    return fail(500, 'আনসাবস্ক্রাইব করা যায়নি।');
  }
}
