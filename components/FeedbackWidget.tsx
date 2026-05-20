"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare, X, Bug, Sparkles, HelpCircle,
  CreditCard, Zap, Check, ArrowLeft, Send,
  Clock, Users, Calendar, TrendingUp, Rss, Brain,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { analytics } from "@/lib/analytics"

// ── Types ─────────────────────────────────────────────────────────
interface Category {
  id:    string
  label: string
  icon:  LucideIcon
  color: string
  desc:  string
}
interface WaitlistFeature {
  id:    string
  label: string
  icon:  LucideIcon
  color: string
  desc:  string
  eta:   string
}

// ── Data ──────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  { id: "bug",     label: "Bug Report",       icon: Bug,          color: "#ef4444", desc: "Something broken?" },
  { id: "feature", label: "Feature Request",  icon: Sparkles,     color: "#818cf8", desc: "Want something new?" },
  { id: "ux",      label: "UX Confusion",     icon: HelpCircle,   color: "#F7BE4D", desc: "Felt confusing?" },
  { id: "general", label: "General Feedback", icon: MessageSquare,color: "#34d399", desc: "Anything on your mind" },
  { id: "billing", label: "Billing Problem",  icon: CreditCard,   color: "#f472b6", desc: "Payment issues?" },
  { id: "ai",      label: "AI Quality",       icon: Zap,          color: "#0ea5e9", desc: "AI output issues?" },
]

const WAITLIST_FEATURES: WaitlistFeature[] = [
  { id: "brand-voice",  label: "AI Brand Voice",       icon: Brain,      color: "#F7BE4D", desc: "AI learns and replicates your unique writing style", eta: "Q3 2026" },
  { id: "calendar",     label: "AI Content Calendar",  icon: Calendar,   color: "#818cf8", desc: "Plan a full month of content in one click",          eta: "Q3 2026" },
  { id: "team",         label: "Team Collaboration",   icon: Users,      color: "#34d399", desc: "Invite teammates to generate and schedule together",  eta: "Q4 2026" },
  { id: "auto-publish", label: "Auto Publishing",      icon: Rss,        color: "#f472b6", desc: "Automatically post directly to your social accounts", eta: "Q4 2026" },
  { id: "trends",       label: "AI Trend Detection",   icon: TrendingUp, color: "#0ea5e9", desc: "Catch viral trends before they peak",                 eta: "2027"    },
]

const PAGES = ["Dashboard", "Generate", "Templates", "Schedule", "History", "Analytics", "Repurpose", "Settings", "Other"]

type Tab  = "feedback" | "waitlist"
type Step = "category" | "form" | "success"

// ── Widget ────────────────────────────────────────────────────────
export default function FeedbackWidget() {
  const [isOpen,   setIsOpen]   = useState(false)
  const [tab,      setTab]      = useState<Tab>("feedback")
  const [step,     setStep]     = useState<Step>("category")
  const [category, setCategory] = useState<Category | null>(null)

  // Feedback form
  const [message,    setMessage]    = useState("")
  const [page,       setPage]       = useState("Generate")
  const [email,      setEmail]      = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Waitlist
  const [selectedFeature,    setSelectedFeature]    = useState("")
  const [waitlistEmail,      setWaitlistEmail]      = useState("")
  const [waitlistSuccess,    setWaitlistSuccess]    = useState(false)
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false)

  const open = () => {
    setIsOpen(true)
    analytics.feedbackOpened()
  }

  const close = () => {
    setIsOpen(false)
    setTimeout(() => {
      setStep("category")
      setCategory(null)
      setMessage("")
      setEmail("")
      setPage("Generate")
    }, 350)
  }

  const selectCategory = (cat: Category) => {
    setCategory(cat)
    setStep("form")
  }

  const handleSubmit = async () => {
    if (!message.trim()) return
    setSubmitting(true)
    analytics.feedbackSubmitted(category?.id ?? "general", !!email.trim())
    if (category?.id === "bug")     analytics.bugReported(page)
    if (category?.id === "feature") analytics.featureRequested(message)
    await new Promise(r => setTimeout(r, 900))
    setSubmitting(false)
    setStep("success")
  }

  const handleWaitlist = async () => {
    if (!selectedFeature || !waitlistEmail.trim()) return
    setWaitlistSubmitting(true)
    analytics.waitlistJoined(selectedFeature)
    await new Promise(r => setTimeout(r, 900))
    setWaitlistSubmitting(false)
    setWaitlistSuccess(true)
  }

  const placeholder = (id: string) => {
    if (id === "bug")     return "e.g. The generate button didn't respond when I clicked it after pasting a long topic..."
    if (id === "feature") return "e.g. I'd love an AI that auto-detects trending topics and suggests posts around them..."
    if (id === "ux")      return "e.g. The onboarding step 3 was confusing — I didn't know where to click next..."
    if (id === "billing") return "e.g. My payment failed but the credits weren't added..."
    if (id === "ai")      return "e.g. The LinkedIn post was too generic and didn't match my niche..."
    return "Share anything — we read every message and take action on it..."
  }

  const formLabel = (id: string) => {
    if (id === "bug")     return "What happened? What did you expect?"
    if (id === "feature") return "What feature would you love to see next?"
    if (id === "ux")      return "What felt confusing or frustrating?"
    if (id === "billing") return "What billing issue did you experience?"
    if (id === "ai")      return "Was the AI output quality good or bad, and why?"
    return "What's on your mind?"
  }

  return (
    <>
      {/* ── Floating button ────────────────────────────────────── */}
      <motion.button
        onClick={open}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.5, type: "spring", stiffness: 280, damping: 22 }}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full"
        style={{
          background:   "rgba(247,190,77,0.11)",
          border:       "1px solid rgba(247,190,77,0.28)",
          backdropFilter: "blur(14px)",
          boxShadow:    "0 4px 24px rgba(247,190,77,0.14), 0 0 0 1px rgba(247,190,77,0.08)",
        }}
      >
        <MessageSquare className="w-3.5 h-3.5 text-[#F7BE4D]" />
        <span className="text-xs font-bold text-[#F7BE4D]">Feedback</span>
        {/* Pulse ring */}
        <motion.span
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0, 0.35] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ border: "1px solid rgba(247,190,77,0.45)" }}
        />
      </motion.button>

      {/* ── Backdrop ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          />
        )}
      </AnimatePresence>

      {/* ── Slide-over panel ───────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0,      opacity: 1 }}
            exit={{  x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] z-50 flex flex-col"
            style={{
              background:     "rgba(5,8,22,0.97)",
              backdropFilter: "blur(24px)",
              borderLeft:     "1px solid rgba(255,255,255,0.07)",
              boxShadow:      "-24px 0 80px rgba(0,0,0,0.55)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(247,190,77,0.12)", border: "1px solid rgba(247,190,77,0.22)" }}>
                  <MessageSquare className="w-4 h-4 text-[#F7BE4D]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Help us improve</h2>
                  <p className="text-[10px] text-slate-600">Your feedback shapes PostPilotAI</p>
                </div>
              </div>
              <button
                onClick={close}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-4 py-3 border-b border-white/[0.05]">
              {(["feedback", "waitlist"] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${
                    tab === t
                      ? "text-[#F7BE4D]"
                      : "text-slate-600 hover:text-slate-300"
                  }`}
                  style={tab === t ? {
                    background: "rgba(247,190,77,0.1)",
                    border:     "1px solid rgba(247,190,77,0.22)",
                  } : {
                    border: "1px solid transparent",
                  }}
                >
                  {t === "feedback" ? "💬 Give Feedback" : "🚀 Join Waitlist"}
                </button>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">

                {/* ── FEEDBACK TAB ─────────────────────────────── */}
                {tab === "feedback" && (
                  <motion.div
                    key="feedback-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5"
                  >
                    {/* STEP: Category */}
                    {step === "category" && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                        <p className="text-xs text-slate-500 mb-4">What would you like to share?</p>
                        <div className="grid grid-cols-2 gap-2.5">
                          {CATEGORIES.map(cat => (
                            <motion.button
                              key={cat.id}
                              onClick={() => selectCategory(cat)}
                              whileHover={{ y: -2, scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              className="flex flex-col gap-2.5 p-3.5 rounded-xl text-left transition-colors"
                              style={{
                                background: `${cat.color}0a`,
                                border:     `1px solid ${cat.color}1a`,
                              }}
                              onMouseEnter={e => {
                                ;(e.currentTarget as HTMLElement).style.background    = `${cat.color}16`
                                ;(e.currentTarget as HTMLElement).style.borderColor   = `${cat.color}38`
                              }}
                              onMouseLeave={e => {
                                ;(e.currentTarget as HTMLElement).style.background  = `${cat.color}0a`
                                ;(e.currentTarget as HTMLElement).style.borderColor = `${cat.color}1a`
                              }}
                            >
                              <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                              <div>
                                <div className="text-xs font-semibold text-white leading-snug">{cat.label}</div>
                                <div className="text-[10px] text-slate-600 mt-0.5">{cat.desc}</div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* STEP: Form */}
                    {step === "form" && category && (
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                        {/* Back + category badge */}
                        <button
                          onClick={() => setStep("category")}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-4 transition-colors"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          Back
                        </button>
                        <div className="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-xl"
                          style={{ background: `${category.color}0d`, border: `1px solid ${category.color}20` }}>
                          <category.icon className="w-4 h-4" style={{ color: category.color }} />
                          <span className="text-xs font-semibold" style={{ color: category.color }}>{category.label}</span>
                        </div>

                        <div className="space-y-4">
                          {/* Main message */}
                          <div>
                            <label className="text-xs text-slate-400 font-medium mb-1.5 block">
                              {formLabel(category.id)}
                            </label>
                            <textarea
                              value={message}
                              onChange={e => setMessage(e.target.value)}
                              placeholder={placeholder(category.id)}
                              rows={5}
                              className="w-full rounded-xl px-3.5 py-3 text-sm text-slate-200 placeholder-slate-700 resize-none focus:outline-none transition-all"
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border:     "1px solid rgba(255,255,255,0.08)",
                              }}
                              onFocus={e => {
                                e.currentTarget.style.borderColor = `${category.color}45`
                                e.currentTarget.style.boxShadow  = `0 0 0 3px ${category.color}10`
                              }}
                              onBlur={e => {
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                                e.currentTarget.style.boxShadow  = "none"
                              }}
                            />
                          </div>

                          {/* Page selector (bug + ux only) */}
                          {(category.id === "bug" || category.id === "ux") && (
                            <div>
                              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Which page?</label>
                              <select
                                value={page}
                                onChange={e => setPage(e.target.value)}
                                className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none appearance-none cursor-pointer"
                                style={{
                                  background: "rgba(255,255,255,0.04)",
                                  border:     "1px solid rgba(255,255,255,0.08)",
                                }}
                              >
                                {PAGES.map(p => (
                                  <option key={p} value={p} className="bg-[#050816]">{p}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Email */}
                          <div>
                            <label className="text-xs text-slate-400 font-medium mb-1.5 block">
                              Email <span className="text-slate-600">(optional — so we can follow up)</span>
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none transition-all"
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border:     "1px solid rgba(255,255,255,0.08)",
                              }}
                              onFocus={e => {
                                e.currentTarget.style.borderColor = "rgba(247,190,77,0.38)"
                                e.currentTarget.style.boxShadow  = "0 0 0 3px rgba(247,190,77,0.07)"
                              }}
                              onBlur={e => {
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                                e.currentTarget.style.boxShadow  = "none"
                              }}
                            />
                          </div>

                          {/* Submit */}
                          <motion.button
                            onClick={handleSubmit}
                            disabled={!message.trim() || submitting}
                            whileHover={message.trim() && !submitting ? { scale: 1.02 } : {}}
                            whileTap={message.trim()  && !submitting ? { scale: 0.98 } : {}}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:cursor-not-allowed"
                            style={{
                              background: message.trim()
                                ? `linear-gradient(135deg, ${category.color} 0%, ${category.color}bb 100%)`
                                : "rgba(255,255,255,0.04)",
                              color: message.trim() ? "#050816" : "rgba(255,255,255,0.18)",
                              boxShadow: message.trim() ? `0 4px 22px ${category.color}40` : "none",
                              opacity: submitting ? 0.7 : 1,
                            }}
                          >
                            {submitting ? (
                              <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                Send Feedback
                              </>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP: Success */}
                    {step === "success" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 320, damping: 24 }}
                        className="flex flex-col items-center justify-center py-14 text-center"
                      >
                        <div className="relative w-16 h-16 mx-auto mb-6">
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ background: "rgba(52,211,153,0.09)" }}
                            animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
                            transition={{ duration: 2.2, repeat: Infinity }}
                          />
                          <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.08 }}
                            className="absolute inset-0 rounded-full flex items-center justify-center"
                            style={{
                              background: "linear-gradient(135deg, #34d399, #10b981)",
                              boxShadow:  "0 0 32px rgba(52,211,153,0.45)",
                            }}
                          >
                            <Check className="w-8 h-8 text-[#050816]" strokeWidth={3} />
                          </motion.div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                          <h3 className="text-base font-bold text-white mb-2">
                            Thanks for helping improve PostPilotAI 🚀
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-[260px] mx-auto">
                            We read every message and act on it. Your input directly shapes what we build next.
                          </p>
                          {email && (
                            <p className="text-xs mt-3" style={{ color: "rgba(247,190,77,0.6)" }}>
                              We&apos;ll follow up at {email}
                            </p>
                          )}
                          <button
                            onClick={() => {
                              setStep("category")
                              setCategory(null)
                              setMessage("")
                              setEmail("")
                            }}
                            className="mt-6 text-xs text-slate-600 hover:text-slate-400 transition-colors underline underline-offset-2"
                          >
                            Send another message
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* ── WAITLIST TAB ─────────────────────────────── */}
                {tab === "waitlist" && (
                  <motion.div
                    key="waitlist-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5"
                  >
                    {!waitlistSuccess ? (
                      <>
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                          Vote for features you want most — be first to get access when they ship.
                        </p>

                        <div className="space-y-2 mb-5">
                          {WAITLIST_FEATURES.map(feat => (
                            <motion.button
                              key={feat.id}
                              onClick={() => setSelectedFeature(feat.id)}
                              whileHover={{ x: 2 }}
                              className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all"
                              style={{
                                background: selectedFeature === feat.id ? `${feat.color}12` : "rgba(255,255,255,0.025)",
                                border:     selectedFeature === feat.id ? `1px solid ${feat.color}38` : "1px solid rgba(255,255,255,0.06)",
                                boxShadow:  selectedFeature === feat.id ? `0 0 18px ${feat.color}18` : "none",
                              }}
                            >
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: `${feat.color}12`, border: `1px solid ${feat.color}22` }}
                              >
                                <feat.icon className="w-4 h-4" style={{ color: feat.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-white">{feat.label}</span>
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                    style={{ background: `${feat.color}12`, color: feat.color }}>
                                    {feat.eta}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">{feat.desc}</p>
                              </div>
                              <AnimatePresence>
                                {selectedFeature === feat.id && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: feat.color }}
                                  >
                                    <Check className="w-3 h-3 text-[#050816]" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                          ))}
                        </div>

                        <AnimatePresence>
                          {selectedFeature && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              className="space-y-3"
                            >
                              <input
                                type="email"
                                value={waitlistEmail}
                                onChange={e => setWaitlistEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none transition-all"
                                style={{
                                  background: "rgba(255,255,255,0.04)",
                                  border:     "1px solid rgba(255,255,255,0.08)",
                                }}
                                onFocus={e => {
                                  e.currentTarget.style.borderColor = "rgba(247,190,77,0.38)"
                                  e.currentTarget.style.boxShadow  = "0 0 0 3px rgba(247,190,77,0.07)"
                                }}
                                onBlur={e => {
                                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                                  e.currentTarget.style.boxShadow  = "none"
                                }}
                              />
                              <motion.button
                                onClick={handleWaitlist}
                                disabled={!waitlistEmail.trim() || waitlistSubmitting}
                                whileHover={waitlistEmail.trim() && !waitlistSubmitting ? { scale: 1.02 } : {}}
                                whileTap={waitlistEmail.trim()  && !waitlistSubmitting ? { scale: 0.98 } : {}}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-[#050816] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                  background: "linear-gradient(135deg, #F7BE4D, #ffd166)",
                                  boxShadow:  "0 4px 22px rgba(247,190,77,0.30)",
                                }}
                              >
                                {waitlistSubmitting ? (
                                  <span className="w-4 h-4 border-2 border-[#050816]/30 border-t-[#050816] rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <Clock className="w-3.5 h-3.5" />
                                    Join Waitlist
                                  </>
                                )}
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      /* Waitlist success */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 320, damping: 24 }}
                        className="flex flex-col items-center justify-center py-14 text-center"
                      >
                        <div className="relative w-16 h-16 mx-auto mb-6">
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ background: "rgba(247,190,77,0.1)" }}
                            animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
                            transition={{ duration: 2.2, repeat: Infinity }}
                          />
                          <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.08 }}
                            className="absolute inset-0 rounded-full flex items-center justify-center"
                            style={{
                              background: "linear-gradient(135deg, #F7BE4D, #ffd166)",
                              boxShadow:  "0 0 32px rgba(247,190,77,0.45)",
                            }}
                          >
                            <Check className="w-8 h-8 text-[#050816]" strokeWidth={3} />
                          </motion.div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                          <h3 className="text-base font-bold text-white mb-2">You&apos;re on the list! 🎉</h3>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-[240px] mx-auto">
                            We&apos;ll notify you the moment{" "}
                            <span className="text-white font-semibold">
                              {WAITLIST_FEATURES.find(f => f.id === selectedFeature)?.label}
                            </span>{" "}
                            is ready.
                          </p>
                          <button
                            onClick={() => {
                              setWaitlistSuccess(false)
                              setSelectedFeature("")
                              setWaitlistEmail("")
                            }}
                            className="mt-6 text-xs text-slate-600 hover:text-slate-400 transition-colors underline underline-offset-2"
                          >
                            Join another waitlist
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/[0.04] text-center">
              <p className="text-[10px] text-slate-700">
                We read every message · Built for creators · PostPilotAI Team
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
