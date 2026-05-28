import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getAuth(req: NextRequest) {
  return req.headers.get("authorization")?.replace("Bearer ", "") ?? null
}

async function getUser(token: string) {
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: { user } } = await anon.auth.getUser(token)
  return user
}

export async function GET(req: NextRequest) {
  const token = getAuth(req)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data } = await supabaseAdmin
    .from("campaigns")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return NextResponse.json({ campaigns: data ?? [] })
}

export async function POST(req: NextRequest) {
  const token = getAuth(req)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { goal, niche, platforms, weeks = 4, name } = await req.json()
  if (!goal) return NextResponse.json({ error: "goal required" }, { status: 400 })

  const platformList = (platforms as string[]).join(", ")
  const startDate = new Date()
  startDate.setHours(9, 0, 0, 0)

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert social media campaign strategist.
Generate a ${weeks}-week content campaign.
Return ONLY valid JSON:
{
  "campaign_name": "string",
  "strategy": "string (2 sentences on the overall approach)",
  "posts": [
    {
      "week": number,
      "day": number (1-7),
      "platform": "string",
      "topic": "string",
      "content": "string (ready-to-post)",
      "format": "string (Single Post | Thread | Carousel | Story)",
      "goal_alignment": "string (how this post advances the campaign goal)"
    }
  ]
}
Generate ${weeks * (platforms?.length ?? 2) * 3} posts spread across ${weeks} weeks.
Vary formats. Make content progressively build toward the goal.`,
      },
      {
        role: "user",
        content: `Campaign goal: ${goal}
Niche: ${niche || "general"}
Platforms: ${platformList}
Weeks: ${weeks}

Generate the complete campaign with ready-to-post content for each day/platform.`,
      },
    ],
  })

  const raw = completion.choices[0].message.content ?? "{}"
  let campaign: Record<string, unknown> = {}
  try { campaign = JSON.parse(raw) } catch {
    return NextResponse.json({ error: "AI response was malformed — please try again" }, { status: 500 })
  }

  const posts = ((campaign.posts ?? []) as Array<Record<string, unknown>>).map((p: Record<string, unknown>) => {
    const d = new Date(startDate)
    const weekOffset = ((p.week as number) - 1) * 7
    const dayOffset  = ((p.day as number) - 1)
    d.setDate(d.getDate() + weekOffset + dayOffset)
    return { ...p, scheduled_time: d.toISOString() }
  })

  const { data: saved, error } = await supabaseAdmin
    .from("campaigns")
    .insert({
      user_id:   user.id,
      name:      name || campaign.campaign_name,
      goal,
      niche:     niche || null,
      platforms: platforms || [],
      weeks,
      posts,
      status:    "draft",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ campaign: saved, strategy: campaign.strategy })
}

export async function PUT(req: NextRequest) {
  const token = getAuth(req)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { campaignId } = await req.json()
  if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 })

  const { data: campaign } = await supabaseAdmin
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .eq("user_id", user.id)
    .single()

  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (campaign.status === "scheduled") return NextResponse.json({ error: "Already scheduled" }, { status: 409 })

  const posts = campaign.posts as Array<Record<string, unknown>>
  const inserts = posts.map(p => ({
    user_id:        user.id,
    platform:       p.platform as string,
    content:        p.content as string,
    scheduled_time: p.scheduled_time as string,
    status:         "pending",
    topic_tags:     p.topic ? [p.topic as string] : [],
  }))

  const { error } = await supabaseAdmin.from("scheduled_posts").insert(inserts)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { error: updateErr } = await supabaseAdmin
    .from("campaigns").update({ status: "scheduled" }).eq("id", campaignId)
  if (updateErr) console.error("Campaign status update failed:", updateErr.message)

  return NextResponse.json({ ok: true, scheduled: inserts.length })
}

export async function DELETE(req: NextRequest) {
  const token = getAuth(req)
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  await supabaseAdmin.from("campaigns").delete().eq("id", id).eq("user_id", user.id)
  return NextResponse.json({ ok: true })
}
