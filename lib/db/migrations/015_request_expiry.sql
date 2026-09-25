-- 015_request_expiry — ৩ দিন মেয়াদ + বাড়ানো + রিমাইন্ডার ট্র্যাক
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS extended_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS last_expiry_reminder_at TIMESTAMPTZ;
