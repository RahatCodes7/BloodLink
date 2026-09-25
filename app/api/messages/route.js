import { NextResponse } from 'next/server';
import { createRequire } from 'module';
import { ok, fail, getUser } from '../_helpers';

export const runtime = 'nodejs';
const require = createRequire(import.meta.url);
const { messaging } = require('../../../lib/db/repositories/index');

// GET /api/messages?conversationId=...&cursor=... — শুধু member
export async function GET(req) {
  try {
    const user = await getUser(req);
    if (!user) return fail(401, 'লগইন করুন।');
    const { searchParams } = new URL(req.url);
    const cid = searchParams.get('conversationId');
    if (!cid) return fail(400, 'conversationId দিন।');
    if (!(await messaging.isMember(cid, user.id))) return fail(403, 'অনুমতি নেই।');
    const data = await messaging.listMessages(cid, {
      cursor: searchParams.get('cursor') || undefined,
      limit: Number(searchParams.get('limit') || 20)
    });
    return ok(data.items, { nextCursor: data.nextCursor, hasMore: data.hasMore });
  } catch (e) {
    return fail(500, 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}

// POST /api/messages { conversationId, message } — শুধু member
export async function POST(req) {
  try {
    const user = await getUser(req);
    if (!user) return fail(401, 'লগইন করুন।');
    const body = await req.json();
    const text = String(body.message || '').trim().slice(0, 2000);
    if (!text) return fail(400, 'খালি মেসেজ পাঠানো যাবে না।');
    if (!(await messaging.isMember(body.conversationId, user.id))) return fail(403, 'অনুমতি নেই।');
    const row = await messaging.sendMessage(body.conversationId, user.id, text);
    // প্রাপকদের জানান (in-app + ফোনে push):
    try {
      const others = (await messaging.members(body.conversationId)).filter(id => id !== user.id);
      const { notifications } = require('../../../lib/db/repositories/index');
      const { pushToUsers } = require('../../../services/push');
      for (const oid of others) {
        await notifications.create({
          userId: oid, type: 'DONOR_RESPONSE', title: '💬 নতুন মেসেজ',
          message: `${user.name || 'কেউ'}: ${text.slice(0, 80)}`, relatedRequestId: null
        }).catch(() => {});
      }
      pushToUsers(others, {
        title: '💬 BloodLink-এ নতুন মেসেজ',
        message: `${user.name || 'কেউ'}: ${text.slice(0, 80)}`,
        url: `/dashboard/messages?to=${body.conversationId}`
      }).catch(() => {});
    } catch {}
    return NextResponse.json({ ok: true, data: { id: row.id } }, { status: 201 });
  } catch (e) {
    return fail(500, 'দুঃখিত, অনুরোধটি সম্পন্ন করা যায়নি।');
  }
}
