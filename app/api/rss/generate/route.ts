import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"
import type { RSSArticle } from "@/app/api/rss/parse/route"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLATFORM_NOTES: Record<string, string> = {
  linkedin:  "LinkedIn post (200-400 chars, professional, insight-led)",
  twitter:   "Twitter/X post (under 280 chars, punchy, opinionated)",
  instagram: "Instagram caption (150-280 chars, engaging, 3-5 relevant emojis)",
  threads:   "Threads post (under 500 chars, conversational, warm)",
  bluesky:   "Bluesky post (under 300 chars, thoughtful, no corporate tone)",
  pinterest: "Pinterest pin description (under 500 chars, inspiring, keyword-rich)",
  facebook:  "Facebook post (150-300 chars, friendly, relatable)",
}

async function generatePost(article: RSSArticle, platform: string, tone: string): Promise<string> {
  const platformNote = PLATFORM_NOTES[platform] ?? "social media post (under 300 chars)"
  const prompt = `You are a ${tone} social media writer. Convert this blog article into a ${platformNote}.

Article Title: ${article.title}
Article Summary: ${article.description || "(no summary available)"}
Article URL: ${article.link}

Write ONLY the post text. End with the article URL on a new line. No hashtags.`

  const res = await openai.chat.completions.create({
    model:       "gpt-4o-mini",
    messages:    [{ role: "user", content: prompt }],
    temperature: 0.75,
    max_tokens:  300,
  })
  return res.choices[0].message.content?.trim() ?? article.title
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

  const { articles, platforms, tone, startDate, intervalHours } = await req.json()

  if (!articles?.length)  return NextResponse.json({ error: "No articles provided" }, { status: 400 })
  if (!platforms?.length) return NextResponse.json({ error: "No platforms selected" }, { status: 400 })

  const start    = new Date(startDate ?? Date.now() + 86400000)
  const interval = Number(intervalHours ?? 24) * 3600000
  let   offset   = 0

  const rows: object[] = []

  for (const article of articles) {
    for (const platform of platforms) {
      const content       = await generatePost(article, platform, tone ?? "engaging")
      const scheduledTime = new Date(start.getTime() + offset).toISOString()
      rows.push({
        user_id:        user.id,
        content,
        platform,
        scheduled_time: scheduledTime,
        status:         "pending",
        image_url:      null,
      })
      offset += interval
    }
  }

  const { error } = await supabaseAdmin.from("scheduled_posts").insert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  void supabaseAdmin.from("activity_log").insert({
    user_id: user.id,
    action:  `RSS import: scheduled ${rows.length} posts from ${articles.length} articles`,
    platform: null,
  })

  return NextResponse.json({ scheduled: rows.length })
}
