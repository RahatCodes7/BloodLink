// Service: blood-requests — lifecycle + auth + anti-spam + matching notifications।
// React component থেকে সরাসরি DB নয়; API routes এই service ডাকে।
const repo = require('../lib/db/repositories/bloodRequests');
const donorsRepo = require('../lib/db/repositories/donors');
const { notifications } = require('../lib/db/repositories/index');
const { validateRequestInput, assertTransition, requireRole, MOD_ROLES } = require('./validators');

function makeId() { return Math.random().toString(36).slice(2, 7).toUpperCase(); }

/** Rate-limit: এক ব্যবহারকারী ১০ মিনিটে সর্বোচ্চ 3টি সক্রিয় অনুরোধ (spam, তবে জরুরি পথ বন্ধ নয়)। */
async function checkCooldown(requesterId) {
  const { query } = require('../lib/db/client');
  const r = await query(
    `SELECT count(*)::int c FROM blood_requests WHERE requester_id=$1 AND status='ACTIVE' AND created_at > now() - interval '10 minutes'`,
    [requesterId]);
  if (r.rows[0].c >= 3) { const e = new Error('Too many requests — ১০ মিনিট পরে আবার চেষ্টা করুন।'); e.status = 429; throw e; }
}

async function createRequest(user, input) {
  if (!user) { const e = new Error('Unauthorized'); e.status = 401; throw e; }
  validateRequestInput(input);
  await checkCooldown(user.id);
  const expires = input.expires_at || new Date(new Date(input.required_date).getTime() + 48 * 3600 * 1000).toISOString();
  const row = await repo.create({
    id: makeId(), requester_id: user.id, blood_group: input.blood_group, bags_required: input.bags_required,
    urgency: input.urgency, required_date: input.required_date, required_time: input.required_time || null,
    hospital_id: input.hospital_id || null, division_id: input.division_id, district_id: input.district_id,
    upazila_id: input.upazila_id || null, location_text: input.location_text || null,
    patient_name: input.patient_name || null, patient_relation: input.patient_relation || null,
    description: (input.description || '').slice(0, 500) || null, contact_phone: input.contact_phone.trim(),
    whatsapp_available: input.whatsapp_available ?? true, status: 'ACTIVE', expires_at: expires
  });
  // Matching donors → notification (spam এড়াতে সর্বোচ্চ 50 জন, emergency_available only):
  try {
    const matched = await donorsRepo.matchDonors({
      bloodGroup: row.blood_group, upazilaId: row.upazila_id, districtId: row.district_id, divisionId: row.division_id, limit: 50
    });
    const { query } = require('../lib/db/client');
    const donorUserIds = (await query(`SELECT user_id FROM donor_profiles WHERE id = ANY($1) AND emergency_available=TRUE`, [matched.map(m => m.id)])).rows;
    for (const d of donorUserIds.slice(0, 50)) {
      await notifications.create({
        userId: d.user_id, type: 'NEW_BLOOD_REQUEST',
        title: '🔔 নতুন রক্তের প্রয়োজন',
        message: `${row.blood_group} রক্ত প্রয়োজন (${row.bags_required} ব্যাগ)।`,
        relatedRequestId: row.id
      }).catch(() => {});
    }
  } catch {}
  return row;
}

async function changeStatus(user, id, to, opts = {}) {
  const { query } = require('../lib/db/client');
  const cur = (await query('SELECT * FROM blood_requests WHERE id=$1 AND deleted_at IS NULL', [id])).rows[0];
  if (!cur) { const e = new Error('Not found'); e.status = 404; throw e; }
  const isOwner = user && cur.requester_id === user.id;
  const isMod = user && MOD_ROLES.includes(user.role);
  if (!isOwner && !isMod) { const e = new Error('Forbidden'); e.status = 403; throw e; }
  assertTransition(cur.status, to);
  // সাধারণ USER শুধু নিজেরটা FULFILLED/CANCELLED করতে পারে; APPROVE/REJECT মডারেটর:
  if (!isMod && !['FULFILLED', 'CANCELLED'].includes(to)) requireRole(user, MOD_ROLES);
  return repo.updateStatus(id, to, opts);
}

async function expireDueRequests() { return repo.expireDue(500); }

module.exports = { createRequest, changeStatus, expireDueRequests };
