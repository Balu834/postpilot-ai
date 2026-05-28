import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { topic, platform } = await req.json()
  if (!topic) return NextResponse.json({ error: "Topic required" }, { status: 400 })

  const platformNote: Record<string, string> = {
    instagram: "Instagram — mix of broad lifestyle tags and niche community tags. Max 30 tags typical.",
    twitter:   "Twitter/X — 1-2 trending hashtags max. Conversational, topical.",
    linkedin:  "LinkedIn — professional tags, 3-5 per post. Industry-focused.",
    pinterest: "Pinterest — SEO-style keywords as hashtags, very niche and descriptive.",
    threads:   "Threads — minimal hashtags, 1-3 max, very casual.",
    bluesky:   "Bluesky — community-driven tags, few per post, no spam.",
  }

  const prompt = `You are a social media hashtag strategist.

Topic: "${topic}"
Platform: ${platform} — ${platformNote[platform] ?? "general social media"}

Generate a comprehensive hashtag research report. Return ONLY valid JSON:
{
  "trending": ["tag1","tag2","tag3"],
  "high": ["tag1","tag2","tag3","tag4","tag5"],
  "medium": ["tag1","tag2","tag3","tag4","tag5"],
  "niche": ["tag1","tag2","tag3","tag4","tag5"],
  "strategy": "One sentence on the ideal mix for this topic + platform (e.g. Use 2 trending + 3 high + 4 medium + 3 niche for max reach with engagement)"
}

Rules:
- No # prefix in tags
- trending: currently viral, very high volume (10M+ posts)
- high: broad, high competition (1M–10M posts)
- medium: balanced reach and engagement (100K–1M posts)
- niche: specific community, high engagement rate (under 100K posts)
- All tags must be relevant to the topic
- Mix of English and commonly used international tags if appropriate`

  try {
    const res = await openai.chat.completions.create({
      model:           "gpt-4o-mini",
      messages:        [{ role: "user", content: prompt }],
      temperature:     0.7,
      max_tokens:      600,
      response_format: { type: "json_object" },
    })

    const raw = res.choices[0].message.content
    if (!raw) throw new Error("No content")

    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Research failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
