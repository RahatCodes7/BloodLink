-- 003_create_locations — normalized বিভাগ/জেলা/উপজেলা (নাম ডুপ্লিকেট না করে ID ব্যবহার)
CREATE TABLE IF NOT EXISTS divisions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS districts (
  id TEXT PRIMARY KEY,
  division_id TEXT NOT NULL REFERENCES divisions(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS upazilas (
  id TEXT PRIMARY KEY,
  district_id TEXT NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_districts_division ON districts (division_id);
CREATE INDEX IF NOT EXISTS idx_upazilas_district ON upazilas (district_id);
