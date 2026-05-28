import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    const { inviteToken } = await req.json()
    if (!inviteToken) return NextResponse.json({ error: "Invite token required" }, { status: 400 })

    const { data: member, error } = await supabaseAdmin
      .from("workspace_members")
      .select("id, workspace_id, email, status, invited_at")
      .eq("invite_token", inviteToken)
      .single()

    if (error || !member) return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 })
    if (member.status === "active") return NextResponse.json({ error: "Invite already accepted" }, { status: 400 })

    // Check invite is not older than 7 days
    const invitedAt = new Date(member.invited_at)
    if (Date.now() - invitedAt.getTime() > 7 * 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: "Invite has expired" }, { status: 400 })
    }

    await supabaseAdmin.from("workspace_members").update({
      status:       "active",
      user_id:      user.id,
      invite_token: null,
      joined_at:    new Date().toISOString(),
    }).eq("id", member.id)

    const { data: workspace } = await supabaseAdmin
      .from("workspaces").select("name, owner_id").eq("id", member.workspace_id).single()

    return NextResponse.json({ success: true, workspace })
  } catch {
    return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 })
  }
}
