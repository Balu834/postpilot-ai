import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import {
  getValidTwitterToken, fetchTwitterMentions,
  fetchBlueskyMentions, draftReply,
} from "@/lib/socialReplies"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

// GET /api/replies/inbox — pull fresh mentions from connected Twitter/Bluesky
// accounts, draft an AI reply for any new ones, and return the live inbox.
export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: accounts } = await supabaseAdmin
    .from("social_accounts")
    .select("platform, access_token, platform_user_id")
    .eq("user_id", user.id)
    .in("platform", ["twitter", "bluesky"])

  const connected = { twitter: false, bluesky: false }
  const errors: string[] = []

  for (const account of accounts ?? []) {
    try {
      let mentions
      if (account.platform === "twitter") {
        connected.twitter = true
        const accessToken = await getValidTwitterToken(user.id)
        mentions = await fetchTwitterMentions(accessToken)
      } else if (account.platform === "bluesky") {
        connected.bluesky = true
        if (!account.platform_user_id) throw new Error("Bluesky handle missing — please reconnect in Settings.")
        mentions = await fetchBlueskyMentions(account.platform_user_id, account.access_token)
      } else {
        continue
      }

      for (const m of mentions) {
        const { data: existing } = await supabaseAdmin
          .from("social_replies")
          .select("id")
          .eq("user_id", user.id)
          .eq("platform", account.platform)
          .eq("platform_reply_id", m.platform_reply_id)
          .maybeSingle()

        if (existing) continue

        const draft = await draftReply(account.platform, m.author_handle, m.content).catch(() => "")

        await supabaseAdmin.from("social_replies").insert({
          user_id:            user.id,
          platform:           account.platform,
          platform_reply_id:  m.platform_reply_id,
          author_handle:      m.author_handle,
          author_name:        m.author_name,
          content:            m.content,
          permalink:          m.permalink,
          ai_draft:           draft,
        })
      }
    } catch (err: unknown) {
      errors.push(`${account.platform}: ${err instanceof Error ? err.message : "sync failed"}`)
    }
  }

  const { data: inbox } = await supabaseAdmin
    .from("social_replies")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(50)

  return NextResponse.json({ inbox: inbox ?? [], connected, errors })
}
