import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"
import { checkRateLimit } from "@/lib/rate-limit"

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

    const { limited, remaining } = await checkRateLimit(user.id)
    if (limited) {
      return NextResponse.json(
        { error: "Rate limit exceeded. You can generate up to 5 times per minute. Please wait and try again." },
        { status: 429, headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" } }
      )
    }

    const { topic, product, blogUrl, tone = "engaging", brandVoice } = await req.json()

    if (!topic && !blogUrl) {
      return NextResponse.json({ error: "Topic or blog URL is required" }, { status: 400 })
    }

    const context = [
      topic && `Topic: ${topic}`,
      product && `Product/Brand: ${product}`,
      blogUrl && `Blog URL for reference: ${blogUrl}`,
      `Tone: ${tone}`,
    ].filter(Boolean).join("\n")

    const voiceSection = brandVoice ? `
BRAND VOICE GUIDELINES (follow strictly):
${brandVoice.brand_name ? `- Brand name: ${brandVoice.brand_name}` : ""}
${brandVoice.industry ? `- Industry: ${brandVoice.industry}` : ""}
${brandVoice.audience ? `- Target audience: ${brandVoice.audience}` : ""}
${brandVoice.key_topics?.length ? `- Preferred topics/themes: ${brandVoice.key_topics.join(", ")}` : ""}
${brandVoice.avoid_words?.length ? `- Words/phrases to AVOID: ${brandVoice.avoid_words.join(", ")}` : ""}
${brandVoice.emoji_style === "heavy" ? "- Use emojis liberally throughout" : brandVoice.emoji_style === "none" ? "- Do NOT use any emojis" : "- Use emojis sparingly and purposefully"}
${brandVoice.sample_post ? `- Example of ideal content style:\n"${brandVoice.sample_post}"` : ""}
`.trim() : ""

    const prompt = `You are a world-class social media strategist who creates high-converting, viral content.

${context}
${voiceSection ? `\n${voiceSection}` : ""}

Generate platform-optimized social media content. Return ONLY valid JSON with this exact structure:
{
  "instagram": "Instagram caption (150-300 chars, emojis encouraged, conversational, storytelling style)",
  "linkedin": "LinkedIn post (200-450 chars, professional yet approachable, value-driven, insight-led)",
  "twitter": "Twitter/X post (under 280 chars, punchy, opinionated, or insightful, trend-aware)",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8", "hashtag9", "hashtag10"],
  "carousel": [
    "Slide 1: Hook — attention-grabbing opening line for the carousel",
    "Slide 2: Problem — the pain point or challenge",
    "Slide 3: Solution — your insight or answer",
    "Slide 4: Key point — one actionable takeaway",
    "Slide 5: CTA — strong call to action to close"
  ]
}

Requirements:
- Each post must sound human, not AI-written
- Instagram: storytelling + emotion + soft CTA
- LinkedIn: professional insight + value + subtle authority
- Twitter: bold take or insightful observation under 280 chars
- Hashtags: mix of popular (#Marketing) and niche (#ContentStrategyTips), no # prefix in the array
- Carousel: each slide is a concise standalone idea, label each with "Slide N: Title — content"`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error("No content generated")

    const generated = JSON.parse(content)
    if (!Array.isArray(generated.carousel)) generated.carousel = []
    if (!Array.isArray(generated.hashtags)) generated.hashtags = []

    return NextResponse.json({ success: true, data: generated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
