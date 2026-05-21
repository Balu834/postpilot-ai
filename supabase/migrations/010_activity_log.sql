-- Activity log for dashboard feed
create table if not exists activity_log (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete cascade not null,
  action     text        not null,
  platform   text,
  created_at timestamptz default now() not null
);

create index if not exists activity_log_user_created
  on activity_log(user_id, created_at desc);

alter table activity_log enable row level security;

create policy "Users can read own activity"
  on activity_log for select
  using (auth.uid() = user_id);
