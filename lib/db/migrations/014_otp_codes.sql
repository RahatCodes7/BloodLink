-- 014_otp_codes — Email OTP (reset/verify), hash সংরক্ষণ, rate-limit সহ
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('reset','verify')),
  attempts INTEGER NOT NULL DEFAULT 0,
  consumed BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes (email, purpose, created_at DESC);
