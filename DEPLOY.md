# PostPilot AI — Deployment Guide

## 1. Supabase — Run migration

Open your Supabase project → SQL Editor → run `supabase/migrations/001_add_onboarding_columns.sql`

This adds the `platforms`, `niche`, `tone`, `goal` columns to `users` and the missing INSERT RLS policy.

If deploying fresh (no existing database), run `supabase/schema.sql` instead.

## 2. Supabase — Enable Google OAuth (if not done)

Dashboard → Authentication → Providers → Google → enable + add credentials.

Redirect URL to whitelist: `https://your-domain.com/auth/callback`

## 3. Deploy to Vercel

```bash
npx vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard.

## 4. Set environment variables in Vercel

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` |

## 5. Update Supabase allowed URLs

Dashboard → Authentication → URL Configuration:
- Site URL: `https://your-domain.com`
- Redirect URLs: `https://your-domain.com/auth/callback`

## 6. Verify

- `/` — landing page loads
- `/login` — split-screen auth works, Google OAuth redirects correctly
- `/onboarding` — 4-step wizard saves to Supabase `users` table
- `/dashboard` — personalized AI suggestions appear after onboarding
- `/generate` — OpenAI call works (check Vercel function logs if not)
