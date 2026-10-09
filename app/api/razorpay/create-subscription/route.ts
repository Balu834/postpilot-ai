import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { createClient } from "@supabase/supabase-js"
import { isPlanKey, planIdFor, planMatchesPrice } from "@/lib/razorpay-plans"

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    if (!isPlanKey(plan)) return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    const planId = planIdFor(plan)
    if (!planId) {
      return NextResponse.json({ error: "This plan isn't available right now. Please contact support." }, { status: 503 })
    }

    // Never charge an amount or interval the pricing page didn't show.
    const rpPlan = await razorpay.plans.fetch(planId).catch(() => null)
    if (!planMatchesPrice(rpPlan as Parameters<typeof planMatchesPrice>[0], plan)) {
      console.error(`Razorpay plan ${planId} does not match the displayed price for ${plan}`)
      return NextResponse.json({ error: "This plan isn't available right now. Please contact support." }, { status: 503 })
    }

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
