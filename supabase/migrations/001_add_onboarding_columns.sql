-- Run this in Supabase SQL Editor if the users table already exists
-- Adds onboarding preference columns

alter table users add column if not exists platforms text[] default '{}';
alter table users add column if not exists niche     text;
alter table users add column if not exists tone      text;
alter table users add column if not exists goal      text;

-- Add missing INSERT policy for users
drop policy if exists "Users can insert own data" on users;
create policy "Users can insert own data"
  on users for insert with check (auth.uid() = id);
