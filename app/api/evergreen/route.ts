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

// GET /api/evergreen — list evergreen sources + everything they've spawned
export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [sourcesRes, historyRes] = await Promise.all([
    supabaseAdmin
      .from("scheduled_posts")
      .select("id, content, platform, evergreen_active, evergreen_interval_days, evergreen_last_recycled_at")
      .eq("user_id", user.id)
      .eq("is_evergreen", true)
      .order("evergreen_last_recycled_at", { ascending: false }),
    supabaseAdmin
      .from("scheduled_posts")
      .select("id, content, platform, scheduled_time, status, evergreen_source_id")
      .eq("user_id", user.id)
      .not("evergreen_source_id", "is", null)
      .order("scheduled_time", { ascending: false })
      .limit(50),
  ])

  return NextResponse.json({
    sources: sourcesRes.data ?? [],
    history: historyRes.data ?? [],
  })
}

// POST /api/evergreen — mark a published post as an evergreen source
export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { postId, intervalDays } = await req.json()
  const interval = Number(intervalDays)
  if (![7, 14, 30, 60, 90].includes(interval)) {
    return NextResponse.json({ error: "intervalDays must be one of 7, 14, 30, 60, 90" }, { status: 400 })
  }

  const { data: post } = await supabaseAdmin
    .from("scheduled_posts")
    .select("id, user_id, status")
    .eq("id", postId)
    .single()

  if (!post || post.user_id !== user.id) return NextResponse.json({ error: "Post not found" }, { status: 404 })
  if (post.status !== "published") {
    return NextResponse.json({ error: "Only published posts can be marked evergreen" }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from("scheduled_posts")
    .update({
      is_evergreen:               true,
      evergreen_active:           true,
      evergreen_interval_days:    interval,
      evergreen_last_recycled_at: new Date().toISOString(),
    })
    .eq("id", postId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
