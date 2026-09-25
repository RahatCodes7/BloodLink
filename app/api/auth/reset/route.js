import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail } from '../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const { resetPasswordWithFirebase } = require('../../../../services/auth');

// POST /api/auth/reset { email, newPassword, idToken } — Firebase OTP-verified
export async function POST(req) {
  try {
    const body = await req.json();
    const out = await resetPasswordWithFirebase({
      email: body.email, newPassword: body.newPassword, idToken: body.idToken
    });
    return NextResponse.json({ ok: true, data: { id: out.id } });
  } catch (e) {
    console.error('[api/auth/reset]', e.status || 500, e.message);
    return fail(e.status || 500, e.status ? e.message : 'রিসেট করা যায়নি।');
  }
}
