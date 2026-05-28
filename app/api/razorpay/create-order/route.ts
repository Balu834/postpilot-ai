import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { createClient } from "@supabase/supabase-js"

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    // Auth check — prevent unauthenticated order creation
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await anon.auth.getUser(token)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { plan } = await req.json()

    const PRICES: Record<string, number> = {
      pro_monthly:    79900,   // ₹799  in paise
      pro_yearly:    799900,   // ₹7,999
      agency_monthly: 299900,  // ₹2,999
      agency_yearly: 2999900,  // ₹29,999
    }

    const amount = PRICES[plan]
    if (!amount) return NextResponse.json({ error: "Invalid plan" }, { status: 400 })

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
      notes:    { plan },
    })

    return NextResponse.json({ orderId: order.id, amount, currency: "INR" })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Order creation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
