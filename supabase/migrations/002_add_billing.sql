-- Add billing columns to users table
alter table users add column if not exists plan_name           text    default 'free';
alter table users add column if not exists plan_expires_at     timestamptz;
alter table users add column if not exists razorpay_payment_id text;

-- Backfill plan_name for existing users who already have a plan
update users set plan_name = 'free' where plan_name is null;
