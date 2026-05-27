-- PostgreSQL schema for AmyLens backend
-- Run as a privileged DB user with CREATE EXTENSION rights

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Varieties lookup
CREATE TABLE IF NOT EXISTS varieties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Devices
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ssaid TEXT NOT NULL UNIQUE,
  hardware_identity TEXT NOT NULL,
  workspace_assignment TEXT,
  health_status TEXT NOT NULL DEFAULT 'Unknown',
  approved BOOLEAN NOT NULL DEFAULT false,
  denied BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  denied_by UUID REFERENCES users(id),
  denied_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Device <-> User mapping
CREATE TABLE IF NOT EXISTS device_users (
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (device_id, user_id)
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT NOT NULL UNIQUE,
  device_id UUID REFERENCES devices(id),
  user_id UUID REFERENCES users(id),
  variety TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  trial_stage TEXT,
  season TEXT,
  captured_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  amylose_class TEXT,
  confidence_score NUMERIC(6,4),
  grain_length NUMERIC(8,2),
  grain_shape TEXT,
  percent_acceptability NUMERIC(5,2),
  image_hash TEXT,
  review_state TEXT DEFAULT 'pending',
  reviewer_id UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Session reviews audit
CREATE TABLE IF NOT EXISTS session_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  reviewer_id UUID REFERENCES users(id),
  reviewer_note TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Export jobs / history
CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID REFERENCES users(id),
  format TEXT NOT NULL,
  status_filter TEXT,
  variety_filter TEXT,
  date_from DATE,
  date_to DATE,
  record_count INTEGER,
  export_status TEXT NOT NULL DEFAULT 'queued',
  file_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Optional analytics snapshots cache
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_sessions_captured_at ON sessions(captured_at);
CREATE INDEX IF NOT EXISTS idx_sessions_variety ON sessions(variety);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_devices_ssaid ON devices(ssaid);

-- Seed: example varieties
INSERT INTO varieties (id, name, is_active)
VALUES
  (gen_random_uuid(), 'IR64', true),
  (gen_random_uuid(), 'Samba', true)
ON CONFLICT (name) DO NOTHING;

-- Seed: admin user (password_hash is placeholder; replace with real bcrypt/argon2 hash)
INSERT INTO users (id, username, password_hash, display_name, role)
VALUES (gen_random_uuid(), 'admin', '$2b$12$REPLACE_WITH_REAL_HASH', 'Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Example session seed (optional)
INSERT INTO sessions (id, session_code, device_id, user_id, variety, status, captured_at, submitted_at, amylose_class, confidence_score, image_hash)
SELECT gen_random_uuid(), 'SESS-001', d.id, u.id, 'IR64', 'verified', '2024-10-01T09:12:00Z'::timestamptz, '2024-10-01T09:13:00Z'::timestamptz, 'Waxy', 0.92, 'hash1'
FROM devices d CROSS JOIN users u
LIMIT 1
ON CONFLICT (session_code) DO NOTHING;

-- Notes:
--  - Replace password hash placeholder with a securely generated bcrypt/argon2 hash before creating real users.
--  - Consider adding triggers to keep updated_at in sync on row updates.
--  - For large exports consider COPY TO for efficient CSV generation.

-- Compatibility: Module 3 table variants and additional module tables

-- Module 3: device_user_names (may reference bigint device ids in older schema)
CREATE TABLE IF NOT EXISTS public.device_user_names (
  device_id BIGINT,
  user_name VARCHAR(255)
);

-- Module 3: gqris_mirrors table (GQ-RIS reference data)
CREATE TABLE IF NOT EXISTS public.gqris_mirrors (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  amylose_ordinal INTEGER NOT NULL,
  variety VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL
);

-- Add missing session columns that Module 3 used (safe, non-destructive)
ALTER TABLE IF EXISTS sessions
  ADD COLUMN IF NOT EXISTS device_ssid TEXT;
ALTER TABLE IF EXISTS sessions
  ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE IF EXISTS sessions
  ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS sessions
  ADD COLUMN IF NOT EXISTS reviewer_identity TEXT;
ALTER TABLE IF EXISTS sessions
  ADD COLUMN IF NOT EXISTS reviewer_note TEXT;
ALTER TABLE IF EXISTS sessions
  ADD COLUMN IF NOT EXISTS verdict TEXT;
ALTER TABLE IF EXISTS sessions
  ADD COLUMN IF NOT EXISTS verdict_reason TEXT;

-- Add missing device columns that Module 3 used
ALTER TABLE IF EXISTS devices
  ADD COLUMN IF NOT EXISTS device_label TEXT;
ALTER TABLE IF EXISTS devices
  ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS devices
  ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE IF EXISTS devices
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Seed compatibility data: common GQ-RIS mirror rows (id generated)
INSERT INTO public.gqris_mirrors (amylose_ordinal, variety, year)
VALUES
  (1, 'IR64', 2024),
  (2, 'Samba', 2024)
ON CONFLICT DO NOTHING;

-- If a legacy `varieties` table expects description, try to populate a description column if present
DO $$
BEGIN
  -- If a `description` column exists on `varieties`, update it for known names
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='varieties' AND column_name='description') THEN
    INSERT INTO varieties (id, name, is_active)
    SELECT gen_random_uuid(), v.name, true
    FROM (VALUES ('IR64'), ('Samba')) AS v(name)
    ON CONFLICT (name) DO NOTHING;
    UPDATE varieties SET description = 'Imported variety' WHERE name IN ('IR64','Samba');
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- ignore compatibility failures
  RAISE NOTICE 'Compatibility seed for varieties skipped: %', SQLERRM;
END$$;

