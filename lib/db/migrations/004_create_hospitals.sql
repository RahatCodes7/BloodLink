-- 004_create_hospitals — হাসপাতাল আলাদা টেবিলে, request শুধু hospital_id ধরে
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  division_id TEXT REFERENCES divisions(id),
  district_id TEXT REFERENCES districts(id),
  upazila_id TEXT REFERENCES upazilas(id),
  address TEXT,
  phone TEXT,
  latitude DOUBLE PRECISION CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90)),
  longitude DOUBLE PRECISION CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180)),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hospitals_district ON hospitals (district_id) WHERE is_active = TRUE;
