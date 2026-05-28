import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"

const PLATFORMS = ["linkedin", "instagram", "twitter", "facebook", "threads"] as const

const PLATFORM_NOTES: Record<string, string> = {
  linkedin:  "LinkedIn (200-350 chars, professional, insight-led, end with a question or CTA)",
  instagram: "Instagram (150-220 chars, engaging, warm, 4-5 relevant emojis, 3-5 hashtags at the end)",
  twitter:   "Twitter/X (under 240 chars, punchy, opinionated, no hashtags unless highly relevant)",
  facebook:  "Facebook (150-280 chars, friendly, conversational, relatable)",
  threads:   "Threads (under 400 chars, casual and warm, conversational tone)",
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

  const { imageBase64, mimeType = "image/jpeg", tone = "engaging" } = await req.json()
  if (!imageBase64) return NextResponse.json({ error: "Image required" }, { status: 400 })

  const platformList = PLATFORMS.map(p => `"${p}": "<${PLATFORM_NOTES[p]}>"`)

  const prompt = `You are a social media expert. Look at this image and write optimized captions for each platform.
Tone: ${tone}. Make the captions feel authentic, not generic. Reference what's actually in the image.

Respond ONLY with valid JSON:
{
  "imageDescription": "<one sentence describing what you see>",
  ${platformList.join(",\n  ")}
}`

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: "low" },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
    max_tokens:      900,
    response_format: { type: "json_object" },
  })

  try {
    const result = JSON.parse(res.choices[0].message.content ?? "{}")
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to parse captions" }, { status: 500 })
  }
}
