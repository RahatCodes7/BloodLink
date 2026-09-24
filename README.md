# BloodLink 🩸 — রক্ত খুঁজুন। জীবন বাঁচান।

বাংলাদেশ-কেন্দ্রিক, বাংলা-ফার্স্ট, মোবাইল-ফার্স্ট রক্তদান ও জরুরি রক্ত অনুরোধ প্ল্যাটফর্ম (Next.js + Supabase)।

## চালানো

```bash
npm install
cp .env.example .env.local   # Supabase URL + anon key বসান (ঐচ্ছিক — ছাড়া ডেমো মোডে চলবে)
npm run dev                  # http://localhost:3000
```

ডেমো মোডে ডেটা ব্রাউজারের localStorage-এ থাকে। প্রোডাকশনে `supabase/schema.sql` Supabase-এ চালিয়ে `.env.local` সেট করুন।

## ডাটাবেস (CockroachDB — PostgreSQL-compatible)

```bash
cp .env.example .env.local   # DATABASE_URL বসান (server-side only, NEXT_PUBLIC_ নয়)
npm run db:migrate           # lib/db/migrations/001–010 apply
npm run db:seed              # শুধু dev ডেটা (production-এ refuse করে)
npm run db:expire            # মেয়াদোত্তীর্ণ sweep (cron: প্রতি 10 মিনিটে)
```

স্তর: `app/api/*` → `services/*` → `lib/db/repositories/*` → CockroachDB।
Component-এ raw SQL নেই। বিস্তারিত: `docs/DATABASE.md` (ERD, index, backup, provider-migration)।

## রুট
- `/` হোম • `/search` রক্ত খুঁজুন • `/request/[id]` বিস্তারিত • `/donors` রক্তদাতা
- `/dashboard/*` ওভারভিউ, অনুরোধ, ডোনার প্রোফাইল, সংরক্ষিত, নোটিফিকেশন, মেসেজ, প্রোফাইল
- `/admin/*` ড্যাশবোর্ড, ব্যবহারকারী, অনুরোধ, ডোনার, রিপোর্ট, যাচাই, হাসপাতাল, লোকেশন, সেটিংস

## নিরাপত্তা নোট

- service-role key কখনো ফ্রন্টএন্ডে নয়। RLS পলিসি `supabase/schema.sql`-এ।
- অ্যাডমিন চেক সার্ভার-সাইডে (`is_admin()`), শুধু UI হাইড নয়।
- ফোন নম্বর শুধু ব্যবহারকারীর অনুমতিতে দেখানো হয়; NID/ঠিকানা/মেডিকেল ডকুমেন্ট নেওয়া হয় না।

## আইকন কৃতজ্ঞতা

`public/icons/*` — [Flaticon](https://www.flaticon.com/) (Freepik, wanicon, Vector Stall), free license with attribution।
