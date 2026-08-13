import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface FetchedMention {
  platform_reply_id: string
  author_handle: string | null
  author_name: string | null
  content: string
  permalink: string | null
}

// ── Twitter ──────────────────────────────────────────────────────────────

async function refreshTwitterToken(userId: string, refreshToken: string): Promise<string> {
  const clientId     = process.env.TWITTER_CLIENT_ID!
  const clientSecret = process.env.TWITTER_CLIENT_SECRET!
  const basicAuth    = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${basicAuth}` },
    body:    new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken, client_id: clientId }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || "Twitter token refresh failed")

  const expiresAt = new Date(Date.now() + (data.expires_in ?? 7200) * 1000)
  await supabaseAdmin.from("social_accounts").update({
    access_token:  data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    expires_at:    expiresAt.toISOString(),
  }).eq("user_id", userId).eq("platform", "twitter")

  return data.access_token
}

export async function getValidTwitterToken(userId: string): Promise<string> {
  const { data: account } = await supabaseAdmin
    .from("social_accounts")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .eq("platform", "twitter")
    .single()

  if (!account?.access_token) throw new Error("Twitter not connected — go to Settings → Connected Accounts.")

  const shouldRefresh = account.refresh_token && (
    !account.expires_at || new Date(account.expires_at).getTime() - Date.now() < 5 * 60 * 1000
  )
  if (shouldRefresh) return refreshTwitterToken(userId, account.refresh_token)
  return account.access_token
}

export async function fetchTwitterMentions(accessToken: string): Promise<FetchedMention[]> {
  const meRes = await fetch("https://api.twitter.com/2/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const me = await meRes.json()
  if (!meRes.ok || !me.data?.id) throw new Error("Failed to look up Twitter account")

  const res = await fetch(
    `https://api.twitter.com/2/users/${me.data.id}/mentions?max_results=20&tweet.fields=created_at,author_id&expansions=author_id&user.fields=username,name`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || data.title || "Failed to fetch Twitter mentions")

  const usersById = new Map<string, { username: string; name: string }>(
    (data.includes?.users ?? []).map((u: { id: string; username: string; name: string }) => [u.id, u])
  )

  return (data.data ?? []).map((t: { id: string; text: string; author_id?: string }) => {
    const author = t.author_id ? usersById.get(t.author_id) : undefined
    return {
      platform_reply_id: t.id,
      author_handle:      author?.username ? `@${author.username}` : null,
      author_name:        author?.name ?? null,
      content:            t.text,
      permalink:          author?.username ? `https://twitter.com/${author.username}/status/${t.id}` : null,
    }
  })
}

export async function sendTwitterReply(accessToken: string, inReplyToTweetId: string, text: string) {
  const res = await fetch("https://api.twitter.com/2/tweets", {
    method:  "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body:    JSON.stringify({ text: text.slice(0, 280), reply: { in_reply_to_tweet_id: inReplyToTweetId } }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || err.title || "Failed to send Twitter reply")
  }
}

// ── Bluesky ──────────────────────────────────────────────────────────────

async function blueskySession(handle: string, appPassword: string) {
  const res = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ identifier: handle, password: appPassword }),
  })
  const session = await res.json()
  if (!res.ok) throw new Error(session.message || "Bluesky auth failed — please reconnect in Settings.")
  return session as { accessJwt: string; did: string }
}

interface BlueskyNotification {
  uri: string
  cid: string
  reason: string
  author: { handle: string; displayName?: string }
  record: { text?: string; reply?: { root: { uri: string; cid: string }; parent: { uri: string; cid: string } } }
}

export async function fetchBlueskyMentions(handle: string, appPassword: string): Promise<FetchedMention[]> {
  const session = await blueskySession(handle, appPassword)

  const res = await fetch("https://bsky.social/xrpc/app.bsky.notification.listNotifications?limit=30", {
    headers: { Authorization: `Bearer ${session.accessJwt}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Failed to fetch Bluesky notifications")

  const relevant = (data.notifications ?? []).filter(
    (n: BlueskyNotification) => n.reason === "mention" || n.reason === "reply"
  )

  return relevant.map((n: BlueskyNotification) => {
    const rkey = n.uri.split("/").pop()
    return {
      platform_reply_id: n.uri,
      author_handle:      `@${n.author.handle}`,
      author_name:        n.author.displayName ?? null,
      content:            n.record.text ?? "",
      permalink:          `https://bsky.app/profile/${n.author.handle}/post/${rkey}`,
    }
  })
}

export async function sendBlueskyReply(
  handle: string, appPassword: string, replyToUri: string, text: string
) {
  const session = await blueskySession(handle, appPassword)

  // Look up the original post to thread the reply correctly (root vs. parent).
  const postRes = await fetch(
    `https://bsky.social/xrpc/app.bsky.feed.getPosts?uris=${encodeURIComponent(replyToUri)}`,
    { headers: { Authorization: `Bearer ${session.accessJwt}` } }
  )
  const postData = await postRes.json()
  const post = postData.posts?.[0]
  if (!post) throw new Error("Original Bluesky post no longer exists")

  const parent = { uri: post.uri, cid: post.cid }
  const root   = post.record?.reply?.root ?? parent

  const res = await fetch("https://bsky.social/xrpc/com.atproto.repo.createRecord", {
    method:  "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessJwt}` },
    body: JSON.stringify({
      repo:       session.did,
      collection: "app.bsky.feed.post",
      record: {
        $type:     "app.bsky.feed.post",
        text:      text.slice(0, 300),
        reply:     { root, parent },
        createdAt: new Date().toISOString(),
      },
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || "Failed to send Bluesky reply")
  }
}

// ── AI draft ─────────────────────────────────────────────────────────────

export async function draftReply(platform: string, authorHandle: string | null, content: string): Promise<string> {
  const prompt = `You are a social media community manager replying on ${platform === "twitter" ? "Twitter/X" : "Bluesky"}.

Someone${authorHandle ? ` (${authorHandle})` : ""} wrote: "${content}"

Write ONE short, natural, friendly reply. Keep it concise and platform-appropriate (${platform === "twitter" ? "under 280 characters" : "under 300 characters"}). No hashtags unless clearly fitting. Return ONLY the reply text, nothing else.`

  const res = await openai.chat.completions.create({
    model:       "gpt-4o-mini",
    messages:    [{ role: "user", content: prompt }],
    temperature: 0.8,
    max_tokens:  150,
  })

  return res.choices[0].message.content?.trim() ?? ""
}
