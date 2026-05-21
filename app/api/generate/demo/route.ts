import { NextRequest, NextResponse } from "next/server"
import { openai } from "@/lib/openai"

// In-memory IP rate limit: 1 demo per IP per 60s
const ipTimestamps = new Map<string, number>()

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
  const now = Date.now()
  const last = ipTimestamps.get(ip) ?? 0
  if (now - last < 60_000) {
    return NextResponse.json({ error: "One demo per minute — sign up for unlimited!" }, { status: 429 })
  }
  ipTimestamps.set(ip, now)
  // Prevent unbounded growth
  if (ipTimestamps.size > 5000) {
    const oldest = [...ipTimestamps.entries()].sort((a, b) => a[1] - b[1]).slice(0, 500)
    oldest.forEach(([k]) => ipTimestamps.delete(k))
  }

  const { topic } = await req.json()
  if (!topic?.trim()) return NextResponse.json({ error: "Topic required" }, { status: 400 })

  const prompt = `You are a world-class social media strategist. Generate one post for each platform based on this topic.

Topic: ${String(topic).slice(0, 200)}

Return ONLY valid JSON:
{
  "instagram": "Instagram caption (150-250 chars, 2-3 emojis, storytelling hook)",
  "linkedin": "LinkedIn post (200-380 chars, professional insight, no emojis)",
  "twitter": "Tweet (under 240 chars, punchy, bold take or surprising fact)"
}`

  try {
    const res = await openai.chat.completions.create({
      model:           "gpt-4o-mini",
      messages:        [{ role: "user", content: prompt }],
      temperature:     0.85,
      max_tokens:      500,
      response_format: { type: "json_object" },
    })

    const raw = res.choices[0].message.content ?? "{}"
    const data = JSON.parse(raw)

    return NextResponse.json({
      instagram: data.instagram ?? "",
      linkedin:  data.linkedin  ?? "",
      twitter:   data.twitter   ?? "",
    })
  } catch {
    return NextResponse.json({ error: "Generation failed, try again" }, { status: 500 })
  }
}
