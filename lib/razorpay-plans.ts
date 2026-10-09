import crypto from "crypto"

export type PlanKey = "pro_monthly" | "pro_yearly" | "agency_monthly" | "agency_yearly"

// What the pricing page shows, in paise. Checkout refuses to start if the
// Razorpay plan disagrees, so a misconfigured plan can never charge an amount
// or interval the customer was not shown.
export const PLAN_PRICES: Record<PlanKey, { amount: number; period: "monthly" | "yearly" }> = {
  pro_monthly:    { amount: 79900,   period: "monthly" },
  pro_yearly:     { amount: 799900,  period: "yearly" },
  agency_monthly: { amount: 299900,  period: "monthly" },
  agency_yearly:  { amount: 2999900, period: "yearly" },
}

export function planIdFor(plan: PlanKey): string | undefined {
  // Trim: values piped into `vercel env add` can carry a trailing newline.
  return ({
    pro_monthly:    process.env.RAZORPAY_PLAN_ID_PRO_MONTHLY,
    pro_yearly:     process.env.RAZORPAY_PLAN_ID_PRO_YEARLY,
    agency_monthly: process.env.RAZORPAY_PLAN_ID_AGENCY_MONTHLY,
    agency_yearly:  process.env.RAZORPAY_PLAN_ID_AGENCY_YEARLY,
  }[plan])?.trim() || undefined
}

export function isPlanKey(v: unknown): v is PlanKey {
  return typeof v === "string" && v in PLAN_PRICES
}

interface RazorpayPlanLike {
  period?: string
  interval?: number
  item?: { amount?: number | string; currency?: string }
}

export function planMatchesPrice(rp: RazorpayPlanLike | null | undefined, plan: PlanKey): boolean {
  const want = PLAN_PRICES[plan]
  return (
    !!rp &&
    rp.period === want.period &&
    Number(rp.interval) === 1 &&
    Number(rp.item?.amount) === want.amount &&
    rp.item?.currency === "INR"
  )
}

export function planNameFor(plan: string | undefined): "pro" | "agency" {
  return plan?.includes("agency") ? "agency" : "pro"
}

// Razorpay reports the paid-through date as unix seconds; fall back to one
// period from now only if it is missing.
export function expiryFrom(currentEnd: number | null | undefined, plan: string | undefined): Date {
  if (currentEnd && currentEnd > 0) return new Date(currentEnd * 1000)
  const d = new Date()
  d.setMonth(d.getMonth() + (plan?.includes("yearly") ? 12 : 1))
  return d
}

export function safeEqualHex(a: string, b: string | null | undefined): boolean {
  if (!b) return false
  const x = Buffer.from(a, "utf8")
  const y = Buffer.from(b, "utf8")
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}
