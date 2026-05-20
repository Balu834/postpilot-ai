"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wand2, Sparkles, Copy, CheckCheck, RefreshCw,
  LinkIcon, Package, Hash, CalendarClock, Zap, Layers,
  Check, ClipboardList, TrendingUp, Flame,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import UpgradeModal from "@/components/UpgradeModal"

const FREE_LIMIT = 10

// ── Types ─────────────────────────────────────────────────────────
interface FullResult {
  instagram: string
  linkedin:  string
  twitter:   string
  hashtags:  string[]
  carousel:  string[]
}

// ── Constants ──────────────────────────────────────────────────────
const toneOptions = [
  { value: "engaging",      label: "Engaging",      emoji: "🔥" },
  { value: "professional",  label: "Professional",  emoji: "💼" },
  { value: "witty",         label: "Witty",         emoji: "😄" },
  { value: "inspirational", label: "Inspirational", emoji: "✨" },
  { value: "educational",   label: "Educational",   emoji: "🎓" },
]

const resultTabs = [
  { key: "instagram" as const, label: "Instagram",   icon: "📸", color: "#E1306C", charLimit: 2200 },
  { key: "linkedin"  as const, label: "LinkedIn",    icon: "💼", color: "#0A66C2", charLimit: 3000 },
  { key: "twitter"   as const, label: "Twitter / X", icon: "𝕏",  color: "#94a3b8", charLimit: 280  },
  { key: "hashtags"  as const, label: "Hashtags",    icon: "#️⃣", color: "#F7BE4D", charLimit: null },
  { key: "carousel"  as const, label: "Carousel",    icon: "🎨", color: "#818cf8", charLimit: null },
]

const LOADING_PHASES = [
  { msg: "Analyzing your topic...",          platform: null,        pct: 10 },
  { msg: "Generating Instagram captions...", platform: "instagram", pct: 28 },
  { msg: "Creating LinkedIn posts...",       platform: "linkedin",  pct: 46 },
  { msg: "Writing Twitter threads...",       platform: "twitter",   pct: 62 },
  { msg: "Generating hashtag sets...",       platform: "hashtags",  pct: 76 },
  { msg: "Building carousel ideas...",       platform: "carousel",  pct: 88 },
  { msg: "Optimizing for engagement...",     platform: null,        pct: 96 },
]

const refinements = [
  { label: "🔥 More Viral",      action: "more viral and attention-grabbing",  color: "#ef4444" },
  { label: "✍️ Rewrite",         action: "completely rewritten with fresh angle", color: "#818cf8" },
  { label: "✂️ Shorter",         action: "shorter and punchier",                color: "#F7BE4D" },
  { label: "🪝 Add Hooks",       action: "with a stronger hook at the start",   color: "#f472b6" },
  { label: "💼 Professional",    action: "more professional and authoritative",  color: "#0A66C2" },
  { label: "❤️ More Emotional",  action: "more emotional and personal",          color: "#e11d48" },
]

const AI_SUGGESTIONS = [
  "AI tools every creator needs in 2026",
  "LinkedIn growth hacks that actually work",
  "How to grow on Instagram without posting daily",
  "SaaS marketing strategies for early startups",
  "Personal branding tips for tech founders",
  "Viral Twitter thread formulas explained",
  "Content repurposing workflow that saves hours",
  "Building in public: raw lessons learned",
]

const emptyFeatures = [
  { icon: "💼", label: "LinkedIn Posts",     color: "#0A66C2" },
  { icon: "📸", label: "Instagram Captions", color: "#E1306C" },
  { icon: "𝕏",  label: "Twitter Threads",   color: "#94a3b8" },
  { icon: "🎨", label: "Carousel Ideas",     color: "#818cf8" },
]

// ── CopyBtn ────────────────────────────────────────────────────────
function CopyBtn({ text, variant = "ghost" }: { text: string; variant?: "ghost" | "solid" }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  if (variant === "solid") {
    return (
      <motion.button
        onClick={handle}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
          copied
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
            : "bg-white/[0.06] text-slate-300 hover:bg-white/10 border border-white/10"
        }`}>
        {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied!" : "Copy"}
      </motion.button>
    )
  }
  return (
    <motion.button
      onClick={handle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`p-1.5 rounded-lg transition-all ${
        copied ? "text-emerald-400 bg-emerald-500/10" : "text-slate-600 hover:text-slate-300 hover:bg-white/[0.06]"
      }`}>
      {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </motion.button>
  )
}

// ── SuccessToast ───────────────────────────────────────────────────
function SuccessToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl"
          style={{
            background: "rgba(13,21,38,0.95)",
            border: "1px solid rgba(52,211,153,0.25)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 40px rgba(52,211,153,0.15), 0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 500 }}
            className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
          >
            <Check className="w-4 h-4 text-emerald-400" />
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-white">Content generated</p>
            <p className="text-[11px] text-slate-400">5 platforms ready to publish</p>
          </div>
          <div className="flex gap-1 ml-2">
            {["#E1306C","#0A66C2","#94a3b8","#F7BE4D","#818cf8"].map((c, i) => (
              <motion.div key={c} className="w-1.5 h-1.5 rounded-full"
                style={{ background: c }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06, type: "spring" }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── CinematicLoader ────────────────────────────────────────────────
function CinematicLoader({ phase }: { phase: number }) {
  const current = LOADING_PHASES[Math.min(phase, LOADING_PHASES.length - 1)]
  const completed = LOADING_PHASES.slice(0, phase).filter(p => p.platform)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: "linear-gradient(145deg, #0d1526, #080c1a)",
        border: "1px solid rgba(247,190,77,0.12)",
        boxShadow: "0 0 60px rgba(247,190,77,0.05)",
      }}
    >
      {/* Ambient pulse */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(247,190,77,0.06), transparent 60%)" }} />

      <div className="relative p-6">
        {/* AI orb */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-shrink-0">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(247,190,77,0.2)" }}
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(247,190,77,0.15)" }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
            />
            <div className="w-12 h-12 rounded-full bg-[#F7BE4D]/10 border border-[#F7BE4D]/30 flex items-center justify-center relative z-10">
              <Sparkles className="w-5 h-5 text-[#F7BE4D]" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.p
                key={phase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="text-base font-bold text-white mb-2"
              >
                {current.msg}
              </motion.p>
            </AnimatePresence>
            {/* Progress bar */}
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #F7BE4D, #ffd97d, #F7BE4D)", backgroundSize: "200% 100%" }}
                animate={{ backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"], width: `${current.pct}%` }}
                transition={{ width: { duration: 0.6, ease: "easeOut" }, backgroundPosition: { duration: 2, repeat: Infinity } }}
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5 tabular-nums">{current.pct}% complete</p>
          </div>
        </div>

        {/* Platform completion indicators */}
        <div className="flex gap-2 flex-wrap">
          {resultTabs.filter(t => t.key !== "hashtags" && t.key !== "carousel").map((tab, i) => {
            const isDone = completed.some(c => c.platform === tab.key)
            const isCurrent = current.platform === tab.key
            return (
              <motion.div
                key={tab.key}
                animate={isCurrent ? { scale: [1, 1.06, 1] } : {}}
                transition={{ duration: 0.8, repeat: isCurrent ? Infinity : 0 }}
                className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full transition-all duration-500"
                style={{
                  background: isDone ? `${tab.color}18` : isCurrent ? `${tab.color}12` : "rgba(255,255,255,0.03)",
                  border: isDone ? `1px solid ${tab.color}40` : isCurrent ? `1px solid ${tab.color}30` : "1px solid rgba(255,255,255,0.06)",
                  color: isDone || isCurrent ? tab.color : "#475569",
                }}
              >
                <span className="text-[12px]">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                {isDone && <Check className="w-3 h-3" style={{ color: tab.color }} />}
                {isCurrent && (
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: tab.color }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Shimmer cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          {[{ color: "#E1306C" }, { color: "#0A66C2" }, { color: "#94a3b8" }].map(({ color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl p-4"
              style={{ background: `${color}06`, border: `1px solid ${color}18` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="skeleton w-8 h-8 rounded-lg" />
                <div className="skeleton w-16 h-3 rounded" />
              </div>
              <div className="space-y-2">
                <div className="skeleton h-2.5 rounded w-full" />
                <div className="skeleton h-2.5 rounded w-[80%]" />
                <div className="skeleton h-2.5 rounded w-full" />
                <div className="skeleton h-2.5 rounded w-[65%]" />
              </div>
              <div className="flex gap-2 mt-4">
                <div className="skeleton h-6 w-12 rounded-lg" />
                <div className="skeleton h-6 w-20 rounded-lg" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── PostCard ───────────────────────────────────────────────────────
function PostCard({
  text, color, charLimit, onSchedule,
}: { text: string; color: string; charLimit: number; onSchedule: () => void }) {
  const [hovered, setHovered] = useState(false)
  const pct  = Math.min((text.length / charLimit) * 100, 100)
  const over = text.length > charLimit

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 tabular-nums">
            {text.length.toLocaleString()} / {charLimit.toLocaleString()}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            over         ? "bg-red-500/15 text-red-400"
            : pct > 85  ? "bg-amber-500/15 text-amber-400"
                        : "bg-emerald-500/15 text-emerald-400"
          }`}>
            {over ? "Over limit" : pct > 85 ? "Near limit" : "✓ Within limit"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CopyBtn text={text} variant="solid" />
          <motion.button
            onClick={onSchedule}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#94a3b8",
            }}>
            <CalendarClock className="w-3.5 h-3.5" />
            Schedule
          </motion.button>
        </div>
      </div>

      <div className="h-0.5 bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: over ? "#f87171" : pct > 85 ? "#fbbf24" : color }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        animate={{ y: hovered ? -2 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="p-5 rounded-2xl text-sm text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[160px] relative overflow-hidden transition-all duration-300"
        style={{
          background: hovered ? `${color}0e` : `${color}07`,
          border: hovered ? `1px solid ${color}35` : `1px solid ${color}18`,
          boxShadow: hovered ? `0 0 30px ${color}12, 0 8px 24px rgba(0,0,0,0.2)` : "none",
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${color}10, transparent 70%)`,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s",
          }} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          {text}
        </motion.div>
      </motion.div>
    </div>
  )
}

// ── HashtagsTab ────────────────────────────────────────────────────
function HashtagsTab({ hashtags }: { hashtags: string[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{hashtags.length} hashtags · click any to copy</p>
        <CopyBtn text={hashtags.map(h => `#${h}`).join(" ")} variant="solid" />
      </div>
      <div className="flex flex-wrap gap-2">
        {hashtags.map((tag, i) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigator.clipboard.writeText(`#${tag}`)}
            className="text-xs px-3 py-1.5 rounded-lg cursor-pointer select-none transition-shadow duration-200"
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

// ── CarouselTab ────────────────────────────────────────────────────
function CarouselTab({ slides }: { slides: string[] }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">{slides.length} slides · carousel frame scripts</p>
      {slides.map((slide, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, type: "spring", stiffness: 250 }}
          whileHover={{ x: 4, backgroundColor: "rgba(129,140,248,0.07)" }}
          className="flex items-start gap-3 p-4 rounded-xl border border-[#818cf8]/15 transition-colors"
          style={{ background: "rgba(129,140,248,0.04)" }}
        >
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
            style={{ background: "rgba(129,140,248,0.15)", color: "#818cf8" }}>
            {i + 1}
          </span>
          <p className="text-sm text-slate-300 leading-relaxed flex-1">{slide}</p>
          <CopyBtn text={slide} />
        </motion.div>
      ))}
    </div>
  )
}

// ── RefinementBar ──────────────────────────────────────────────────
function RefinementBar({
  onRefine, disabled,
}: { onRefine: (action: string) => void; disabled: boolean }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [activeIdx,  setActiveIdx]  = useState<number | null>(null)

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Flame className="w-3.5 h-3.5 text-[#F7BE4D]" />
        <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">AI Refine</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {refinements.map((r, i) => (
          <motion.button
            key={r.action}
            onHoverStart={() => setHoveredIdx(i)}
            onHoverEnd={() => setHoveredIdx(null)}
            whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={() => {
              if (disabled) return
              setActiveIdx(i)
              onRefine(r.action)
              setTimeout(() => setActiveIdx(null), 2000)
            }}
            disabled={disabled}
            className="text-[11px] px-3 py-1.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: hoveredIdx === i ? `${r.color}15` : "rgba(255,255,255,0.04)",
              border: hoveredIdx === i ? `1px solid ${r.color}40` : "1px solid rgba(255,255,255,0.08)",
              color: hoveredIdx === i ? r.color : "#64748b",
              boxShadow: hoveredIdx === i ? `0 0 16px ${r.color}20` : "none",
            }}>
            {activeIdx === i ? (
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin inline" />
                Rewriting...
              </span>
            ) : r.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── AISuggestions ──────────────────────────────────────────────────
function AISuggestions({
  onSelect, visible,
}: { onSelect: (s: string) => void; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[11px] text-slate-600 font-medium">Trending ideas:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AI_SUGGESTIONS.map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(s)}
                className="text-[11px] px-3 py-1.5 rounded-lg text-slate-500 hover:text-white transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {s}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── CopyAllBtn ─────────────────────────────────────────────────────
function CopyAllBtn({ result }: { result: FullResult }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    const text = [
      `📸 INSTAGRAM\n${result.instagram}`,
      `💼 LINKEDIN\n${result.linkedin}`,
      `𝕏 TWITTER\n${result.twitter}`,
      `#️⃣ HASHTAGS\n${result.hashtags.map(h => `#${h}`).join(" ")}`,
    ].join("\n\n──────────────\n\n")
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }
  return (
    <motion.button
      onClick={handle}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
      style={{
        background: copied ? "rgba(52,211,153,0.12)" : "rgba(247,190,77,0.1)",
        border: copied ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(247,190,77,0.22)",
        color: copied ? "#34d399" : "#F7BE4D",
        boxShadow: copied ? "0 0 16px rgba(52,211,153,0.15)" : "0 0 12px rgba(247,190,77,0.1)",
      }}>
      {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <ClipboardList className="w-3.5 h-3.5" />}
      {copied ? "All Copied!" : "Copy All"}
    </motion.button>
  )
}

// ── Main Page ──────────────────────────────────────────────────────
export default function GeneratePage() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [topic,        setTopic]        = useState("")
  const [product,      setProduct]      = useState("")
  const [blogUrl,      setBlogUrl]      = useState("")
  const [tone,         setTone]         = useState("engaging")
  const [loading,      setLoading]      = useState(false)
  const [loadingPhase, setLoadingPhase] = useState(0)
  const [result,       setResult]       = useState<FullResult | null>(null)
  const [error,        setError]        = useState("")
  const [activeTab,    setActiveTab]    = useState<keyof FullResult>("instagram")
  const [upgradeOpen,  setUpgradeOpen]  = useState(false)
  const [planName,     setPlanName]     = useState("free")
  const [genCount,     setGenCount]     = useState(0)
  const [brandVoice,   setBrandVoice]   = useState<Record<string, unknown> | null>(null)
  const [showSuccess,  setShowSuccess]  = useState(false)
  const [topicFocused, setTopicFocused] = useState(false)
  const phaseRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const t  = searchParams.get("topic")
    const tn = searchParams.get("tone")
    if (t)  setTopic(decodeURIComponent(t))
    if (tn) setTone(tn)
  }, [searchParams])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const [genRes, planRes] = await Promise.all([
        supabase.from("generations").select("id", { count: "exact" }).eq("user_id", session.user.id),
        supabase.from("users").select("plan_name").eq("id", session.user.id).single(),
      ])
      setGenCount(genRes.count ?? 0)
      setPlanName(planRes.data?.plan_name ?? "free")
      const bvRes = await fetch("/api/brand-voice", {
        headers: { authorization: `Bearer ${session.access_token}` },
      })
      const bvJson = await bvRes.json()
      if (bvJson.data) setBrandVoice(bvJson.data)
    })
  }, [])

  useEffect(() => {
    if (loading) {
      setLoadingPhase(0)
      phaseRef.current = setInterval(() => setLoadingPhase(p => p + 1), 2000)
    } else {
      if (phaseRef.current) clearInterval(phaseRef.current)
    }
    return () => { if (phaseRef.current) clearInterval(phaseRef.current) }
  }, [loading])

  const generate = useCallback(async (topicOverride?: string) => {
    const effectiveTopic = topicOverride ?? topic
    if (!effectiveTopic.trim() && !blogUrl.trim()) {
      setError("Please enter a topic or blog URL")
      return
    }
    if (planName === "free" && genCount >= FREE_LIMIT) {
      setUpgradeOpen(true)
      return
    }
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ topic: effectiveTopic, product, blogUrl, tone, brandVoice }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setResult(data.data)
      setActiveTab("instagram")
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3500)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("generations").insert({
          user_id: user.id,
          prompt:  [effectiveTopic, product, blogUrl].filter(Boolean).join(" | "),
          platform: "all",
          output:  JSON.stringify(data.data),
        })
        setGenCount(c => c + 1)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [topic, product, blogUrl, tone, brandVoice, planName, genCount])

  const handleRefine = (action: string) => {
    if (!result) return
    const current = (activeTab !== "hashtags" && activeTab !== "carousel")
      ? result[activeTab as "instagram" | "linkedin" | "twitter"]
      : ""
    generate(`${topic} [REWRITE THIS ${activeTab.toUpperCase()} POST to be ${action}: "${current.slice(0, 120)}..."]`)
  }

  const activeTabConfig = resultTabs.find(t => t.key === activeTab)!
  const showSuggestions  = topicFocused && topic.length === 0

  return (
    <>
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onSuccess={(plan) => { setPlanName(plan); setGenCount(0) }}
      />
      <SuccessToast show={showSuccess} />

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

        {/* ── Input panel ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0d1526, #080c1a)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="absolute -top-14 -right-14 w-52 h-52 bg-[#F7BE4D]/[0.05] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/[0.04] rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F7BE4D]/12 border border-[#F7BE4D]/22 flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-[#F7BE4D]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">AI Content Generator</h2>
                  <p className="text-[11px] text-slate-500">Generate platform-ready posts from any idea</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.14)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-400 font-semibold">GPT-4o mini</span>
              </div>
            </div>

            {/* Topic textarea */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5 block">
                <Sparkles className="w-3 h-3 text-[#F7BE4D]" />
                Topic or Idea
                <span className="text-[#F7BE4D]">*</span>
              </label>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onFocus={() => setTopicFocused(true)}
                onBlur={() => setTimeout(() => setTopicFocused(false), 200)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate() }}
                placeholder={`e.g. "How AI is reshaping content marketing in 2026"`}
                rows={3}
                className="input-premium w-full px-4 py-3 text-sm resize-none leading-relaxed"
              />
            </div>

            {/* AI Suggestions */}
            <div className="mb-4">
              <AISuggestions
                visible={showSuggestions}
                onSelect={(s) => { setTopic(s); setTopicFocused(false) }}
              />
            </div>

            {/* Product + Blog URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5 block">
                  <Package className="w-3 h-3" />
                  Product / Brand
                  <span className="text-[10px] text-slate-600 ml-1">optional</span>
                </label>
                <input
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  placeholder="e.g. Intellixy, Nike Air Max..."
                  className="input-premium w-full px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5 block">
                  <LinkIcon className="w-3 h-3" />
                  Blog URL
                  <span className="text-[10px] text-slate-600 ml-1">optional</span>
                </label>
                <input
                  value={blogUrl}
                  onChange={e => setBlogUrl(e.target.value)}
                  placeholder="https://yourblog.com/post..."
                  type="url"
                  className="input-premium w-full px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            {/* Tone selector */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs text-slate-500 font-medium shrink-0">Tone:</span>
              <div className="flex flex-wrap gap-2">
                {toneOptions.map(t => (
                  <motion.button
                    key={t.value}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setTone(t.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                      tone === t.value
                        ? "bg-[#F7BE4D]/15 border-[#F7BE4D]/40 text-[#F7BE4D] font-semibold"
                        : "border-white/[0.07] text-slate-500 hover:border-white/14 hover:text-white"
                    }`}
                    style={tone === t.value ? { boxShadow: "0 0 14px rgba(247,190,77,0.15)" } : {}}>
                    {t.emoji} {t.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {planName === "free" && genCount >= FREE_LIMIT - 2 && genCount < FREE_LIMIT && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 mb-4">
                <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  {FREE_LIMIT - genCount} free {FREE_LIMIT - genCount === 1 ? "generation" : "generations"} left.{" "}
                  <button onClick={() => setUpgradeOpen(true)} className="underline font-semibold hover:text-amber-300">
                    Upgrade for unlimited
                  </button>
                </span>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-xs mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </p>
            )}

            {/* Generate button */}
            <motion.button
              onClick={() => generate()}
              disabled={loading}
              whileHover={!loading ? { scale: 1.01, y: -1 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-full py-3.5 text-sm flex items-center justify-center gap-2.5 rounded-xl font-bold transition-all duration-300 relative overflow-hidden"
              style={{
                background: loading
                  ? "rgba(247,190,77,0.08)"
                  : "linear-gradient(135deg, #F7BE4D 0%, #ffd97d 100%)",
                color: loading ? "#F7BE4D" : "#050816",
                boxShadow: loading
                  ? "none"
                  : "0 0 30px rgba(247,190,77,0.35), 0 4px 16px rgba(247,190,77,0.2)",
                border: loading ? "1px solid rgba(247,190,77,0.2)" : "none",
              }}
            >
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
            </motion.button>
          </div>
        </motion.div>

        {/* ── Cinematic Loader ───────────────────────────────────── */}
        <AnimatePresence>
          {loading && <CinematicLoader phase={loadingPhase} />}
        </AnimatePresence>

        {/* ── Results workspace ──────────────────────────────────── */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #0d1526, #080c1a)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="w-2 h-2 rounded-full bg-emerald-400"
                    style={{ boxShadow: "0 0 8px rgba(52,211,153,0.6)" }}
                  />
                  <span className="text-sm font-semibold text-white">Content ready</span>
                  <span className="text-[11px] text-slate-600 hidden sm:block">
                    5 platforms · {result.hashtags.length} hashtags · {result.carousel.length} slides
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CopyAllBtn result={result} />
                  <motion.button
                    onClick={() => generate()}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <RefreshCw className="w-3 h-3" />
                    <span className="hidden sm:block">Regenerate</span>
                  </motion.button>
                </div>
              </div>

              {/* Platform tabs */}
              <div className="flex overflow-x-auto border-b border-white/[0.05]" style={{ scrollbarWidth: "none" }}>
                {resultTabs.map((tab, i) => (
                  <motion.button
                    key={tab.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all relative flex-shrink-0 ${
                      activeTab === tab.key ? "text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                    style={activeTab === tab.key ? { color: tab.color } : {}}>
                    <span className="text-sm">{tab.icon}</span>
                    {tab.label}
                    {activeTab === tab.key && (
                      <motion.div
                        layoutId="genTabLine"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ background: tab.color, boxShadow: `0 0 8px ${tab.color}` }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}>
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

              {/* AI refinement bar */}
              {activeTab !== "hashtags" && activeTab !== "carousel" && (
                <div className="px-5 pb-5 pt-1 border-t border-white/[0.04]">
                  <RefinementBar onRefine={handleRefine} disabled={loading} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty state ────────────────────────────────────────── */}
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-14 text-center"
            style={{
              background: "linear-gradient(145deg, #0d1526, #080c1a)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="w-20 h-20 rounded-2xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center"
                style={{ boxShadow: "0 0 40px rgba(247,190,77,0.08)" }}>
                <Sparkles className="w-9 h-9 text-[#F7BE4D]" />
              </div>
              {[
                { top: "-8%",  right: "-12%", delay: 0,   color: "#F7BE4D" },
                { top: "20%",  right: "-24%", delay: 0.4, color: "#818cf8" },
                { top: "-12%", right: "38%",  delay: 0.8, color: "#34d399" },
              ].map((pos, i) => (
                <motion.div key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ top: pos.top, right: pos.right, background: pos.color, opacity: 0.6 }}
                  animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: pos.delay, ease: "easeInOut" }}
                />
              ))}
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Generate your first AI-powered social campaign
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
              One idea becomes a full content pack across 5 platforms — captions, threads, hashtags, and carousel scripts.
            </p>

            <div className="flex items-center justify-center gap-2.5 flex-wrap mb-8">
              {emptyFeatures.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border"
                  style={{ background: `${f.color}10`, borderColor: `${f.color}22`, color: f.color }}>
                  <span>{f.icon}</span>
                  {f.label}
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-600 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#F7BE4D]" />
                <span>GPT-4o mini</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <span>~3 seconds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/10 font-mono">⌘ Enter</kbd>
                <span>to generate</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}
