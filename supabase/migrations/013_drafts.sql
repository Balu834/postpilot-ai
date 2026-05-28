CREATE TABLE IF NOT EXISTS drafts (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform    TEXT        NOT NULL,
  content     TEXT        NOT NULL,
  topic       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS drafts_user_id_idx ON drafts(user_id);

ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own drafts" ON drafts
  FOR ALL USING (auth.uid() = user_id);
