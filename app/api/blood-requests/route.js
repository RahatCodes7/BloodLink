import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const repo = require('../../../lib/db/repositories/bloodRequests');
const { createRequest } = require('../../../services/bloodRequests');

// GET /api/blood-requests?... — public feed; ?mine=1 → নিজের সব (login)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get('mine') === '1') {
      const user = await getUser(req);
      if (!user) return fail(401, 'লগইন করুন।');
      const rows = await repo.listByRequester(user.id);
      return ok(rows.map(r => ({ ...r, urgency: String(r.urgency || '').toLowerCase() })));
    }
    if (searchParams.get('all') === '1') {
      const user = await getUser(req);
      const { requireRole, MOD_ROLES } = require('../../../services/validators');
      requireRole(user, MOD_ROLES);
      const rows = await repo.listAllForAdmin({ status: searchParams.get('status') || undefined });
      return ok(rows.map(r => ({ ...r, urgency: String(r.urgency || '').toLowerCase(), hospital: r.hospital_name || r.location_text || '' })));
    }
    const data = await repo.listActive({
      bloodGroup: searchParams.get('bloodGroup') || undefined,
      divisionId: searchParams.get('divisionId') || undefined,
      districtId: searchParams.get('districtId') || undefined,
      upazilaId: searchParams.get('upazilaId') || undefined,
      cursor: searchParams.get('cursor') || undefined,
      limit: Number(searchParams.get('limit') || 20)
    });
    return ok(data.items, { nextCursor: data.nextCursor, hasMore: data.hasMore });
  } catch (e) {
    return fail(500, 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}

// POST /api/blood-requests — login required
export async function POST(req) {
  try {
    const user = await getUser(req);
    const body = await req.json();
    const row = await createRequest(user, {
      blood_group: body.blood_group, bags_required: body.bags_required, urgency: body.urgency || 'URGENT',
      required_date: body.required_date, required_time: body.required_time, hospital_id: body.hospital_id,
      division_id: body.division_id, district_id: body.district_id, upazila_id: body.upazila_id,
      location_text: body.location_text, patient_name: body.patient_name, patient_relation: body.patient_relation,
      description: body.description, contact_phone: body.contact_phone, whatsapp_available: body.whatsapp_available
    });
    return NextResponse.json({ ok: true, data: { id: row.id } }, { status: 201 });
  } catch (e) {
    return fail(e.status || 500, e.status ? e.message : 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}
