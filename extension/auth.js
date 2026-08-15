import { CONFIG } from "./config.js"

const STORAGE_KEY = "postpilot_session"

// Talks to Supabase's GoTrue REST API directly (the same one the web app's
// supabase-js client calls under the hood) — no SDK needed in an unbundled
// extension.

export async function login(email, password) {
  const res = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", apikey: CONFIG.SUPABASE_ANON_KEY },
    body:    JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || data.msg || "Sign in failed")

  const session = {
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
    expires_at:    Date.now() + (data.expires_in ?? 3600) * 1000,
    email:         data.user?.email ?? email,
  }
  await chrome.storage.local.set({ [STORAGE_KEY]: session })
  return session
}

export async function logout() {
  await chrome.storage.local.remove(STORAGE_KEY)
}

async function refresh(session) {
  const res = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", apikey: CONFIG.SUPABASE_ANON_KEY },
    body:    JSON.stringify({ refresh_token: session.refresh_token }),
  })
  if (!res.ok) {
    await logout()
    return null
  }
  const data = await res.json()
  const next = {
    access_token:  data.access_token,
    refresh_token: data.refresh_token ?? session.refresh_token,
    expires_at:    Date.now() + (data.expires_in ?? 3600) * 1000,
    email:         session.email,
  }
  await chrome.storage.local.set({ [STORAGE_KEY]: next })
  return next
}

// Returns a valid session (refreshing if the stored token is expiring
// within 5 minutes), or null if signed out.
export async function getSession() {
  const { [STORAGE_KEY]: session } = await chrome.storage.local.get(STORAGE_KEY)
  if (!session) return null
  if (session.expires_at - Date.now() < 5 * 60 * 1000) {
    return refresh(session)
  }
  return session
}
