import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex")
  const bufB = Buffer.from(b, "hex")
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

// The webhook payload echoes back the subscription's `notes` (set at
// creation in create-subscription/route.ts), so the plan key — and
// therefore the correct monthly/yearly billing interval — is available
// right here without an extra API call back to Razorpay.
async function extendAccess(subscriptionId: string, planKey: string | undefined, status: string) {
  const isYearly = planKey?.includes("yearly") ?? false
  const planName = planKey?.includes("agency") ? "agency" : "pro"

  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + (isYearly ? 12 : 1))

  await supabaseAdmin
    .from("users")
    .update({
      plan_name:           planName,
      plan_expires_at:     expiresAt.toISOString(),
      subscription_status: status,
    })
    .eq("razorpay_subscription_id", subscriptionId)
}

async function setStatus(subscriptionId: string, status: string) {
  await supabaseAdmin
    .from("users")
    .update({ subscription_status: status })
    .eq("razorpay_subscription_id", subscriptionId)
}

export async function POST(req: NextRequest) {
  // Signature is computed over the RAW body — must read as text before any
  // JSON parsing, or the signature check will never match.
  const rawBody = await req.text()
  const signature = req.headers.get("x-razorpay-signature")

  if (!process.env.RAZORPAY_WEBHOOK_SECRET || !signature) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex")

  if (!timingSafeEqualHex(expected, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const event: string = payload.event
  const subscriptionEntity = payload.payload?.subscription?.entity
  const subscriptionId: string | undefined = subscriptionEntity?.id
  const planKey: string | undefined = subscriptionEntity?.notes?.plan

  if (!subscriptionId) {
    return NextResponse.json({ received: true })
  }

  try {
    switch (event) {
      case "subscription.activated":
      case "subscription.charged":
        await extendAccess(subscriptionId, planKey, "active")
        break
      case "subscription.pending":
        await setStatus(subscriptionId, "pending")
        break
      case "subscription.halted":
        await setStatus(subscriptionId, "halted")
        break
      case "subscription.cancelled":
        await setStatus(subscriptionId, "cancelled")
        break
      case "subscription.completed":
        await setStatus(subscriptionId, "completed")
        break
      case "subscription.expired":
        await setStatus(subscriptionId, "expired")
        break
      case "subscription.paused":
        await setStatus(subscriptionId, "paused")
        break
      case "subscription.resumed":
        await setStatus(subscriptionId, "active")
        break
      default:
        // Unhandled event type — acknowledge so Razorpay doesn't retry.
        break
    }
  } catch (err) {
    console.error(`Razorpay webhook: failed to process ${event}`, err)
  }

  return NextResponse.json({ received: true })
}
