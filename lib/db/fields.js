// Data-access helpers shared by repositories.
// Public API-তে private field ফাঁস রোধে allowlist projection ব্যবহার করুন।
const PUBLIC_REQUEST_FIELDS = `t.id, t.blood_group, t.bags_required, t.bags_fulfilled, t.urgency,
  t.required_date, t.required_time, t.hospital_id, t.division_id, t.district_id, t.upazila_id,
  t.location_text, t.description, t.status, t.expires_at, t.created_at`;

const PUBLIC_DONOR_FIELDS = `d.id, d.blood_group, d.division_id, d.district_id, d.upazila_id,
  d.availability_status, d.emergency_available, d.donation_count, d.verified, d.created_at`;

module.exports = { PUBLIC_REQUEST_FIELDS, PUBLIC_DONOR_FIELDS };
