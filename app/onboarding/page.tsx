"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabase"

/* ─── Data ─────────────────────────────────────────────────────── */

const PLATFORMS = [
  { id: "instagram", label: "Instagram",   emoji: "📸", color: "#E1306C" },
  { id: "linkedin",  label: "LinkedIn",    emoji: "💼", color: "#0077B5" },
  { id: "twitter",   label: "Twitter / X", emoji: "🐦", color: "#1DA1F2" },
  { id: "youtube",   label: "YouTube",     emoji: "▶️", color: "#FF0000" },
  { id: "facebook",  label: "Facebook",    emoji: "👥", color: "#1877F2" },
  { id: "threads",   label: "Threads",     emoji: "🔗", color: "#aaa" },
]

const NICHES = [
  { id: "business",  label: "Business / Finance", emoji: "💼" },
  { id: "fitness",   label: "Fitness / Health",   emoji: "💪" },
  { id: "personal",  label: "Personal Brand",     emoji: "🌟" },
  { id: "travel",    label: "Travel",             emoji: "✈️" },
  { id: "food",      label: "Food & Recipes",     emoji: "🍜" },
  { id: "tech",      label: "Tech / SaaS",        emoji: "⚡" },
  { id: "fashion",   label: "Fashion / Beauty",   emoji: "👗" },
  { id: "education", label: "Education",          emoji: "📚" },
]

const TONES = [
  { id: "professional",  label: "Professional",  desc: "Polished and authoritative",       emoji: "🎯" },
  { id: "casual",        label: "Casual & Fun",  desc: "Friendly and relatable",           emoji: "😊" },
  { id: "motivational",  label: "Motivational",  desc: "Inspiring and high-energy",        emoji: "🔥" },
  { id: "educational",   label: "Educational",   desc: "Clear, concise and informative",   emoji: "🎓" },
  { id: "witty",         label: "Witty",         desc: "Clever, punchy and entertaining",  emoji: "😄" },
  { id: "inspirational", label: "Inspirational", desc: "Uplifting and thought-provoking",  emoji: "✨" },
]

const GOALS = [
  { id: "grow",      label: "Grow followers", desc: "Build a larger engaged audience",  emoji: "📈" },
  { id: "sales",     label: "Drive sales",    desc: "Convert audience into buyers",     emoji: "💰" },
  { id: "brand",     label: "Build brand",    desc: "Establish thought leadership",     emoji: "🏆" },
  { id: "knowledge", label: "Share knowledge",desc: "Educate and inspire your niche",  emoji: "💡" },
]

const STEP_META = [
  {
    title: "Which platforms do you post on?",
    subtitle: "Select all your active platforms — we'll generate content optimized for each.",
    tag: "Setting up your platform mix",
  },
  {
    title: "What's your content niche?",
    subtitle: "We'll personalize your AI content suggestions, templates, and growth strategies.",
    tag: "Personalizing your AI workspace",
  },
  {
    title: "What's your preferred tone?",
    subtitle: "Your AI will write in this voice consistently across every platform.",
    tag: "Calibrating your AI voice",
  },
  {
    title: "What's your primary goal?",
    subtitle: "Every post will be engineered to drive this specific outcome for you.",
    tag: "Defining your growth strategy",
  },
]

const LOADING_MESSAGES = [
  { text: "Analyzing your niche...",               icon: "🧠" },
  { text: "Preparing your AI templates...",        icon: "✨" },
  { text: "Optimizing your content workflow...",   icon: "⚡" },
  { text: "Building your AI workspace...",         icon: "🚀" },
]

/* ─── Motion variants ──────────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.94 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 380, damping: 26 },
  },
}

/* ─── Background ───────────────────────────────────────────────── */

interface Particle { id: number; x: number; y: number; size: number; dur: number; del: number }

function Background() {
  const [particles, setParticles] = useState<Particle[]>([])
  useEffect(() => {
    setParticles(Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: (i * 37.3 + 11) % 100,
      y: (i * 53.7 + 7)  % 100,
      size: (i % 3) + 1.2,
      dur:  10 + (i % 7) * 2,
      del:  (i % 5) * 1.2,
    })))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Ambient orbs */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.25, 0.18] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, #F7BE4D 0%, transparent 65%)", filter: "blur(80px)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-40 -right-24 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 65%)", filter: "blur(80px)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.06, 0.1, 0.06] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full"
        style={{ background: "radial-gradient(circle, #14b8a6 0%, transparent 65%)", filter: "blur(60px)" }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#F7BE4D]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -24, 0], opacity: [0.04, 0.18, 0.04] }}
          transition={{ duration: p.dur, delay: p.del, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

/* ─── Smart progress bar ───────────────────────────────────────── */

function SmartProgressBar({ step }: { step: number }) {
  const pct = ((step - 1) / 4) * 100

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#F7BE4D" }}>
          Step {step} of 4
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={step}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[11px] text-slate-600"
          >
            {STEP_META[step - 1].tag}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="relative h-[3px] rounded-full overflow-visible"
        style={{ background: "rgba(255,255,255,0.07)" }}>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            background: "linear-gradient(90deg, #F7BE4D, #ffd166)",
            boxShadow: "0 0 10px rgba(247,190,77,0.9), 0 0 24px rgba(247,190,77,0.4)",
          }}
        />
        {/* Glow pulse at leading edge */}
        {pct > 0 && pct < 100 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#F7BE4D]"
            style={{ left: `${pct}%`, transform: `translateX(-50%) translateY(-50%)` }}
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
    </div>
  )
}

/* ─── Reusable selection card ──────────────────────────────────── */

interface CardProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  accentColor?: string
  className?: string
}

function SelectionCard({ active, onClick, children, accentColor = "#F7BE4D", className = "" }: CardProps) {
  return (
    <motion.button
      variants={cardVariants}
      whileHover={{
        scale: 1.025,
        y: -2,
        transition: { type: "spring", stiffness: 500, damping: 30 },
      }}
      whileTap={{ scale: 0.975 }}
      onClick={onClick}
      className={`relative text-left transition-colors overflow-hidden ${className}`}
      style={{
        background: active
          ? `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 100%)`
          : "rgba(255,255,255,0.025)",
        border: active ? `1px solid ${accentColor}55` : "1px solid rgba(255,255,255,0.07)",
        boxShadow: active
          ? `0 0 24px ${accentColor}20, 0 0 0 1px ${accentColor}30, inset 0 0 24px ${accentColor}06`
          : "0 1px 3px rgba(0,0,0,0.2)",
        borderRadius: "14px",
      }}
    >
      {/* Shimmer on active */}
      {active && (
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(105deg, transparent 30%, ${accentColor}30 50%, transparent 70%)`,
          }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
        />
      )}
      {children}
    </motion.button>
  )
}

/* ─── Animated checkmark ───────────────────────────────────────── */

function AnimatedCheck({ color = "#F7BE4D" }: { color?: string }) {
  return (
    <AnimatePresence>
      <motion.div
        key="check"
        initial={{ scale: 0, rotate: -15, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 600, damping: 22 }}
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}25`, border: `1px solid ${color}50` }}
      >
        <Check className="w-3 h-3" style={{ color }} />
      </motion.div>
    </AnimatePresence>
  )
}

/* ─── Loading screen ───────────────────────────────────────────── */

function LoadingScreen() {
  const [msgIdx, setMsgIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length)
    }, 2000)

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1.2, 100))
    }, 100)

    return () => {
      clearInterval(msgInterval)
      clearInterval(progressInterval)
    }
  }, [])

  const msg = LOADING_MESSAGES[msgIdx]

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm text-center"
    >
      {/* Glow ring */}
      <div className="relative w-24 h-24 mx-auto mb-8">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "rgba(247,190,77,0.12)", border: "1px solid rgba(247,190,77,0.2)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-3 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #F7BE4D20, #F7BE4D08)", border: "1px solid rgba(247,190,77,0.3)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-2 h-2 rounded-full bg-[#F7BE4D] absolute top-2" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={msgIdx}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-3xl"
            >
              {msg.icon}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={msgIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="text-xl font-bold text-white mb-2">{msg.text}</h2>
        </motion.div>
      </AnimatePresence>
      <p className="text-sm text-slate-500 mb-8">Setting up your personalized AI workspace…</p>

      {/* Progress bar */}
      <div className="h-1 rounded-full overflow-hidden mx-auto max-w-xs"
        style={{ background: "rgba(255,255,255,0.07)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #F7BE4D, #ffd166)",
            boxShadow: "0 0 10px rgba(247,190,77,0.7)",
          }}
        />
      </div>

      {/* Shimmer dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {LOADING_MESSAGES.map((_, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{
              width: i === msgIdx ? 20 : 6,
              height: 6,
              background: i === msgIdx ? "#F7BE4D" : "rgba(255,255,255,0.12)",
              boxShadow: i === msgIdx ? "0 0 8px rgba(247,190,77,0.6)" : "none",
            }}
            animate={{ opacity: i === msgIdx ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

/* ─── Done screen ──────────────────────────────────────────────── */

function DoneScreen() {
  return (
    <motion.div
      key="done"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="w-full max-w-sm text-center"
    >
      <div className="relative w-24 h-24 mx-auto mb-7">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "rgba(247,190,77,0.1)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
          className="absolute inset-0 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #F7BE4D, #ffd166)",
            boxShadow: "0 0 40px rgba(247,190,77,0.5), 0 0 80px rgba(247,190,77,0.2)",
          }}
        >
          <Check className="w-10 h-10 text-[#050816]" strokeWidth={3} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-black text-white mb-2">Welcome to PostPilotAI 🚀</h2>
        <p className="text-slate-400 text-sm mb-6">Your AI workspace is ready. Redirecting you now…</p>

        <div className="flex items-center justify-center gap-1.5">
          {[0, 0.15, 0.3].map((delay, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#F7BE4D]"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
              transition={{ duration: 0.8, delay, repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Main page ────────────────────────────────────────────────── */

type Phase = "wizard" | "loading" | "done"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep]           = useState(1)
  const [phase, setPhase]         = useState<Phase>("wizard")
  const [platforms, setPlatforms] = useState<string[]>([])
  const [niche, setNiche]         = useState("")
  const [tone, setTone]           = useState("")
  const [goal, setGoal]           = useState("")
  const supabaseDone = useRef(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/login")
    })
  }, [router])

  const togglePlatform = (id: string) =>
    setPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])

  const canAdvance =
    (step === 1 && platforms.length > 0) ||
    (step === 2 && niche !== "") ||
    (step === 3 && tone !== "") ||
    (step === 4 && goal !== "")

  const handleFinish = async () => {
    setPhase("loading")
    supabaseDone.current = false

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("users").upsert({ id: user.id, email: user.email, platforms, niche, tone, goal })
      localStorage.setItem(`postpilot_onboarded_${user.id}`, "true")
      // Store prefs in localStorage for instant dashboard personalization
      localStorage.setItem(`postpilot_prefs_${user.id}`, JSON.stringify({ platforms, niche, tone, goal }))
    }
    supabaseDone.current = true
  }

  // Transition loading → done after minimum 8 seconds
  useEffect(() => {
    if (phase !== "loading") return
    const timer = setTimeout(() => setPhase("done"), 8200)
    return () => clearTimeout(timer)
  }, [phase])

  // Redirect after done screen shows
  useEffect(() => {
    if (phase !== "done") return
    const timer = setTimeout(() => router.replace("/dashboard"), 2800)
    return () => clearTimeout(timer)
  }, [phase, router])

  const isWizard  = phase === "wizard"
  const isLoading = phase === "loading"
  const isDone    = phase === "done"

  return (
    <>
      <Background />

      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo — always visible */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 mb-8"
        >
          <div
            className="w-8 h-8 rounded-xl bg-[#F7BE4D] flex items-center justify-center"
            style={{ boxShadow: "0 0 20px rgba(247,190,77,0.45)" }}
          >
            <Zap className="w-4 h-4 text-[#050816]" fill="currentColor" strokeWidth={0} />
          </div>
          <span className="font-bold text-white">
            PostPilot<span className="text-[#F7BE4D]">AI</span>
          </span>
        </motion.div>

        {/* Phase switcher */}
        <AnimatePresence mode="wait">
          {isWizard && (
            <motion.div
              key="wizard"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-[520px]"
            >
              <div
                className="rounded-2xl p-7"
                style={{
                  background: "rgba(8,12,26,0.75)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
                }}
              >
                <SmartProgressBar step={step} />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    {/* Step heading */}
                    <div className="mb-6">
                      <h2 className="text-xl font-black text-white mb-1.5">{STEP_META[step - 1].title}</h2>
                      <p className="text-sm text-slate-500 leading-relaxed">{STEP_META[step - 1].subtitle}</p>
                    </div>

                    {/* Step 1 — Platforms */}
                    {step === 1 && (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-2 gap-2.5"
                      >
                        {PLATFORMS.map(({ id, label, emoji, color }) => {
                          const active = platforms.includes(id)
                          return (
                            <SelectionCard
                              key={id}
                              active={active}
                              onClick={() => togglePlatform(id)}
                              accentColor={color}
                              className="flex items-center gap-3 px-4 py-3"
                            >
                              <motion.span
                                className="text-xl flex-shrink-0"
                                animate={{ scale: active ? 1.15 : 1 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                {emoji}
                              </motion.span>
                              <span className={`text-sm font-medium flex-1 ${active ? "text-white" : "text-slate-500"}`}>
                                {label}
                              </span>
                              <AnimatePresence>
                                {active && <AnimatedCheck color={color} />}
                              </AnimatePresence>
                            </SelectionCard>
                          )
                        })}
                      </motion.div>
                    )}

                    {/* Step 2 — Niche */}
                    {step === 2 && (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-2 gap-2.5"
                      >
                        {NICHES.map(({ id, label, emoji }) => {
                          const active = niche === id
                          return (
                            <SelectionCard
                              key={id}
                              active={active}
                              onClick={() => setNiche(id)}
                              className="flex items-center gap-3 px-4 py-3"
                            >
                              <motion.span
                                className="text-xl flex-shrink-0"
                                animate={{ scale: active ? 1.15 : 1 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                {emoji}
                              </motion.span>
                              <span className={`text-sm font-medium flex-1 ${active ? "text-white" : "text-slate-500"}`}>
                                {label}
                              </span>
                              <AnimatePresence>
                                {active && <AnimatedCheck />}
                              </AnimatePresence>
                            </SelectionCard>
                          )
                        })}
                      </motion.div>
                    )}

                    {/* Step 3 — Tone */}
                    {step === 3 && (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 gap-2"
                      >
                        {TONES.map(({ id, label, desc, emoji }) => {
                          const active = tone === id
                          return (
                            <SelectionCard
                              key={id}
                              active={active}
                              onClick={() => setTone(id)}
                              className="flex items-center gap-4 px-4 py-3"
                            >
                              <motion.span
                                className="text-2xl flex-shrink-0"
                                animate={{ scale: active ? 1.2 : 1, rotate: active ? [0, -5, 5, 0] : 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                              >
                                {emoji}
                              </motion.span>
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-semibold ${active ? "text-white" : "text-slate-400"}`}>
                                  {label}
                                </div>
                                <div className="text-xs text-slate-600 mt-0.5">{desc}</div>
                              </div>
                              <AnimatePresence>
                                {active && <AnimatedCheck />}
                              </AnimatePresence>
                            </SelectionCard>
                          )
                        })}
                      </motion.div>
                    )}

                    {/* Step 4 — Goal */}
                    {step === 4 && (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-2 gap-3"
                      >
                        {GOALS.map(({ id, label, desc, emoji }) => {
                          const active = goal === id
                          return (
                            <SelectionCard
                              key={id}
                              active={active}
                              onClick={() => setGoal(id)}
                              className="flex flex-col gap-2.5 px-4 py-4"
                            >
                              <motion.span
                                className="text-2xl"
                                animate={{ scale: active ? 1.2 : 1 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                {emoji}
                              </motion.span>
                              <div className="flex-1">
                                <div className={`text-sm font-semibold ${active ? "text-white" : "text-slate-400"}`}>
                                  {label}
                                </div>
                                <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">{desc}</div>
                              </div>
                              <AnimatePresence>
                                {active && <AnimatedCheck />}
                              </AnimatePresence>
                            </SelectionCard>
                          )
                        })}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center gap-3 mt-7">
                  <AnimatePresence>
                    {step > 1 && (
                      <motion.button
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        onClick={() => setStep(s => s - 1)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-all"
                        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={canAdvance ? { scale: 1.02 } : {}}
                    whileTap={canAdvance ? { scale: 0.98 } : {}}
                    onClick={step < 4 ? () => setStep(s => s + 1) : handleFinish}
                    disabled={!canAdvance}
                    className="flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-sm transition-all"
                    style={{
                      background: canAdvance
                        ? "linear-gradient(135deg, #F7BE4D 0%, #ffd166 100%)"
                        : "rgba(255,255,255,0.05)",
                      color: canAdvance ? "#050816" : "rgba(255,255,255,0.2)",
                      boxShadow: canAdvance ? "0 4px 24px rgba(247,190,77,0.3), 0 1px 0 rgba(255,255,255,0.2) inset" : "none",
                      cursor: canAdvance ? "pointer" : "not-allowed",
                    }}
                    animate={canAdvance ? { boxShadow: ["0 4px 24px rgba(247,190,77,0.3)", "0 4px 32px rgba(247,190,77,0.5)", "0 4px 24px rgba(247,190,77,0.3)"] } : {}}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    {step < 4 ? (
                      <>Continue <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Build my workspace</>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Skip + hint */}
              <div className="flex items-center justify-between mt-4 px-1">
                <p className="text-[11px] text-slate-700">You can change these anytime in Settings</p>
                <button
                  onClick={async () => {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (user) localStorage.setItem(`postpilot_onboarded_${user.id}`, "true")
                    router.replace("/dashboard")
                  }}
                  className="text-[11px] text-slate-700 hover:text-slate-400 transition-colors underline underline-offset-2"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              key="loading-phase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <LoadingScreen />
            </motion.div>
          )}

          {isDone && (
            <motion.div
              key="done-phase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DoneScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
