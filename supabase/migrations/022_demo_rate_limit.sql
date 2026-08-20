-- /api/generate/demo is the only unauthenticated paid endpoint (public
-- "try before signup" demo) and was rate-limited via an in-process Map —
-- meaningless on Vercel, where each invocation can land on a different
-- serverless instance with its own memory. rate_limit_events can't be
-- reused directly: its user_id is NOT NULL and FK'd to auth.users, which
-- an anonymous IP can't satisfy. This is a dedicated table for the same
-- purpose, keyed by IP instead of user_id.
create table if not exists demo_rate_limit_events (
  id         uuid primary key default gen_random_uuid(),
  ip         text not null,
  created_at timestamptz not null default now()
);

create index if not exists demo_rate_limit_events_ip_created_at_idx
  on demo_rate_limit_events(ip, created_at);

alter table demo_rate_limit_events enable row level security;
