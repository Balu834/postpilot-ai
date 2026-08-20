-- Real recurring Razorpay Subscriptions, replacing the manual
-- pay-once-then-wait-for-expiry model for new upgrades. The existing
-- plan_name/plan_expires_at columns remain the source of truth for what
-- access a user has; these two columns track the underlying subscription
-- so webhooks and cancellation can find and update the right row.
alter table users add column if not exists razorpay_subscription_id text;
alter table users add column if not exists subscription_status      text;
