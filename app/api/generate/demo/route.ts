import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  // 1 demo per IP per 60s. Backed by a table, not an in-process Map —
  // each request can land on a different serverless instance, so
  // in-memory state never actually enforced anything on Vercel.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
  const windowStart = new Date(Date.now() - 60_000).toISOString()

  const { count } = await supabaseAdmin
    .from("demo_rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", windowStart)

  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: "One demo per minute — sign up for unlimited!" }, { status: 429 })
  }
  await supabaseAdmin.from("demo_rate_limit_events").insert({ ip })

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
