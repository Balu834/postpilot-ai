import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { openai } from "@/lib/openai"

const PLATFORM_LIMITS: Record<string, { max: number; note: string }> = {
  linkedin:  { max: 220,  note: "LinkedIn headline (max 220 chars, keyword-rich, professional)"  },
  instagram: { max: 150,  note: "Instagram bio (max 150 chars, punchy, line breaks welcome)"     },
  twitter:   { max: 160,  note: "Twitter/X bio (max 160 chars, concise, personality-forward)"    },
  facebook:  { max: 255,  note: "Facebook bio (max 255 chars, friendly, community-focused)"      },
  youtube:   { max: 200,  note: "YouTube channel description intro (max 200 chars, value-first)"  },
  pinterest: { max: 160,  note: "Pinterest bio (max 160 chars, keyword-rich, inspiring)"          },
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

  const { name, role, keywords, tone = "professional" } = await req.json()
  if (!name?.trim() || !role?.trim()) {
    return NextResponse.json({ error: "Name and role required" }, { status: 400 })
  }

  const keywordStr = Array.isArray(keywords) ? keywords.join(", ") : keywords

  const platformEntries = Object.entries(PLATFORM_LIMITS)
    .map(([key, { note }]) => `"${key}": "<${note}>"`)
    .join(",\n    ")

  const prompt = `You are a personal branding expert. Write optimized social media bios for ${name}, a ${role}.
Keywords to include naturally: ${keywordStr || "none specified"}.
Tone: ${tone}.

Each bio must be within its character limit. Do not include the name in every bio — vary the approach.

Respond ONLY with valid JSON:
{
  ${platformEntries}
}`

  const res = await openai.chat.completions.create({
    model:           "gpt-4o-mini",
    messages:        [{ role: "user", content: prompt }],
    temperature:     0.7,
    max_tokens:      700,
    response_format: { type: "json_object" },
  })

  try {
    const result = JSON.parse(res.choices[0].message.content ?? "{}")
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to parse bios" }, { status: 500 })
  }
}
