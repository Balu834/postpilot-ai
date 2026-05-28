import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"

const PLATFORM_NOTES: Record<string, string> = {
  linkedin:  "LinkedIn (200-400 chars, professional, insight-led)",
  instagram: "Instagram caption (150-280 chars, engaging, 3-5 emojis)",
  twitter:   "Twitter/X (under 280 chars, punchy, opinionated)",
  facebook:  "Facebook (150-300 chars, friendly, relatable)",
  threads:   "Threads (under 500 chars, conversational, warm)",
  bluesky:   "Bluesky (under 300 chars, thoughtful)",
  pinterest: "Pinterest (under 500 chars, keyword-rich, inspiring)",
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

  const { originalContent, platform, angle = "fresh" } = await req.json()
  if (!originalContent?.trim()) return NextResponse.json({ error: "Original post required" }, { status: 400 })

  const platformNote = PLATFORM_NOTES[platform] ?? "social media post (under 300 chars)"

  const angleInstructions: Record<string, string> = {
    fresh:     "completely rewrite with a fresh perspective — same core message, new hook and structure",
    opposite:  "flip the angle — argue the opposite or challenge the original assumption",
    story:     "reframe as a personal story or anecdote that leads to the same insight",
    listicle:  "restructure as a numbered list or bullet points",
    question:  "open with a thought-provoking question that leads into the same message",
    statistic: "lead with a surprising fact or statistic that reinforces the same point",
  }

  const angleNote = angleInstructions[angle] ?? angleInstructions.fresh

  const prompt = `You are a social media copywriter. Recycle this old ${platform} post with a fresh angle.

Original post:
"""
${originalContent}
"""

Your task: ${angleNote}
Format: ${platformNote}

Write ONLY the recycled post text. No explanations, no quotes around it.`

  const res = await openai.chat.completions.create({
    model:       "gpt-4o-mini",
    messages:    [{ role: "user", content: prompt }],
    temperature: 0.85,
    max_tokens:  350,
  })

  const recycled = res.choices[0].message.content?.trim() ?? ""
  return NextResponse.json({ recycled })
}
