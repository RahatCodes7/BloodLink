// Service: campaigns — validation (server-side)
const repo = require('../lib/db/repositories/campaigns');
const { isBDPhone } = require('./validators');

function validateCampaign(d) {
  const errs = [];
  if (!d.title || d.title.trim().length < 5) errs.push('শিরোনাম কমপক্ষে ৫ অক্ষরের দিন।');
  if (!d.organizer_name || d.organizer_name.trim().length < 3) errs.push('আয়োজকের নাম দিন।');
  if (!d.venue || d.venue.trim().length < 3) errs.push('স্থান লিখুন।');
  if (!d.event_date || isNaN(Date.parse(d.event_date))) errs.push('তারিখ দিন।');
  else {
    const t = new Date(d.event_date); t.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (t < today) errs.push('তারিখ আজ বা ভবিষ্যতের হতে হবে।');
  }
  if (!isBDPhone(d.contact_phone)) errs.push('সঠিক ফোন নম্বর দিন।');
  if (d.description && d.description.length > 1000) errs.push('বিবরণ অনেক বড়।');
  if (errs.length) { const e = new Error(errs.join(' ')); e.status = 400; throw e; }
}

async function createCampaign(user, input) {
  if (!user) { const e = new Error('লগইন করুন।'); e.status = 401; throw e; }
  validateCampaign(input);
  return repo.create({
    title: input.title.trim(), description: (input.description || '').slice(0, 1000) || null,
    organizer_name: input.organizer_name.trim(), division_id: input.division_id || null,
    district_id: input.district_id || null, upazila_id: input.upazila_id || null,
    venue: input.venue.trim(), event_date: input.event_date,
    start_time: input.start_time || null, end_time: input.end_time || null,
    contact_phone: String(input.contact_phone).trim(), created_by: user.id
  });
}

module.exports = { validateCampaign, createCampaign };
