import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"
import { checkRateLimit } from "@/lib/rate-limit"

const FREE_LIMIT = 30
const DURATIONS: Record<string, string> = {
  "15": "15 seconds (3-4 beats, ultra-fast pacing)",
  "30": "30 seconds (5-6 beats, fast pacing)",
  "60": "60 seconds (7-9 beats, room to breathe)",
}

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

    // Plan enforcement
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
      return NextResponse.json({
        error: `You've used all ${FREE_LIMIT} free AI generations. Upgrade to Pro for unlimited.`,
        code:  "UPGRADE_REQUIRED",
      }, { status: 402 })
    }

    const { topic, duration = "30", tone = "engaging" } = await req.json()
    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    const durationSpec = DURATIONS[String(duration)] ?? DURATIONS["30"]

    const prompt = `You are a short-form video scriptwriter specializing in Reels, TikTok, and YouTube Shorts that stop the scroll in the first 2 seconds.

TOPIC: ${String(topic).slice(0, 500)}
TARGET LENGTH: ${durationSpec}
TONE: ${tone}

Write a complete shootable script. Return ONLY valid JSON with this exact structure:
{
  "hook": "The exact line spoken in the first 2-3 seconds — must create curiosity or tension immediately",
  "beats": [
    { "time": "0-3s", "voiceover": "exact words spoken", "visual": "what's on screen / shot description", "on_screen_text": "short caption text overlay, or empty string" }
  ],
  "caption": "Post caption for the platform (150-300 chars, includes a hook + soft CTA)",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"],
  "audio_suggestion": "one sentence describing the type of trending audio/music/sound that fits this video's energy"
}

Rules:
- The hook must work with zero context — assume the viewer has 2 seconds before they scroll away
- Beats should cover the full target length, each with a distinct visual moment
- Voiceover lines must sound spoken aloud, not written — short, punchy, natural
- on_screen_text should be a short phrase (3-6 words) reinforcing the voiceover, not a duplicate of it
- End on a clear CTA beat (follow, comment, save, or similar)`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    })

    const raw = completion.choices[0].message.content
    if (!raw) throw new Error("No content generated")

    const data = JSON.parse(raw)
    if (!Array.isArray(data.beats)) data.beats = []
    if (!Array.isArray(data.hashtags)) data.hashtags = []

    // Increment credits_used for free users
    if (isFree) {
      void supabaseAdmin
        .from("users")
        .update({ credits_used: (profile?.credits_used ?? 0) + 1 })
        .eq("id", user.id)
    }

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
