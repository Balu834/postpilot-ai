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

  const { content, platform } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 })

  const platformLabel = platform || "social media"

  const prompt = `You are a social media expert. Score this ${platformLabel} post on 5 dimensions (0–100 each).

Post:
"""
${content}
"""

Respond ONLY with valid JSON:
{
  "score": <overall 0-100, weighted average>,
  "hook": <0-100, how compelling the opening line is>,
  "clarity": <0-100, how clear and readable the message is>,
  "virality": <0-100, shareability and emotional resonance>,
  "platformFit": <0-100, how well it matches ${platformLabel} norms and format>,
  "engagement": <0-100, likelihood to generate likes/comments/shares>,
  "tips": ["<specific actionable improvement>", "<specific actionable improvement>", "<specific actionable improvement>"]
}`

  const res = await openai.chat.completions.create({
    model:           "gpt-4o-mini",
    messages:        [{ role: "user", content: prompt }],
    temperature:     0.3,
    max_tokens:      500,
    response_format: { type: "json_object" },
  })

  try {
    const result = JSON.parse(res.choices[0].message.content ?? "{}")
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to parse score" }, { status: 500 })
  }
}
