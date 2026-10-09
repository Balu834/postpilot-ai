-- The "update own row" policy on users checks only that the row is yours, and
-- the authenticated role had UPDATE on every column. Anyone signed in could run
--   supabase.from("users").update({ plan_name: "agency", plan_expires_at: "2099-01-01" })
-- from the browser console and get a paid plan for free, or reset credits_used.
--
-- Fix with column privileges: the browser may only write the profile fields the
-- app's own screens write (auth callback, onboarding, settings). Plan, credits,
-- referral credits and Razorpay fields are written only by API routes using the
-- service role, which bypasses these grants.

revoke insert, update, delete, truncate on public.users from anon;
revoke insert, update, delete, truncate on public.users from authenticated;

-- auth/callback upsert (ignoreDuplicates) and onboarding upsert.
grant insert (id, email, name, referral_code, platforms, niche, tone, goal)
  on public.users to authenticated;

-- onboarding upsert (ON CONFLICT DO UPDATE sets every supplied column, id included;
-- RLS still pins the row to auth.uid()) and the settings page.
grant update (id, email, name, platforms, niche, tone, goal,
              email_notify_published, email_notify_digest)
  on public.users to authenticated;
