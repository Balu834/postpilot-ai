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
      client_id:     process.env.PINTEREST_APP_ID!,
      redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL}/api/social/pinterest/callback`,
      response_type: "code",
      scope:         "boards:read,pins:read,pins:write,user_accounts:read",
      state,
    })

    const url = `https://www.pinterest.com/oauth/?${params}`
    const res = NextResponse.json({ url })
    res.cookies.set("pinterest_state", state,   { httpOnly: true, secure: true, maxAge: 600, sameSite: "lax" })
    res.cookies.set("pinterest_uid",   user.id, { httpOnly: true, secure: true, maxAge: 600, sameSite: "lax" })
    return res
  } catch (err: unknown) {
    console.error("[OAuth]", err)
    return NextResponse.json({ error: "Failed to initiate Pinterest auth" }, { status: 500 })
  }
}
