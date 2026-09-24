import { createRequire } from 'module';
import { ok, fail } from '../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const repo = require('../../../../lib/db/repositories/campaigns');

// GET /api/campaigns/:id
export async function GET(req, { params }) {
  try {
    const row = await repo.findById(params.id);
    if (!row) return fail(404, 'ক্যাম্পেইন পাওয়া যায়নি।');
    return ok(row);
  } catch (e) {
    return fail(500, 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}
