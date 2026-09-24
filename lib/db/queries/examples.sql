-- Example queries (production-এ EXPLAIN ANALYZE দিয়ে যাচাই করুন) — docs/DATABASE.md দেখুন।

-- 1) Active feed: O+ / খুলনা (index: idx_requests_status_bg_created + idx_requests_district)
SELECT t.id, t.blood_group, t.bags_required, t.urgency, t.location_text, t.created_at
FROM blood_requests t
WHERE t.status='ACTIVE' AND t.deleted_at IS NULL
  AND (t.expires_at IS NULL OR t.expires_at > now())
  AND t.blood_group='O+' AND t.district_id='khulna-d'
ORDER BY t.created_at DESC, t.id DESC LIMIT 21;

-- 2) Donor matching: একই উপজেলা > জেলা > বিভাগ অগ্রাধিকার
SELECT d.id, d.blood_group,
  CASE WHEN d.upazila_id='khulna-sadar' THEN 0 WHEN d.district_id='khulna-d' THEN 1 WHEN d.division_id='khulna' THEN 2 ELSE 3 END AS rank
FROM donor_profiles d
WHERE d.blood_group='O+' AND d.availability_status='AVAILABLE'
  AND (d.upazila_id='khulna-sadar' OR d.district_id='khulna-d' OR d.division_id='khulna')
ORDER BY rank, d.donation_count DESC LIMIT 20;

-- 3) Messages pagination (keyset — OFFSET নয়):
SELECT t.* FROM messages t
WHERE t.conversation_id=$1 AND (t.created_at, t.id) < ($2,$3)
ORDER BY t.created_at DESC, t.id DESC LIMIT 21;

-- 4) Expire sweep (cron প্রতি 10 মিনিটে):
UPDATE blood_requests SET status='EXPIRED', updated_at=now() WHERE id IN (
  SELECT id FROM blood_requests WHERE status='ACTIVE' AND expires_at <= now() LIMIT 500);
