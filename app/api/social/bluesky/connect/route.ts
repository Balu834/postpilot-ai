import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { handle, appPassword } = await req.json()
    if (!handle || !appPassword) {
      return NextResponse.json({ error: "Handle and App Password are required" }, { status: 400 })
    }

    // Validate credentials by creating a session
    const sessionRes = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ identifier: handle.trim(), password: appPassword.trim() }),
    })
    const session = await sessionRes.json()
    if (!sessionRes.ok) {
      const msg = session.message || session.error || "Invalid handle or App Password"
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    // Save: access_token = appPassword (used for future sessions), platform_user_id = handle
    await supabaseAdmin.from("social_accounts").upsert({
      user_id:          user.id,
      platform:         "bluesky",
      access_token:     appPassword.trim(),
      platform_user_id: handle.trim(),
      refresh_token:    null,
      expires_at:       null,
      username:         (session.handle ?? handle).replace(/^@/, ""),
    }, { onConflict: "user_id,platform" })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error("[OAuth]", err)
    return NextResponse.json({ error: "Failed to connect Bluesky" }, { status: 500 })
  }
}
