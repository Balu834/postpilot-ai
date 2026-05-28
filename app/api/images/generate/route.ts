import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"

const STYLE_SUFFIXES: Record<string, string> = {
  photorealistic: "photorealistic, high resolution, professional photography, 8k",
  illustration:   "digital illustration, vibrant colors, flat design, vector art style",
  minimalist:     "minimalist, clean, simple, white background, elegant",
  abstract:       "abstract art, colorful, geometric shapes, artistic, creative",
  bold:           "bold graphic design, strong contrast, eye-catching, poster style",
}

const SIZE_MAP: Record<string, "1024x1024" | "1024x1792" | "1792x1024"> = {
  square:    "1024x1024",
  portrait:  "1024x1792",
  landscape: "1792x1024",
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

  const { prompt, style = "photorealistic", size = "square" } = await req.json()
  if (!prompt?.trim()) return NextResponse.json({ error: "Prompt required" }, { status: 400 })

  const styleSuffix = STYLE_SUFFIXES[style] ?? STYLE_SUFFIXES.photorealistic
  const fullPrompt  = `${prompt.trim()}. ${styleSuffix}`
  const imageSize   = SIZE_MAP[size] ?? "1024x1024"

  const res = await openai.images.generate({
    model:   "dall-e-3",
    prompt:  fullPrompt,
    n:       1,
    size:    imageSize,
    quality: "standard",
  })

  const first = res.data?.[0]
  if (!first?.url) return NextResponse.json({ error: "No image returned" }, { status: 500 })

  return NextResponse.json({ url: first.url, revisedPrompt: first.revised_prompt ?? fullPrompt })
}
