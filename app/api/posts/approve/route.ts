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

    const { postId, action, note } = await req.json()
    if (!postId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "postId and action (approve|reject) required" }, { status: 400 })
    }

    // Verify user owns the workspace that this post belongs to
    const { data: post } = await supabaseAdmin
      .from("scheduled_posts").select("workspace_id, user_id").eq("id", postId).single()
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

    // Allow approval if: user owns the post OR user owns the workspace
    const isOwner = post.user_id === user.id
    let isWorkspaceOwner = false
    if (post.workspace_id) {
      const { data: ws } = await supabaseAdmin
        .from("workspaces").select("owner_id").eq("id", post.workspace_id).single()
      isWorkspaceOwner = ws?.owner_id === user.id
    }

    if (!isOwner && !isWorkspaceOwner) {
      return NextResponse.json({ error: "Only the workspace owner can approve posts" }, { status: 403 })
    }

    await supabaseAdmin.from("scheduled_posts").update({
      approval_status: action === "approve" ? "approved" : "rejected",
      reviewer_note:   note ?? null,
    }).eq("id", postId)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to update approval" }, { status: 500 })
  }
}
