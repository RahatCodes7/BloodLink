// Repository: blood_requests — feed/search সবসময় paginated + ACTIVE-only (public)।
const { query } = require('../client');
const { keysetClause, pageOf } = require('../pagination');
const { PUBLIC_REQUEST_FIELDS } = require('../fields');

function feedWhere(params, { bloodGroup, districtId, upazilaId, divisionId }) {
  let w = `t.status='ACTIVE' AND t.deleted_at IS NULL AND (t.expires_at IS NULL OR t.expires_at > now())`;
  if (bloodGroup) { params.push(bloodGroup); w += ` AND t.blood_group=$${params.length}`; }
  if (divisionId) { params.push(divisionId); w += ` AND t.division_id=$${params.length}`; }
  if (districtId) { params.push(districtId); w += ` AND t.district_id=$${params.length}`; }
  if (upazilaId) { params.push(upazilaId); w += ` AND t.upazila_id=$${params.length}`; }
  return w;
}

/** Public feed — contact_phone কখনো select-এ নেই (privacy)। */
async function listActive({ bloodGroup, divisionId, districtId, upazilaId, cursor, limit = 20 }) {
  limit = Math.min(Math.max(limit, 1), 50);
  const params = [];
  let w = feedWhere(params, { bloodGroup, districtId, upazilaId, divisionId });
  const ks = keysetClause(params, cursor, 'DESC');
  w += ks.clause;
  params.push(limit + 1);
  const r = await query(
    `SELECT ${PUBLIC_REQUEST_FIELDS} FROM blood_requests t WHERE ${w} ORDER BY t.created_at DESC, t.id DESC LIMIT $${params.length}`,
    params
  );
  return pageOf(r.rows, limit);
}

async function findPublicById(id) {
  const r = await query(
    `SELECT ${PUBLIC_REQUEST_FIELDS}, h.name_bn AS hospital_name
     FROM blood_requests t LEFT JOIN hospitals h ON h.id=t.hospital_id
     WHERE t.id=$1 AND t.deleted_at IS NULL`, [id]);
  return r.rows[0] || null;
}

/** Owner-এর জন্য contact_phone সহ (service layer owner-check করে)। */
async function findOwnedById(id, requesterId) {
  const r = await query(`SELECT * FROM blood_requests t WHERE t.id=$1 AND t.requester_id=$2 AND t.deleted_at IS NULL`, [id, requesterId]);
  return r.rows[0] || null;
}

async function create(data) {
  const c = ['id','requester_id','blood_group','bags_required','urgency','required_date','required_time','hospital_id','division_id','district_id','upazila_id','location_text','patient_name','patient_relation','description','contact_phone','whatsapp_available','status','expires_at'];
  const vals = c.map((k, i) => `$${i + 1}`);
  const r = await query(`INSERT INTO blood_requests (${c.join(',')}) VALUES (${vals.join(',')}) RETURNING *`, c.map(k => data[k] ?? null));
  return r.rows[0];
}

async function updateStatus(id, status, { bagsFulfilled } = {}) {
  const r = await query(
    `UPDATE blood_requests SET status=$2, bags_fulfilled=COALESCE($3,bags_fulfilled), updated_at=now() WHERE id=$1 AND deleted_at IS NULL RETURNING *`,
    [id, status, bagsFulfilled ?? null]
  );
  return r.rows[0] || null;
}

async function softDelete(id, requesterId) {
  const r = await query(`UPDATE blood_requests SET deleted_at=now() WHERE id=$1 AND requester_id=$2 RETURNING id`, [id, requesterId]);
  return r.rows[0] || null;
}

/** Cron/job: মেয়াদোত্তীর্ণ ACTIVE → EXPIRED (frontend-এর উপর নির্ভর নয়)। */
async function expireDue(batch = 500) {
  const r = await query(
    `UPDATE blood_requests SET status='EXPIRED', updated_at=now() WHERE id IN (
       SELECT id FROM blood_requests WHERE status='ACTIVE' AND expires_at IS NOT NULL AND expires_at <= now() LIMIT $1
     ) RETURNING id`, [batch]);
  return r.rows.map(x => x.id);
}

module.exports = { listActive, findPublicById, findOwnedById, create, updateStatus, softDelete, expireDue };
