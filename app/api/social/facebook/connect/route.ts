import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

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

    const state = crypto.randomBytes(16).toString("hex")

    const params = new URLSearchParams({
      client_id:     process.env.META_APP_ID!,
      redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL}/api/social/facebook/callback`,
      scope:         "public_profile,pages_show_list,pages_read_user_content",
      response_type: "code",
      state,
    })

    const url = `https://www.facebook.com/v19.0/dialog/oauth?${params}`
    const res = NextResponse.json({ url })
    res.cookies.set("fb_state", state,   { httpOnly: true, secure: true, maxAge: 600, sameSite: "lax" })
    res.cookies.set("fb_uid",   user.id, { httpOnly: true, secure: true, maxAge: 600, sameSite: "lax" })
    return res
  } catch {
    return NextResponse.json({ error: "Failed to initiate Facebook auth" }, { status: 500 })
  }
}
