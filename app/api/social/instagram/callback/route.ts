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
    return NextResponse.redirect(`${appUrl}/settings?social_error=instagram`)
  }

  const storedState = req.cookies.get("ig_state")?.value
  const userId      = req.cookies.get("ig_uid")?.value

  if (!storedState || storedState !== state || !userId) {
    return NextResponse.redirect(`${appUrl}/settings?social_error=instagram_state`)
  }

  try {
    // Exchange code for short-lived token
    const tokenRes = await fetch("https://graph.facebook.com/v19.0/oauth/access_token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        redirect_uri:  `${appUrl}/api/social/instagram/callback`,
        code,
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok || tokenData.error) throw new Error(tokenData.error?.message || "Token exchange failed")

    // Exchange for long-lived user token (60 days)
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
    const userToken     = longLivedData.access_token || tokenData.access_token
    const expiresIn     = longLivedData.expires_in ?? 5184000 // 60 days default

    // Get Facebook pages to find linked Instagram Business Account
    const pagesRes  = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${userToken}`)
    const pagesData = await pagesRes.json()

    let igUsername: string | null = null
    let igAccountId: string | null = null
    let pageToken = userToken

    if (pagesData.data?.length > 0) {
      const page = pagesData.data[0]
      pageToken  = page.access_token // page token has IG publishing permissions

      const igRes  = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      )
      const igData = await igRes.json()
      igAccountId  = igData.instagram_business_account?.id ?? null

      if (igAccountId) {
        const igInfoRes = await fetch(
          `https://graph.facebook.com/v19.0/${igAccountId}?fields=username&access_token=${page.access_token}`
        )
        const igInfo = await igInfoRes.json()
        igUsername   = igInfo.username ?? null
      }
    }

    // Fallback: get FB user name as identifier
    if (!igUsername) {
      const meRes  = await fetch(`https://graph.facebook.com/v19.0/me?fields=name&access_token=${userToken}`)
      const meData = await meRes.json()
      igUsername   = meData.name ?? "Instagram User"
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    await supabaseAdmin.from("social_accounts").upsert({
      user_id:          userId,
      platform:         "instagram",
      access_token:     pageToken,       // page token required for IG Content Publishing API
      platform_user_id: igAccountId,     // Instagram Business Account ID for publishing
      refresh_token:    null,
      expires_at:       expiresAt.toISOString(),
      username:         igUsername,
    }, { onConflict: "user_id,platform" })

    const res = NextResponse.redirect(`${appUrl}/settings?social_connected=instagram`)
    res.cookies.delete("ig_state")
    res.cookies.delete("ig_uid")
    return res
  } catch {
    return NextResponse.redirect(`${appUrl}/settings?social_error=instagram`)
  }
}
