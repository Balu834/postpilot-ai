import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"
import { checkRateLimit } from "@/lib/rate-limit"

const FREE_LIMIT = 30

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { limited } = await checkRateLimit(user.id)
    if (limited) {
      return NextResponse.json(
        { error: "Rate limit exceeded. You can generate up to 5 times per minute. Please wait and try again." },
        { status: 429, headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" } }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("plan_name, credits_used")
      .eq("id", user.id)
      .single()

    const isFree = !profile?.plan_name || profile.plan_name === "free"
    if (isFree && (profile?.credits_used ?? 0) >= FREE_LIMIT) {
      return NextResponse.json({ error: `You've used all ${FREE_LIMIT} free AI generations. Upgrade to Pro for unlimited.`, code: "UPGRADE_REQUIRED" }, { status: 402 })
    }

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

    const result = JSON.parse(res.choices[0].message.content ?? "{}")

    if (isFree) {
      void supabaseAdmin
        .from("users")
        .update({ credits_used: (profile?.credits_used ?? 0) + 1 })
        .eq("id", user.id)
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to score post"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
