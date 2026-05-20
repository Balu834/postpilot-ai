import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const REFERRAL_CREDITS = 5

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { referralCode } = await req.json()
    if (!referralCode) return NextResponse.json({ skipped: true })

    // Find the referrer by code
    const { data: referrer } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("referral_code", referralCode)
      .single()

    if (!referrer || referrer.id === user.id) {
      return NextResponse.json({ skipped: true })
    }

    // Record the referral (unique constraint prevents duplicates)
    const { error: insertError } = await supabaseAdmin
      .from("referrals")
      .insert({ referrer_id: referrer.id, referred_id: user.id })

    if (insertError) return NextResponse.json({ skipped: true }) // already referred

    // Award bonus credits to referrer
    await supabaseAdmin.rpc("increment_referral_credits", {
      user_id: referrer.id,
      amount:  REFERRAL_CREDITS,
    })

    return NextResponse.json({ success: true, credits: REFERRAL_CREDITS })
  } catch (err) {
    console.error("Referral track error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
