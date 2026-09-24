import { createRequire } from 'module';
import { ok, fail, getUser } from '../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const repo = require('../../../../lib/db/repositories/bloodRequests');
const { changeStatus } = require('../../../../services/bloodRequests');

// GET /api/blood-requests/:id — public (contact_phone বাদে)
export async function GET(req, { params }) {
  try {
    const row = await repo.findPublicById(params.id);
    if (!row) return fail(404, 'অনুরোধটি পাওয়া যায়নি।');
    return ok(row);
  } catch (e) {
    return fail(500, 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}

// PATCH /api/blood-requests/:id { status, bagsFulfilled } — owner / moderator
export async function PATCH(req, { params }) {
  try {
    const user = await getUser(req);
    const body = await req.json();
    const row = await changeStatus(user, params.id, body.status, { bagsFulfilled: body.bagsFulfilled });
    return ok(row);
  } catch (e) {
    return fail(e.status || 500, e.status ? e.message : 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}

// DELETE /api/blood-requests/:id — owner (soft delete)
export async function DELETE(req, { params }) {
  try {
    const user = await getUser(req);
    if (!user) return fail(401, 'লগইন করুন।');
    const row = await repo.softDelete(params.id, user.id);
    if (!row) return fail(404, 'অনুরোধটি পাওয়া যায়নি।');
    return ok({ id: row.id });
  } catch (e) {
    return fail(500, 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}
