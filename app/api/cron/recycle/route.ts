import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Daily: find evergreen sources due for recirculation and spawn a fresh
// scheduled post from each. The source itself is never touched beyond its
// evergreen_last_recycled_at bookkeeping — the new row is what actually
// gets published (picked up by the existing /api/cron/publish run).
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: sources, error } = await supabaseAdmin
    .from("scheduled_posts")
    .select("id, user_id, content, platform, image_url, evergreen_interval_days, evergreen_last_recycled_at")
    .eq("is_evergreen", true)
    .eq("evergreen_active", true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const now = Date.now()
  const results: { sourceId: string; status: "recycled" | "skipped" | "failed"; error?: string }[] = []

  for (const source of sources ?? []) {
    try {
      const intervalMs = (source.evergreen_interval_days ?? 30) * 24 * 60 * 60 * 1000
      const lastRecycled = source.evergreen_last_recycled_at
        ? new Date(source.evergreen_last_recycled_at).getTime()
        : 0

      if (now - lastRecycled < intervalMs) {
        results.push({ sourceId: source.id, status: "skipped" })
        continue
      }

      const { error: insertError } = await supabaseAdmin.from("scheduled_posts").insert({
        user_id:             source.user_id,
        content:             source.content,
        platform:            source.platform,
        image_url:           source.image_url,
        scheduled_time:      new Date().toISOString(),
        status:              "pending",
        evergreen_source_id: source.id,
      })
      if (insertError) throw insertError

      await supabaseAdmin
        .from("scheduled_posts")
        .update({ evergreen_last_recycled_at: new Date().toISOString() })
        .eq("id", source.id)

      void supabaseAdmin.from("activity_log").insert({
        user_id: source.user_id, action: `Evergreen post recirculated on ${source.platform}`, platform: source.platform,
      })

      results.push({ sourceId: source.id, status: "recycled" })
    } catch (err: unknown) {
      results.push({ sourceId: source.id, status: "failed", error: err instanceof Error ? err.message : "unknown" })
    }
  }

  return NextResponse.json({ processed: results.length, results })
}
