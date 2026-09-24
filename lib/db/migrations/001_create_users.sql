-- 001_create_users
-- users: কেন্দ্রীয় অ্যাকাউন্ট টেবিল। পাসওয়ার্ড plain-text এ রাখা নিষেধ;
-- বাইরের auth হলে password_hash NULL + auth_provider/auth_subject রাখুন।
-- Portable: শুধু standard SQL (CITEXT/gen_random_uuid-এর বদলে pgcrypto নয়)।
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 3 AND 120),
  email TEXT UNIQUE,
  phone TEXT UNIQUE CHECK (phone IS NULL OR phone ~ '^01[3-9][0-9]{8}$'),
  password_hash TEXT,
  auth_provider TEXT,
  auth_subject TEXT,
  avatar_url TEXT CHECK (avatar_url IS NULL OR avatar_url NOT LIKE '% %'),
  role TEXT NOT NULL DEFAULT 'USER'
    CHECK (role IN ('USER','DONOR','MODERATOR','ADMIN','SUPER_ADMIN')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  UNIQUE (auth_provider, auth_subject)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email)) WHERE deleted_at IS NULL AND email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role) WHERE deleted_at IS NULL;
