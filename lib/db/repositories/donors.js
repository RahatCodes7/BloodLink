// Repository: donors + matching query (blood_group + location + availability)।
const { query } = require('../client');
const { pageOf } = require('../pagination');
const { PUBLIC_DONOR_FIELDS } = require('../fields');

async function upsertProfile(userId, data) {
  const r = await query(
    `INSERT INTO donor_profiles (user_id, blood_group, division_id, district_id, upazila_id, area, last_donation_date, availability_status, emergency_available, contact_preference)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (user_id) DO UPDATE SET blood_group=EXCLUDED.blood_group, division_id=EXCLUDED.division_id,
       district_id=EXCLUDED.district_id, upazila_id=EXCLUDED.upazila_id, area=EXCLUDED.area,
       last_donation_date=EXCLUDED.last_donation_date, availability_status=EXCLUDED.availability_status,
       emergency_available=EXCLUDED.emergency_available, contact_preference=EXCLUDED.contact_preference, updated_at=now()
     RETURNING *`,
    [userId, data.bloodGroup, data.divisionId || null, data.districtId || null, data.upazilaId || null, data.area || null, data.lastDonationDate || null, data.availability || 'AVAILABLE', data.emergencyAvailable ?? true, data.contactPreference || 'contact']
  );
  return r.rows[0];
}

async function searchDonors({ bloodGroup, districtId, upazilaId, availableOnly = true, limit = 20, offset = 0 }) {
  limit = Math.min(Math.max(limit, 1), 50);
  const params = []; let w = 'TRUE';
  if (bloodGroup) { params.push(bloodGroup); w += ` AND d.blood_group=$${params.length}`; }
  if (districtId) { params.push(districtId); w += ` AND d.district_id=$${params.length}`; }
  if (upazilaId) { params.push(upazilaId); w += ` AND d.upazila_id=$${params.length}`; }
  if (availableOnly) w += ` AND d.availability_status='AVAILABLE'`;
  params.push(limit + 1, offset);
  const r = await query(
    `SELECT ${PUBLIC_DONOR_FIELDS}, d.user_id, u.full_name FROM donor_profiles d LEFT JOIN users u ON u.id=d.user_id WHERE ${w} ORDER BY d.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
  const hasMore = r.rows.length > limit;
  return { items: hasMore ? r.rows.slice(0, limit) : r.rows, hasMore };
}

/** Matching: একই upazila > district > division অগ্রাধিকার (medical compatibility দাবি নয়)। */
async function matchDonors({ bloodGroup, upazilaId, districtId, divisionId, limit = 20 }) {
  const r = await query(
    `SELECT ${PUBLIC_DONOR_FIELDS},
       CASE WHEN d.upazila_id=$2 THEN 0 WHEN d.district_id=$3 THEN 1 WHEN d.division_id=$4 THEN 2 ELSE 3 END AS rank
     FROM donor_profiles d
     WHERE d.blood_group=$1 AND d.availability_status='AVAILABLE'
       AND (d.upazila_id=$2 OR d.district_id=$3 OR d.division_id=$4)
     ORDER BY rank, d.donation_count DESC LIMIT $5`,
    [bloodGroup, upazilaId || null, districtId || null, divisionId || null, limit]
  );
  return r.rows;
}

module.exports = { upsertProfile, searchDonors, matchDonors, updateDonor };

/** অ্যাডমিন আপডেট (verify/suspend) — MOD রোল API-তে যাচাই হয়। */
async function updateDonor(id, { verified, availability }) {
  const sets = [];
  const params = [id];
  if (verified !== undefined) { params.push(verified); sets.push(`verified=$${params.length}`); }
  if (availability) { params.push(availability); sets.push(`availability_status=$${params.length}`); }
  if (!sets.length) return null;
  params.push(new Date().toISOString());
  const r = await query(`UPDATE donor_profiles SET ${sets.join(', ')}, updated_at=$${params.length} WHERE id=$1 RETURNING *`, params);
  return r.rows[0] || null;
}
