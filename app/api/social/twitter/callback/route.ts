import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const code   = req.nextUrl.searchParams.get("code")
  const error  = req.nextUrl.searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/settings?social_error=twitter`)
  }

  const codeVerifier = req.cookies.get("tw_cv")?.value
  const userId       = req.cookies.get("tw_uid")?.value

  if (!codeVerifier || !userId) {
    return NextResponse.redirect(`${appUrl}/settings?social_error=twitter_session`)
  }

  try {
    const clientId     = process.env.TWITTER_CLIENT_ID!
    const clientSecret = process.env.TWITTER_CLIENT_SECRET!
    const basicAuth    = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        code,
        grant_type:    "authorization_code",
        client_id:     clientId,
        redirect_uri:  `${appUrl}/api/social/twitter/callback`,
        code_verifier: codeVerifier,
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) {
      console.error("Twitter token exchange failed:", JSON.stringify(tokenData))
      throw new Error(tokenData.error_description || tokenData.error || "Token exchange failed")
    }

    const userRes = await fetch("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const userData = await userRes.json()

    const expiresAt = new Date(Date.now() + (tokenData.expires_in ?? 7200) * 1000)

    await supabaseAdmin.from("social_accounts").upsert({
      user_id:       userId,
      platform:      "twitter",
      access_token:  tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      expires_at:    expiresAt.toISOString(),
      username:      userData.data?.username ?? null,
    }, { onConflict: "user_id,platform" })

    const res = NextResponse.redirect(`${appUrl}/settings?social_connected=twitter`)
    res.cookies.delete("tw_cv")
    res.cookies.delete("tw_uid")
    return res
  } catch {
    return NextResponse.redirect(`${appUrl}/settings?social_error=twitter`)
  }
}
