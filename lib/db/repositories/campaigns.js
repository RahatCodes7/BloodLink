// Repository: campaigns
const { query } = require('../client');

async function list({ districtId, limit = 20, offset = 0 } = {}) {
  limit = Math.min(Math.max(limit, 1), 50);
  const p = []; let w = `status IN ('UPCOMING','ONGOING')`;
  if (districtId) { p.push(districtId); w += ` AND district_id=$${p.length}`; }
  p.push(limit, Math.max(offset, 0));
  const r = await query(
    `SELECT * FROM campaigns WHERE ${w} ORDER BY event_date ASC LIMIT $${p.length - 1} OFFSET $${p.length}`, p);
  return r.rows;
}

async function findById(id) {
  const r = await query('SELECT * FROM campaigns WHERE id=$1', [id]);
  return r.rows[0] || null;
}

async function create(c) {
  const r = await query(
    `INSERT INTO campaigns (title, description, organizer_name, division_id, district_id, upazila_id, venue, event_date, start_time, end_time, contact_phone, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [c.title, c.description || null, c.organizer_name, c.division_id || null, c.district_id || null, c.upazila_id || null,
     c.venue, c.event_date, c.start_time || null, c.end_time || null, c.contact_phone, c.created_by || null]);
  return r.rows[0];
}

module.exports = { list, findById, create };
