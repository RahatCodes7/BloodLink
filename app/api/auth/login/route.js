import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { fail } from '../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const { loginUser, cookieHeader } = require('../../../../services/auth');

// POST /api/auth/login { email, password }
export async function POST(req) {
  try {
    const body = await req.json();
    const { user, token } = await loginUser({ email: body.email, password: body.password });
    const res = NextResponse.json({ ok: true, data: user });
    res.headers.set('Set-Cookie', cookieHeader(token));
    return res;
  } catch (e) {
    return fail(e.status || 500, e.status ? e.message : 'দুঃখিত, লগইন করা যায়নি।');
  }
}
