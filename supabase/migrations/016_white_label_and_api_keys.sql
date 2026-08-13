-- White-label branding fields for the Agency plan's report output
alter table users add column if not exists brand_name      text;
alter table users add column if not exists brand_logo_url  text;

-- Customer-facing API keys for the Agency plan's public API
create table if not exists api_keys (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  key_prefix  text not null,
  key_hash    text not null unique,
  created_at  timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at  timestamptz
);

create index if not exists api_keys_user_id_idx on api_keys(user_id);

alter table api_keys enable row level security;

create policy "Users can view their own API keys" on api_keys
  for select using (auth.uid() = user_id);
