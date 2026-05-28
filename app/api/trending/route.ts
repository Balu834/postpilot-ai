import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { niche = "business", platform = "linkedin", action, topic } = await req.json()

  // Brand adapt action: take a trending topic and write 3 brand-voice variations
  if (action === "adapt" && topic) {
    const { data: bv } = await supabaseAdmin
      .from("brand_voices")
      .select("*")
      .eq("user_id", user.id)
      .single()

    const voiceSection = bv ? `
BRAND VOICE (apply to all variations):
- Brand: ${bv.brand_name || ""}
- Industry: ${bv.industry || ""}
- Audience: ${bv.audience || ""}
- Tone: ${bv.tone_keywords?.join(", ") || "professional"}
- Avoid: ${bv.avoid_words?.join(", ") || "none"}
- Emoji style: ${bv.emoji_style || "moderate"}
${bv.sample_post ? `- Style example: "${bv.sample_post}"` : ""}`.trim() : ""

    const adaptPrompt = `You are a brand content strategist. Adapt a trending topic into 3 variations written in a specific brand voice for ${platform}.

${voiceSection}

Trending topic: "${topic}"
Platform: ${platform}

Return ONLY valid JSON:
{
  "variations": [
    {
      "angle": "string (e.g. 'Hot take', 'Personal story', 'Data-driven insight')",
      "content": "string (platform-ready post in brand voice)",
      "hook": "string (the opening line that stops the scroll)",
      "engagement_score": number (1-10, predicted engagement)
    }
  ]
}`

    const res = await openai.chat.completions.create({
      model:           "gpt-4o-mini",
      messages:        [{ role: "user", content: adaptPrompt }],
      temperature:     0.85,
      response_format: { type: "json_object" },
    })

    try {
      const result = JSON.parse(res.choices[0].message.content ?? "{}")
      return NextResponse.json(result)
    } catch {
      return NextResponse.json({ error: "Failed to adapt topic" }, { status: 500 })
    }
  }

  // Default: fetch trending topics
  const prompt = `You are a social media trends expert. Generate 12 content topics that are currently high-performing and trending for ${niche} creators on ${platform}.

Focus on evergreen-trending topics: themes that consistently drive engagement, not one-day news cycles.

Respond ONLY with valid JSON:
{
  "topics": [
    {
      "title": "<punchy topic title, 5-10 words>",
      "why": "<one sentence on why this resonates right now>",
      "format": "<best content format: Thread / Carousel / Single Post / Reel / Poll>",
      "hashtags": ["<tag1>", "<tag2>", "<tag3>"],
      "heat": <1-5, engagement potential score>
    }
  ]
}`

  const res = await openai.chat.completions.create({
    model:           "gpt-4o-mini",
    messages:        [{ role: "user", content: prompt }],
    temperature:     0.8,
    max_tokens:      1400,
    response_format: { type: "json_object" },
  })

  try {
    const result = JSON.parse(res.choices[0].message.content ?? "{}")
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to parse trends" }, { status: 500 })
  }
}
