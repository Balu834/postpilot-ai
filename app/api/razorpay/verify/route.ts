import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Verify caller identity from JWT — do not trust userId from body
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: { user: caller } } = await anon.auth.getUser(token)
    if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()
    const userId = caller.id

    // Look up the order we created server-side — the plan/amount actually
    // paid for, not whatever the client claims in this request.
    const { data: order } = await supabaseAdmin
      .from("payment_orders")
      .select("user_id, plan, status")
      .eq("order_id", razorpay_order_id)
      .single()

    if (!order) {
      return NextResponse.json({ error: "Unknown order" }, { status: 400 })
    }
    if (order.user_id !== userId) {
      return NextResponse.json({ error: "This order does not belong to you" }, { status: 403 })
    }
    if (order.status === "verified") {
      return NextResponse.json({ error: "This order has already been processed" }, { status: 409 })
    }

    // Verify signature
    const body     = `${razorpay_order_id}|${razorpay_payment_id}`
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex")

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Determine plan name and expiry from the stored order, not the request body
    const plan       = order.plan
    const isYearly    = plan.includes("yearly")
    const planName    = plan.includes("agency") ? "agency" : "pro"
    const expiresAt   = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + (isYearly ? 12 : 1))

    // Update user plan in Supabase
    const { error } = await supabaseAdmin
      .from("users")
      .update({
        plan_name:          planName,
        plan_expires_at:    expiresAt.toISOString(),
        razorpay_payment_id,
      })
      .eq("id", userId)

    if (error) throw error

    await supabaseAdmin
      .from("payment_orders")
      .update({ status: "verified", verified_at: new Date().toISOString() })
      .eq("order_id", razorpay_order_id)

    return NextResponse.json({ success: true, plan: planName })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
