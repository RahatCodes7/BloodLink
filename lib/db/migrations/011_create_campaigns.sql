-- 011_create_campaigns — রক্তদান ক্যাম্পেইন/ইভেন্ট (স্পেক §72)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 150),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 1000),
  organizer_name TEXT NOT NULL CHECK (char_length(organizer_name) BETWEEN 3 AND 120),
  division_id TEXT REFERENCES divisions(id),
  district_id TEXT REFERENCES districts(id),
  upazila_id TEXT REFERENCES upazilas(id),
  venue TEXT NOT NULL CHECK (char_length(venue) BETWEEN 3 AND 200),
  event_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  contact_phone TEXT NOT NULL CHECK (contact_phone ~ '^01[3-9][0-9]{8}$'),
  status TEXT NOT NULL DEFAULT 'UPCOMING'
    CHECK (status IN ('UPCOMING','ONGOING','COMPLETED','CANCELLED')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_campaigns_date ON campaigns (event_date) WHERE status IN ('UPCOMING','ONGOING');
CREATE INDEX IF NOT EXISTS idx_campaigns_district ON campaigns (district_id, event_date);
