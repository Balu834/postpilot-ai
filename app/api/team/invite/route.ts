import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { sendTeamInviteEmail } from "@/lib/resend"

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

    // Agency plan only
    const { data: profile } = await supabaseAdmin.from("users").select("plan_name, name").eq("id", user.id).single()
    if (!profile?.plan_name?.includes("agency")) {
      return NextResponse.json({ error: "Team features require an Agency plan" }, { status: 403 })
    }

    const { email, role = "editor" } = await req.json()
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

    // Get or create workspace for this owner
    let { data: workspace } = await supabaseAdmin
      .from("workspaces").select("id, name").eq("owner_id", user.id).single()

    if (!workspace) {
      const { data: created } = await supabaseAdmin
        .from("workspaces")
        .insert({ name: profile.name ? `${profile.name}'s Workspace` : "My Workspace", owner_id: user.id })
        .select("id, name").single()
      workspace = created
    }

    if (!workspace) return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 })

    const inviteToken = crypto.randomBytes(32).toString("hex")

    const { error: upsertError } = await supabaseAdmin.from("workspace_members").upsert({
      workspace_id:  workspace.id,
      email:         email.toLowerCase().trim(),
      role,
      status:        "pending",
      invite_token:  inviteToken,
      invited_at:    new Date().toISOString(),
    }, { onConflict: "workspace_id,email" })

    if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 })

    const inviterName = profile.name || user.email?.split("@")[0] || "Someone"
    await sendTeamInviteEmail(email, inviterName, workspace.name, role, inviteToken).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to invite" }, { status: 500 })
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

    const { data: workspace } = await supabaseAdmin
      .from("workspaces").select("id, name").eq("owner_id", user.id).single()

    if (!workspace) return NextResponse.json({ members: [], workspace: null })

    const { data: members } = await supabaseAdmin
      .from("workspace_members")
      .select("id, email, role, status, invited_at, joined_at")
      .eq("workspace_id", workspace.id)
      .order("invited_at", { ascending: false })

    return NextResponse.json({ members: members ?? [], workspace })
  } catch {
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { memberId } = await req.json()

    const { data: workspace } = await supabaseAdmin
      .from("workspaces").select("id").eq("owner_id", user.id).single()
    if (!workspace) return NextResponse.json({ error: "No workspace found" }, { status: 404 })

    await supabaseAdmin.from("workspace_members")
      .delete().eq("id", memberId).eq("workspace_id", workspace.id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 })
  }
}
