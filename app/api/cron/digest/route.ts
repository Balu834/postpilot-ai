import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendWeeklyDigestEmail } from "@/lib/resend"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Get all users who opted into the weekly digest
  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, email_notify_digest")
    .eq("email_notify_digest", true)

  if (!users || users.length === 0) {
    return NextResponse.json({ sent: 0, message: "No subscribers" })
  }

  let sent = 0

  for (const user of users) {
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id)
      const email = authUser?.user?.email
      if (!email) continue

      // Gather this week's stats
      const [genRes, schedRes, pubRes, platformRes] = await Promise.all([
        supabaseAdmin
          .from("generations")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .gte("created_at", weekAgo),
        supabaseAdmin
          .from("scheduled_posts")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .eq("status", "scheduled")
          .gte("created_at", weekAgo),
        supabaseAdmin
          .from("scheduled_posts")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .eq("status", "published")
          .gte("updated_at", weekAgo),
        supabaseAdmin
          .from("scheduled_posts")
          .select("platform")
          .eq("user_id", user.id)
          .eq("status", "published")
          .gte("updated_at", weekAgo),
      ])

      // Find the most-used platform this week
      const platformCounts: Record<string, number> = {}
      for (const p of (platformRes.data ?? [])) {
        platformCounts[p.platform] = (platformCounts[p.platform] ?? 0) + 1
      }
      const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ""

      await sendWeeklyDigestEmail(email, {
        generated:   genRes.count ?? 0,
        scheduled:   schedRes.count ?? 0,
        published:   pubRes.count ?? 0,
        topPlatform,
      })

      sent++
    } catch (err) {
      console.error(`Digest: failed for user ${user.id}:`, err)
    }
  }

  return NextResponse.json({ sent })
}
