import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client with service role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, plan } = await req.json()

    // Verify signature
    const body     = `${razorpay_order_id}|${razorpay_payment_id}`
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex")

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Determine plan name and expiry
    const isYearly    = plan.includes("yearly")
    const planName    = plan.includes("agency") ? "agency" : "pro"
    const expiresAt   = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + (isYearly ? 12 : 1))

    // Update user plan in Supabase
    const { error } = await supabaseAdmin
      .from("users")
      .update({
        plan,
        plan_name:          planName,
        plan_expires_at:    expiresAt.toISOString(),
        razorpay_payment_id,
      })
      .eq("id", userId)

    if (error) throw error

    return NextResponse.json({ success: true, plan: planName })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
