-- Expand platform check to support facebook and youtube in addition to existing platforms
alter table scheduled_posts drop constraint if exists scheduled_posts_platform_check;
alter table scheduled_posts add constraint scheduled_posts_platform_check
  check (platform in ('instagram', 'linkedin', 'twitter', 'facebook', 'youtube'));
