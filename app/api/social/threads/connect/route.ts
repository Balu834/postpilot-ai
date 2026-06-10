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
      client_id:     process.env.THREADS_APP_ID!,
      redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL}/api/social/threads/callback`,
      scope:         "threads_basic,threads_content_publish",
      response_type: "code",
      state,
    })

    const url = `https://threads.net/oauth/authorize?${params}`
    const res = NextResponse.json({ url })
    res.cookies.set("threads_state", state,   { httpOnly: true, secure: true, maxAge: 600, sameSite: "lax" })
    res.cookies.set("threads_uid",   user.id, { httpOnly: true, secure: true, maxAge: 600, sameSite: "lax" })
    return res
  } catch {
    return NextResponse.json({ error: "Failed to initiate Threads auth" }, { status: 500 })
  }
}
