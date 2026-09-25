import { NextResponse } from 'next/server';
import { createRequire } from 'module';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);

// GET /api/cron/expire?key=SECRET — Render cron-এর বদলে UptimeRobot/cron-job.org থেকে হিট করুন
// CRON_SECRET env না মিললে 403 (secret ছাড়া কেউ চালাতে পারবে না)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    if (!process.env.CRON_SECRET || searchParams.get('key') !== process.env.CRON_SECRET) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }
    const { expireDueRequests, remindExpiringRequests } = require('../../../services/bloodRequests');
    const expired = await expireDueRequests();
    const reminded = await remindExpiringRequests();
    return NextResponse.json({ ok: true, data: { expired: expired.length, reminded } });
  } catch (e) {
    console.error('[api/cron/expire]', e.message);
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 });
  }
}
