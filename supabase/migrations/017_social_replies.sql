-- Live replies/mentions inbox for Twitter/X and Bluesky
create table if not exists social_replies (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  platform           text not null,
  platform_reply_id  text not null,
  author_handle      text,
  author_name        text,
  content            text not null,
  permalink          text,
  ai_draft           text,
  status             text not null default 'new',
  created_at         timestamptz not null default now(),
  fetched_at         timestamptz not null default now(),
  sent_at            timestamptz,
  unique(user_id, platform, platform_reply_id)
);

create index if not exists social_replies_user_id_idx on social_replies(user_id);

alter table social_replies enable row level security;

create policy "Users can view their own replies inbox" on social_replies
  for select using (auth.uid() = user_id);
