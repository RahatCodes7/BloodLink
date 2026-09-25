import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const { requestOtp } = require('../../../../../services/otpEmail');

// POST /api/auth/otp/request { email, purpose: 'reset'|'verify' }
export async function POST(req) {
  try {
    const body = await req.json();
    if (body.purpose === 'verify') {
      const user = await getUser(req);
      if (!user) return fail(401, 'লগইন করুন।');
    }
    await requestOtp(body.email, body.purpose || 'reset');
    return NextResponse.json({ ok: true, data: { sent: true } });
  } catch (e) {
    console.error('[api/auth/otp]', e.message);
    return fail(e.status || 500, e.status ? e.message : 'কোড পাঠানো যায়নি।');
  }
}
