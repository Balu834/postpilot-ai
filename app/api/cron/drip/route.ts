import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendDay2TipsEmail, sendDay7UpgradeEmail } from "@/lib/resend"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function daysBetween(a: Date, b: Date) {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

export async function GET(req: NextRequest) {
  if (
    process.env.CRON_SECRET &&
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  if (!authUsers?.users?.length) return NextResponse.json({ sent: 0 })

  let sent = 0

  for (const user of authUsers.users) {
    if (!user.email) continue
    const createdAt = new Date(user.created_at)
    const age = daysBetween(createdAt, now)
    const meta = (user.user_metadata ?? {}) as Record<string, boolean>

    if (age === 2 && !meta.drip_day2_sent) {
      await sendDay2TipsEmail(user.email).catch(console.error)
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { ...meta, drip_day2_sent: true },
      })
      sent++
    } else if (age === 7 && !meta.drip_day7_sent) {
      const { count } = await supabaseAdmin
        .from("generations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
      await sendDay7UpgradeEmail(user.email, count ?? 0).catch(console.error)
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { ...meta, drip_day7_sent: true },
      })
      sent++
    }
  }

  return NextResponse.json({ sent })
}
