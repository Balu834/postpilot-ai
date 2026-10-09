import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import Razorpay from "razorpay"
import { createClient } from "@supabase/supabase-js"
import { expiryFrom, planNameFor, safeEqualHex } from "@/lib/razorpay-plans"

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
    const { data: { user: caller } } = await anon.auth.getUser(token)
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { razorpay_payment_id, razorpay_signature } = await req.json()

    // Look up the subscription we created server-side for this user — never
    // trust a client-supplied subscription_id.
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("razorpay_subscription_id")
      .eq("id", caller.id)
      .single()

    const subscriptionId = profile?.razorpay_subscription_id
    if (!subscriptionId) {
      return NextResponse.json({ error: "No pending subscription found" }, { status: 400 })
    }

    // Subscription checkout signs payment_id|subscription_id — different
    // from the order flow's order_id|payment_id.
    const body     = `${razorpay_payment_id}|${subscriptionId}`
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex")

    if (!safeEqualHex(expected, razorpay_signature)) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Fetch the subscription back from Razorpay to read the plan key we
    // stored in `notes` at creation time — the authoritative source (also
    // what the webhook will reference), rather than trusting anything
    // client-supplied or duplicating a local copy that could drift.
    const subscription = await razorpay.subscriptions.fetch(subscriptionId)
    const notes = subscription.notes as Record<string, string> | undefined
    const planKey = notes?.plan
    if (!planKey) return NextResponse.json({ error: "Subscription plan not found" }, { status: 400 })
    if (notes?.user_id && notes.user_id !== caller.id) {
      return NextResponse.json({ error: "This subscription does not belong to you" }, { status: 403 })
    }

    // The signature never expires, so a replayed payment_id+signature after a
    // cancellation must not unlock anything: only grant while Razorpay itself
    // says the subscription is live, and only up to the date it is paid for.
    if (subscription.status !== "authenticated" && subscription.status !== "active") {
      return NextResponse.json({ error: "Subscription is not active" }, { status: 409 })
    }

    const planName = planNameFor(planKey)
    const expiresAt = expiryFrom(subscription.current_end as number | null | undefined, planKey)

    // Optimistic unlock for instant UI feedback — the webhook
    // (subscription.activated/charged) keeps this current on every
    // renewal after this point.
    const { error } = await supabaseAdmin
      .from("users")
      .update({
        plan_name:            planName,
        plan_expires_at:      expiresAt.toISOString(),
        subscription_status:  "authenticated",
        razorpay_payment_id,
      })
      .eq("id", caller.id)
    if (error) throw error

    return NextResponse.json({ success: true, plan: planName })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
