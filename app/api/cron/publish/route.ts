import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendPublishedEmail } from "@/lib/resend"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function postToTwitter(content: string, accessToken: string) {
  const res = await fetch("https://api.twitter.com/2/tweets", {
    method:  "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body:    JSON.stringify({ text: content.slice(0, 280) }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || err.title || "Twitter publish failed")
  }
}

async function postToLinkedIn(content: string, accessToken: string) {
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const profile   = await profileRes.json()
  const authorUrn = `urn:li:person:${profile.sub}`

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method:  "POST",
    headers: {
      Authorization:               `Bearer ${accessToken}`,
      "Content-Type":              "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author:          authorUrn,
      lifecycleState:  "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary:    { text: content },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || "LinkedIn publish failed")
  }
}

export async function GET(req: NextRequest) {
  // Verify the request comes from Vercel cron (or an authorized caller)
  const authHeader = req.headers.get("authorization")
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch all posts that are due to be published
  const now = new Date().toISOString()
  const { data: duePosts, error } = await supabaseAdmin
    .from("scheduled_posts")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_time", now)

  if (error) {
    console.error("Cron: failed to fetch due posts", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!duePosts || duePosts.length === 0) {
    return NextResponse.json({ published: 0, message: "No posts due" })
  }

  const results: { id: string; status: "published" | "failed"; error?: string }[] = []

  for (const post of duePosts) {
    try {
      // Get the connected social account for this user + platform
      const { data: account } = await supabaseAdmin
        .from("social_accounts")
        .select("access_token")
        .eq("user_id", post.user_id)
        .eq("platform", post.platform)
        .single()

      if (!account?.access_token) {
        throw new Error(`${post.platform} not connected`)
      }

      if (post.platform === "twitter") {
        await postToTwitter(post.content, account.access_token)
      } else if (post.platform === "linkedin") {
        await postToLinkedIn(post.content, account.access_token)
      } else {
        throw new Error(`Auto-publish not supported for ${post.platform}`)
      }

      await supabaseAdmin
        .from("scheduled_posts")
        .update({ status: "published" })
        .eq("id", post.id)

      // Fire email notification if the user has it enabled
      const { data: prefs } = await supabaseAdmin
        .from("users")
        .select("email_notify_published")
        .eq("id", post.user_id)
        .single()

      if (prefs?.email_notify_published) {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(post.user_id)
        if (authUser?.user?.email) {
          sendPublishedEmail(authUser.user.email, post.platform, post.content).catch(console.error)
        }
      }

      results.push({ id: post.id, status: "published" })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      console.error(`Cron: failed to publish post ${post.id}:`, message)

      await supabaseAdmin
        .from("scheduled_posts")
        .update({ status: "failed" })
        .eq("id", post.id)

      results.push({ id: post.id, status: "failed", error: message })
    }
  }

  const published = results.filter(r => r.status === "published").length
  const failed    = results.filter(r => r.status === "failed").length

  console.log(`Cron: published ${published}, failed ${failed}`)
  return NextResponse.json({ published, failed, results })
}
