-- Referral code on every user (short unique slug)
alter table users add column if not exists referral_code   text unique;
alter table users add column if not exists referral_credits int default 0;

-- Generate a referral code for existing users (first 8 chars of their UUID)
update users set referral_code = substring(id::text, 1, 8) where referral_code is null;

-- Referrals tracking table
create table if not exists referrals (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid not null references users(id) on delete cascade,
  referred_id   uuid not null references users(id) on delete cascade,
  created_at    timestamptz default now(),
  unique(referred_id)   -- each user can only be referred once
);

-- RLS
alter table referrals enable row level security;

create policy "Users can view their own referrals"
  on referrals for select using (auth.uid() = referrer_id);

-- Index for fast lookup
create index if not exists referrals_referrer_id_idx on referrals(referrer_id);

-- Function to safely increment referral_credits
create or replace function increment_referral_credits(user_id uuid, amount int)
returns void language sql security definer as $$
  update users set referral_credits = coalesce(referral_credits, 0) + amount where id = user_id;
$$;
