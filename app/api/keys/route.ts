import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { generateApiKey, MAX_KEYS_PER_USER } from "@/lib/api-keys"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function requireAgencyUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return null

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("plan_name")
    .eq("id", user.id)
    .single()

  if (profile?.plan_name !== "agency") return null
  return user
}

export async function GET(req: NextRequest) {
  const user = await requireAgencyUser(req)
  if (!user) return NextResponse.json({ error: "Agency plan required" }, { status: 403 })

  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ keys: data })
}

export async function POST(req: NextRequest) {
  const user = await requireAgencyUser(req)
  if (!user) return NextResponse.json({ error: "Agency plan required" }, { status: 403 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: "Key name is required" }, { status: 400 })

  const { count } = await supabaseAdmin
    .from("api_keys")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("revoked_at", null)

  if ((count ?? 0) >= MAX_KEYS_PER_USER) {
    return NextResponse.json({ error: `You can have at most ${MAX_KEYS_PER_USER} active API keys — revoke one first` }, { status: 400 })
  }

  const { key, prefix, hash } = generateApiKey()

  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .insert({ user_id: user.id, name: name.trim(), key_prefix: prefix, key_hash: hash })
    .select("id, name, key_prefix, created_at")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // The raw key is only ever returned here — it can't be recovered later.
  return NextResponse.json({ apiKey: key, key: data })
}
