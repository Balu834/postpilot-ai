import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { createClient } from "@supabase/supabase-js"

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: { user } } = await anon.auth.getUser(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("razorpay_subscription_id")
      .eq("id", user.id)
      .single()

    const subscriptionId = profile?.razorpay_subscription_id
    if (!subscriptionId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 })
    }

    // Cancel at the end of the current billing cycle — the user keeps
    // access through what they already paid for; the existing
    // downgrade-expired cron reverts them to free once plan_expires_at
    // (already set to that cycle's end) lapses.
    await razorpay.subscriptions.cancel(subscriptionId, true)

    const { error } = await supabaseAdmin
      .from("users")
      .update({ subscription_status: "cancelled" })
      .eq("id", user.id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cancellation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
