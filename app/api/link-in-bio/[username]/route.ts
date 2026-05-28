import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const { data: bio } = await supabaseAdmin
    .from("link_in_bio")
    .select("*")
    .eq("username", username.toLowerCase())
    .single()

  if (!bio) return NextResponse.json({ error: "Page not found" }, { status: 404 })

  const { data: accounts } = await supabaseAdmin
    .from("social_accounts")
    .select("platform, username")
    .eq("user_id", bio.user_id)

  return NextResponse.json({ bio, accounts: accounts ?? [] })
}
