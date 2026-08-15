import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ plan_name: "free" })
    .neq("plan_name", "free")
    .lt("plan_expires_at", now)
    .select("id")

  if (error) {
    console.error("Cron: failed to downgrade expired plans", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ downgraded: data?.length ?? 0 })
}
