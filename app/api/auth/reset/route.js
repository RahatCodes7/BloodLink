import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const { resetPasswordWithEmail } = require('../../../../services/auth');

// POST /api/auth/reset { email, code, newPassword } — Email OTP verified
export async function POST(req) {
  try {
    const body = await req.json();
    const out = await resetPasswordWithEmail({
      email: body.email, code: body.code, newPassword: body.newPassword
    });
    return NextResponse.json({ ok: true, data: { id: out.id } });
  } catch (e) {
    console.error('[api/auth/reset]', e.status || 500, e.message);
    return fail(e.status || 500, e.status ? e.message : 'রিসেট করা যায়নি।');
  }
}
