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

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: { user } } = await anon.auth.getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { content, sourceType } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: "content required" }, { status: 400 })

  const { data: bv } = await supabaseAdmin
    .from("brand_voices")
    .select("*")
    .eq("user_id", user.id)
    .single()

  const voiceSection = bv ? `
BRAND VOICE — apply consistently across all platforms:
- Brand: ${bv.brand_name || ""}
- Industry: ${bv.industry || ""}
- Target audience: ${bv.audience || ""}
- Tone keywords: ${bv.tone_keywords?.join(", ") || "professional, engaging"}
- Avoid words: ${bv.avoid_words?.join(", ") || "none"}
- Emoji style: ${bv.emoji_style || "moderate"}
${bv.sample_post ? `- Writing reference: "${bv.sample_post}"` : ""}`.trim() : ""

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a world-class content strategist specializing in transforming raw source material into platform-native social posts.
${voiceSection}

Given source content (${sourceType}), extract the key insights and rewrite for 6 social platforms.

Return ONLY valid JSON:
{
  "core_ideas": ["insight 1", "insight 2", "insight 3"],
  "key_quote": "the most shareable line from the source",
  "linkedin": {
    "content": "LinkedIn post (200-450 chars, professional, insight-led, 1-2 paragraphs)",
    "format": "Single Post"
  },
  "twitter": {
    "content": "Tweet (under 280 chars, punchy, bold take)",
    "thread": ["tweet 1", "tweet 2", "tweet 3", "tweet 4"],
    "format": "Thread"
  },
  "instagram": {
    "content": "Instagram caption (150-300 chars, storytelling, emojis, soft CTA)",
    "format": "Caption"
  },
  "threads": {
    "content": "Threads post (under 500 chars, conversational, warm)",
    "format": "Single Post"
  },
  "bluesky": {
    "content": "Bluesky post (under 300 chars, thoughtful, community-driven)",
    "format": "Single Post"
  },
  "pinterest": {
    "content": "Pinterest description (under 500 chars, inspirational, keyword-rich)",
    "format": "Pin"
  },
  "image_prompts": [
    "DALL-E 3 prompt: a [style] image of [subject] — [composition details], [mood] mood, [color palette]",
    "DALL-E 3 prompt: a [style] image that represents [concept] — [details], professional social media aesthetic"
  ],
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"]
}`,
      },
      {
        role: "user",
        content: `Source type: ${sourceType || "general content"}

---
${content.slice(0, 3500)}
---

Extract the best ideas and rewrite for all 6 platforms in the brand voice provided.`,
      },
    ],
  })

  const raw = completion.choices[0].message.content ?? "{}"
  try {
    const result = JSON.parse(raw)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "AI response was malformed — please try again" }, { status: 500 })
  }
}
