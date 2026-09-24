import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok } from '../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const { clearCookieHeader } = require('../../../../services/auth');

// POST /api/auth/logout
export async function POST() {
  const res = NextResponse.json({ ok: true, data: null });
  res.headers.set('Set-Cookie', clearCookieHeader());
  return res;
}
