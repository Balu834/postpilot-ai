import crypto from "crypto"

// OAuth connect routes remember who started the flow in a short-lived cookie,
// and the callback saves the platform tokens against that user. A plain user id
// can be forged by setting the cookie by hand, which would attach the
// attacker's account to someone else's PostPilot user. Sign it with a server
// secret so the callback only trusts ids this server issued.

function secret(): string {
  const s = process.env.OAUTH_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!s) throw new Error("OAuth cookie secret is not configured")
  return s
}

function mac(uid: string): string {
  return crypto.createHmac("sha256", secret()).update(`oauth-uid:${uid}`).digest("hex")
}

export function signUid(uid: string): string {
  return `${uid}.${mac(uid)}`
}

export function verifyUid(value: string | undefined | null): string | null {
  if (!value) return null
  const dot = value.lastIndexOf(".")
  if (dot <= 0) return null
  const uid = value.slice(0, dot)
  const given = Buffer.from(value.slice(dot + 1), "utf8")
  const expected = Buffer.from(mac(uid), "utf8")
  if (given.length !== expected.length) return null
  return crypto.timingSafeEqual(given, expected) ? uid : null
}
