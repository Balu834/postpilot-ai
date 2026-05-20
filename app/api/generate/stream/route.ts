import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"
import { checkRateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

function buildPrompt(
  topic: string, product?: string, blogUrl?: string,
  tone = "engaging", brandVoice?: Record<string, unknown>
): string {
  const context = [
    topic    && `Topic: ${topic}`,
    product  && `Product/Brand: ${product}`,
    blogUrl  && `Blog URL for reference: ${blogUrl}`,
    `Tone: ${tone}`,
  ].filter(Boolean).join("\n")

  const voiceSection = brandVoice ? `
BRAND VOICE GUIDELINES (follow strictly):
${brandVoice.brand_name ? `- Brand name: ${brandVoice.brand_name}` : ""}
${brandVoice.industry   ? `- Industry: ${brandVoice.industry}` : ""}
${brandVoice.audience   ? `- Target audience: ${brandVoice.audience}` : ""}
${Array.isArray(brandVoice.key_topics) && brandVoice.key_topics.length ? `- Topics: ${(brandVoice.key_topics as string[]).join(", ")}` : ""}
${Array.isArray(brandVoice.avoid_words) && brandVoice.avoid_words.length ? `- Avoid: ${(brandVoice.avoid_words as string[]).join(", ")}` : ""}
${brandVoice.emoji_style === "heavy" ? "- Use emojis liberally" : brandVoice.emoji_style === "none" ? "- No emojis" : "- Emojis sparingly"}
${brandVoice.sample_post ? `- Style example: "${brandVoice.sample_post}"` : ""}`.trim() : ""

  return `You are a world-class social media strategist.

${context}
${voiceSection ? `\n${voiceSection}` : ""}

Generate platform-optimized content. Return ONLY valid JSON:
{
  "instagram": "Instagram caption (150-300 chars, emojis, storytelling)",
  "linkedin": "LinkedIn post (200-450 chars, professional, insight-led)",
  "twitter": "Twitter/X post (under 280 chars, punchy, opinionated)",
  "hashtags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10"],
  "carousel": [
    "Slide 1: Hook — opening line",
    "Slide 2: Problem — pain point",
    "Slide 3: Solution — your insight",
    "Slide 4: Takeaway — actionable tip",
    "Slide 5: CTA — strong close"
  ]
}

Rules: sound human, platform-native, no # prefix in hashtags array.`
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return new Response("Unauthorized", { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return new Response("Unauthorized", { status: 401 })

  const { limited } = await checkRateLimit(user.id)
  if (limited) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Please wait and try again." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    )
  }

  const body = await req.json()
  const { topic, product, blogUrl, tone, brandVoice } = body

  if (!topic && !blogUrl) {
    return new Response(JSON.stringify({ error: "Topic or blog URL required" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    })
  }

  const encoder = new TextEncoder()
  let closed = false

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {}
      }

      try {
        send({ event: "phase", msg: "Analyzing your topic..." })
        await sleep(500)
        send({ event: "phase", msg: "Connecting to AI engine..." })
        await sleep(300)

        // Call OpenAI
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: buildPrompt(topic, product, blogUrl, tone, brandVoice) }],
          temperature: 0.85,
          max_tokens: 1000,
          response_format: { type: "json_object" },
        })

        const raw = response.choices[0].message.content
        if (!raw) throw new Error("No content generated")

        const generated = JSON.parse(raw)
        if (!Array.isArray(generated.carousel)) generated.carousel = []
        if (!Array.isArray(generated.hashtags)) generated.hashtags = []

        // Stream each platform progressively
        const platforms = [
          { key: "instagram", msg: "Crafting Instagram captions...",  chunkSize: 5, delay: 28 },
          { key: "linkedin",  msg: "Writing LinkedIn posts...",        chunkSize: 5, delay: 22 },
          { key: "twitter",   msg: "Building Twitter threads...",      chunkSize: 4, delay: 32 },
          { key: "hashtags",  msg: "Generating hashtag sets...",       chunkSize: 0, delay: 0  },
          { key: "carousel",  msg: "Crafting carousel scripts...",     chunkSize: 0, delay: 0  },
        ]

        for (const { key, msg, chunkSize, delay } of platforms) {
          if (closed) break
          send({ event: "phase", msg })
          await sleep(180)

          const content = generated[key]

          if (chunkSize > 0 && typeof content === "string") {
            // Stream text chunk by chunk (typing effect)
            send({ event: "tab_open", platform: key })
            for (let i = 0; i < content.length; i += chunkSize) {
              if (closed) break
              send({ event: "chunk", platform: key, text: content.slice(i, i + chunkSize) })
              await sleep(delay)
            }
          } else {
            // Arrays: send at once with a brief dramatic pause
            await sleep(350)
            send({ event: "tab_open", platform: key })
            await sleep(100)
            send({ event: "chunk", platform: key, text: JSON.stringify(content), isArray: true })
          }

          send({ event: "platform_done", platform: key })
          await sleep(220)
        }

        send({ event: "phase", msg: "Finalizing your content pack..." })
        await sleep(400)
        send({ event: "done", result: generated })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Generation failed"
        send({ event: "error", msg })
      } finally {
        closed = true
        try { controller.close() } catch {}
      }
    },
    cancel() {
      closed = true
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type":    "text/event-stream",
      "Cache-Control":   "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "Connection":      "keep-alive",
    },
  })
}
