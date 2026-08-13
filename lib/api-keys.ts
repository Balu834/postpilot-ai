import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const MAX_KEYS_PER_USER = 5

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const secret = crypto.randomBytes(24).toString("base64url")
  const key    = `ppk_live_${secret}`
  const prefix = key.slice(0, 16) // shown in the UI, e.g. ppk_live_ab12cd34…
  const hash   = crypto.createHash("sha256").update(key).digest("hex")
  return { key, prefix, hash }
}

export interface ApiKeyAuthResult {
  userId: string
}

// Verifies a raw API key from an Authorization header against the hashed
// record, rejecting revoked keys. Updates last_used_at on success.
export async function verifyApiKey(rawKey: string): Promise<ApiKeyAuthResult | null> {
  if (!rawKey.startsWith("ppk_live_")) return null
  const hash = crypto.createHash("sha256").update(rawKey).digest("hex")

  const { data } = await supabaseAdmin
    .from("api_keys")
    .select("id, user_id, revoked_at")
    .eq("key_hash", hash)
    .single()

  if (!data || data.revoked_at) return null

  void supabaseAdmin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id)

  return { userId: data.user_id }
}
