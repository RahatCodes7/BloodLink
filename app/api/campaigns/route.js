import { createRequire } from 'module';
import { NextResponse } from 'next/server';
import { ok, fail, getUser } from '../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const repo = require('../../../lib/db/repositories/campaigns');
const { createCampaign } = require('../../../services/campaigns');

// GET /api/campaigns?districtId=...&limit=20&offset=0
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rows = await repo.list({
      districtId: searchParams.get('districtId') || undefined,
      limit: Number(searchParams.get('limit') || 20),
      offset: Number(searchParams.get('offset') || 0)
    });
    return ok(rows);
  } catch (e) {
    return fail(500, 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}

// POST /api/campaigns — login required
export async function POST(req) {
  try {
    const user = await getUser(req);
    const body = await req.json();
    const row = await createCampaign(user, body);
    return NextResponse.json({ ok: true, data: { id: row.id } }, { status: 201 });
  } catch (e) {
    return fail(e.status || 500, e.status ? e.message : 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}
