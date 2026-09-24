// Service: donors — eligibility নয়, শুধু প্রোফাইল রেকর্ড (চিকিৎসাগত সিদ্ধান্ত চিকিৎসকের)।
const donorsRepo = require('../lib/db/repositories/donors');
const { BLOOD_GROUPS, isBDPhone } = require('./validators');

async function saveDonorProfile(user, input) {
  if (!user) { const e = new Error('Unauthorized'); e.status = 401; throw e; }
  if (!BLOOD_GROUPS.includes(input.bloodGroup)) { const e = new Error('bloodGroup invalid'); e.status = 400; throw e; }
  if (!input.districtId) { const e = new Error('district required'); e.status = 400; throw e; }
  if (input.phone && !isBDPhone(input.phone)) { const e = new Error('phone invalid'); e.status = 400; throw e; }
  const row = await donorsRepo.upsertProfile(user.id, input);
  // প্রথমবার ডোনার হলে role DONOR (ADMIN লজিক আলাদা):
  try {
    const { query } = require('../lib/db/client');
    await query(`UPDATE users SET role='DONOR', updated_at=now() WHERE id=$1 AND role='USER'`, [user.id]);
  } catch {}
  return row;
}

module.exports = { saveDonorProfile };
