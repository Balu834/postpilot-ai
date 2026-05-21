import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function DELETE(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Delete all user data
  await Promise.all([
    supabaseAdmin.from("generations").delete().eq("user_id", user.id),
    supabaseAdmin.from("scheduled_posts").delete().eq("user_id", user.id),
    supabaseAdmin.from("social_accounts").delete().eq("user_id", user.id),
    supabaseAdmin.from("brand_voices").delete().eq("user_id", user.id),
    supabaseAdmin.from("referrals").delete().eq("referrer_id", user.id),
    supabaseAdmin.from("users").delete().eq("id", user.id),
  ])

  // Delete auth user
  await supabaseAdmin.auth.admin.deleteUser(user.id)

  return NextResponse.json({ success: true })
}
