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

const SIZE_MAP: Record<string, "1024x1024" | "1024x1536" | "1536x1024"> = {
  square:    "1024x1024",
  portrait:  "1024x1536",
  landscape: "1536x1024",
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
    model:   "gpt-image-1",
    prompt:  fullPrompt,
    n:       1,
    size:    imageSize,
    quality: "auto",
  })

  const first = res.data?.[0]
  if (!first?.b64_json) return NextResponse.json({ error: "No image returned" }, { status: 500 })

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const imageBuffer = Buffer.from(first.b64_json, "base64")
  const path = `${user.id}/${Date.now()}-ai.png`
  const { error: uploadError } = await supabaseAdmin.storage
    .from("post-images")
    .upload(path, imageBuffer, { contentType: "image/png", upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("post-images")
    .getPublicUrl(path)

  return NextResponse.json({ url: publicUrl, revisedPrompt: first.revised_prompt ?? fullPrompt })
}
