"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wand2, Sparkles, Copy, CheckCheck, RefreshCw,
  LinkIcon, Package, Hash, CalendarClock, Zap, Layers,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

// ── Types ────────────────────────────────────────────────────────
interface FullResult {
  instagram: string
  linkedin: string
  twitter: string
  hashtags: string[]
  carousel: string[]
}

// ── Constants ────────────────────────────────────────────────────
const toneOptions = [
  { value: "engaging",      label: "Engaging",      emoji: "🔥" },
  { value: "professional",  label: "Professional",  emoji: "💼" },
  { value: "witty",         label: "Witty",         emoji: "😄" },
  { value: "inspirational", label: "Inspirational", emoji: "✨" },
  { value: "educational",   label: "Educational",   emoji: "🎓" },
]

const resultTabs = [
  { key: "instagram" as const, label: "Instagram",     icon: "📸", color: "#E1306C", charLimit: 2200 },
  { key: "linkedin"  as const, label: "LinkedIn",      icon: "💼", color: "#0077B5", charLimit: 3000 },
  { key: "twitter"   as const, label: "Twitter / X",   icon: "𝕏",  color: "#94a3b8", charLimit: 280  },
  { key: "hashtags"  as const, label: "Hashtags",      icon: "#️⃣", color: "#F7BE4D", charLimit: null },
  { key: "carousel"  as const, label: "Carousel",      icon: "🎨", color: "#818cf8", charLimit: null },
]

const loadingMessages = [
  "Analyzing your topic...",
  "Generating viral hooks...",
  "Crafting platform-ready posts...",
  "Optimizing for engagement...",
  "Adding finishing touches...",
]

const refinements = [
  { label: "🔥 More Viral",      action: "more viral and attention-grabbing" },
  { label: "✂️ Shorter",         action: "shorter and punchier" },
  { label: "💼 Professional",    action: "more professional and authoritative" },
  { label: "❤️ More Emotional",  action: "more emotional and personal" },
  { label: "🪝 Add Hooks",       action: "with a stronger hook at the start" },
]

const emptyFeatures = [
  { icon: "💼", label: "LinkedIn Posts",       color: "#0077B5" },
  { icon: "📸", label: "Instagram Captions",   color: "#E1306C" },
  { icon: "𝕏",  label: "Twitter Threads",      color: "#94a3b8" },
  { icon: "🎨", label: "Carousel Ideas",        color: "#818cf8" },
]

// ── CopyBtn ──────────────────────────────────────────────────────
function CopyBtn({ text, variant = "ghost" }: { text: string; variant?: "ghost" | "solid" }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  if (variant === "solid") {
    return (
      <button onClick={handle}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
          copied
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
            : "bg-white/8 text-slate-300 hover:bg-white/12 border border-white/10"
        }`}>
        {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied!" : "Copy"}
      </button>
    )
  }
  return (
    <button onClick={handle}
      className={`p-1.5 rounded-lg transition-all ${
        copied ? "text-emerald-400 bg-emerald-500/10" : "text-slate-600 hover:text-slate-300 hover:bg-white/8"
      }`}>
      {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

// ── LoadingState ─────────────────────────────────────────────────
function LoadingState({ phase }: { phase: number }) {
  const pct = Math.min(((phase + 1) / loadingMessages.length) * 100, 92)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Status header */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-[#F7BE4D]/20 animate-ping" style={{ animationDuration: "1.4s" }} />
            <div className="w-9 h-9 rounded-full bg-[#F7BE4D]/15 border border-[#F7BE4D]/30 flex items-center justify-center relative z-10">
              <Sparkles className="w-4 h-4 text-[#F7BE4D] animate-pulse" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.p key={phase}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28 }}
                className="text-sm font-semibold text-white mb-1.5">
                {loadingMessages[phase % loadingMessages.length]}
              </motion.p>
            </AnimatePresence>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #F7BE4D, #ffd166)" }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
              <span className="text-[10px] text-slate-600 tabular-nums w-8 text-right">{pct.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton platform cards */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { color: "#E1306C", label: "Instagram" },
          { color: "#0077B5", label: "LinkedIn" },
          { color: "#94a3b8", label: "Twitter / X" },
        ].map(({ color, label }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl p-4 border"
            style={{ borderColor: `${color}20`, background: `${color}06` }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
              <div className="skeleton w-20 h-3.5 rounded" />
            </div>
            <div className="space-y-2.5">
              <div className="skeleton h-2.5 rounded w-full" />
              <div className="skeleton h-2.5 rounded w-[83%]" />
              <div className="skeleton h-2.5 rounded w-full" />
              <div className="skeleton h-2.5 rounded w-[67%]" />
              <div className="skeleton h-2.5 rounded w-[90%]" />
            </div>
            <div className="flex gap-2 mt-4">
              <div className="skeleton h-7 w-14 rounded-lg" />
              <div className="skeleton h-7 w-20 rounded-lg" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ── PostCard (Instagram / LinkedIn / Twitter) ────────────────────
function PostCard({
  text, color, charLimit, onSchedule,
}: { text: string; color: string; charLimit: number; onSchedule: () => void }) {
  const pct = Math.min((text.length / charLimit) * 100, 100)
  const over = text.length > charLimit

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 tabular-nums">
            {text.length.toLocaleString()} / {charLimit.toLocaleString()} chars
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            over          ? "bg-red-500/15 text-red-400"
            : pct > 85   ? "bg-amber-500/15 text-amber-400"
                         : "bg-emerald-500/15 text-emerald-400"
          }`}>
            {over ? "Over limit" : pct > 85 ? "Near limit" : "✓ Within limit"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CopyBtn text={text} variant="solid" />
          <button onClick={onSchedule}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-white/5 text-slate-400 hover:text-white border border-white/8 hover:border-white/18 transition-all">
            <CalendarClock className="w-3.5 h-3.5" />
            Schedule
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: over ? "#f87171" : pct > 85 ? "#fbbf24" : color,
          }} />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="p-4 rounded-xl text-sm text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[140px]"
        style={{ background: `${color}07`, border: `1px solid ${color}18` }}>
        {text}
      </motion.div>
    </div>
  )
}

// ── HashtagsTab ──────────────────────────────────────────────────
function HashtagsTab({ hashtags }: { hashtags: string[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{hashtags.length} hashtags · click any to copy</p>
        <CopyBtn text={hashtags.map(h => `#${h}`).join(" ")} variant="solid" />
      </div>
      <div className="flex flex-wrap gap-2">
        {hashtags.map((tag, i) => (
          <motion.span key={tag}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigator.clipboard.writeText(`#${tag}`)}
            className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:scale-105 active:scale-95 select-none"
            style={{
              background: "rgba(247,190,77,0.08)",
              border: "1px solid rgba(247,190,77,0.18)",
              color: "#F7BE4D",
            }}>
            #{tag}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

// ── CarouselTab ──────────────────────────────────────────────────
function CarouselTab({ slides }: { slides: string[] }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">{slides.length} slides · use these as your carousel frame scripts</p>
      {slides.map((slide, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }}
          className="flex items-start gap-3 p-4 rounded-xl border border-[#818cf8]/15"
          style={{ background: "rgba(129,140,248,0.05)" }}>
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
            style={{ background: "rgba(129,140,248,0.15)", color: "#818cf8" }}>
            {i + 1}
          </span>
          <p className="text-sm text-slate-300 leading-relaxed flex-1">{slide}</p>
          <div className="flex-shrink-0">
            <CopyBtn text={slide} />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ── RefinementBar ────────────────────────────────────────────────
function RefinementBar({ onRefine, disabled }: { onRefine: (action: string) => void; disabled: boolean }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[11px] text-slate-600 font-medium shrink-0">AI refine:</span>
      {refinements.map(r => (
        <button key={r.action} onClick={() => onRefine(r.action)} disabled={disabled}
          className="text-[11px] px-2.5 py-1.5 rounded-lg border border-white/8 text-slate-400 hover:text-white hover:border-white/16 hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          {r.label}
        </button>
      ))}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────
export default function GeneratePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [topic,   setTopic]   = useState("")
  const [product, setProduct] = useState("")
  const [blogUrl, setBlogUrl] = useState("")
  const [tone,    setTone]    = useState("engaging")
  const [loading, setLoading] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState(0)
  const [result,  setResult]  = useState<FullResult | null>(null)
  const [error,   setError]   = useState("")
  const [activeTab, setActiveTab] = useState<keyof Omit<FullResult, "hashtags" | "carousel"> | "hashtags" | "carousel">("instagram")
  const phaseRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const t = searchParams.get("topic")
    const tn = searchParams.get("tone")
    if (t)  setTopic(decodeURIComponent(t))
    if (tn) setTone(tn)
  }, [searchParams])

  // Rotate loading messages every 2s
  useEffect(() => {
    if (loading) {
      setLoadingPhase(0)
      phaseRef.current = setInterval(() => setLoadingPhase(p => p + 1), 2000)
    } else {
      if (phaseRef.current) clearInterval(phaseRef.current)
    }
    return () => { if (phaseRef.current) clearInterval(phaseRef.current) }
  }, [loading])

  const generate = async (topicOverride?: string) => {
    const effectiveTopic = topicOverride ?? topic
    if (!effectiveTopic.trim() && !blogUrl.trim()) {
      setError("Please enter a topic or blog URL")
      return
    }
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: effectiveTopic, product, blogUrl, tone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setResult(data.data)
      setActiveTab("instagram")

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("generations").insert({
          user_id: user.id,
          prompt: [effectiveTopic, product, blogUrl].filter(Boolean).join(" | "),
          platform: "all",
          output: JSON.stringify(data.data),
        })
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleRefine = (action: string) => {
    if (!result) return
    const current = activeTab !== "hashtags" && activeTab !== "carousel"
      ? result[activeTab as "instagram" | "linkedin" | "twitter"]
      : ""
    generate(`${topic} [REWRITE THIS ${activeTab.toUpperCase()} POST to be ${action}: "${current.slice(0, 120)}..."]`)
  }

  const activeTabConfig = resultTabs.find(t => t.key === activeTab)!

  return (
    <div className="max-w-5xl space-y-5 relative">

      {/* Background ambient glows */}
      <div className="fixed top-0 left-60 right-0 h-screen pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px]"
          style={{ background: "radial-gradient(ellipse at top, rgba(247,190,77,0.07) 0%, transparent 55%)" }} />
        <div className="absolute top-1/3 right-[10%] w-72 h-72 rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 left-[20%] w-56 h-56 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, rgba(225,48,108,0.12) 0%, transparent 70%)" }} />
      </div>

      {/* ── Input panel ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-hero rounded-2xl p-6 relative overflow-hidden"
      >
        {/* Decorative orbs */}
        <div className="absolute -top-14 -right-14 w-52 h-52 bg-[#F7BE4D]/[0.06] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/[0.05] rounded-full blur-3xl pointer-events-none" />
        <div className="grid-bg absolute inset-0 opacity-25 pointer-events-none rounded-2xl" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F7BE4D]/15 border border-[#F7BE4D]/25 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-[#F7BE4D]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">AI Content Generator</h2>
                <p className="text-[11px] text-slate-500">Generate platform-ready posts from any idea or URL</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 glass-sm rounded-xl px-3 py-1.5 border border-emerald-500/15">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-[11px] text-emerald-400 font-semibold">GPT-4o mini</span>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5 block">
                <Sparkles className="w-3 h-3 text-[#F7BE4D]" />
                Topic or Idea
                <span className="text-[#F7BE4D]">*</span>
              </label>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate() }}
                placeholder="e.g. 'How AI is reshaping content marketing in 2025' or 'Launching our new productivity app'"
                rows={3}
                className="input-premium w-full px-4 py-3 text-sm resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5 block">
                <Package className="w-3 h-3" />
                Product / Brand
                <span className="text-[10px] text-slate-600 ml-1">optional</span>
              </label>
              <input value={product} onChange={e => setProduct(e.target.value)}
                placeholder="e.g. Acme SaaS, Nike Air Max..."
                className="input-premium w-full px-4 py-2.5 text-sm" />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5 block">
                <LinkIcon className="w-3 h-3" />
                Blog URL
                <span className="text-[10px] text-slate-600 ml-1">optional</span>
              </label>
              <input value={blogUrl} onChange={e => setBlogUrl(e.target.value)}
                placeholder="https://yourblog.com/post..."
                type="url"
                className="input-premium w-full px-4 py-2.5 text-sm" />
            </div>
          </div>

          {/* Tone selector */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs text-slate-500 font-medium shrink-0">Tone:</span>
            <div className="flex flex-wrap gap-2">
              {toneOptions.map(t => (
                <button key={t.value} onClick={() => setTone(t.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    tone === t.value
                      ? "bg-[#F7BE4D]/15 border-[#F7BE4D]/40 text-[#F7BE4D] font-semibold"
                      : "border-white/8 text-slate-500 hover:border-white/16 hover:text-white"
                  }`}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              {error}
            </p>
          )}

          {/* Generate button */}
          <button onClick={() => generate()} disabled={loading}
            className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2.5 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span key="loading" className="flex items-center gap-2.5"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </motion.span>
              ) : (
                <motion.span key="idle" className="flex items-center gap-2.5"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <Sparkles className="w-4 h-4" />
                  Generate Content
                  <span className="text-[10px] opacity-50 hidden sm:block">⌘ Enter</span>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      {/* ── AI Loading State ─────────────────────────────────────── */}
      <AnimatePresence>
        {loading && <LoadingState phase={loadingPhase} />}
      </AnimatePresence>

      {/* ── Results workspace ────────────────────────────────────── */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                <span className="text-sm font-semibold text-white">Content ready</span>
                <span className="text-[11px] text-slate-600">
                  5 platforms · {result.hashtags.length} hashtags · {result.carousel.length} slides
                </span>
              </div>
              <button onClick={() => generate()}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/8 border border-white/8 transition-all">
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            </div>

            {/* Platform tabs */}
            <div className="flex overflow-x-auto border-b border-white/[0.06]" style={{ scrollbarWidth: "none" }}>
              {resultTabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all relative flex-shrink-0 ${
                    activeTab === tab.key ? "text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                  style={activeTab === tab.key ? { color: tab.color } : {}}>
                  <span className="text-sm">{tab.icon}</span>
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.div layoutId="genTabLine"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: tab.color }} />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.16 }}>
                  {activeTab === "hashtags" ? (
                    <HashtagsTab hashtags={result.hashtags} />
                  ) : activeTab === "carousel" ? (
                    <CarouselTab slides={result.carousel} />
                  ) : (
                    <PostCard
                      text={result[activeTab as "instagram" | "linkedin" | "twitter"]}
                      color={activeTabConfig.color}
                      charLimit={activeTabConfig.charLimit!}
                      onSchedule={() => router.push("/schedule")}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* AI refinement bar — only for post tabs */}
            {activeTab !== "hashtags" && activeTab !== "carousel" && (
              <div className="px-5 pb-4 pt-1 border-t border-white/[0.04]">
                <RefinementBar onRefine={handleRefine} disabled={loading} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ──────────────────────────────────────────── */}
      {!result && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-14 text-center"
        >
          {/* Animated icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 rounded-2xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center float">
              <Sparkles className="w-9 h-9 text-[#F7BE4D]" />
            </div>
            {/* Floating dots */}
            {[
              { top: "-8%",  right: "-12%", delay: 0    },
              { top: "20%",  right: "-24%", delay: 0.4  },
              { top: "-12%", right: "38%",  delay: 0.8  },
            ].map((pos, i) => (
              <motion.div key={i}
                className="absolute w-2 h-2 rounded-full bg-[#F7BE4D]"
                style={{ top: pos.top, right: pos.right, opacity: 0.55 }}
                animate={{ y: [0, -10, 0], opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: pos.delay, ease: "easeInOut" }}
              />
            ))}
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            Generate your first AI-powered social campaign
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
            Create captions, threads, hashtags, and viral content in seconds.
            One idea becomes a full content pack across 5 platforms.
          </p>

          {/* Feature pills */}
          <div className="flex items-center justify-center gap-2.5 flex-wrap mb-8">
            {emptyFeatures.map(f => (
              <div key={f.label}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border"
                style={{ background: `${f.color}10`, borderColor: `${f.color}22`, color: f.color }}>
                <span>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
            <Zap className="w-3.5 h-3.5 text-[#F7BE4D]" />
            <span>Powered by GPT-4o mini · Generates in ~3 seconds · Saves to history</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
