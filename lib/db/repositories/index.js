// Repository: locations + hospitals + saved + contacts + notifications + messaging + reports + admin_logs
const { query } = require('../client');
const { keysetClause, pageOf } = require('../pagination');

const locations = {
  divisions: async () => (await query('SELECT * FROM divisions ORDER BY name_bn')).rows,
  districtsByDivision: async (divisionId) => (await query('SELECT * FROM districts WHERE division_id=$1 ORDER BY name_bn', [divisionId])).rows,
  upazilasByDistrict: async (districtId) => (await query('SELECT * FROM upazilas WHERE district_id=$1 ORDER BY name_bn', [districtId])).rows,
  createDivision: async (id, name, nameBn) => (await query(`INSERT INTO divisions(id,name,name_bn) VALUES ($1,$2,$3) RETURNING *`, [id, name, nameBn])).rows[0],
  createDistrict: async (id, divisionId, name, nameBn) => (await query(`INSERT INTO districts(id,division_id,name,name_bn) VALUES ($1,$2,$3,$4) RETURNING *`, [id, divisionId, name, nameBn])).rows[0],
  createUpazila: async (id, districtId, name, nameBn) => (await query(`INSERT INTO upazilas(id,district_id,name,name_bn) VALUES ($1,$2,$3,$4) RETURNING *`, [id, districtId, name, nameBn])).rows[0]
};

const hospitals = {
  list: async ({ districtId, limit = 20, offset = 0 } = {}) => {
    const p = []; let w = 'is_active=TRUE';
    if (districtId) { p.push(districtId); w += ` AND district_id=$${p.length}`; }
    p.push(Math.min(limit, 50), Math.max(offset, 0));
    return (await query(`SELECT * FROM hospitals WHERE ${w} ORDER BY is_verified DESC, name_bn LIMIT $${p.length - 1} OFFSET $${p.length}`, p)).rows;
  },
  create: async (h) => (await query(
    `INSERT INTO hospitals (name,name_bn,division_id,district_id,upazila_id,address,phone) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [h.name, h.nameBn, h.divisionId || null, h.districtId || null, h.upazilaId || null, h.address || null, h.phone || null])).rows[0]
};

const saved = {
  add: async (userId, requestId) => (await query(
    `INSERT INTO saved_requests (user_id, request_id) VALUES ($1,$2) ON CONFLICT (user_id, request_id) DO NOTHING RETURNING *`, [userId, requestId])).rows[0] || null,
  remove: async (userId, requestId) => (await query(`DELETE FROM saved_requests WHERE user_id=$1 AND request_id=$2`, [userId, requestId])).rowCount > 0,
  listByUser: async (userId, limit = 20, offset = 0) => (await query(
    `SELECT t.* FROM saved_requests s JOIN blood_requests t ON t.id=s.request_id
     WHERE s.user_id=$1 AND t.deleted_at IS NULL ORDER BY s.created_at DESC LIMIT $2 OFFSET $3`, [userId, Math.min(limit, 50), Math.max(offset, 0)])).rows
};

const contacts = {
  log: async ({ requestId, donorId, contactType }) => (await query(
    `INSERT INTO request_contacts (request_id, donor_id, contact_type) VALUES ($1,$2,$3) RETURNING *`, [requestId, donorId || null, contactType])).rows[0]
};

const notifications = {
  create: async ({ userId, type, title, message, relatedRequestId }) => (await query(
    `INSERT INTO notifications (user_id, type, title, message, related_request_id) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [userId, type, title, message, relatedRequestId || null])).rows[0],
  listByUser: async (userId, { cursor, limit = 20 } = {}) => {
    limit = Math.min(Math.max(limit, 1), 50);
    const params = [userId]; let w = `t.user_id=$1`;
    const ks = keysetClause(params, cursor, 'DESC'); w += ks.clause;
    params.push(limit + 1);
    const r = await query(`SELECT t.* FROM notifications t WHERE ${w} ORDER BY t.created_at DESC, t.id DESC LIMIT $${params.length}`, ks.params.concat(limit + 1));
    return pageOf(r.rows, limit);
  },
  markRead: async (userId, id) => (await query(`UPDATE notifications SET is_read=TRUE WHERE id=$1 AND user_id=$2 RETURNING id`, [id, userId])).rows[0] || null
};

const messaging = {
  ensureConversation: async (memberIds) => {
    const { tx } = require('../client');
    return tx(async (c) => {
      const conv = (await c.query('INSERT INTO conversations DEFAULT VALUES RETURNING *')).rows[0];
      for (const uid of [...new Set(memberIds)]) await c.query('INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [conv.id, uid]);
      return conv;
    });
  },
  isMember: async (conversationId, userId) => (await query(
    `SELECT 1 FROM conversation_members WHERE conversation_id=$1 AND user_id=$2`, [conversationId, userId])).rowCount > 0,
  sendMessage: async (conversationId, senderId, text) => (await query(
    `INSERT INTO messages (conversation_id, sender_id, message) VALUES ($1,$2,$3) RETURNING *`, [conversationId, senderId, text])).rows[0],
  listMessages: async (conversationId, { cursor, limit = 20 } = {}) => {
    limit = Math.min(Math.max(limit, 1), 50);
    const params = [conversationId]; let w = `t.conversation_id=$1`;
    const ks = keysetClause(params, cursor, 'DESC'); w += ks.clause;
    const r = await query(`SELECT t.* FROM messages t WHERE ${w} ORDER BY t.created_at DESC, t.id DESC LIMIT $${ks.params.length + 1}`, ks.params.concat(limit + 1));
    return pageOf(r.rows, limit);
  }
};

const reports = {
  create: async ({ reporterId, targetType, targetId, reason, description }) => (await query(
    `INSERT INTO reports (reporter_id, target_type, target_id, reason, description) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [reporterId || null, targetType, targetId, reason, description || null])).rows[0],
  list: async ({ status, limit = 20, offset = 0 } = {}) => {
    const p = []; let w = 'TRUE';
    if (status) { p.push(status); w += ` AND status=$${p.length}`; }
    p.push(Math.min(limit, 50), Math.max(offset, 0));
    return (await query(`SELECT * FROM reports WHERE ${w} ORDER BY created_at DESC LIMIT $${p.length - 1} OFFSET $${p.length}`, p)).rows;
  },
  setStatus: async (id, status, reviewedBy) => (await query(
    `UPDATE reports SET status=$2, reviewed_by=$3, reviewed_at=now() WHERE id=$1 RETURNING *`, [id, status, reviewedBy || null])).rows[0] || null
};

const adminLogs = {
  log: async ({ adminId, action, targetType, targetId, metadata }) => (await query(
    `INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [adminId || null, action, targetType || null, targetId || null, metadata ? JSON.stringify(metadata) : null])).rows[0],
  list: async ({ limit = 20, offset = 0 } = {}) => (await query(
    `SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [Math.min(limit, 50), Math.max(offset, 0)])).rows
};

module.exports = { locations, hospitals, saved, contacts, notifications, messaging, reports, adminLogs };
