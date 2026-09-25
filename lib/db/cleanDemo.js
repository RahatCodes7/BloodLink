// node lib/db/cleanDemo.js — শুধু known demo rows মুছে (production ডেটা ছোঁয় না)
const { query, closePool } = require('./client');

(async () => {
  const out = {};
  out.requests = (await query(`DELETE FROM blood_requests WHERE id IN ('8F92K','7A11Q','5C77M') RETURNING id`)).rows.map(r => r.id);
  out.campaigns = (await query(`DELETE FROM campaigns WHERE title IN ('স্বেচ্ছায় রক্তদান কর্মসূচি','ক্যাম্পাস ব্লাড ড্রাইভ') RETURNING id`)).rows.map(r => r.id);
  const demo = (await query(`SELECT id FROM users WHERE email='demo@bloodlink.local'`)).rows[0];
  out.demoUser = demo ? demo.id : null;
  if (demo) {
    await query(`DELETE FROM donor_profiles WHERE user_id=$1`, [demo.id]);
    await query(`DELETE FROM users WHERE id=$1`, [demo.id]);
  }
  const left = await query(`SELECT (SELECT count(*)::int FROM blood_requests) requests, (SELECT count(*)::int FROM campaigns) campaigns, (SELECT count(*)::int FROM donor_profiles) donors, (SELECT count(*)::int FROM users) users`);
  out.remaining = left.rows[0];
  console.log(JSON.stringify(out, null, 2));
  await closePool();
})().catch(e => { console.error('FAIL', e.message.slice(0, 300)); process.exit(1); });
