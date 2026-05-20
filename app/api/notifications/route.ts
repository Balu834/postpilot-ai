import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Recent published posts
    const { data: published } = await supabaseAdmin
      .from("scheduled_posts")
      .select("id, platform, content, scheduled_time")
      .eq("user_id", user.id)
      .eq("status", "published")
      .order("scheduled_time", { ascending: false })
      .limit(5)

    // Recent failed posts
    const { data: failed } = await supabaseAdmin
      .from("scheduled_posts")
      .select("id, platform, content, scheduled_time")
      .eq("user_id", user.id)
      .eq("status", "failed")
      .order("scheduled_time", { ascending: false })
      .limit(3)

    // Recent generations (last 5)
    const { data: generations } = await supabaseAdmin
      .from("generations")
      .select("id, prompt, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    type Notification = {
      id: string
      type: "published" | "failed" | "generated"
      title: string
      body: string
      time: string
    }

    const notifications: Notification[] = []

    for (const p of published ?? []) {
      notifications.push({
        id: `pub_${p.id}`,
        type: "published",
        title: `${p.platform.charAt(0).toUpperCase() + p.platform.slice(1)} post published`,
        body: p.content.slice(0, 80) + (p.content.length > 80 ? "…" : ""),
        time: p.scheduled_time,
      })
    }

    for (const f of failed ?? []) {
      notifications.push({
        id: `fail_${f.id}`,
        type: "failed",
        title: `${f.platform.charAt(0).toUpperCase() + f.platform.slice(1)} post failed`,
        body: f.content.slice(0, 80) + (f.content.length > 80 ? "…" : ""),
        time: f.scheduled_time,
      })
    }

    for (const g of generations ?? []) {
      notifications.push({
        id: `gen_${g.id}`,
        type: "generated",
        title: "Content generated",
        body: g.prompt?.slice(0, 80) ?? "AI content pack",
        time: g.created_at,
      })
    }

    // Sort by time desc, take top 10
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    return NextResponse.json({ notifications: notifications.slice(0, 10) })
  } catch (err) {
    console.error("Notifications error:", err)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
