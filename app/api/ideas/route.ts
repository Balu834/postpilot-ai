import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { niche, platforms, count = 7 } = await req.json()
  if (!niche?.trim()) return NextResponse.json({ error: "Niche required" }, { status: 400 })

  const platformList = Array.isArray(platforms) && platforms.length
    ? platforms.join(", ")
    : "LinkedIn, Instagram, Twitter"

  const prompt = `You are a content strategist. Generate a ${count}-day social media content calendar for a ${niche} brand.

Target platforms: ${platformList}
Variety: mix educational, inspirational, promotional, and engagement posts.

Respond ONLY with valid JSON:
{
  "ideas": [
    {
      "day": <1-${count}>,
      "dayLabel": "<e.g. Monday>",
      "platform": "<one platform from: ${platformList}>",
      "format": "<e.g. Tip, Story, Poll, Quote, Behind the Scenes, How-To, CTA, Listicle>",
      "hook": "<compelling first line under 15 words>",
      "idea": "<detailed post idea in 2-3 sentences>",
      "hashtags": ["<tag1>", "<tag2>", "<tag3>"]
    }
  ]
}`

  const res = await openai.chat.completions.create({
    model:           "gpt-4o-mini",
    messages:        [{ role: "user", content: prompt }],
    temperature:     0.8,
    max_tokens:      1500,
    response_format: { type: "json_object" },
  })

  try {
    const result = JSON.parse(res.choices[0].message.content ?? "{}")
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to parse ideas" }, { status: 500 })
  }
}
