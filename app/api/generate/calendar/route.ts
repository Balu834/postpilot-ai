import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"

const FREE_LIMIT = 30

const PLATFORM_TIMES: Record<string, number> = {
  linkedin:  9,
  twitter:   12,
  instagram: 19,
  facebook:  10,
}

function getScheduleDates(platforms: string[], postsPerWeek: number): { platform: string; scheduled_time: string }[] {
  const slots: { platform: string; scheduled_time: string }[] = []
  const now = new Date()
  // Start from tomorrow
  const start = new Date(now)
  start.setDate(start.getDate() + 1)
  start.setHours(0, 0, 0, 0)

  // Collect Mon–Fri dates for the rest of the current month + next month
  const weekdays: Date[] = []
  const end = new Date(start)
  end.setDate(start.getDate() + 35) // ~5 weeks

  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay()
    if (dow >= 1 && dow <= 5) weekdays.push(new Date(d))
  }

  // Cycle through platforms and assign weekdays
  const totalPosts = Math.floor((postsPerWeek / 7) * weekdays.length)
  const maxPosts = Math.min(totalPosts, weekdays.length, 30)

  for (let i = 0; i < maxPosts; i++) {
    const platform = platforms[i % platforms.length]
    const date     = weekdays[i]
    const hour     = PLATFORM_TIMES[platform] ?? 10
    const dt       = new Date(date)
    dt.setHours(hour, 0, 0, 0)
    slots.push({ platform, scheduled_time: dt.toISOString() })
  }

  return slots
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
    return NextResponse.json({
      error: `You've used all ${FREE_LIMIT} free generations. Upgrade to Pro.`,
      code: "UPGRADE_REQUIRED",
    }, { status: 402 })
  }

  const { topics, platforms, postsPerWeek = 5 } = await req.json() as {
    topics: string[]
    platforms: string[]
    postsPerWeek: number
  }

  if (!topics?.length || !platforms?.length) {
    return NextResponse.json({ error: "Topics and platforms are required" }, { status: 400 })
  }

  const slots = getScheduleDates(platforms, postsPerWeek)
  const totalNeeded = slots.length

  const platformDescriptions: Record<string, string> = {
    linkedin:  "professional insight (200-400 chars, no emojis)",
    twitter:   "punchy take under 280 chars",
    instagram: "story-driven caption (150-280 chars, 2-3 emojis)",
    facebook:  "friendly community post (150-300 chars)",
  }

  const topicList   = topics.map((t, i) => `${i + 1}. ${t}`).join("\n")
  const platformList = platforms.map(p => `${p}: ${platformDescriptions[p] ?? "engaging post"}`).join("\n")

  const prompt = `You are a world-class social media strategist. Generate exactly ${totalNeeded} social media posts.

TOPICS (rotate through these):
${topicList}

PLATFORM STYLES:
${platformList}

SLOTS (platform → write a post for that platform, in this order):
${slots.map((s, i) => `${i + 1}. ${s.platform}`).join("\n")}

Return ONLY a valid JSON array of exactly ${totalNeeded} strings (one post per slot, in order).
Each string is the post content only — no labels, no platform names, no numbering.
Make every post feel authentic and human. Rotate topics evenly.`

  const response = await openai.chat.completions.create({
    model:           "gpt-4o-mini",
    messages:        [{ role: "user", content: prompt }],
    temperature:     0.82,
    max_tokens:      4000,
    response_format: { type: "json_object" },
  })

  let posts: string[] = []
  try {
    const raw = response.choices[0].message.content ?? ""
    // GPT returns {posts: [...]} or just the array wrapped
    const parsed = JSON.parse(raw)
    posts = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.posts) ? parsed.posts : Object.values(parsed)[0] as string[])
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return NextResponse.json({ error: "No posts generated" }, { status: 500 })
  }

  // Pair content with slots
  const rows = slots.map((slot, i) => ({
    user_id:        user.id,
    content:        (posts[i] ?? posts[i % posts.length] ?? "").trim(),
    platform:       slot.platform,
    scheduled_time: slot.scheduled_time,
    status:         "pending",
    image_url:      null,
  })).filter(r => r.content)

  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from("scheduled_posts")
    .insert(rows)
    .select()

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  if (isFree) {
    void supabaseAdmin
      .from("users")
      .update({ credits_used: (profile?.credits_used ?? 0) + 1 })
      .eq("id", user.id)
  }

  void supabaseAdmin.from("activity_log").insert({
    user_id: user.id,
    action:  `AI planned ${rows.length} posts`,
  })

  return NextResponse.json({ created: inserted?.length ?? rows.length, posts: inserted })
}
