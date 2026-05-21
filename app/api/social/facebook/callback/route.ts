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
    return NextResponse.redirect(`${appUrl}/settings?social_error=facebook`)
  }

  const storedState = req.cookies.get("fb_state")?.value
  const userId      = req.cookies.get("fb_uid")?.value

  if (!storedState || storedState !== state || !userId) {
    return NextResponse.redirect(`${appUrl}/settings?social_error=facebook_state`)
  }

  try {
    // Exchange code for short-lived user token
    const tokenRes = await fetch("https://graph.facebook.com/v19.0/oauth/access_token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        redirect_uri:  `${appUrl}/api/social/facebook/callback`,
        code,
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok || tokenData.error) throw new Error(tokenData.error?.message || "Token exchange failed")

    // Exchange for long-lived token (60 days)
    const longLivedRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      new URLSearchParams({
        grant_type:        "fb_exchange_token",
        client_id:         process.env.META_APP_ID!,
        client_secret:     process.env.META_APP_SECRET!,
        fb_exchange_token: tokenData.access_token,
      })
    )
    const longLivedData = await longLivedRes.json()
    const accessToken   = longLivedData.access_token || tokenData.access_token
    const expiresIn     = longLivedData.expires_in ?? 5184000 // 60 days default

    // Get the user's name
    const meRes  = await fetch(`https://graph.facebook.com/v19.0/me?fields=name&access_token=${accessToken}`)
    const meData = await meRes.json()
    const fbName = meData.name ?? "Facebook User"

    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    await supabaseAdmin.from("social_accounts").upsert({
      user_id:       userId,
      platform:      "facebook",
      access_token:  accessToken,
      refresh_token: null,
      expires_at:    expiresAt.toISOString(),
      username:      fbName,
    }, { onConflict: "user_id,platform" })

    const res = NextResponse.redirect(`${appUrl}/settings?social_connected=facebook`)
    res.cookies.delete("fb_state")
    res.cookies.delete("fb_uid")
    return res
  } catch {
    return NextResponse.redirect(`${appUrl}/settings?social_error=facebook`)
  }
}
