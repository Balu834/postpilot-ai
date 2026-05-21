import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

interface PostInput {
  content:        string
  platform:       string
  scheduled_time: string
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { posts } = await req.json() as { posts: PostInput[] }
  if (!Array.isArray(posts) || posts.length === 0) {
    return NextResponse.json({ error: "Posts array required" }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const rows = posts.map(p => ({
    user_id:        user.id,
    content:        p.content,
    platform:       p.platform,
    scheduled_time: p.scheduled_time,
    status:         "pending",
    image_url:      null,
  }))

  const { data, error } = await supabaseAdmin
    .from("scheduled_posts")
    .insert(rows)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  void supabaseAdmin.from("activity_log").insert({
    user_id: user.id,
    action: `AI planned ${rows.length} posts`,
  })

  return NextResponse.json({ created: data?.length ?? rows.length })
}
