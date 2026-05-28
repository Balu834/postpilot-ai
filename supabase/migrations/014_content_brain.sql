-- Add brain columns to scheduled_posts
ALTER TABLE scheduled_posts
  ADD COLUMN IF NOT EXISTS performance_rating INT CHECK (performance_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS topic_tags TEXT[] DEFAULT '{}';

-- Expand platform constraint to include threads, bluesky, pinterest
ALTER TABLE scheduled_posts DROP CONSTRAINT IF EXISTS scheduled_posts_platform_check;
ALTER TABLE scheduled_posts ADD CONSTRAINT scheduled_posts_platform_check
  CHECK (platform IN ('instagram', 'linkedin', 'twitter', 'facebook', 'youtube', 'threads', 'bluesky', 'pinterest'));

-- Campaigns table for AI Campaign Planner
CREATE TABLE IF NOT EXISTS campaigns (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  goal        TEXT        NOT NULL,
  niche       TEXT,
  platforms   TEXT[]      DEFAULT '{}',
  weeks       INT         DEFAULT 4,
  posts       JSONB       DEFAULT '[]',
  status      TEXT        DEFAULT 'draft',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS campaigns_user_id_idx ON campaigns(user_id);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own campaigns" ON campaigns
  FOR ALL USING (auth.uid() = user_id);
