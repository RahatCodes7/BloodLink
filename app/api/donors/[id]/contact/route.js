import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);

// GET /api/donors/:id/contact — শুধু লগইন; ডোনারের contact_preference মানা হয়
export async function GET(req, { params }) {
  try {
    const user = await getUser(req);
    if (!user) return fail(401, 'যোগাযোগ করতে লগইন করুন।');
    const { query } = require('../../../../lib/db/client');
    const r = await query(
      `SELECT d.contact_preference, u.phone FROM donor_profiles d JOIN users u ON u.id=d.user_id WHERE d.id=$1`,
      [params.id]
    );
    const row = r.rows[0];
    if (!row) return fail(404, 'ডোনার পাওয়া যায়নি।');
    if (row.contact_preference === 'none' || !row.phone) {
      return fail(403, 'ডোনার সরাসরি যোগাযোগ বন্ধ রেখেছেন।');
    }
    return NextResponse.json({ ok: true, data: { phone: row.phone } });
  } catch (e) {
    console.error('[api/donors/contact]', e.message);
    return fail(e.status || 500, e.status ? e.message : 'যোগাযোগ করা যায়নি।');
  }
}
