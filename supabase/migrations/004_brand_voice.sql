create table if not exists brand_voices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  brand_name text,
  industry text,
  tone text default 'engaging',
  audience text,
  key_topics text[],
  avoid_words text[],
  emoji_style text default 'moderate',
  sample_post text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table brand_voices enable row level security;

create policy "Users manage own brand voice"
  on brand_voices for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
