-- Add username column to social_accounts for display purposes
alter table social_accounts add column if not exists username text;
