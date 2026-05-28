import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const code   = req.nextUrl.searchParams.get("code")
  const state  = req.nextUrl.searchParams.get("state")
  const error  = req.nextUrl.searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/settings?social_error=threads`)
  }

  const storedState = req.cookies.get("threads_state")?.value
  const userId      = req.cookies.get("threads_uid")?.value

  if (!storedState || storedState !== state || !userId) {
    return NextResponse.redirect(`${appUrl}/settings?social_error=threads_state`)
  }

  try {
    // Exchange code for short-lived token
    const tokenRes = await fetch("https://graph.threads.net/oauth/access_token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        redirect_uri:  `${appUrl}/api/social/threads/callback`,
        code,
        grant_type:    "authorization_code",
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok || tokenData.error) throw new Error(tokenData.error?.message || "Token exchange failed")

    // Exchange for long-lived token (60 days)
    const longLivedRes = await fetch(
      `https://graph.threads.net/access_token?` +
      new URLSearchParams({
        grant_type:    "th_exchange_token",
        client_id:     process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        access_token:  tokenData.access_token,
      })
    )
    const longLivedData = await longLivedRes.json()
    const accessToken   = longLivedData.access_token || tokenData.access_token
    const expiresIn     = longLivedData.expires_in ?? 5184000

    // Get Threads user profile
    const profileRes = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,username&access_token=${accessToken}`
    )
    const profile = await profileRes.json()
    if (!profile?.id) throw new Error("Failed to get Threads profile")

    await supabaseAdmin.from("social_accounts").upsert({
      user_id:          userId,
      platform:         "threads",
      access_token:     accessToken,
      platform_user_id: profile.id,
      refresh_token:    null,
      expires_at:       new Date(Date.now() + expiresIn * 1000).toISOString(),
      username:         profile.username ?? "Threads User",
    }, { onConflict: "user_id,platform" })

    const res = NextResponse.redirect(`${appUrl}/settings?social_connected=threads`)
    res.cookies.delete("threads_state")
    res.cookies.delete("threads_uid")
    return res
  } catch {
    return NextResponse.redirect(`${appUrl}/settings?social_error=threads`)
  }
}
