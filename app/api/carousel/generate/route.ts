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

  const { topic, platform, tone = "engaging", count = 7 } = await req.json()
  if (!topic?.trim()) return NextResponse.json({ error: "Topic required" }, { status: 400 })

  const isThread    = platform === "twitter"
  const slideCount  = Math.min(Math.max(Number(count), 3), 12)

  const prompt = isThread
    ? `You are a viral Twitter/X thread writer. Write a ${slideCount}-tweet thread about: "${topic}".
Tone: ${tone}. Each tweet must be under 280 characters. Hook the reader with tweet 1. End with a strong CTA.

Respond ONLY with valid JSON:
{
  "title": "<catchy thread title>",
  "slides": [
    { "slide": 1, "body": "<tweet text — hook, under 280 chars>" },
    ...
  ]
}`
    : `You are an Instagram carousel expert. Create a ${slideCount}-slide carousel about: "${topic}".
Tone: ${tone}. Slide 1 must be a thumb-stopping hook. Last slide is the CTA.

Respond ONLY with valid JSON:
{
  "title": "<carousel title>",
  "slides": [
    { "slide": 1, "headline": "<bold 4-8 word hook>", "body": "<supporting text, 1-2 sentences, under 120 chars>" },
    ...
  ]
}`

  const res = await openai.chat.completions.create({
    model:           "gpt-4o-mini",
    messages:        [{ role: "user", content: prompt }],
    temperature:     0.75,
    max_tokens:      1200,
    response_format: { type: "json_object" },
  })

  try {
    const result = JSON.parse(res.choices[0].message.content ?? "{}")
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to parse response" }, { status: 500 })
  }
}
