import { createRequire } from 'module';
import { ok, fail, getUser } from '../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const { notifications } = require('../../../lib/db/repositories/index');

// GET /api/notifications?cursor=...&limit=20 — নিজের নোটিফিকেশনই
export async function GET(req) {
  try {
    const user = await getUser(req);
    if (!user) return fail(401, 'লগইন করুন।');
    const { searchParams } = new URL(req.url);
    const data = await notifications.listByUser(user.id, {
      cursor: searchParams.get('cursor') || undefined,
      limit: Number(searchParams.get('limit') || 20)
    });
    return ok(data.items, { nextCursor: data.nextCursor, hasMore: data.hasMore });
  } catch (e) {
    return fail(500, 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}
