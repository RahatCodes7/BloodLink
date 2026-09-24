import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail } from '../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const { registerUser, cookieHeader } = require('../../../../services/auth');

// POST /api/auth/register { name, email, phone, password }
export async function POST(req) {
  try {
    const body = await req.json();
    const { user, token } = await registerUser({ name: body.name, email: body.email, phone: body.phone, password: body.password });
    const res = NextResponse.json({ ok: true, data: user }, { status: 201 });
    res.headers.set('Set-Cookie', cookieHeader(token));
    return res;
  } catch (e) {
    return fail(e.status || 500, e.status ? e.message : 'দুঃখিত, নিবন্ধন করা যায়নি।');
  }
}
