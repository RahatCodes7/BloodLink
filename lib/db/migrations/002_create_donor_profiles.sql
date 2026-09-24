-- 002_create_donor_profiles
-- NOTE: divisions/districts/upazilas 003-এ তৈরি হয় বলে এখানে FK নেই;
-- 010_add_donor_location_fks-এ FK যোগ করা হয়েছে। কলাম টাইপ আগে থেকেই TEXT রাখা হয়েছে।
CREATE TABLE IF NOT EXISTS donor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  division_id TEXT,
  district_id TEXT,
  upazila_id TEXT,
  area TEXT CHECK (area IS NULL OR char_length(area) <= 200),
  last_donation_date DATE,
  donation_count INTEGER NOT NULL DEFAULT 0 CHECK (donation_count >= 0),
  availability_status TEXT NOT NULL DEFAULT 'AVAILABLE'
    CHECK (availability_status IN ('AVAILABLE','UNAVAILABLE','TEMPORARILY_UNAVAILABLE')),
  emergency_available BOOLEAN NOT NULL DEFAULT TRUE,
  contact_preference TEXT NOT NULL DEFAULT 'contact'
    CHECK (contact_preference IN ('all','contact','none')),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- সার্চ/ম্যাচিং-এর জন্য composite index:
CREATE INDEX IF NOT EXISTS idx_donors_bg_district ON donor_profiles (blood_group, district_id, availability_status);
CREATE INDEX IF NOT EXISTS idx_donors_upazila ON donor_profiles (upazila_id, availability_status);
