import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fetchTwitterMetrics(accessToken: string) {
  // Step 1: get the authenticated user's Twitter ID
  const meRes = await fetch("https://api.twitter.com/2/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!meRes.ok) throw new Error("twitter_auth")
  const { data: me } = await meRes.json()

  // Step 2: fetch their last 20 tweets with public metrics
  const tweetsRes = await fetch(
    `https://api.twitter.com/2/users/${me.id}/tweets?max_results=20&tweet.fields=public_metrics,created_at`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!tweetsRes.ok) throw new Error("twitter_tweets")
  const { data: tweets } = await tweetsRes.json()

  if (!tweets?.length) return { platform: "twitter", tweets: [], totals: null }

  const totals = tweets.reduce(
    (acc: Record<string, number>, t: any) => {
      const m = t.public_metrics
      acc.impressions  += m.impression_count  ?? 0
      acc.likes        += m.like_count        ?? 0
      acc.retweets     += m.retweet_count     ?? 0
      acc.replies      += m.reply_count       ?? 0
      acc.quotes       += m.quote_count       ?? 0
      return acc
    },
    { impressions: 0, likes: 0, retweets: 0, replies: 0, quotes: 0 }
  )

  const engagements = totals.likes + totals.retweets + totals.replies + totals.quotes
  const engagementRate = totals.impressions > 0
    ? ((engagements / totals.impressions) * 100).toFixed(2)
    : "0.00"

  return {
    platform: "twitter",
    handle: me.username,
    totals: { ...totals, engagementRate },
    tweets: tweets.slice(0, 5).map((t: any) => ({
      id:          t.id,
      text:        t.text,
      created_at:  t.created_at,
      metrics:     t.public_metrics,
    })),
  }
}

async function fetchLinkedInMetrics(accessToken: string) {
  // Get LinkedIn user info to confirm connection
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!profileRes.ok) throw new Error("linkedin_auth")
  const profile = await profileRes.json()

  // LinkedIn post analytics require organization-level permissions
  // For personal accounts we can only confirm connection status
  return {
    platform:     "linkedin",
    handle:       profile.name,
    connected:    true,
    note:         "Post-level analytics require LinkedIn Partner access.",
    totals:       null,
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Get all connected accounts
    const { data: accounts } = await supabaseAdmin
      .from("social_accounts")
      .select("platform, access_token")
      .eq("user_id", user.id)

    if (!accounts?.length) return NextResponse.json({ platforms: [] })

    const results = await Promise.allSettled(
      accounts.map(async (account) => {
        if (account.platform === "twitter") {
          return fetchTwitterMetrics(account.access_token)
        }
        if (account.platform === "linkedin") {
          return fetchLinkedInMetrics(account.access_token)
        }
        return null
      })
    )

    const platforms = results
      .filter(r => r.status === "fulfilled" && r.value)
      .map(r => (r as PromiseFulfilledResult<any>).value)

    return NextResponse.json({ platforms })
  } catch (err) {
    console.error("Social analytics error:", err)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
