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

// PATCH /api/evergreen/[id] — pause, resume, remove, or change the interval
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { action, intervalDays } = await req.json()

  const { data: post } = await supabaseAdmin
    .from("scheduled_posts")
    .select("id, user_id, is_evergreen")
    .eq("id", id)
    .single()

  if (!post || post.user_id !== user.id || !post.is_evergreen) {
    return NextResponse.json({ error: "Evergreen post not found" }, { status: 404 })
  }

  let update: Record<string, unknown>
  if (action === "pause") {
    update = { evergreen_active: false }
  } else if (action === "resume") {
    update = { evergreen_active: true, evergreen_last_recycled_at: new Date().toISOString() }
  } else if (action === "remove") {
    update = { is_evergreen: false, evergreen_active: false, evergreen_interval_days: null }
  } else if (action === "set_interval") {
    const interval = Number(intervalDays)
    if (![7, 14, 30, 60, 90].includes(interval)) {
      return NextResponse.json({ error: "intervalDays must be one of 7, 14, 30, 60, 90" }, { status: 400 })
    }
    update = { evergreen_interval_days: interval }
  } else {
    return NextResponse.json({ error: "action must be pause, resume, remove, or set_interval" }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from("scheduled_posts").update(update).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
