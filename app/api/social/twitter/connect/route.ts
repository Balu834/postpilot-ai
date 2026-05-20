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

    const codeVerifier  = crypto.randomBytes(32).toString("base64url")
    const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url")

    const params = new URLSearchParams({
      response_type:         "code",
      client_id:             process.env.TWITTER_CLIENT_ID!,
      redirect_uri:          `${process.env.NEXT_PUBLIC_APP_URL}/api/social/twitter/callback`,
      scope:                 "tweet.read tweet.write users.read offline.access",
      state:                 crypto.randomBytes(16).toString("hex"),
      code_challenge:        codeChallenge,
      code_challenge_method: "S256",
    })

    const url = `https://twitter.com/i/oauth2/authorize?${params}`
    const res = NextResponse.json({ url })
    res.cookies.set("tw_cv",  codeVerifier, { httpOnly: true, secure: true, maxAge: 600, sameSite: "lax" })
    res.cookies.set("tw_uid", user.id,      { httpOnly: true, secure: true, maxAge: 600, sameSite: "lax" })
    return res
  } catch {
    return NextResponse.json({ error: "Failed to initiate Twitter auth" }, { status: 500 })
  }
}
