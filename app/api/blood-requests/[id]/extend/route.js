import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const { extendRequest } = require('../../../../../services/bloodRequests');

// POST /api/blood-requests/:id/extend — মেয়াদ +৩ দিন (মালিক, ACTIVE, max ৩ বার)
export async function POST(req, { params }) {
  try {
    const user = await getUser(req);
    const row = await extendRequest(user, params.id);
    return NextResponse.json({ ok: true, data: { id: row.id, expires_at: row.expires_at, extended_count: row.extended_count } });
  } catch (e) {
    console.error('[api/extend]', e.message);
    return fail(e.status || 500, e.status ? e.message : 'মেয়াদ বাড়ানো যায়নি।');
  }
}
