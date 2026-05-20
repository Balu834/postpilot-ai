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
    return NextResponse.redirect(`${appUrl}/settings?social_error=linkedin`)
  }

  const storedState = req.cookies.get("li_state")?.value
  const userId      = req.cookies.get("li_uid")?.value

  if (!storedState || storedState !== state || !userId) {
    return NextResponse.redirect(`${appUrl}/settings?social_error=linkedin_state`)
  }

  try {
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "authorization_code",
        code,
        redirect_uri:  `${appUrl}/api/social/linkedin/callback`,
        client_id:     process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) throw new Error("Token exchange failed")

    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profile = await profileRes.json()

    const expiresAt = new Date(Date.now() + (tokenData.expires_in ?? 5184000) * 1000)

    await supabaseAdmin.from("social_accounts").upsert({
      user_id:       userId,
      platform:      "linkedin",
      access_token:  tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      expires_at:    expiresAt.toISOString(),
      username:      profile.name || profile.email || "LinkedIn User",
    }, { onConflict: "user_id,platform" })

    const res = NextResponse.redirect(`${appUrl}/settings?social_connected=linkedin`)
    res.cookies.delete("li_state")
    res.cookies.delete("li_uid")
    return res
  } catch {
    return NextResponse.redirect(`${appUrl}/settings?social_error=linkedin`)
  }
}
