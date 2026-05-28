"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Zap, Check, Sparkles, Crown, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"

/* ─── Types ──────────────────────────────────────────────────── */
type Billing = "monthly" | "yearly"
type PlanKey = "pro" | "agency"

interface Plan {
  key:          PlanKey
  name:         string
  icon:         React.ReactNode
  monthlyPrice: number
  yearlyPrice:  number
  yearlyPerMo:  number
  savings:      number
  color:        string
  features:     string[]
  cta:          string
  popular:      boolean
}

const PLANS: Plan[] = [
  {
    key:          "pro",
    name:         "Pro",
    icon:         <Zap className="w-4 h-4" fill="currentColor" strokeWidth={0} />,
    monthlyPrice: 799,
    yearlyPrice:  7999,
    yearlyPerMo:  667,
    savings:      1589,
    color:        "#F7BE4D",
    popular:      true,
    cta:          "Start Pro",
    features: [
      "Unlimited AI generations",
      "All 5 content platforms",
      "12 AI templates",
      "Content workspace & campaigns",
      "Priority AI (faster responses)",
      "Analytics dashboard",
      "Schedule up to 100 posts/mo",
    ],
  },
  {
    key:          "agency",
    name:         "Agency",
    icon:         <Crown className="w-4 h-4" />,
    monthlyPrice: 2999,
    yearlyPrice:  29999,
    yearlyPerMo:  2500,
    savings:      5989,
    color:        "#818cf8",
    popular:      false,
    cta:          "Start Agency",
    features: [
      "Everything in Pro",
      "Up to 10 client workspaces",
      "White-label reports",
      "API access",
      "Dedicated account manager",
      "Unlimited scheduling",
      "Priority support (< 2hr)",
    ],
  },
]

/* ─── Razorpay script loader ─────────────────────────────────── */
function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if (typeof window === "undefined") return resolve(false)
    if ((window as any).Razorpay) return resolve(true)
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload  = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/* ─── Props ──────────────────────────────────────────────────── */
interface Props {
  open:    boolean
  onClose: () => void
  onSuccess?: (plan: string) => void
}

/* ─── Component ──────────────────────────────────────────────── */
export default function UpgradeModal({ open, onClose, onSuccess }: Props) {
  const [billing,      setBilling]      = useState<Billing>("monthly")
  const [selected,     setSelected]     = useState<PlanKey>("pro")
  const [loading,      setLoading]      = useState(false)
  const [success,      setSuccess]      = useState(false)
  const [activatedPlan, setActivatedPlan] = useState("")
  const [error,        setError]        = useState("")

  useEffect(() => {
    if (open) { setSuccess(false); setError("") }
  }, [open])

  const handleUpgrade = async () => {
    setLoading(true)
    setError("")

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Please sign in first")
      const user = session.user

      const planKey = `${selected}_${billing}` // e.g. pro_monthly

      // 1. Create order server-side
      const orderRes = await fetch("/api/razorpay/create-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body:    JSON.stringify({ plan: planKey }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error)

      // 2. Load Razorpay script
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error("Failed to load payment gateway. Check your connection.")

      // 3. Open Razorpay checkout
      const plan = PLANS.find(p => p.key === selected)!
      const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice

      const options = {
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      orderData.amount,
        currency:    "INR",
        name:        "PostPilot AI",
        description: `${plan.name} Plan — ${billing === "monthly" ? "Monthly" : "Yearly"}`,
        order_id:    orderData.orderId,
        prefill: {
          email: user.email,
        },
        theme: { color: plan.color },
        handler: async (response: any) => {
          try {
            // 4. Verify payment server-side
            const verifyRes = await fetch("/api/razorpay/verify", {
              method:  "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
              body:    JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                plan:                planKey,
              }),
            })
            const verifyData = await verifyRes.json()
            if (!verifyRes.ok) throw new Error(verifyData.error ?? "Verification failed")

            // Meta Pixel: completed purchase
            ;(window as any).fbq?.("track", "Purchase", {
              value:    price,
              currency: "INR",
            })

            setSuccess(true)
            setActivatedPlan(verifyData.plan)
            onSuccess?.(verifyData.plan)
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Payment verification failed")
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment failed")
      setLoading(false)
    }
  }

  const activePlan = PLANS.find(p => p.key === selected)!
  const price      = billing === "monthly" ? activePlan.monthlyPrice : activePlan.yearlyPerMo

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(5,8,22,0.85)", backdropFilter: "blur(12px)" }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{
              background: "rgba(10,14,30,0.95)",
              border:     "1px solid rgba(255,255,255,0.08)",
              boxShadow:  "0 32px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Success state */}
            {success ? (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                  style={{
                    background: "linear-gradient(135deg, #F7BE4D, #ffd166)",
                    boxShadow:  "0 0 40px rgba(247,190,77,0.5)",
                  }}
                >
                  <Check className="w-10 h-10 text-[#050816]" strokeWidth={3} />
                </motion.div>
                <h2 className="text-2xl font-black text-white mb-2 capitalize">
                  You&apos;re on {activatedPlan || "Pro"}! 🚀
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  Unlimited generations unlocked. Your workspace is ready.
                </p>
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl font-bold text-sm"
                  style={{ background: "linear-gradient(135deg, #F7BE4D, #ffd166)", color: "#050816" }}
                >
                  Start creating →
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                  <div>
                    <h2 className="text-lg font-black text-white">Upgrade PostPilot AI</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Unlock unlimited AI generations</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Billing toggle */}
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
                      {(["monthly", "yearly"] as Billing[]).map(b => (
                        <button
                          key={b}
                          onClick={() => setBilling(b)}
                          className="relative px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                          style={{
                            background: billing === b ? "#F7BE4D" : "transparent",
                            color:      billing === b ? "#050816" : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {b.charAt(0).toUpperCase() + b.slice(1)}
                          {b === "yearly" && (
                            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: billing === "yearly" ? "rgba(5,8,22,0.3)" : "rgba(247,190,77,0.15)",
                                color:      billing === "yearly" ? "#050816" : "#F7BE4D",
                              }}>
                              Save 17%
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plan cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {PLANS.map(plan => {
                      const isActive = selected === plan.key
                      const p = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPerMo
                      return (
                        <motion.button
                          key={plan.key}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelected(plan.key)}
                          className="relative text-left p-5 rounded-xl transition-all"
                          style={{
                            background: isActive
                              ? `linear-gradient(135deg, ${plan.color}15, ${plan.color}08)`
                              : "rgba(255,255,255,0.025)",
                            border: isActive
                              ? `1px solid ${plan.color}50`
                              : "1px solid rgba(255,255,255,0.07)",
                            boxShadow: isActive ? `0 0 24px ${plan.color}18` : "none",
                          }}
                        >
                          {plan.popular && (
                            <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ background: plan.color, color: "#050816" }}>
                              MOST POPULAR
                            </div>
                          )}

                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: `${plan.color}20`, color: plan.color }}>
                              {plan.icon}
                            </div>
                            <span className="font-bold text-white text-sm">{plan.name}</span>
                            {isActive && (
                              <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: plan.color }}>
                                <Check className="w-3 h-3 text-[#050816]" strokeWidth={3} />
                              </div>
                            )}
                          </div>

                          <div className="mb-3">
                            <span className="text-2xl font-black text-white">₹{p.toLocaleString("en-IN")}</span>
                            <span className="text-xs text-slate-500">/mo</span>
                            {billing === "yearly" && (
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                ₹{plan.yearlyPrice.toLocaleString("en-IN")} billed yearly
                              </div>
                            )}
                          </div>

                          <ul className="space-y-1.5">
                            {plan.features.slice(0, 4).map(f => (
                              <li key={f} className="flex items-start gap-1.5">
                                <Check className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: plan.color }} />
                                <span className="text-[11px] text-slate-400 leading-tight">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-red-400 text-xs text-center mb-4 flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      {error}
                    </p>
                  )}

                  {/* CTA */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
                    style={{
                      background: `linear-gradient(135deg, ${activePlan.color}, ${activePlan.color}cc)`,
                      color:      activePlan.key === "pro" ? "#050816" : "#fff",
                      boxShadow:  `0 4px 24px ${activePlan.color}35`,
                    }}
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Pay ₹{(billing === "monthly"
                          ? activePlan.monthlyPrice
                          : activePlan.yearlyPrice
                        ).toLocaleString("en-IN")} with Razorpay
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  {/* Trust */}
                  <div className="flex items-center justify-center gap-4 mt-4">
                    {["UPI", "Cards", "NetBanking", "EMI"].map(m => (
                      <span key={m} className="text-[10px] text-slate-600 font-medium">{m}</span>
                    ))}
                    <span className="text-[10px] text-slate-700">•</span>
                    <span className="text-[10px] text-slate-600">Secured by Razorpay</span>
                  </div>

                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
