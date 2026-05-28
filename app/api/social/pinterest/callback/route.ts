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
    return NextResponse.redirect(`${appUrl}/settings?social_error=pinterest`)
  }

  const storedState = req.cookies.get("pinterest_state")?.value
  const userId      = req.cookies.get("pinterest_uid")?.value

  if (!storedState || storedState !== state || !userId) {
    return NextResponse.redirect(`${appUrl}/settings?social_error=pinterest_state`)
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_APP_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type:   "authorization_code",
        code,
        redirect_uri: `${appUrl}/api/social/pinterest/callback`,
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok || tokenData.error) throw new Error(tokenData.message || "Token exchange failed")

    const accessToken  = tokenData.access_token
    const refreshToken = tokenData.refresh_token ?? null
    const expiresIn    = tokenData.expires_in ?? 2592000 // 30 days default

    // Get user profile
    const profileRes = await fetch("https://api.pinterest.com/v5/user_account", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const profile = await profileRes.json()

    // Get first board to use as default
    const boardsRes = await fetch("https://api.pinterest.com/v5/boards?page_size=1", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const boardsData = await boardsRes.json()
    const defaultBoardId = boardsData.items?.[0]?.id ?? null

    await supabaseAdmin.from("social_accounts").upsert({
      user_id:          userId,
      platform:         "pinterest",
      access_token:     accessToken,
      refresh_token:    refreshToken,
      platform_user_id: defaultBoardId,  // default board for posting
      expires_at:       new Date(Date.now() + expiresIn * 1000).toISOString(),
      username:         profile.username ?? "Pinterest User",
    }, { onConflict: "user_id,platform" })

    const res = NextResponse.redirect(`${appUrl}/settings?social_connected=pinterest`)
    res.cookies.delete("pinterest_state")
    res.cookies.delete("pinterest_uid")
    return res
  } catch {
    return NextResponse.redirect(`${appUrl}/settings?social_error=pinterest`)
  }
}
