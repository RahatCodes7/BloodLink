-- 006_create_contacts_saved (request_contacts + saved_requests)
CREATE TABLE IF NOT EXISTS request_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('PHONE','WHATSAPP','MESSAGE')),
  contacted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'INITIATED' CHECK (status IN ('INITIATED','RESPONDED','DECLINED'))
);
CREATE INDEX IF NOT EXISTS idx_contacts_request ON request_contacts (request_id, contacted_at DESC);

CREATE TABLE IF NOT EXISTS saved_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, request_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_requests (user_id, created_at DESC);
