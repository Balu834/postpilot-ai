-- Evergreen content recycling: mark a published post to auto-recirculate
-- on a repeat interval. The original post is never modified — each
-- recirculation spawns a new scheduled_posts row referencing it, so there's
-- a real history instead of duplication in place.
alter table scheduled_posts add column if not exists is_evergreen              boolean default false;
alter table scheduled_posts add column if not exists evergreen_active          boolean default false;
alter table scheduled_posts add column if not exists evergreen_interval_days   integer;
alter table scheduled_posts add column if not exists evergreen_last_recycled_at timestamptz;
alter table scheduled_posts add column if not exists evergreen_source_id      uuid references scheduled_posts(id) on delete set null;

create index if not exists scheduled_posts_evergreen_active_idx
  on scheduled_posts(evergreen_active) where evergreen_active = true;
