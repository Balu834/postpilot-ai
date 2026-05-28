import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_PLATFORMS = new Set(["instagram","linkedin","twitter","facebook","threads","bluesky","pinterest","youtube"])

interface BulkRow {
  content:        string
  platform:       string
  scheduled_time: string
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

  const { rows }: { rows: BulkRow[] } = await req.json()
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 })
  }
  if (rows.length > 200) {
    return NextResponse.json({ error: "Max 200 rows per upload" }, { status: 400 })
  }

  const errors: string[] = []
  const valid: object[]  = []

  rows.forEach((row, i) => {
    const lineNum = i + 1
    if (!row.content?.trim())        { errors.push(`Row ${lineNum}: content is empty`);           return }
    if (!VALID_PLATFORMS.has(row.platform?.toLowerCase())) {
      errors.push(`Row ${lineNum}: unknown platform "${row.platform}"`)
      return
    }
    const date = new Date(row.scheduled_time)
    if (isNaN(date.getTime()))       { errors.push(`Row ${lineNum}: invalid date "${row.scheduled_time}"`); return }

    valid.push({
      user_id:        user.id,
      content:        row.content.trim(),
      platform:       row.platform.toLowerCase(),
      scheduled_time: date.toISOString(),
      status:         "pending",
      image_url:      null,
    })
  })

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 422 })
  }

  const { error } = await supabaseAdmin.from("scheduled_posts").insert(valid)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  void supabaseAdmin.from("activity_log").insert({
    user_id: user.id,
    action:  `Bulk scheduled ${valid.length} posts via CSV upload`,
    platform: null,
  })

  return NextResponse.json({ scheduled: valid.length })
}
