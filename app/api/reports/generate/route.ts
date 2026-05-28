import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { from, to, platforms } = await req.json()
  if (!from || !to) return NextResponse.json({ error: "Date range required" }, { status: 400 })

  const fromDate = new Date(from).toISOString()
  const toDate   = new Date(to + "T23:59:59").toISOString()

  let postsQuery = supabaseAdmin
    .from("scheduled_posts")
    .select("id,platform,content,status,scheduled_time")
    .eq("user_id", user.id)
    .gte("scheduled_time", fromDate)
    .lte("scheduled_time", toDate)
    .order("scheduled_time", { ascending: false })

  if (platforms?.length) {
    postsQuery = postsQuery.in("platform", platforms)
  }

  const [postsRes, genRes, activityRes] = await Promise.all([
    postsQuery,
    supabaseAdmin
      .from("generations")
      .select("id,prompt,created_at", { count: "exact" })
      .eq("user_id", user.id)
      .gte("created_at", fromDate)
      .lte("created_at", toDate),
    supabaseAdmin
      .from("activity_log")
      .select("action,platform,created_at")
      .eq("user_id", user.id)
      .gte("created_at", fromDate)
      .lte("created_at", toDate)
      .order("created_at", { ascending: false })
      .limit(20),
  ])

  const posts     = postsRes.data ?? []
  const published = posts.filter(p => p.status === "published")
  const scheduled = posts.filter(p => p.status === "pending")
  const failed    = posts.filter(p => p.status === "failed")

  // Platform breakdown
  const platformCounts: Record<string, { total: number; published: number; failed: number }> = {}
  for (const p of posts) {
    if (!platformCounts[p.platform]) platformCounts[p.platform] = { total: 0, published: 0, failed: 0 }
    platformCounts[p.platform].total++
    if (p.status === "published") platformCounts[p.platform].published++
    if (p.status === "failed")    platformCounts[p.platform].failed++
  }

  // Success rate
  const totalAttempted = published.length + failed.length
  const successRate    = totalAttempted > 0 ? Math.round((published.length / totalAttempted) * 100) : 100

  // Top platform by total
  const topPlatform = Object.entries(platformCounts)
    .sort((a, b) => b[1].total - a[1].total)[0]?.[0] ?? null

  return NextResponse.json({
    summary: {
      totalPosts:   posts.length,
      published:    published.length,
      scheduled:    scheduled.length,
      failed:       failed.length,
      generated:    genRes.count ?? 0,
      successRate,
      topPlatform,
    },
    platformBreakdown: platformCounts,
    recentPosts:       posts.slice(0, 20).map(p => ({
      id:             p.id,
      platform:       p.platform,
      content:        p.content.slice(0, 120) + (p.content.length > 120 ? "…" : ""),
      status:         p.status,
      scheduled_time: p.scheduled_time,
    })),
    activity: activityRes.data ?? [],
  })
}
