import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const donorsRepo = require('../../../../lib/db/repositories/donors');
const { requireRole, MOD_ROLES } = require('../../../../services/validators');

// GET /api/donors/:id — public প্রোফাইল (ফোন ছাড়া)
export async function GET(req, { params }) {
  try {
    const { query } = require('../../../../lib/db/client');
    const r = await query(
      `SELECT d.id, d.blood_group, d.division_id, d.district_id, d.upazila_id, d.availability_status, d.emergency_available, d.donation_count, d.last_donation_date, d.verified, d.created_at, u.full_name
       FROM donor_profiles d LEFT JOIN users u ON u.id=d.user_id WHERE d.id=$1`,
      [params.id]
    );
    const d = r.rows[0];
    if (!d) return fail(404, 'ডোনার পাওয়া যায়নি।');
    return ok({
      id: d.id, name: d.full_name || 'রক্তদাতা', blood_group: d.blood_group,
      division_id: d.division_id, district_id: d.district_id, upazila_id: d.upazila_id,
      available: d.availability_status === 'AVAILABLE', donations: d.donation_count || 0,
      last_donation: d.last_donation_date || null, verified: d.verified
    });
  } catch (e) {
    console.error('[api/donors/:id]', e.message);
    return fail(500, 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}

// PATCH /api/donors/:id { verified?, availability? } — MODERATOR+ only
export async function PATCH(req, { params }) {
  try {
    const user = await getUser(req);
    requireRole(user, MOD_ROLES);
    const body = await req.json();
    if (body.availability && !['AVAILABLE', 'UNAVAILABLE', 'TEMPORARILY_UNAVAILABLE'].includes(body.availability)) {
      return fail(400, 'অবস্থা সঠিক নয়।');
    }
    const row = await donorsRepo.updateDonor(params.id, { verified: body.verified, availability: body.availability });
    if (!row) return fail(404, 'ডোনার পাওয়া যায়নি।');
    try {
      const { adminLogs } = require('../../../../lib/db/repositories/index');
      await adminLogs.log({ adminId: user.id, action: body.verified ? 'donor_verified' : 'donor_updated', targetType: 'DONOR_PROFILE', targetId: params.id, metadata: body });
    } catch {}
    return NextResponse.json({ ok: true, data: { id: row.id } });
  } catch (e) {
    console.error('[api/donors/:id]', e.message);
    return fail(e.status || 500, e.status ? e.message : 'আপডেট হয়নি।');
  }
}
