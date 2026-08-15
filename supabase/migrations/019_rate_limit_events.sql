-- checkRateLimit() counted rows in `generations`, but only one page's
-- client-side code ever wrote there — every other AI route relying on the
-- shared rate limiter (chat, repurpose, video-script, direct stream calls)
-- never actually recorded a hit. Give the limiter its own table so it
-- records its own invocations instead of depending on unrelated code.
create table if not exists rate_limit_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_user_id_created_at_idx
  on rate_limit_events(user_id, created_at);

alter table rate_limit_events enable row level security;
