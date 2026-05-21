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

async function postToFacebook(content: string, accessToken: string, pageId: string) {
  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ message: content, access_token: accessToken }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || "Facebook publish failed")
  }
}

async function postToInstagram(content: string, accessToken: string, igAccountId: string, imageUrl: string) {
  const createRes = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ image_url: imageUrl, caption: content, access_token: accessToken }),
  })
  const createData = await createRes.json()
  if (!createRes.ok || createData.error) {
    throw new Error(createData.error?.message || "Failed to create Instagram media container")
  }

  const publishRes = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media_publish`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ creation_id: createData.id, access_token: accessToken }),
  })
  if (!publishRes.ok) {
    const err = await publishRes.json()
    throw new Error(err.error?.message || "Failed to publish to Instagram")
  }
}

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

    const { postId } = await req.json()

    const { data: post } = await supabaseAdmin
      .from("scheduled_posts").select("*").eq("id", postId).eq("user_id", user.id).single()
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

    const { data: account } = await supabaseAdmin
      .from("social_accounts")
      .select("access_token, platform_user_id")
      .eq("user_id", user.id)
      .eq("platform", post.platform)
      .single()

    if (!account) {
      return NextResponse.json({
        error: `${post.platform} not connected. Go to Settings → Connected Accounts.`,
      }, { status: 400 })
    }

    try {
      if (post.platform === "twitter") {
        await postToTwitter(post.content, account.access_token)
      } else if (post.platform === "linkedin") {
        await postToLinkedIn(post.content, account.access_token)
      } else if (post.platform === "facebook") {
        if (!account.platform_user_id) {
          throw new Error("Facebook Page ID missing — please reconnect your Facebook account in Settings.")
        }
        await postToFacebook(post.content, account.access_token, account.platform_user_id)
      } else if (post.platform === "instagram") {
        if (!account.platform_user_id) {
          throw new Error("Instagram Business Account not found — please reconnect Instagram in Settings.")
        }
        if (!post.image_url) {
          throw new Error("Instagram posts require an image. Please add an image when scheduling.")
        }
        await postToInstagram(post.content, account.access_token, account.platform_user_id, post.image_url)
      } else if (post.platform === "youtube") {
        throw new Error("YouTube video publishing is coming soon.")
      } else {
        throw new Error(`Publishing not supported for ${post.platform}`)
      }

      await supabaseAdmin.from("scheduled_posts").update({ status: "published" }).eq("id", postId)

      void supabaseAdmin.from("activity_log").insert({ user_id: user.id, action: `Published ${post.platform} post`, platform: post.platform })

      const { data: prefs } = await supabaseAdmin
        .from("users").select("email_notify_published").eq("id", user.id).single()
      if (prefs?.email_notify_published && user.email) {
        sendPublishedEmail(user.email, post.platform, post.content).catch(console.error)
      }

      return NextResponse.json({ success: true })
    } catch (publishErr: unknown) {
      await supabaseAdmin.from("scheduled_posts").update({ status: "failed" }).eq("id", postId)
      throw publishErr
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Publish failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
