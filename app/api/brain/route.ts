import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: { user } } = await anon.auth.getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: posts } = await supabaseAdmin
    .from("scheduled_posts")
    .select("platform, content, topic_tags, performance_rating, status, scheduled_time")
    .eq("user_id", user.id)
    .order("scheduled_time", { ascending: false })
    .limit(100)

  if (!posts || posts.length === 0) {
    return NextResponse.json({
      clusters: [],
      gaps: ["Start creating content to build your Content Brain"],
      topPlatform: null,
      totalPosts: 0,
      insights: [],
    })
  }

  const postSummaries = posts
    .map(p => `[${p.platform}] ${p.content.slice(0, 120)} ${p.performance_rating ? `(rating: ${p.performance_rating}/5)` : ""}`)
    .join("\n")

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a content strategist analyzing a creator's post history.
Return ONLY valid JSON with this exact shape:
{
  "clusters": [
    { "topic": "string", "count": number, "avgRating": number, "platforms": ["string"] }
  ],
  "gaps": ["string", "string"],
  "insights": ["string", "string", "string"],
  "topPerforming": ["string"],
  "recommended_topics": ["string", "string", "string"]
}
clusters: group posts by main topic (max 8 clusters).
gaps: topics the creator hasn't covered that would complement their content (3-5 gaps).
insights: actionable observations about their content pattern (3 insights).
topPerforming: topics or styles with highest ratings.
recommended_topics: 3 specific topic ideas they should post next.`,
      },
      {
        role: "user",
        content: `Analyze these ${posts.length} posts:\n\n${postSummaries}`,
      },
    ],
  })

  const raw = completion.choices[0].message.content ?? "{}"
  let analysis: Record<string, unknown> = {}
  try { analysis = JSON.parse(raw) } catch { /* GPT truncation — return empty analysis */ }

  const platformCounts: Record<string, number> = {}
  for (const p of posts) {
    platformCounts[p.platform] = (platformCounts[p.platform] ?? 0) + 1
  }
  const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return NextResponse.json({
    ...analysis,
    topPlatform,
    totalPosts: posts.length,
    platformCounts,
  })
}

export async function PATCH(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: { user } } = await anon.auth.getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { postId, rating, tags } = await req.json()
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 })

  const update: Record<string, unknown> = {}
  if (rating !== undefined) update.performance_rating = rating
  if (tags !== undefined) update.topic_tags = tags

  const { error } = await supabaseAdmin
    .from("scheduled_posts")
    .update(update)
    .eq("id", postId)
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
