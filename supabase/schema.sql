-- ─── Users (extends Supabase Auth) ───────────────────────────────────────────
create table if not exists users (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text,
  email         text unique,
  plan          text default 'free',
  credits_used  integer default 0,
  platforms     text[] default '{}',
  niche         text,
  tone          text,
  goal          text,
  created_at    timestamp with time zone default now()
);

-- ─── Generations ──────────────────────────────────────────────────────────────
create table if not exists generations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete cascade,
  prompt     text not null,
  platform   text not null,
  output     text not null,
  created_at timestamp with time zone default now()
);

-- ─── Scheduled Posts ──────────────────────────────────────────────────────────
create table if not exists scheduled_posts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references users(id) on delete cascade,
  content        text not null,
  platform       text not null check (platform in ('instagram', 'linkedin', 'twitter')),
  scheduled_time timestamp with time zone not null,
  status         text not null default 'pending' check (status in ('pending', 'published', 'failed')),
  created_at     timestamp with time zone default now()
);

-- ─── Social Accounts ──────────────────────────────────────────────────────────
create table if not exists social_accounts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id) on delete cascade,
  platform      text not null,
  access_token  text,
  refresh_token text,
  expires_at    timestamp with time zone,
  created_at    timestamp with time zone default now(),
  unique (user_id, platform)
);

-- ─── Auto-create user record on signup ────────────────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table users           enable row level security;
alter table generations     enable row level security;
alter table scheduled_posts enable row level security;
alter table social_accounts enable row level security;

-- Users
drop policy if exists "Users can view their own data"   on users;
drop policy if exists "Users can insert own data"       on users;
drop policy if exists "Users can update their own data" on users;
create policy "Users can view their own data"   on users for select using (auth.uid() = id);
create policy "Users can insert own data"       on users for insert with check (auth.uid() = id);
create policy "Users can update their own data" on users for update using (auth.uid() = id);

-- Generations
drop policy if exists "Users can view own generations"   on generations;
drop policy if exists "Users can insert own generations" on generations;
create policy "Users can view own generations"   on generations for select using (auth.uid() = user_id);
create policy "Users can insert own generations" on generations for insert with check (auth.uid() = user_id);

-- Scheduled Posts
drop policy if exists "Users can manage own scheduled posts" on scheduled_posts;
create policy "Users can manage own scheduled posts" on scheduled_posts for all using (auth.uid() = user_id);

-- Social Accounts
drop policy if exists "Users can manage own social accounts" on social_accounts;
create policy "Users can manage own social accounts" on social_accounts for all using (auth.uid() = user_id);
