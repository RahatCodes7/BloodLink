-- 005_create_blood_requests — অপ্রয়োজনীয় মেডিকেল তথ্য রাখা নিষেধ
CREATE TABLE IF NOT EXISTS blood_requests (
  id TEXT PRIMARY KEY,
  requester_id UUID REFERENCES users(id) ON DELETE SET NULL,
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  bags_required INTEGER NOT NULL CHECK (bags_required BETWEEN 1 AND 10),
  bags_fulfilled INTEGER NOT NULL DEFAULT 0 CHECK (bags_fulfilled >= 0),
  urgency TEXT NOT NULL DEFAULT 'URGENT' CHECK (urgency IN ('NORMAL','URGENT','CRITICAL')),
  required_date DATE NOT NULL,
  required_time TEXT,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
  division_id TEXT REFERENCES divisions(id),
  district_id TEXT REFERENCES districts(id),
  upazila_id TEXT REFERENCES upazilas(id),
  location_text TEXT,
  patient_name TEXT CHECK (patient_name IS NULL OR char_length(patient_name) <= 120),
  patient_relation TEXT CHECK (patient_relation IS NULL OR char_length(patient_relation) <= 60),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 500),
  contact_phone TEXT NOT NULL CHECK (contact_phone ~ '^01[3-9][0-9]{8}$'),
  whatsapp_available BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('DRAFT','PENDING_REVIEW','ACTIVE','PARTIALLY_FULFILLED','FULFILLED','EXPIRED','CANCELLED','REJECTED')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT bags_fulfilled_lte_required CHECK (bags_fulfilled <= bags_required)
);
-- বিভাগ 13-এর index (active feed + filter সব এই index-এ কভার হয়):
CREATE INDEX IF NOT EXISTS idx_requests_status_bg_created ON blood_requests (status, blood_group, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_requests_district ON blood_requests (district_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_requests_upazila ON blood_requests (upazila_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_requests_expires ON blood_requests (expires_at) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_requests_requester ON blood_requests (requester_id, created_at DESC) WHERE deleted_at IS NULL;
