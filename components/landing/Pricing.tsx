"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Check, Zap, Shield, CreditCard, Users,
  ArrowRight, Star, Sparkles,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────
type Billing = "monthly" | "yearly"

interface Feature {
  text: string
  power?: boolean   // highlighted as a key selling feature
}

interface Plan {
  name:          string
  monthlyPrice:  string
  yearlyPrice:   string
  yearlyPerMo?:  string   // e.g. "₹667/mo" shown as effective rate
  periodLabel:   string
  description:   string
  badge?:        string
  highlighted:   boolean
  accent:        string
  glowColor:     string
  features:      Feature[]
  cta:           string
  ctaHref:       string
  yearlySavings?: string
}

// ── Plan data ─────────────────────────────────────────────────────
const PLANS: Plan[] = [
  {
    name:         "Free",
    monthlyPrice: "₹0",
    yearlyPrice:  "₹0",
    periodLabel:  "forever",
    description:  "Try PostPilot AI with no commitment",
    highlighted:  false,
    accent:       "#64748b",
    glowColor:    "rgba(100,116,139,0.12)",
    features: [
      { text: "30 AI generations / month",   power: true },
      { text: "Instagram + X captions" },
      { text: "Basic hashtag suggestions" },
      { text: "5 scheduled posts" },
      { text: "Community support" },
    ],
    cta:     "Start Free",
    ctaHref: "/login",
  },
  {
    name:          "Pro",
    monthlyPrice:  "₹799",
    yearlyPrice:   "₹7,999",
    yearlyPerMo:   "₹667/mo",
    periodLabel:   "/month",
    description:   "For creators, freelancers & small businesses",
    badge:         "Most Popular",
    highlighted:   true,
    accent:        "#F7BE4D",
    glowColor:     "rgba(247,190,77,0.18)",
    features: [
      { text: "Unlimited AI generations",              power: true },
      { text: "All platforms: LinkedIn + Instagram + X" },
      { text: "Blog → 20 Posts repurposing",           power: true },
      { text: "Unlimited scheduling" },
      { text: "Analytics dashboard" },
      { text: "AI rewrite & refine tools" },
      { text: "Viral hooks generator",                 power: true },
      { text: "Priority AI speed" },
    ],
    cta:           "Start Pro — ₹799/mo",
    ctaHref:       "/login",
    yearlySavings: "Save ₹1,589/year",
  },
  {
    name:          "Agency",
    monthlyPrice:  "₹2,999",
    yearlyPrice:   "₹29,999",
    yearlyPerMo:   "₹2,500/mo",
    periodLabel:   "/month",
    description:   "For agencies managing multiple brands",
    highlighted:   false,
    accent:        "#818cf8",
    glowColor:     "rgba(129,140,248,0.12)",
    features: [
      { text: "Everything in Pro" },
      { text: "10 team members",             power: true },
      { text: "Multi-brand workspace" },
      { text: "White-label reports",         power: true },
      { text: "Client approval workflows" },
      { text: "API access",                  power: true },
      { text: "Custom AI tone & voice" },
      { text: "Priority support" },
    ],
    cta:           "Contact Sales",
    ctaHref:       "/login",
    yearlySavings: "Save ₹5,989/year",
  },
]

const TESTIMONIALS = [
  { name: "Priya S.",  role: "Creator · Mumbai",    avatar: "P", color: "#E1306C",
    quote: "Saves me 15 hours a week. ₹799 is insane value." },
  { name: "Rahul K.",  role: "Agency · Bengaluru",  avatar: "R", color: "#0077B5",
    quote: "We run 12 client accounts on the Agency plan. ROI is incredible." },
  { name: "Ananya T.", role: "Founder · Delhi",     avatar: "A", color: "#818cf8",
    quote: "Upgraded to Pro after day 1. The repurpose feature alone is worth it." },
]

// ── BillingToggle ─────────────────────────────────────────────────
function BillingToggle({
  billing, onChange,
}: { billing: Billing; onChange: (b: Billing) => void }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => onChange("monthly")}
        className={`text-sm font-semibold transition-colors ${
          billing === "monthly" ? "text-white" : "text-slate-500 hover:text-slate-300"
        }`}>
        Monthly
      </button>

      {/* Toggle pill */}
      <button
        onClick={() => onChange(billing === "monthly" ? "yearly" : "monthly")}
        className="relative w-12 h-6 rounded-full border border-white/12 transition-all"
        style={{
          background: billing === "yearly"
            ? "rgba(247,190,77,0.2)"
            : "rgba(255,255,255,0.05)",
        }}
      >
        <motion.div
          layout
          className="absolute top-0.5 w-5 h-5 rounded-full"
          style={{
            left: billing === "yearly" ? "calc(100% - 1.375rem)" : "0.125rem",
            background: billing === "yearly" ? "#F7BE4D" : "#64748b",
            boxShadow: billing === "yearly" ? "0 0 8px rgba(247,190,77,0.5)" : "none",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      </button>

      <button
        onClick={() => onChange("yearly")}
        className={`text-sm font-semibold transition-colors flex items-center gap-2 ${
          billing === "yearly" ? "text-white" : "text-slate-500 hover:text-slate-300"
        }`}>
        Yearly
        <motion.span
          animate={{
            background: billing === "yearly"
              ? "rgba(247,190,77,0.2)"
              : "rgba(255,255,255,0.06)",
            color: billing === "yearly" ? "#F7BE4D" : "#64748b",
          }}
          transition={{ duration: 0.25 }}
          className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
          style={{
            borderColor: billing === "yearly"
              ? "rgba(247,190,77,0.3)"
              : "rgba(255,255,255,0.08)",
          }}>
          Save 20%
        </motion.span>
      </button>
    </div>
  )
}

// ── PlanCard ──────────────────────────────────────────────────────
function PlanCard({
  plan, billing, index,
}: { plan: Plan; billing: Billing; index: number }) {
  const price     = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice
  const perMo     = billing === "yearly" && plan.yearlyPerMo
  const isFree    = plan.name === "Free"
  const isPro     = plan.highlighted
  const isAgency  = plan.name === "Agency"

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      whileHover={!isPro ? { y: -4 } : {}}
      className="relative flex flex-col rounded-2xl transition-all duration-300 h-full"
    >
      {/* Card body */}
      <div
        className={`relative flex flex-col h-full rounded-2xl p-7 overflow-hidden
          transition-all duration-300 ${isPro ? "" : "hover:border-white/14"}`}
        style={{
          background: isPro
            ? "linear-gradient(145deg, rgba(20,28,50,0.98) 0%, rgba(14,20,40,0.98) 100%)"
            : "rgba(13,21,38,0.85)",
          border: isPro
            ? "1px solid rgba(247,190,77,0.35)"
            : isAgency
              ? "1px solid rgba(129,140,248,0.18)"
              : "1px solid rgba(255,255,255,0.07)",
          boxShadow: isPro
            ? "0 0 0 1px rgba(247,190,77,0.12), 0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(247,190,77,0.1)"
            : "0 8px 32px rgba(0,0,0,0.3)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Pro animated glow ring */}
        {isPro && (
          <>
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(247,190,77,0.1) 0%, transparent 60%)",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                boxShadow: "0 0 40px rgba(247,190,77,0.08) inset",
              }}
            />
          </>
        )}

        {/* Agency top gradient */}
        {isAgency && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(129,140,248,0.07) 0%, transparent 55%)",
            }}
          />
        )}

        <div className="relative flex flex-col flex-1">
          {/* Badge */}
          {plan.badge && (
            <div className="absolute -top-1 -right-1 z-10">
              <div className="flex items-center gap-1 bg-[#F7BE4D] text-[#050816] text-[10px]
                font-bold px-2.5 py-1 rounded-full shadow-lg"
                style={{ boxShadow: "0 0 14px rgba(247,190,77,0.5)" }}>
                <Zap className="w-2.5 h-2.5" fill="currentColor" strokeWidth={0} />
                {plan.badge}
              </div>
            </div>
          )}

          {/* Plan name + description */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${plan.accent}18` }}>
                {isPro ? (
                  <Sparkles className="w-3.5 h-3.5" style={{ color: plan.accent }} />
                ) : isAgency ? (
                  <Users className="w-3.5 h-3.5" style={{ color: plan.accent }} />
                ) : (
                  <Zap className="w-3.5 h-3.5" style={{ color: plan.accent }} />
                )}
              </div>
              <h3 className="text-base font-bold text-white">{plan.name}</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{plan.description}</p>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-end gap-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={billing + plan.name}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.22 }}
                  className="text-4xl font-black text-white tracking-tight"
                  style={isPro ? {
                    background: "linear-gradient(135deg, #F7BE4D, #ffd166)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  } : {}}
                >
                  {price}
                </motion.span>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={billing + plan.name + "period"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pb-1.5"
                >
                  {isFree ? (
                    <span className="text-sm text-slate-500">{plan.periodLabel}</span>
                  ) : billing === "yearly" && perMo ? (
                    <div>
                      <span className="text-xs text-slate-500 block">/year</span>
                      <span className="text-[11px] font-semibold" style={{ color: plan.accent }}>
                        = {perMo}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">{plan.periodLabel}</span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Savings badge */}
            <AnimatePresence>
              {billing === "yearly" && !isFree && plan.yearlySavings && (
                <motion.div
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2"
                >
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold
                    px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(52,211,153,0.12)",
                      color: "#34d399",
                      border: "1px solid rgba(52,211,153,0.2)",
                    }}>
                    <Check className="w-3 h-3" />
                    {plan.yearlySavings}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Feature list */}
          <ul className="space-y-2.5 flex-1 mb-7">
            {plan.features.map((f, i) => (
              <motion.li
                key={f.text}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i + index * 0.08 }}
                className="flex items-start gap-2.5"
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: f.power
                      ? `${plan.accent}22`
                      : "rgba(255,255,255,0.06)",
                  }}>
                  <Check
                    className="w-2.5 h-2.5"
                    style={{ color: f.power ? plan.accent : "#64748b" }}
                  />
                </div>
                <span className={`text-sm leading-snug ${
                  f.power ? "text-slate-200 font-medium" : "text-slate-500"
                }`}>
                  {f.text}
                </span>
              </motion.li>
            ))}
          </ul>

          {/* CTA */}
          {isPro ? (
            <Link href={plan.ctaHref}>
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-center
                  text-[#050816] cursor-pointer flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #F7BE4D 0%, #ffd166 50%, #f0a800 100%)",
                  boxShadow: "0 0 24px rgba(247,190,77,0.4), 0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                <Sparkles className="w-4 h-4" />
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
          ) : isAgency ? (
            <Link href={plan.ctaHref}>
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-center
                  cursor-pointer flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "rgba(129,140,248,0.1)",
                  border: "1px solid rgba(129,140,248,0.3)",
                  color: "#818cf8",
                }}
              >
                Contact Sales
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
          ) : (
            <Link href={plan.ctaHref}>
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-center
                  cursor-pointer transition-all"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94a3b8",
                }}
              >
                {plan.cta}
              </motion.div>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Pricing Section ──────────────────────────────────────────
export default function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly")

  return (
    <section id="pricing" className="py-28 px-6 relative overflow-hidden">

      {/* ── Background effects ──────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid */}
        <div className="absolute inset-0 grid-bg opacity-30" />
        {/* Gold orb — top center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
          style={{
            background: "radial-gradient(ellipse at center top, rgba(247,190,77,0.07) 0%, transparent 60%)",
          }} />
        {/* Indigo orb — right */}
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, rgba(129,140,248,0.3) 0%, transparent 70%)" }} />
        {/* Blue orb — left */}
        <div className="absolute bottom-1/3 -left-32 w-64 h-64 rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)" }} />
      </div>

      <div className="max-w-6xl mx-auto relative">

        {/* ── Section header ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border"
            style={{
              background: "rgba(247,190,77,0.08)",
              borderColor: "rgba(247,190,77,0.2)",
            }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F7BE4D] pulse-dot" />
            <span className="text-xs text-[#F7BE4D] font-semibold tracking-widest uppercase">
              India-First Pricing · Made for Creators
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4
            leading-tight tracking-tight">
            Your AI Social{" "}
            <span className="gradient-text">Media Team.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Create 30 days of content in minutes using AI-powered generation,
            scheduling, and analytics.
          </p>
        </motion.div>

        {/* ── Billing toggle ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mb-12"
        >
          <BillingToggle billing={billing} onChange={setBilling} />
        </motion.div>

        {/* ── Pricing cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 items-stretch">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} billing={billing} index={i} />
          ))}
        </div>

        {/* ── Trust strip ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-col items-center gap-6"
        >
          {/* Trust items row */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: Shield,     text: "No credit card required" },
              { icon: Check,      text: "Cancel anytime"          },
              { icon: Users,      text: "10,000+ creators trust us" },
              { icon: CreditCard, text: "UPI · Cards · Net Banking" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <Icon className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-sm text-slate-400">{text}</span>
              </div>
            ))}
          </div>

          {/* Payment logos row */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {[
              { label: "UPI",       bg: "#1a2235" },
              { label: "Razorpay",  bg: "#1a2235" },
              { label: "Visa",      bg: "#1a2235" },
              { label: "Mastercard",bg: "#1a2235" },
              { label: "Net Banking",bg: "#1a2235" },
            ].map(p => (
              <div key={p.label}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500
                  border border-white/6"
                style={{ background: p.bg }}>
                {p.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Testimonial micro-strip ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i + 0.4 }}
              className="rounded-2xl p-5 border border-white/6"
              style={{
                background: "rgba(13,21,38,0.7)",
                backdropFilter: "blur(16px)",
              }}
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-3 h-3 text-[#F7BE4D]" fill="#F7BE4D" />
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4 italic">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center
                  text-xs font-bold text-white flex-shrink-0"
                  style={{ background: t.color }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{t.name}</p>
                  <p className="text-[11px] text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Bottom CTA strip ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-600 mb-4">
            Questions about pricing?{" "}
            <a href="mailto:support@postpilot.ai"
              className="text-[#F7BE4D] hover:text-[#ffd166] transition-colors">
              Talk to us →
            </a>
          </p>
          <p className="text-xs text-slate-700">
            Prices shown in Indian Rupees (INR) including applicable taxes.
            All plans renew automatically.
          </p>
        </motion.div>

      </div>
    </section>
  )
}
