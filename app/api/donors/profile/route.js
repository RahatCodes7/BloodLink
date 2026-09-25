import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const { saveDonorProfile } = require('../../../../services/donors');

// POST /api/donors/profile — login required
export async function POST(req) {
  try {
    const user = await getUser(req);
    const body = await req.json();
    const row = await saveDonorProfile(user, {
      bloodGroup: body.blood_group, divisionId: body.division_id, districtId: body.district_id,
      upazilaId: body.upazila_id, area: body.area, lastDonationDate: body.last_donation_date,
      availability: body.availability_status, emergencyAvailable: body.emergency_available,
      contactPreference: body.contact_preference, phone: body.phone
    });
    return NextResponse.json({ ok: true, data: { id: row.id } }, { status: 201 });
  } catch (e) {
    console.error('[api/donors/profile]', e.status || 500, e.message);
    return fail(e.status || 500, e.status ? e.message : 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}
