"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Repeat2, Sparkles, RefreshCw, Copy, CheckCheck,
  Hash, ChevronRight, Zap, CheckCircle2, Clock,
  CalendarClock, Megaphone,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { analytics } from "@/lib/analytics"

// ── Types ─────────────────────────────────────────────────────────
interface RepurposeResult {
  linkedin:  string[]
  twitter:   string[]
  instagram: string[]
  carousels: string[]
  reels:     string[]
  cta:       string[]
  hashtags:  string[]
}

type TabKey = keyof Omit<RepurposeResult, "hashtags">

// ── Constants ─────────────────────────────────────────────────────
const toneOptions = [
  { value: "engaging",      label: "Engaging",      emoji: "🔥" },
  { value: "professional",  label: "Professional",  emoji: "💼" },
  { value: "witty",         label: "Witty",         emoji: "😄" },
  { value: "educational",   label: "Educational",   emoji: "🎓" },
  { value: "inspirational", label: "Inspirational", emoji: "✨" },
]

// The order platforms "complete" in the streaming UI (800–900 ms apart)
const STREAM_SEQUENCE = [
  { key: "linkedin",  label: "LinkedIn posts",     icon: "💼", color: "#0077B5", delay: 700  },
  { key: "twitter",   label: "Twitter threads",    icon: "𝕏",  color: "#94a3b8", delay: 1500 },
  { key: "instagram", label: "Instagram captions", icon: "📸", color: "#E1306C", delay: 2200 },
  { key: "carousels", label: "Carousel decks",     icon: "🎨", color: "#818cf8", delay: 2900 },
  { key: "reels",     label: "Reels hooks",        icon: "🎬", color: "#f472b6", delay: 3500 },
  { key: "cta",       label: "CTA captions",       icon: "📣", color: "#34d399", delay: 4100 },
]

const tabs = [
  { key: "linkedin"  as const, label: "LinkedIn",    icon: "💼", color: "#0077B5" },
  { key: "twitter"   as const, label: "Twitter / X", icon: "𝕏",  color: "#94a3b8" },
  { key: "instagram" as const, label: "Instagram",   icon: "📸", color: "#E1306C" },
  { key: "carousels" as const, label: "Carousels",   icon: "🎨", color: "#818cf8" },
  { key: "reels"     as const, label: "Reels Hooks", icon: "🎬", color: "#f472b6" },
  { key: "cta"       as const, label: "CTAs",        icon: "📣", color: "#34d399" },
]

const refinements = [
  { label: "🔥 More Viral",    action: "more viral and attention-grabbing" },
  { label: "✂️ Shorter",       action: "shorter and punchier" },
  { label: "💼 Professional",  action: "more professional and authoritative" },
  { label: "❤️ More Emotional", action: "more emotional and personal" },
  { label: "🪝 Add Hooks",     action: "with a stronger opening hook" },
  { label: "🔄 Rewrite",       action: "completely rewritten with a fresh angle" },
]

// ── CopyBtn ───────────────────────────────────────────────────────
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

// ── StreamingLoader ───────────────────────────────────────────────
// Shows platform-by-platform status while the real API call is running.
// Timer advances each platform from Queued → Generating → Ready
// independently of the actual response time.
function StreamingLoader({ completedKeys }: { completedKeys: string[] }) {
  const totalDone = completedKeys.length
  const progressPct = Math.min((totalDone / STREAM_SEQUENCE.length) * 100, 95)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Header with pulsing AI indicator */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-[#F7BE4D]/20 animate-ping"
              style={{ animationDuration: "1.4s" }} />
            <div className="w-10 h-10 rounded-full bg-[#F7BE4D]/15 border border-[#F7BE4D]/30
              flex items-center justify-center relative z-10">
              <Sparkles className="w-5 h-5 text-[#F7BE4D] animate-pulse" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">
              AI is building your content pack
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Generating across 6 platforms simultaneously
            </p>
          </div>
          <span className="text-xs font-bold text-[#F7BE4D] tabular-nums">
            {progressPct.toFixed(0)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #F7BE4D, #ffd166)" }}
            initial={{ width: "0%" }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Platform status grid */}
      <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
        {STREAM_SEQUENCE.map((p, i) => {
          const isDone    = completedKeys.includes(p.key)
          const isActive  = !isDone && completedKeys.length === i
          const isQueued  = !isDone && !isActive

          return (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-300 ${
                isDone   ? "border-emerald-500/20 bg-emerald-500/5"
                : isActive ? "border-[#F7BE4D]/25 bg-[#F7BE4D]/6"
                           : "border-white/5 bg-white/[0.02]"
              }`}
            >
              {/* Status icon */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDone   ? "bg-emerald-500/20"
                : isActive ? "bg-[#F7BE4D]/20"
                           : "bg-white/5"
              }`}>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isActive ? (
                  <RefreshCw className="w-3.5 h-3.5 text-[#F7BE4D] animate-spin" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-slate-700" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-300 leading-tight">{p.label}</p>
                <p className={`text-[10px] font-semibold mt-0.5 ${
                  isDone   ? "text-emerald-400"
                  : isActive ? "text-[#F7BE4D]"
                             : "text-slate-700"
                }`}>
                  {isDone ? "✓ Ready" : isActive ? "Generating..." : "Queued"}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── PostCard ──────────────────────────────────────────────────────
function PostCard({
  text, index, color, onSchedule,
}: { text: string; index: number; color: string; onSchedule: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > 200

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card rounded-xl p-4 group"
    >
      <div className="flex items-start gap-3">
        {/* Index badge */}
        <span className="w-6 h-6 rounded-full flex items-center justify-center
          text-[11px] font-bold flex-shrink-0 mt-0.5"
          style={{ background: `${color}20`, color }}>
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <p className={`text-sm text-slate-300 leading-relaxed ${
            !expanded && isLong ? "line-clamp-3" : ""
          }`}>
            {text}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] text-slate-600 hover:text-slate-400 mt-1.5
                transition-colors flex items-center gap-1">
              {expanded ? "Show less" : "Show more"}
              <ChevronRight className={`w-3 h-3 transition-transform ${
                expanded ? "rotate-90" : ""
              }`} />
            </button>
          )}
        </div>

        {/* Action buttons — visible on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0
          flex items-center gap-1.5">
          <CopyBtn text={text} />
          <button
            onClick={onSchedule}
            title="Schedule this post"
            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-400
              hover:bg-indigo-500/10 transition-all">
            <CalendarClock className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── HashtagCloud ──────────────────────────────────────────────────
function HashtagCloud({ tags }: { tags: string[] }) {
  return (
    <div className="px-5 pb-5 pt-2 border-t border-white/[0.05]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-[#F7BE4D]" />
          <span className="text-xs font-semibold text-white">Hashtags</span>
          <span className="text-[10px] text-slate-600">{tags.length} tags</span>
        </div>
        <CopyBtn text={tags.map(h => `#${h}`).join(" ")} variant="solid" />
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => navigator.clipboard.writeText(`#${tag}`)}
            className="text-xs px-2.5 py-1 rounded-lg cursor-pointer
              transition-all hover:scale-105 active:scale-95 select-none"
            style={{
              background: "rgba(247,190,77,0.08)",
              border: "1px solid rgba(247,190,77,0.15)",
              color: "#F7BE4D",
            }}>
            #{tag}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

// ── RefinementBar ─────────────────────────────────────────────────
function RefinementBar({
  onRefine, disabled,
}: { onRefine: (action: string) => void; disabled: boolean }) {
  return (
    <div className="px-5 pb-4 pt-2 border-t border-white/[0.04]">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-slate-600 font-medium shrink-0">AI refine:</span>
        {refinements.map(r => (
          <button
            key={r.action}
            onClick={() => onRefine(r.action)}
            disabled={disabled}
            className="text-[11px] px-2.5 py-1.5 rounded-lg border border-white/8
              text-slate-400 hover:text-white hover:border-white/16 hover:bg-white/5
              transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────
function EmptyState() {
  const platforms = [
    { icon: "💼", label: "5 LinkedIn Posts",     color: "#0077B5" },
    { icon: "𝕏",  label: "5 Twitter Threads",    color: "#94a3b8" },
    { icon: "📸", label: "5 Instagram Captions", color: "#E1306C" },
    { icon: "🎨", label: "3 Carousel Decks",     color: "#818cf8" },
    { icon: "🎬", label: "3 Reels Hooks",        color: "#f472b6" },
    { icon: "📣", label: "3 CTA Captions",       color: "#34d399" },
  ]
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-2xl p-14 text-center"
    >
      {/* Animated icon */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="w-20 h-20 rounded-2xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20
          flex items-center justify-center float">
          <Repeat2 className="w-9 h-9 text-[#F7BE4D]" />
        </div>
        {[
          { top: "-8%",  right: "-12%", delay: 0    },
          { top: "20%",  right: "-24%", delay: 0.5  },
          { top: "-10%", right: "38%",  delay: 1.0  },
        ].map((pos, i) => (
          <motion.div key={i}
            className="absolute w-2 h-2 rounded-full bg-[#F7BE4D]"
            style={{ top: pos.top, right: pos.right, opacity: 0.5 }}
            animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: pos.delay }}
          />
        ))}
      </div>

      <h3 className="text-xl font-bold text-white mb-2">
        Turn any content into 24 posts
      </h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        Paste a blog post, YouTube transcript, newsletter, or any long-form content —
        get a full cross-platform content pack in seconds.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-lg mx-auto mb-8">
        {platforms.map(p => (
          <div key={p.label}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl border"
            style={{ background: `${p.color}10`, borderColor: `${p.color}20`, color: p.color }}>
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
        <Zap className="w-3.5 h-3.5 text-[#F7BE4D]" />
        <span>Powered by GPT-4o mini · 24 posts per generation · Saves to history</span>
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function RepurposePage() {
  const router = useRouter()

  const [content, setContent]   = useState("")
  const [tone,    setTone]      = useState("engaging")
  const [loading, setLoading]   = useState(false)
  const [result,  setResult]    = useState<RepurposeResult | null>(null)
  const [error,   setError]     = useState("")
  const [activeTab, setActiveTab] = useState<TabKey>("linkedin")
  // Keys that have "completed" in the streaming UI simulation
  const [streamDone, setStreamDone] = useState<string[]>([])
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Kick off simulated streaming progress when loading starts
  useEffect(() => {
    if (loading) {
      setStreamDone([])
      timersRef.current = STREAM_SEQUENCE.map(({ key, delay }) =>
        setTimeout(() => setStreamDone(prev => [...prev, key]), delay)
      )
    } else {
      timersRef.current.forEach(clearTimeout)
    }
    return () => timersRef.current.forEach(clearTimeout)
  }, [loading])

  const handleGenerate = async (refineAction?: string) => {
    if (!content.trim()) {
      setError("Paste your blog, article, or transcript above")
      return
    }
    setLoading(true)
    setError("")
    setResult(null)
    if (!refineAction) {
      analytics.blogToPostsUsed(content.trim().startsWith("http"))
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const body: Record<string, string> = { tone }
      if (refineAction && result) {
        // Build a refinement prompt from the active tab's posts
        const posts = result[activeTab] as string[]
        body.content = `${content}\n\n[REFINEMENT: Make the ${activeTab} posts ${refineAction}. Original first post: "${posts[0]?.slice(0, 120)}"]`
      } else {
        body.content = content
      }

      const res  = await fetch("/api/repurpose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setResult(data.data)
      setActiveTab("linkedin")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const activeItems: string[] = result ? (result[activeTab] ?? []) : []
  const activeTabConfig = tabs.find(t => t.key === activeTab)!

  const totalPosts = result
    ? (["linkedin","twitter","instagram","carousels","reels","cta"] as const)
        .reduce((acc, k) => acc + (result[k]?.length ?? 0), 0)
    : 0

  return (
    <div className="max-w-4xl space-y-5 relative">

      {/* Ambient background glows */}
      <div className="fixed top-0 left-60 right-0 h-screen pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
          style={{ background: "radial-gradient(ellipse at top, rgba(247,190,77,0.07) 0%, transparent 55%)" }} />
        <div className="absolute top-1/3 right-[5%] w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, rgba(129,140,248,0.2) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 left-[15%] w-48 h-48 rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, rgba(244,114,182,0.15) 0%, transparent 70%)" }} />
      </div>

      {/* ── Input panel ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-hero rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#F7BE4D]/[0.06]
          rounded-full blur-3xl pointer-events-none" />
        <div className="grid-bg absolute inset-0 opacity-25 pointer-events-none rounded-2xl" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F7BE4D]/15 border border-[#F7BE4D]/25
                flex items-center justify-center">
                <Repeat2 className="w-5 h-5 text-[#F7BE4D]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Blog → 24 Posts</h2>
                <p className="text-[11px] text-slate-500">
                  Paste any content — get a full cross-platform content pack
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 glass-sm rounded-xl px-3 py-1.5
              border border-[#F7BE4D]/15">
              <Sparkles className="w-3 h-3 text-[#F7BE4D]" />
              <span className="text-[11px] text-[#F7BE4D] font-semibold">24 posts generated</span>
            </div>
          </div>

          {/* Platform preview pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tabs.map(t => (
              <span key={t.key}
                className="text-[11px] px-2.5 py-1 rounded-full border font-medium"
                style={{
                  background: `${t.color}10`,
                  borderColor: `${t.color}20`,
                  color: t.color,
                }}>
                {t.icon} {t.label}
              </span>
            ))}
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your blog post, article, YouTube transcript, newsletter, or any long-form content here..."
            rows={6}
            className="input-premium w-full px-4 py-3 text-sm mb-4 resize-none leading-relaxed"
          />

          {/* Tone row */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-slate-500 font-medium shrink-0">Tone:</span>
            <div className="flex flex-wrap gap-2">
              {toneOptions.map(t => (
                <button key={t.value} onClick={() => setTone(t.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    tone === t.value
                      ? "bg-[#F7BE4D]/15 border-[#F7BE4D]/40 text-[#F7BE4D] font-semibold"
                      : "border-white/8 text-slate-500 hover:border-white/15 hover:text-white"
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

          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2.5">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span key="loading" className="flex items-center gap-2.5"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating 24 posts...
                </motion.span>
              ) : (
                <motion.span key="idle" className="flex items-center gap-2.5"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}>
                  <Sparkles className="w-4 h-4" />
                  Generate 24 Posts
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      {/* ── Streaming loader ──────────────────────────────────────── */}
      <AnimatePresence>
        {loading && <StreamingLoader completedKeys={streamDone} />}
      </AnimatePresence>

      {/* ── Results workspace ─────────────────────────────────────── */}
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
                <span className="text-sm font-semibold text-white">
                  {totalPosts} posts ready
                </span>
                <span className="text-[11px] text-slate-600">
                  · {result.hashtags.length} hashtags
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CopyBtn text={activeItems.join("\n\n")} variant="solid" />
                <button
                  onClick={() => handleGenerate()}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white
                    px-3 py-1.5 rounded-lg hover:bg-white/8 border border-white/8 transition-all">
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </button>
              </div>
            </div>

            {/* Platform tabs */}
            <div className="flex overflow-x-auto border-b border-white/[0.06]"
              style={{ scrollbarWidth: "none" }}>
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold
                    whitespace-nowrap transition-all relative flex-shrink-0 ${
                    activeTab === tab.key
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                  style={activeTab === tab.key ? { color: tab.color } : {}}>
                  <span className="text-sm">{tab.icon}</span>
                  {tab.label}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: activeTab === tab.key ? `${tab.color}20` : "rgba(255,255,255,0.05)",
                      color: activeTab === tab.key ? tab.color : "#64748b",
                    }}>
                    {result[tab.key]?.length ?? 0}
                  </span>
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="repurposeTabLine"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: tab.color }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.16 }}
                  className="space-y-3">
                  {activeItems.map((text, i) => (
                    <PostCard
                      key={i}
                      text={text}
                      index={i}
                      color={activeTabConfig.color}
                      onSchedule={() => router.push("/schedule")}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* AI refinement bar */}
            <RefinementBar
              onRefine={(action) => handleGenerate(action)}
              disabled={loading}
            />

            {/* Hashtag cloud */}
            {result.hashtags.length > 0 && (
              <HashtagCloud tags={result.hashtags} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ───────────────────────────────────────────── */}
      {!result && !loading && <EmptyState />}
    </div>
  )
}
