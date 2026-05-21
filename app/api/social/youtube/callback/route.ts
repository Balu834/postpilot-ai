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
    return NextResponse.redirect(`${appUrl}/settings?social_error=youtube`)
  }

  const storedState = req.cookies.get("yt_state")?.value
  const userId      = req.cookies.get("yt_uid")?.value

  if (!storedState || storedState !== state || !userId) {
    return NextResponse.redirect(`${appUrl}/settings?social_error=youtube_state`)
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri:  `${appUrl}/api/social/youtube/callback`,
        grant_type:    "authorization_code",
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok || tokenData.error) throw new Error(tokenData.error_description || tokenData.error || "Token exchange failed")

    // Get the user's YouTube channel info
    const channelRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    )
    const channelData = await channelRes.json()
    const channel     = channelData.items?.[0]
    const channelName = channel?.snippet?.title ?? "YouTube Channel"

    const expiresAt = new Date(Date.now() + (tokenData.expires_in ?? 3600) * 1000)

    await supabaseAdmin.from("social_accounts").upsert({
      user_id:       userId,
      platform:      "youtube",
      access_token:  tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      expires_at:    expiresAt.toISOString(),
      username:      channelName,
    }, { onConflict: "user_id,platform" })

    const res = NextResponse.redirect(`${appUrl}/settings?social_connected=youtube`)
    res.cookies.delete("yt_state")
    res.cookies.delete("yt_uid")
    return res
  } catch {
    return NextResponse.redirect(`${appUrl}/settings?social_error=youtube`)
  }
}
