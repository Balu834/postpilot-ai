import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyApiKey } from "@/lib/api-keys"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_PLATFORMS = new Set(["instagram", "linkedin", "twitter", "facebook", "threads", "bluesky", "pinterest", "youtube"])

async function authenticate(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null
  return verifyApiKey(token)
}

// GET /api/v1/posts — list your scheduled posts
export async function GET(req: NextRequest) {
  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized — invalid or missing API key" }, { status: 401 })

  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 20, 100)

  const { data, error } = await supabaseAdmin
    .from("scheduled_posts")
    .select("id, content, platform, scheduled_time, status, image_url")
    .eq("user_id", auth.userId)
    .order("scheduled_time", { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data })
}

// POST /api/v1/posts — create a scheduled post
export async function POST(req: NextRequest) {
  const auth = await authenticate(req)
  if (!auth) return NextResponse.json({ error: "Unauthorized — invalid or missing API key" }, { status: 401 })

  const { content, platform, scheduled_time } = await req.json()

  if (!content?.trim()) return NextResponse.json({ error: "content is required" }, { status: 400 })
  if (!VALID_PLATFORMS.has(String(platform).toLowerCase())) {
    return NextResponse.json({ error: `platform must be one of: ${[...VALID_PLATFORMS].join(", ")}` }, { status: 400 })
  }
  const date = new Date(scheduled_time)
  if (isNaN(date.getTime())) return NextResponse.json({ error: "scheduled_time must be a valid ISO date" }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from("scheduled_posts")
    .insert({
      user_id:        auth.userId,
      content:        content.trim(),
      platform:       String(platform).toLowerCase(),
      scheduled_time: date.toISOString(),
      status:         "pending",
      image_url:      null,
    })
    .select("id, content, platform, scheduled_time, status")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data }, { status: 201 })
}
