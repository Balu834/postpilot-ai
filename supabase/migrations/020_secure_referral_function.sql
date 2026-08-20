-- increment_referral_credits is SECURITY DEFINER (runs with elevated
-- privileges, bypassing RLS). Supabase grants EXECUTE on public schema
-- functions to anon/authenticated by default, and this function takes a
-- raw user_id + amount with no ownership check — anyone could call
-- POST /rest/v1/rpc/increment_referral_credits directly with any user_id
-- and amount to set an arbitrary user's referral_credits to anything.
-- The only legitimate caller (/api/referral/track) already goes through
-- the service-role client, which is unaffected by revoking these grants.
-- Revoking from anon/authenticated alone is not enough: Postgres grants
-- EXECUTE to the PUBLIC pseudo-role by default on function creation, and
-- anon/authenticated inherit through it, so PUBLIC must be revoked too.
revoke execute on function increment_referral_credits(uuid, int) from public;
revoke execute on function increment_referral_credits(uuid, int) from anon, authenticated;

-- Pin search_path to prevent schema-injection via a mutable path in a
-- SECURITY DEFINER function.
alter function increment_referral_credits(uuid, int) set search_path = public;
