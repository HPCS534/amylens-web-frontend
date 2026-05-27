-- Add review audit columns to sessions table (adjust table name if different)
BEGIN;

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS reviewer_identity VARCHAR(255),
  ADD COLUMN IF NOT EXISTS reviewer_timestamp TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS reviewer_note TEXT;

-- Optional index for queries by reviewer
CREATE INDEX IF NOT EXISTS idx_sessions_reviewer_identity ON sessions(reviewer_identity);

COMMIT;
