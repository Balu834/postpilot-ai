import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"
import { checkRateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

const SYSTEM_PROMPT = `You are PostPilot AI — a world-class social media strategist, copywriter, and growth expert.

You help creators, founders, startups, and marketers:
- Write viral LinkedIn posts, Twitter/X threads, Instagram captions, and more
- Develop content strategies and content calendars
- Build powerful personal brands
- Grow engaged audiences across platforms
- Create compelling marketing copy and launch announcements
- Repurpose content across platforms

Your style: concise, actionable, conversational. You speak like a senior strategist who gets straight to the point.
You lead with insights, provide specific examples, and always make your advice immediately usable.

When asked to write content:
- Always write it ready to copy-paste (no meta-commentary)
- Match the platform's native format and tone
- Include hooks, engagement drivers, and CTAs where appropriate

When asked for strategy:
- Be specific and tactical, not generic
- Give numbered frameworks, not vague advice
- Back up points with examples when possible`

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
  const { messages } = body as { messages: { role: "user" | "assistant"; content: string }[] }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Messages required" }), {
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
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.8,
          max_tokens: 1500,
          stream: true,
        })

        for await (const chunk of response) {
          if (closed) break
          const text = chunk.choices[0]?.delta?.content ?? ""
          if (text) send({ event: "chunk", text })
        }

        send({ event: "done" })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Chat failed"
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
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "Connection":        "keep-alive",
    },
  })
}
