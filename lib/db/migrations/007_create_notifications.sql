-- 007_create_notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('NEW_BLOOD_REQUEST','REQUEST_UPDATE','DONOR_RESPONSE','REQUEST_FULFILLED','REQUEST_EXPIRING','SYSTEM')),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 1000),
  related_request_id TEXT REFERENCES blood_requests(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notif_user_read_created ON notifications (user_id, is_read, created_at DESC);
