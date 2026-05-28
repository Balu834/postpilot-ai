import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function userClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: { user } } = await userClient(token).auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data } = await supabaseAdmin
    .from("link_in_bio")
    .select("*")
    .eq("user_id", user.id)
    .single()

  // Also fetch connected social accounts
  const { data: accounts } = await supabaseAdmin
    .from("social_accounts")
    .select("platform, username")
    .eq("user_id", user.id)

  return NextResponse.json({ bio: data ?? null, accounts: accounts ?? [] })
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: { user } } = await userClient(token).auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { username, display_name, bio, theme, custom_links, show_platforms, avatar_url } = body

  if (!username) return NextResponse.json({ error: "Username is required" }, { status: 400 })

  const slug = username.toLowerCase().replace(/[^a-z0-9_-]/g, "")
  if (slug.length < 3) return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 })

  // Check uniqueness (allow current user to keep their own)
  const { data: existing } = await supabaseAdmin
    .from("link_in_bio")
    .select("user_id")
    .eq("username", slug)
    .single()

  if (existing && existing.user_id !== user.id) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 })
  }

  const { data, error } = await supabaseAdmin
    .from("link_in_bio")
    .upsert({
      user_id:        user.id,
      username:       slug,
      display_name:   display_name ?? null,
      bio:            bio ?? null,
      avatar_url:     avatar_url ?? null,
      theme:          theme ?? "dark",
      custom_links:   custom_links ?? [],
      show_platforms: show_platforms ?? true,
      updated_at:     new Date().toISOString(),
    }, { onConflict: "user_id" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bio: data })
}
