import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);

// POST /api/auth/verify-email { code } — নিজের ইমেইলে পাঠানো কোড
export async function POST(req) {
  try {
    const user = await getUser(req);
    if (!user) return fail(401, 'লগইন করুন।');
    const body = await req.json();
    const { query } = require('../../../../lib/db/client');
    const me = (await query('SELECT email FROM users WHERE id=$1', [user.id])).rows[0];
    if (!me || !me.email) return fail(400, 'প্রোফাইলে ইমেইল নেই।');
    const { consumeOtp } = require('../../../../services/otpEmail');
    await consumeOtp(me.email, body.code, 'verify');
    await query('UPDATE users SET email_verified=TRUE, updated_at=now() WHERE id=$1', [user.id]);
    return NextResponse.json({ ok: true, data: { verified: true } });
  } catch (e) {
    console.error('[api/auth/verify-email]', e.message);
    return fail(e.status || 500, e.status ? e.message : 'যাচাই হয়নি।');
  }
}
