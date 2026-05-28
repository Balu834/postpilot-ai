import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"

const PLATFORM_NOTES: Record<string, string> = {
  linkedin:  "LinkedIn (200-400 chars, professional, insight-led)",
  twitter:   "Twitter/X (under 280 chars, punchy, opinionated)",
  instagram: "Instagram caption (150-280 chars, engaging, 3-5 emojis)",
  threads:   "Threads (under 500 chars, conversational, warm)",
  bluesky:   "Bluesky (under 300 chars, thoughtful)",
  facebook:  "Facebook (150-300 chars, friendly, relatable)",
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

  const { topic, platform = "linkedin", tone = "professional" } = await req.json()
  if (!topic?.trim()) return NextResponse.json({ error: "Topic required" }, { status: 400 })

  const platformNote = PLATFORM_NOTES[platform] ?? "social media post (under 300 chars)"

  const prompt = `You are a social media copywriter. Write 3 DIFFERENT ${platformNote} posts about: "${topic}".
Tone: ${tone}.

Each variant uses a completely different angle:
- Variant 1: Bold/Direct — starts with a strong statement or surprising fact
- Variant 2: Story-led — opens with a personal story or scenario
- Variant 3: Question-hook — opens with a thought-provoking question

Respond ONLY with valid JSON:
{
  "variants": [
    { "angle": "Bold / Direct",    "hook": "<first 8 words>", "content": "<full post>" },
    { "angle": "Story-led",        "hook": "<first 8 words>", "content": "<full post>" },
    { "angle": "Question Hook",    "hook": "<first 8 words>", "content": "<full post>" }
  ]
}`

  const res = await openai.chat.completions.create({
    model:           "gpt-4o-mini",
    messages:        [{ role: "user", content: prompt }],
    temperature:     0.85,
    max_tokens:      900,
    response_format: { type: "json_object" },
  })

  try {
    const result = JSON.parse(res.choices[0].message.content ?? "{}")
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to parse variants" }, { status: 500 })
  }
}
