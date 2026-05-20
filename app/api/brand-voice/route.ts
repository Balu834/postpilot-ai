import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data } = await supabaseAdmin
      .from("brand_voices")
      .select("*")
      .eq("user_id", user.id)
      .single()

    return NextResponse.json({ data: data ?? null })
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()

    const { error } = await supabaseAdmin
      .from("brand_voices")
      .upsert({
        user_id: user.id,
        brand_name: body.brand_name ?? null,
        industry: body.industry ?? null,
        tone: body.tone ?? "engaging",
        audience: body.audience ?? null,
        key_topics: body.key_topics ?? [],
        avoid_words: body.avoid_words ?? [],
        emoji_style: body.emoji_style ?? "moderate",
        sample_post: body.sample_post ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
