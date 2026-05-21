-- Store platform-specific IDs (e.g. Instagram Business Account ID, Facebook Page ID)
alter table social_accounts add column if not exists platform_user_id text;
