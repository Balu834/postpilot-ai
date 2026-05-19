import { NextRequest, NextResponse } from "next/server"
import { openai } from "@/lib/openai"

export async function POST(req: NextRequest) {
  try {
    const { content, tone = "engaging" } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const prompt = `You are a world-class content strategist. Repurpose the following content into a complete social media pack for every major platform.

CONTENT:
${content.slice(0, 4000)}

TONE: ${tone}

Return ONLY valid JSON with this exact structure:
{
  "linkedin": ["post1 (200-450 chars, professional insight + value)", "post2", "post3", "post4", "post5"],
  "twitter": ["tweet1 (under 280 chars, punchy + opinionated)", "tweet2", "tweet3", "tweet4", "tweet5"],
  "instagram": ["caption1 (150-300 chars, storytelling + emojis + soft CTA)", "caption2", "caption3", "caption4", "caption5"],
  "carousels": ["Deck 1: Slide 1 — hook | Slide 2 — problem | Slide 3 — solution | Slide 4 — takeaway | Slide 5 — CTA", "Deck 2", "Deck 3"],
  "reels": ["Ultra-short hook 1 (stops scroll in 2 seconds)", "Hook 2", "Hook 3"],
  "cta": ["CTA 1 (drives specific action, urgency or strong value prop)", "CTA 2", "CTA 3"],
  "hashtags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10","tag11","tag12","tag13","tag14","tag15"]
}

Rules:
- Every post must sound human and platform-native
- LinkedIn: professional insight with authority
- Twitter: bold takes or data points under 280 chars
- Instagram: emotion + story + emojis
- Carousels: pipe-separated slide scripts
- Reels: ultra-grabbing first-3-second hooks
- CTA: action-oriented, creates urgency
- Hashtags: no # prefix, mix popular and niche`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    })

    const raw = response.choices[0].message.content
    if (!raw) throw new Error("No content generated")

    const data = JSON.parse(raw)
    const keys = ["linkedin", "twitter", "instagram", "carousels", "reels", "cta", "hashtags"]
    for (const k of keys) {
      if (!Array.isArray(data[k])) data[k] = []
    }
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
