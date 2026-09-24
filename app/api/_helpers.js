import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export function ok(data, meta) {
  return NextResponse.json({ ok: true, data, meta: meta || null });
}
export function fail(status, message) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/**
 * Session user: 1) httpOnly cookie `bl_session` (JWT যাচাই) → 2) dev fallback header।
 * Production-এ x-user-id header কখনো বিশ্বাস করা হয় না (NODE_ENV=production-এ fallback বন্ধ)।
 */
export async function getUser(req) {
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  const { verifyToken, COOKIE } = require('../../services/auth');

  const cookieHead = req.headers.get('cookie') || '';
  const m = cookieHead.match(new RegExp(`${COOKIE}=([^;]+)`));
  if (m) {
    const s = verifyToken(decodeURIComponent(m[1]));
    if (s) {
      if (process.env.DATABASE_URL) {
        try {
          const { query } = require('../../lib/db/client');
          const r = await query('SELECT id, full_name, role, is_active FROM users WHERE id=$1 AND deleted_at IS NULL', [s.id]);
          if (r.rows[0] && r.rows[0].is_active) return { id: r.rows[0].id, name: r.rows[0].full_name, role: r.rows[0].role };
          return null;
        } catch { return null; }
      }
      return { id: s.id, name: 'User', role: s.role };
    }
  }
  // Dev-only fallback (demo mode):
  if (process.env.NODE_ENV !== 'production') {
    const id = req.headers.get('x-user-id');
    if (id) return { id, name: 'Demo User', role: req.headers.get('x-user-role') || 'USER' };
  }
  return null;
}
