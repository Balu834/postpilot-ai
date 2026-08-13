import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendWelcomeEmail } from "@/lib/resend"

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("welcome_sent")
    .eq("id", user.id)
    .single()

  if (profile?.welcome_sent) {
    return NextResponse.json({ success: true, skipped: true })
  }

  try {
    await sendWelcomeEmail(user.email)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 })
  }

  await supabaseAdmin.from("users").update({ welcome_sent: true }).eq("id", user.id)

  return NextResponse.json({ success: true })
}
