import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    const q = req.nextUrl.searchParams.get("q")?.trim()
    if (!q || q.length < 2) return NextResponse.json({ results: [] })

    const [genRes, postsRes] = await Promise.all([
      supabaseAdmin
        .from("generations")
        .select("id, prompt, created_at")
        .eq("user_id", user.id)
        .ilike("prompt", `%${q}%`)
        .order("created_at", { ascending: false })
        .limit(5),

      supabaseAdmin
        .from("scheduled_posts")
        .select("id, platform, content, scheduled_time, status")
        .eq("user_id", user.id)
        .ilike("content", `%${q}%`)
        .order("scheduled_time", { ascending: false })
        .limit(5),
    ])

    type SearchResult = {
      id: string
      type: "generation" | "post"
      title: string
      subtitle: string
      href: string
      time: string
    }

    const results: SearchResult[] = []

    for (const g of genRes.data ?? []) {
      results.push({
        id: `gen_${g.id}`,
        type: "generation",
        title: g.prompt ?? "Generated content",
        subtitle: "Content generation",
        href: "/generate",
        time: g.created_at,
      })
    }

    for (const p of postsRes.data ?? []) {
      results.push({
        id: `post_${p.id}`,
        type: "post",
        title: p.content.slice(0, 60) + (p.content.length > 60 ? "…" : ""),
        subtitle: `${p.platform} · ${p.status}`,
        href: "/schedule",
        time: p.scheduled_time,
      })
    }

    results.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    return NextResponse.json({ results: results.slice(0, 8) })
  } catch (err) {
    console.error("Search error:", err)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
