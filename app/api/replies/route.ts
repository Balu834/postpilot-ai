import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"

const TONE_NOTES: Record<string, string> = {
  friendly:     "warm, approachable, uses first names if available, feels human",
  professional: "polished, respectful, measured, appropriate for B2B contexts",
  witty:        "clever, light-hearted, uses wordplay or humor tastefully",
  empathetic:   "acknowledges feelings first, validates the person, then responds",
  grateful:     "expresses genuine appreciation, upbeat, makes the person feel valued",
}

const PLATFORM_NOTES: Record<string, string> = {
  linkedin:  "LinkedIn — professional networking context",
  instagram: "Instagram — visual social platform, casual community",
  twitter:   "Twitter/X — public, concise, punchy replies work best",
  facebook:  "Facebook — community-oriented, friendly",
  threads:   "Threads — casual, conversational, warm",
  youtube:   "YouTube comment — acknowledge the viewer, encourage engagement",
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

  const { comment, platform = "instagram", tone = "friendly", context = "" } = await req.json()
  if (!comment?.trim()) return NextResponse.json({ error: "Comment text required" }, { status: 400 })

  const toneNote     = TONE_NOTES[tone]     ?? TONE_NOTES.friendly
  const platformNote = PLATFORM_NOTES[platform] ?? "social media"

  const prompt = `You are a social media community manager. Write 3 different replies to this ${platformNote} comment.

Comment: "${comment}"
${context ? `Additional context about the post: ${context}` : ""}
Required tone: ${tone} — ${toneNote}

Each reply should feel distinct — different length, different approach, but all in the same tone.
Keep replies concise and natural. No hashtags unless absolutely fitting.

Respond ONLY with valid JSON:
{
  "replies": [
    { "label": "<short style label, e.g. Short & Sweet>", "text": "<reply text>" },
    { "label": "<short style label, e.g. Detailed>",      "text": "<reply text>" },
    { "label": "<short style label, e.g. With a hook>",   "text": "<reply text>" }
  ]
}`

  const res = await openai.chat.completions.create({
    model:           "gpt-4o-mini",
    messages:        [{ role: "user", content: prompt }],
    temperature:     0.8,
    max_tokens:      500,
    response_format: { type: "json_object" },
  })

  try {
    const result = JSON.parse(res.choices[0].message.content ?? "{}")
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to parse replies" }, { status: 500 })
  }
}
