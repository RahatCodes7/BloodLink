import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);

// GET /api/donors/profile — নিজের ডোনার প্রোফাইল (না থাকলে 404)
export async function GET(req) {
  try {
    const user = await getUser(req);
    if (!user) return fail(401, 'লগইন করুন।');
    const { query } = require('../../../../lib/db/client');
    const r = await query(
      `SELECT d.*, u.full_name FROM donor_profiles d JOIN users u ON u.id=d.user_id WHERE d.user_id=$1`,
      [user.id]
    );
    if (!r.rows[0]) return fail(404, 'NOT_DONOR');
    const d = r.rows[0];
    return ok({
      id: d.id, name: d.full_name, blood_group: d.blood_group,
      division_id: d.division_id, district_id: d.district_id, upazila_id: d.upazila_id,
      available: d.availability_status === 'AVAILABLE',
      donations: d.donation_count || 0,
      last_donation: d.last_donation_date || null,
      verified: d.verified
    });
  } catch (e) {
    return fail(500, 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}

// POST /api/donors/profile — login required
export async function POST(req) {
  try {
    const user = await getUser(req);
    const body = await req.json();
    const { saveDonorProfile } = require('../../../../services/donors');
    const row = await saveDonorProfile(user, {
      bloodGroup: body.blood_group, divisionId: body.division_id, districtId: body.district_id,
      upazilaId: body.upazila_id, area: body.area, lastDonationDate: body.last_donation_date,
      availability: body.availability_status, emergencyAvailable: body.emergency_available,
      contactPreference: body.contact_preference, phone: body.phone
    });
    return NextResponse.json({ ok: true, data: { id: row.id } }, { status: 201 });
  } catch (e) {
    return fail(e.status || 500, e.status ? e.message : 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}
