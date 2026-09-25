# BloodLink Database — CockroachDB (PostgreSQL-compatible)

## 1. Schema (সম্পূর্ণ)
মাইগ্রেশন: `lib/db/migrations/001–011`। ক্রম: users → donor_profiles → divisions/districts/upazilas → hospitals → blood_requests → request_contacts/saved_requests → notifications → conversations/members/messages → reports/admin_logs → donor FK → **campaigns**।

## 2. ER Diagram
```text
divisions 1───* districts 1───* upazilas
   │               │                 │
   └───────┬───────┘                 │
           ▼                         ▼
       hospitals               donor_profiles
           │                    (user_id → users.id UNIQUE)
           ▼                         │
blood_requests ──requester_id──→ users │
   │  │  │                            │
   │  │  ├──saved_requests (UNIQUE user+request, →users)
   │  │  ├──request_contacts (donor_id →users)
   │  │  ├──notifications (user_id →users, related_request →blood_requests)
   │  │  └──reports (reporter/reviewed_by →users)
   │
conversations 1───* conversation_members (→users) 1───* messages (sender →users)
admin_logs (admin_id →users)
```
Soft-delete: `users.deleted_at`, `blood_requests.deleted_at` (messages/reports/admin_logs immutable — মুছা হয় না)।

## 3. Migrations
```bash
npm run db:migrate   # lib/db/migrate.js — schema_migrations ট্র্যাক, ক্রমানুসারে apply
npm run db:seed      # শুধু dev (production-এ ALLOW_SEED ছাড়া refuse করে)
```
নিয়ম: production-এ হাতে schema বদল নয় — নতুন `0NN_*.sql` + migrate।

## 4. Connection
```bash
# .env (কখনো git-এ নয়, কখনো ব্রাউজারে নয়):
DATABASE_URL="postgresql://user:pass@host:26257/bloodlink?sslmode=require"
DB_POOL_MAX=10
```
`lib/db/client.js` — pooled `query()` (parameterized) + `tx()` transaction helper। সব repository এখান দিয়ে যায়; component-এ raw SQL নিষেধ।

## 5. Repository / Service / API
```text
lib/db/repositories/  → users, bloodRequests, donors, index(l locations/hospitals/saved/contacts/notifications/messaging/reports/adminLogs)
lib/db/queries/examples.sql → optimized feed/match/pagination উদাহরণ
services/validators.js → CHECK-এর বাইরে lifecycle + phone/group validation
services/bloodRequests.js → create/changeStatus/expire (anti-spam cooldown সহ)
services/donors.js → upsert profile
app/api/... → blood-requests, donors, notifications, messages (JSON, cursor meta)
```

## 6. Indexes (বিভাগ 13)
- `blood_requests(status, blood_group, created_at)` + `(district_id,status)` + `(upazila_id,status)` + `(expires_at) WHERE ACTIVE` + `(requester_id,created_at)`
- `donor_profiles(blood_group,district_id,availability)` + `(upazila_id,availability)`
- `notifications(user_id,is_read,created_at)` • `messages(conversation_id,created_at,id)` • `reports(status,created_at)` • `admin_logs(created_at)`

## 7. Security / Privacy
- Parameterized query বাধ্যতামূলক; client validation-এ ভরসা নয় (`services/validators.js` server-side)।
- Public feed-এ `contact_phone` select-ই হয় না (`PUBLIC_REQUEST_FIELDS` allowlist); owner route-এ owner-check পরে।
- Role change + approve/reject শুধু MODERATOR+ (`requireRole`); `users.role` ক্লায়েন্ট থেকে লেখা যায় না (API-তে এমন endpoint নেই)।
- Messages: member-check ছাড়া read/write অসম্ভব। NID/ঠিকানা/মেডিকেল ডকুমেন্ট স্কিমাতেই নেই।
- ফাইল (avatar) DB-তে নয় — `avatar_url`-এ শুধু R2 key/URL (বিভাগ 25)।

## 8. Lifecycle / Expiration
`DRAFT→PENDING_REVIEW→ACTIVE→PARTIALLY_FULFILLED→FULFILLED`, পাশে `ACTIVE→CANCELLED/EXPIRED`, `PENDING_REVIEW→REJECTED`। অবৈধ jump `assertTransition` ব্লক করে। মেয়াদ: `expires_at` + cron `npm run db:expire` (প্রতি 10 মিনিট) — frontend-নির্ভর নয়।

## 9. Pagination
Feed/notifications/messages: cursor (keyset, `created_at+id`) — `lib/db/pagination.js`। Donors/reports/logs: limit/offset (cap 50)। হাজার row একবারে fetch নিষেধ।

## 10. Backup / Restore
```bash
# CockroachDB:
cockroach sql --insecure --host=... -e "BACKUP DATABASE bloodlink INTO 's3://bucket/bak?AWS_ACCESS_KEY_ID=..&AWS_SECRET_ACCESS_KEY=..'"
# Portable Postgres dump (provider বদলের সময়):
pg_dump "$DATABASE_URL" --schema-only -f backup_schema.sql
pg_dump "$DATABASE_URL" --data-only --exclude-table=schema_migrations -f backup_data.sql
# Restore: নতুন DB-তে migrate চালিয়ে তারপর data load (migrate-ই schema-এর source of truth)।
```

## 12. প্রথম অ্যাডমিন বানানো
`/admin` শুধু MODERATOR/ADMIN/SUPER_ADMIN role দেখে। নিজেকে অ্যাডমিন করুন (Cockroach console/SQL):
```sql
UPDATE users SET role='ADMIN' WHERE email='you@example.com';
```
Roles: `USER` → `DONOR` (auto, ডোনার হলে) → `MODERATOR` (রিপোর্ট/অনুরোধ) → `ADMIN` → `SUPER_ADMIN`।

## 12. Provider Migration (CockroachDB → Postgres/Supabase/Neon)
1. নতুন provider-এ খালি DB + `DATABASE_URL` বদলান।
2. `npm run db:migrate` (সব migration standard SQL — Cockroach-specific syntax নেই)।
3. পুরনো DB থেকে `pg_dump --data-only` → নতুন DB-তে load।
4. Smoke test: feed/search/match example queries + API।
5. DNS/env switch। Frontend-এ কোনো বদল লাগে না (DB access `lib/db` + `services`-এ কেন্দ্রীভূত)।
6. `gen_random_uuid()` Postgres 13+/CockroachDB উভয়ে native — extension লাগে না।
