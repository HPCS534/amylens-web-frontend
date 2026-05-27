-- Fix for incompatible device_users FK types (uuid vs bigint)
-- Run this when you see: "foreign key constraint ... incompatible types: uuid and bigint"

-- 1) Inspect current column types to verify the mismatch
-- Run manually to review before applying destructive changes:
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name IN ('devices','device_users','device_user_names','users');

-- 2) Create a compatibility table that matches the existing devices(id) bigint layout
--    This avoids altering or dropping existing tables and preserves legacy data.
CREATE TABLE IF NOT EXISTS public.device_users_compat (
  device_id BIGINT REFERENCES public.devices(id),
  user_name VARCHAR(255),
  PRIMARY KEY (device_id, user_name)
);

-- 3) Migrate any data from `device_user_names` (dump from Module 3) into the compatibility table
INSERT INTO public.device_users_compat (device_id, user_name)
SELECT device_id, user_name FROM public.device_user_names
ON CONFLICT DO NOTHING;

-- 4) Optional: if you created `device_users` earlier in the canonical schema (UUID device_id)
-- and it is empty OR you have exported its rows for mapping, you can drop it and recreate
-- with BIGINT device_id to match legacy `devices(id)`.
-- The commands below are commented out; only run them after verifying backups.

-- DROP TABLE IF EXISTS public.device_users; -- only if safe
-- CREATE TABLE public.device_users (
--   device_id BIGINT REFERENCES public.devices(id) ON DELETE CASCADE,
--   user_id BIGINT, -- adjust type if you have a users table with bigint PK
--   PRIMARY KEY (device_id, user_id)
-- );

-- 5) Notes / next actions:
-- - If you plan to migrate to UUID-based canonical IDs, add a mapping table (legacy_id -> uuid)
--   and populate it when converting rows; do not try to change column types in-place when data
--   already exists without a clear migrate path.
-- - If `users` in your DB are not bigint, adapt `device_users_compat.user_name` to map to
--   the correct user identifier or keep a textual `user_name` until you reconcile users.
