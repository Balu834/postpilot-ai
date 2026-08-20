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

const PLAN_IDS: Record<string, string | undefined> = {
  pro_monthly:    process.env.RAZORPAY_PLAN_ID_PRO_MONTHLY,
  pro_yearly:     process.env.RAZORPAY_PLAN_ID_PRO_YEARLY,
  agency_monthly: process.env.RAZORPAY_PLAN_ID_AGENCY_MONTHLY,
  agency_yearly:  process.env.RAZORPAY_PLAN_ID_AGENCY_YEARLY,
}

// High enough to never realistically hit the ceiling — users leave via
// cancellation, not by running out of billing cycles.
const TOTAL_COUNT: Record<string, number> = {
  pro_monthly:    120,
  pro_yearly:     10,
  agency_monthly: 120,
  agency_yearly:  10,
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await anon.auth.getUser(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { plan } = await req.json()
    const planId = PLAN_IDS[plan]
    if (!planId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 })

    const subscription = await razorpay.subscriptions.create({
      plan_id:         planId,
      customer_notify: 1,
      total_count:     TOTAL_COUNT[plan],
      notes:           { plan, user_id: user.id },
    })

    const { error } = await supabaseAdmin
      .from("users")
      .update({
        razorpay_subscription_id: subscription.id,
        subscription_status:      "created",
      })
      .eq("id", user.id)
    if (error) throw error

    return NextResponse.json({ subscriptionId: subscription.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Subscription creation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
