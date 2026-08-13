import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getValidTwitterToken, sendTwitterReply, sendBlueskyReply } from "@/lib/socialReplies"

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

// POST /api/replies/inbox/[id] — send the (possibly edited) reply for real
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: "Reply text is required" }, { status: 400 })

  const { data: item } = await supabaseAdmin
    .from("social_replies")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (item.status !== "new") return NextResponse.json({ error: "This reply was already handled" }, { status: 409 })

  try {
    if (item.platform === "twitter") {
      const accessToken = await getValidTwitterToken(user.id)
      await sendTwitterReply(accessToken, item.platform_reply_id, text.trim())
    } else if (item.platform === "bluesky") {
      const { data: account } = await supabaseAdmin
        .from("social_accounts")
        .select("access_token, platform_user_id")
        .eq("user_id", user.id)
        .eq("platform", "bluesky")
        .single()
      if (!account?.platform_user_id) throw new Error("Bluesky not connected")
      await sendBlueskyReply(account.platform_user_id, account.access_token, item.platform_reply_id, text.trim())
    } else {
      throw new Error(`Sending not supported for ${item.platform}`)
    }
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to send reply" }, { status: 500 })
  }

  await supabaseAdmin
    .from("social_replies")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id)

  void supabaseAdmin.from("activity_log").insert({
    user_id: user.id, action: `Replied to a ${item.platform} mention`, platform: item.platform,
  })

  return NextResponse.json({ success: true })
}

// DELETE /api/replies/inbox/[id] — dismiss without replying
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { data: item } = await supabaseAdmin
    .from("social_replies")
    .select("user_id")
    .eq("id", id)
    .single()

  if (!item || item.user_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await supabaseAdmin.from("social_replies").update({ status: "dismissed" }).eq("id", id)
  return NextResponse.json({ success: true })
}
