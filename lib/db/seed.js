// Seed: node lib/db/seed.js  — শুধু development/test ডেটা। Production-এ চালাবেন না।
// divisions/districts/upazilas + sample hospitals + demo users/requests।
const { query, closePool } = require('./client');

async function seed() {
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_SEED) {
    throw new Error('Refusing to seed in production (set ALLOW_SEED=1 to override)');
  }
  await query(`INSERT INTO divisions (id,name,name_bn) VALUES
    ('dhaka','Dhaka','ঢাকা'),('chattogram','Chattogram','চট্টগ্রাম'),('khulna','Khulna','খুলনা'),
    ('rajshahi','Rajshahi','রাজশাহী'),('barishal','Barishal','বরিশাল'),('sylhet','Sylhet','সিলেট'),
    ('rangpur','Rangpur','রংপুর'),('mymensingh','Mymensingh','ময়মনসিংহ')
    ON CONFLICT (id) DO NOTHING`);
  await query(`INSERT INTO districts (id,division_id,name,name_bn) VALUES
    ('dhaka-d','dhaka','Dhaka','ঢাকা'),('gazipur','dhaka','Gazipur','গাজীপুর'),
    ('khulna-d','khulna','Khulna','খুলনা'),('jashore','khulna','Jashore','যশোর'),
    ('chattogram-d','chattogram','Chattogram','চট্টগ্রাম'),('cumilla','chattogram','Cumilla','কুমিল্লা')
    ON CONFLICT (id) DO NOTHING`);
  await query(`INSERT INTO upazilas (id,district_id,name,name_bn) VALUES
    ('khulna-sadar','khulna-d','Khulna Sadar','খুলনা সদর'),('sonadanga','khulna-d','Sonadanga','সোনাডাঙ্গা'),
    ('mirpur','dhaka-d','Mirpur','মিরপুর'),('savar','dhaka-d','Savar','সাভার'),
    ('kotwali-ctg','chattogram-d','Kotwali','কোতোয়ালী')
    ON CONFLICT (id) DO NOTHING`);
  await query(`INSERT INTO hospitals (name,name_bn,division_id,district_id,phone,is_verified) VALUES
    ('Khulna Medical College Hospital','খুলনা মেডিকেল কলেজ হাসপাতাল','khulna','khulna-d','041-760245',TRUE),
    ('Dhaka Medical College Hospital','ঢাকা মেডিকেল কলেজ হাসপাতাল','dhaka','dhaka-d','02-55165088',TRUE)
    ON CONFLICT DO NOTHING`);

  const demo = (await query(`SELECT id FROM users WHERE email='demo@bloodlink.local'`)).rows[0]
    || (await query(`INSERT INTO users (full_name,email,phone,role,is_verified) VALUES ('ডেমো ব্যবহারকারী','demo@bloodlink.local','01700000000','USER',TRUE) RETURNING id`)).rows[0];

  await query(`INSERT INTO donor_profiles (user_id,blood_group,division_id,district_id,upazila_id,donation_count,availability_status)
    VALUES ($1,'O+','khulna','khulna-d','khulna-sadar',4,'AVAILABLE') ON CONFLICT (user_id) DO NOTHING`, [demo.id]);

  const today = new Date().toISOString().slice(0, 10);
  const plus = (d) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
  await query(`INSERT INTO campaigns (title, description, organizer_name, division_id, district_id, upazila_id, venue, event_date, start_time, contact_phone, created_by)
    VALUES ('স্বেচ্ছায় রক্তদান কর্মসূচি','সবার জন্য উন্মুক্ত স্বেচ্ছায় রক্তদান কর্মসূচি।','খুলনা ব্লাড ডোনার্স ক্লাব','khulna','khulna-d','khulna-sadar','খুলনা প্রেসক্লাব মিলনায়তন',$1,'সকাল ৯টা','01700000021',$2)
    ON CONFLICT DO NOTHING`, [plus(6), demo.id]);
  await query(`INSERT INTO blood_requests (id,requester_id,blood_group,bags_required,urgency,required_date,required_time,division_id,district_id,upazila_id,location_text,description,contact_phone,whatsapp_available,status,expires_at)
    VALUES ('8F92K',$1,'O+',2,'URGENT',$2,'সকাল ১০টা','khulna','khulna-d','khulna-sadar','খুলনা মেডিকেল কলেজ হাসপাতাল','ডেলিভারি রোগীর জন্য জরুরি ভিত্তিতে ২ ব্যাগ O+ রক্ত প্রয়োজন।','01700000001',TRUE,'ACTIVE',now()+interval '2 days')
    ON CONFLICT (id) DO NOTHING`, [demo.id, today]);
  console.log('seed ok (development data only)');
}

if (require.main === module) {
  seed().then(() => closePool().then(() => process.exit(0))).catch(e => { console.error(e.message); process.exit(1); });
}
module.exports = { seed };
