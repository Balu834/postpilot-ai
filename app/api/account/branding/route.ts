import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data } = await supabaseAdmin
    .from("users")
    .select("brand_name, brand_logo_url, plan_name")
    .eq("id", user.id)
    .single()

  return NextResponse.json({
    brand_name:     data?.brand_name ?? null,
    brand_logo_url: data?.brand_logo_url ?? null,
    isAgency:       data?.plan_name === "agency",
  })
}

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("plan_name")
    .eq("id", user.id)
    .single()

  if (profile?.plan_name !== "agency") {
    return NextResponse.json({ error: "Agency plan required" }, { status: 403 })
  }

  const { brand_name, brand_logo_url } = await req.json()

  const { error } = await supabaseAdmin
    .from("users")
    .update({
      brand_name:     brand_name?.trim() || null,
      brand_logo_url: brand_logo_url || null,
    })
    .eq("id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
