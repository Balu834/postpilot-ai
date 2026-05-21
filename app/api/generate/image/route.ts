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

  const { caption } = await req.json()
  if (!caption?.trim()) return NextResponse.json({ error: "Caption required" }, { status: 400 })

  // Enforce free tier limit (same as text generation)
  const FREE_LIMIT = 30
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("plan_name, credits_used")
    .eq("id", user.id)
    .single()

  const isFree = !profile?.plan_name || profile.plan_name === "free"
  if (isFree && (profile?.credits_used ?? 0) >= FREE_LIMIT) {
    return NextResponse.json({ error: "Free limit reached. Upgrade to Pro for unlimited generations.", code: "UPGRADE_REQUIRED" }, { status: 402 })
  }

  const prompt = [
    "Create a visually stunning, professional Instagram photo.",
    "No text, words, or captions in the image.",
    "Modern aesthetic, vibrant colors, high quality, social-media ready.",
    `Visual concept based on this theme: ${caption.slice(0, 200)}`,
  ].join(" ")

  const imageRes = await openai.images.generate({
    model:   "dall-e-3",
    prompt,
    n:       1,
    size:    "1024x1024",
    quality: "standard",
  })

  const imageUrl = imageRes.data?.[0]?.url
  if (!imageUrl) return NextResponse.json({ error: "Image generation failed" }, { status: 500 })

  // Fetch and upload to Supabase Storage so URL is permanent
  const imageBuffer = await fetch(imageUrl).then(r => r.arrayBuffer())

  // Deduct credit for free users after successful generation
  if (isFree) {
    void supabaseAdmin
      .from("users")
      .update({ credits_used: (profile?.credits_used ?? 0) + 1 })
      .eq("id", user.id)
  }

  const path = `${user.id}/${Date.now()}-ai.png`
  const { error: uploadError } = await supabaseAdmin.storage
    .from("post-images")
    .upload(path, imageBuffer, { contentType: "image/png", upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("post-images")
    .getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}
