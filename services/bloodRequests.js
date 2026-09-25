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
  // মেয়াদ: তৈরি থেকে ৩ দিন (005 migration-এর expires_at কলামে)
  const expires = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();
  const row = await repo.create({
    id: makeId(), requester_id: user.id, blood_group: input.blood_group, bags_required: input.bags_required,
    urgency: input.urgency, required_date: input.required_date, required_time: input.required_time || null,
    hospital_id: input.hospital_id || null, division_id: input.division_id, district_id: input.district_id,
    upazila_id: input.upazila_id || null, location_text: input.location_text || null,
    patient_name: input.patient_name || null, patient_relation: input.patient_relation || null,
    description: (input.description || '').slice(0, 500) || null, contact_phone: input.contact_phone.trim(),
    whatsapp_available: input.whatsapp_available ?? true, status: 'ACTIVE', expires_at: expires
  });
  // শুধু একই উপজেলার ডোনারদের নোটিফিকেশন (একই গ্রুপ + উপলভ্য + emergency):
  try {
    const { query } = require('../lib/db/client');
    const donors = (await query(
      `SELECT user_id FROM donor_profiles WHERE blood_group=$1 AND upazila_id=$2 AND availability_status='AVAILABLE' AND emergency_available=TRUE LIMIT 100`,
      [row.blood_group, row.upazila_id])).rows;
    const upa = (await query('SELECT name_bn FROM upazilas WHERE id=$1', [row.upazila_id]).catch(() => null));
    const upaName = (upa && upa.rows[0] && upa.rows[0].name_bn) || '';
    for (const d of donors) {
      if (!d.user_id || d.user_id === row.requester_id) continue;
      await notifications.create({
        userId: d.user_id, type: 'NEW_BLOOD_REQUEST',
        title: '🔔 আপনার এলাকায় রক্তের প্রয়োজন',
        message: `${upaName} — ${row.blood_group} রক্ত প্রয়োজন (${row.bags_required} ব্যাগ)।`,
        relatedRequestId: row.id
      }).catch(() => {});
    }
    // জরুরি/অত্যন্ত জরুরি → একই উপজেলার ফোনে Web Push (সাইট বন্ধ থাকলেও):
    if ((row.urgency === 'URGENT' || row.urgency === 'CRITICAL') && donors.length) {
      const { pushToMatchingDonors } = require('./push');
      pushToMatchingDonors({
        bloodGroup: row.blood_group, upazilaId: row.upazila_id,
        title: `🚨 জরুরি রক্ত প্রয়োজন (${row.blood_group})`,
        body: `${upaName} — ${row.bags_required} ব্যাগ ${row.blood_group} রক্ত লাগবে।`,
        url: `/request/${row.id}`
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

/** মেয়াদ শেষের ১২ ঘণ্টা আগে অনুরোধকারীকে মনে করানো (in-app + push)। cron থেকে ডাকুন। */
async function remindExpiringRequests() {
  const { query } = require('../lib/db/client');
  const rows = (await query(
    `SELECT * FROM blood_requests WHERE status='ACTIVE' AND deleted_at IS NULL
     AND expires_at IS NOT NULL AND expires_at <= now() + interval '12 hours' AND expires_at > now()
     AND (last_expiry_reminder_at IS NULL OR last_expiry_reminder_at < created_at) LIMIT 200`)).rows;
  let n = 0;
  for (const r of rows) {
    if (!r.requester_id) continue;
    await notifications.create({
      userId: r.requester_id, type: 'REQUEST_EXPIRING',
      title: '⏳ অনুরোধের মেয়াদ শেষ হতে যাচ্ছে',
      message: `${r.blood_group} অনুরোধ (${r.id})-এর মেয়াদ ১২ ঘণ্টার মধ্যে শেষ। রক্ত পেয়ে গেলে "পাওয়া গেছে" দিন, নইলে সময় বাড়ান।`,
      relatedRequestId: r.id
    }).catch(() => {});
    try {
      const { pushToUsers } = require('./push');
      pushToUsers([r.requester_id], {
        title: '⏳ রক্তের অনুরোধের মেয়াদ শেষ হতে যাচ্ছে',
        body: 'সময় বাড়াতে "আমার অনুরোধ"-এ যান।',
        url: '/dashboard/requests'
      }).catch(() => {});
    } catch {}
    await query('UPDATE blood_requests SET last_expiry_reminder_at=now() WHERE id=$1', [r.id]).catch(() => {});
    n++;
  }
  return n;
}

/** মেয়াদ বাড়ানো: মালিক, ACTIVE, সর্বোচ্চ ৩ বার (+৩ দিন করে)। */
async function extendRequest(user, id) {
  if (!user) { const e = new Error('লগইন করুন।'); e.status = 401; throw e; }
  const { query } = require('../lib/db/client');
  const cur = (await query('SELECT * FROM blood_requests WHERE id=$1 AND deleted_at IS NULL', [id])).rows[0];
  if (!cur) { const e = new Error('অনুরোধটি পাওয়া যায়নি।'); e.status = 404; throw e; }
  if (cur.requester_id !== user.id) { const e = new Error('শুধু অনুরোধকারী বাড়াতে পারে।'); e.status = 403; throw e; }
  if (cur.status !== 'ACTIVE') { const e = new Error('শুধু সক্রিয় অনুরোধের মেয়াদ বাড়ানো যায়।'); e.status = 422; throw e; }
  if ((cur.extended_count || 0) >= 3) { const e = new Error('সর্বোচ্চ ৩ বার বাড়ানো যায়। নতুন অনুরোধ করুন।'); e.status = 422; throw e; }
  const r = (await query(
    `UPDATE blood_requests SET expires_at = now() + interval '3 days', extended_count = COALESCE(extended_count,0)+1, last_expiry_reminder_at=NULL, updated_at=now() WHERE id=$1 RETURNING *`,
    [id])).rows[0];
  return r;
}

module.exports = { createRequest, changeStatus, expireDueRequests, remindExpiringRequests, extendRequest };
