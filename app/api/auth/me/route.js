import { createRequire } from 'module';
import { ok, fail, getUser } from '../../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const usersRepo = require('../../../../lib/db/repositories/users');

// GET /api/auth/me — session থেকে প্রোফাইল
export async function GET(req) {
  try {
    const s = await getUser(req);
    if (!s) return fail(401, 'লগইন করুন।');
    if (process.env.DATABASE_URL) {
      const row = await usersRepo.findById(s.id);
      if (!row || !row.is_active) return fail(401, 'লগইন করুন।');
      return ok({ id: row.id, name: row.full_name, email: row.email, phone: row.phone, role: row.role });
    }
    return ok({ id: s.id, name: s.name, role: s.role });
  } catch (e) {
    return fail(500, 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}
