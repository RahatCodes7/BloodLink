import { createRequire } from 'module';
import { ok, fail } from '../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const donorsRepo = require('../../../lib/db/repositories/donors');

// GET /api/donors?bloodGroup=O%2B&districtId=khulna-d&availableOnly=true&limit=20&offset=0
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const data = await donorsRepo.searchDonors({
      bloodGroup: searchParams.get('bloodGroup') || undefined,
      districtId: searchParams.get('districtId') || undefined,
      upazilaId: searchParams.get('upazilaId') || undefined,
      availableOnly: searchParams.get('availableOnly') !== 'false',
      limit: Number(searchParams.get('limit') || 20),
      offset: Number(searchParams.get('offset') || 0)
    });
    return ok(data.items, { hasMore: data.hasMore });
  } catch (e) {
    return fail(500, 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}
