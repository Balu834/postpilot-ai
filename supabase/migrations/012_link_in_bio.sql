-- Link in Bio pages
CREATE TABLE IF NOT EXISTS link_in_bio (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username       TEXT NOT NULL,
  display_name   TEXT,
  bio            TEXT,
  avatar_url     TEXT,
  theme          TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'purple', 'gold', 'minimal')),
  custom_links   JSONB NOT NULL DEFAULT '[]',
  show_platforms BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(username)
);

ALTER TABLE link_in_bio ENABLE ROW LEVEL SECURITY;

-- Anyone can read (public pages)
CREATE POLICY "Public can view link_in_bio"
  ON link_in_bio FOR SELECT USING (true);

-- Only owner can write
CREATE POLICY "Owner can manage link_in_bio"
  ON link_in_bio FOR ALL USING (auth.uid() = user_id);
