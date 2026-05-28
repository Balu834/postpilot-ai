-- ─── Workspaces ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspaces (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  owner_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Workspace Members ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspace_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'viewer')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  invite_token  TEXT UNIQUE,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at    TIMESTAMPTZ DEFAULT NOW(),
  joined_at     TIMESTAMPTZ,
  UNIQUE(workspace_id, email)
);

-- ─── Approval columns on scheduled_posts ──────────────────────────────────────
ALTER TABLE scheduled_posts
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved'
    CHECK (approval_status IN ('pending_approval', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS submitted_by  UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewer_note TEXT,
  ADD COLUMN IF NOT EXISTS workspace_id  UUID REFERENCES workspaces(id) ON DELETE SET NULL;

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE workspaces        ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner manages workspace"  ON workspaces;
CREATE POLICY "Owner manages workspace" ON workspaces
  FOR ALL USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Members can view membership" ON workspace_members;
CREATE POLICY "Members can view membership" ON workspace_members
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() = (SELECT owner_id FROM workspaces WHERE id = workspace_id)
  );

DROP POLICY IF EXISTS "Owner manages members" ON workspace_members;
CREATE POLICY "Owner manages members" ON workspace_members
  FOR ALL USING (
    auth.uid() = (SELECT owner_id FROM workspaces WHERE id = workspace_id)
  );
