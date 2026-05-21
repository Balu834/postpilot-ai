"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wand2, Sparkles, Copy, CheckCheck, RefreshCw,
  LinkIcon, Package, CalendarClock, Zap, Check,
  ClipboardList, TrendingUp, Flame, BookmarkPlus,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import UpgradeModal from "@/components/UpgradeModal"
import { analytics } from "@/lib/analytics"

const FREE_LIMIT = 30

// ── Types ──────────────────────────────────────────────────────────
interface FullResult {
  instagram: string
  linkedin:  string
  twitter:   string
  hashtags:  string[]
  carousel:  string[]
}
type PlatformKey = keyof FullResult

// ── Constants ──────────────────────────────────────────────────────
const TONE_OPTIONS = [
  { value: "engaging",      label: "Engaging",      emoji: "🔥" },
  { value: "professional",  label: "Professional",  emoji: "💼" },
  { value: "witty",         label: "Witty",         emoji: "😄" },
  { value: "inspirational", label: "Inspirational", emoji: "✨" },
  { value: "educational",   label: "Educational",   emoji: "🎓" },
]

const TABS = [
  { key: "instagram" as const, label: "Instagram",   icon: "📸", color: "#E1306C", charLimit: 2200 },
  { key: "linkedin"  as const, label: "LinkedIn",    icon: "💼", color: "#0A66C2", charLimit: 3000 },
  { key: "twitter"   as const, label: "Twitter / X", icon: "𝕏",  color: "#94a3b8", charLimit: 280  },
  { key: "hashtags"  as const, label: "Hashtags",    icon: "#️⃣", color: "#F7BE4D", charLimit: null },
  { key: "carousel"  as const, label: "Carousel",    icon: "🎨", color: "#818cf8", charLimit: null },
]

const REFINEMENTS = [
  { label: "🔥 More Viral",     action: "more viral and attention-grabbing",   color: "#ef4444" },
  { label: "✍️ Rewrite",        action: "completely rewritten with fresh angle", color: "#818cf8" },
  { label: "✂️ Shorter",        action: "shorter and punchier",                 color: "#F7BE4D" },
  { label: "🪝 Add Hooks",      action: "with a stronger hook at the start",    color: "#f472b6" },
  { label: "💼 Professional",   action: "more professional and authoritative",  color: "#0A66C2" },
  { label: "❤️ More Emotional", action: "more emotional and personal",          color: "#e11d48" },
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

const STREAM_PHASES = [
  "Analyzing your topic...",
  "Connecting to AI engine...",
  "Crafting Instagram captions...",
  "Writing LinkedIn posts...",
  "Building Twitter threads...",
  "Generating hashtag sets...",
  "Crafting carousel scripts...",
  "Finalizing your content pack...",
]

// ── Helpers ────────────────────────────────────────────────────────
function parseSSE(raw: string): object | null {
  const line = raw.trim()
  if (!line.startsWith("data: ")) return null
  try { return JSON.parse(line.slice(6)) } catch { return null }
}

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
      <motion.button onClick={handle} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
          copied
            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
            : "bg-white/[0.05] text-slate-300 hover:bg-white/10 border border-white/10"
        }`}>
        {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied!" : "Copy"}
      </motion.button>
    )
  }
  return (
    <motion.button onClick={handle} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
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
          initial={{ opacity: 0, y: 48, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl pointer-events-none"
          style={{
            background: "rgba(10,16,32,0.96)",
            border: "1px solid rgba(52,211,153,0.28)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 0 50px rgba(52,211,153,0.14), 0 24px 64px rgba(0,0,0,0.5)",
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.12, type: "spring", stiffness: 500 }}
            className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0"
          >
            <Check className="w-4 h-4 text-emerald-400" />
          </motion.div>
          <div>
            <p className="text-sm font-bold text-white">Content generated ✨</p>
            <p className="text-[11px] text-slate-400">5 platforms ready · saved to history</p>
          </div>
          <div className="flex gap-1.5 ml-2">
            {TABS.map((t, i) => (
              <motion.div key={t.key} className="w-2 h-2 rounded-full"
                style={{ background: t.color }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.18 + i * 0.07, type: "spring" }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── StreamingLoader ────────────────────────────────────────────────
function StreamingLoader({
  phase, visibleTabs, completedPlatforms,
}: {
  phase: string
  visibleTabs: string[]
  completedPlatforms: Set<string>
}) {
  const [phaseIndex, setPhaseIndex] = useState(0)

  useEffect(() => {
    const idx = STREAM_PHASES.indexOf(phase)
    if (idx >= 0) setPhaseIndex(idx)
  }, [phase])

  const progress = Math.round(((phaseIndex + 1) / STREAM_PHASES.length) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: "linear-gradient(145deg, #0d1526 0%, #080c1a 100%)",
        border: "1px solid rgba(247,190,77,0.14)",
        boxShadow: "0 0 80px rgba(247,190,77,0.05)",
      }}
    >
      {/* Radial pulse */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 40% 0%, rgba(247,190,77,0.07), transparent 55%)" }} />

      <div className="relative p-6">
        {/* AI orb + phase */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative flex-shrink-0 mt-0.5">
            {[1.8, 1.4].map((scale, i) => (
              <motion.div key={i} className="absolute inset-0 rounded-full"
                style={{ background: "rgba(247,190,77,0.18)" }}
                animate={{ scale: [1, scale, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
            <div className="w-12 h-12 rounded-full bg-[#F7BE4D]/10 border border-[#F7BE4D]/30 flex items-center justify-center relative z-10">
              <Sparkles className="w-5 h-5 text-[#F7BE4D] animate-pulse" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.p key={phase}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="text-[15px] font-bold text-white mb-1.5 flex items-center gap-2">
                {phase}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-[#F7BE4D] rounded-full"
                />
              </motion.p>
            </AnimatePresence>

            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full relative overflow-hidden"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                style={{ background: "linear-gradient(90deg, #F7BE4D, #ffd97d)" }}
              >
                <motion.div className="absolute inset-0"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 tabular-nums">{progress}%</p>
          </div>
        </div>

        {/* Platform pills — reveal as they appear */}
        <div className="flex flex-wrap gap-2 mb-5">
          {TABS.map((tab) => {
            const isVisible   = visibleTabs.includes(tab.key)
            const isDone      = completedPlatforms.has(tab.key)
            const isCurrent   = visibleTabs[visibleTabs.length - 1] === tab.key && !isDone
            if (!isVisible && !isCurrent) return null
            return (
              <motion.div key={tab.key}
                initial={{ opacity: 0, scale: 0.8, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
                className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full font-medium transition-all duration-300"
                style={{
                  background: isDone ? `${tab.color}18` : `${tab.color}0d`,
                  border: isDone ? `1px solid ${tab.color}45` : `1px solid ${tab.color}28`,
                  color: tab.color,
                  boxShadow: isCurrent ? `0 0 14px ${tab.color}30` : "none",
                }}>
                <span className="text-[12px]">{tab.icon}</span>
                {tab.label}
                {isDone && <Check className="w-3 h-3" />}
                {isCurrent && (
                  <motion.span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: tab.color }}
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 0.7, repeat: Infinity }} />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Shimmer skeleton cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[{ color: "#E1306C" }, { color: "#0A66C2" }, { color: "#94a3b8" }].map(({ color }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl p-4" style={{ background: `${color}05`, border: `1px solid ${color}16` }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="skeleton w-8 h-8 rounded-lg" />
                <div className="skeleton w-16 h-3 rounded" />
              </div>
              <div className="space-y-2">
                <div className="skeleton h-2.5 rounded w-full" />
                <div className="skeleton h-2.5 rounded w-[78%]" />
                <div className="skeleton h-2.5 rounded w-full" />
                <div className="skeleton h-2.5 rounded w-[62%]" />
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
  text, color, charLimit, onSchedule, isStreamingThis,
}: {
  text: string; color: string; charLimit: number
  onSchedule: () => void; isStreamingThis?: boolean
}) {
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
            over        ? "bg-red-500/15 text-red-400"
            : pct > 85 ? "bg-amber-500/15 text-amber-400"
                       : "bg-emerald-500/15 text-emerald-400"
          }`}>
            {over ? "Over limit" : pct > 85 ? "Near limit" : "✓ Within limit"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isStreamingThis && <CopyBtn text={text} variant="solid" />}
          <motion.button onClick={onSchedule} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#94a3b8" }}>
            <CalendarClock className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Schedule</span>
          </motion.button>
        </div>
      </div>

      <div className="h-0.5 bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full"
          style={{ width: `${pct}%`, background: over ? "#f87171" : pct > 85 ? "#fbbf24" : color }}
          animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
      </div>

      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        animate={{ y: hovered ? -3 : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 24 }}
        className="p-5 rounded-2xl text-sm text-slate-300 leading-[1.75] whitespace-pre-wrap min-h-[140px] relative overflow-hidden transition-all duration-300"
        style={{
          background: hovered ? `${color}0e` : `${color}07`,
          border: hovered ? `1px solid ${color}38` : `1px solid ${color}18`,
          boxShadow: hovered ? `0 0 35px ${color}10, 0 10px 28px rgba(0,0,0,0.18)` : "none",
        }}
      >
        {/* Hover radial glow */}
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full pointer-events-none transition-opacity duration-300"
          style={{ background: `radial-gradient(circle, ${color}12, transparent 70%)`, opacity: hovered ? 1 : 0 }} />

        <span className="relative">{text}</span>

        {/* Blinking cursor when streaming */}
        {isStreamingThis && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.65, repeat: Infinity }}
            className="inline-block w-0.5 h-4 rounded-full ml-0.5 align-middle"
            style={{ background: color }}
          />
        )}
      </motion.div>
    </div>
  )
}

// ── HashtagsTab ────────────────────────────────────────────────────
function HashtagsTab({ hashtags, isStreaming }: { hashtags: string[]; isStreaming?: boolean }) {
  if (isStreaming) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-3 w-40 rounded" />
        <div className="flex flex-wrap gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-7 rounded-lg" style={{ width: `${60 + i * 15}px` }} />
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{hashtags.length} hashtags · click to copy</p>
        <CopyBtn text={hashtags.map(h => `#${h}`).join(" ")} variant="solid" />
      </div>
      <div className="flex flex-wrap gap-2">
        {hashtags.map((tag, i) => (
          <motion.span key={tag}
            initial={{ opacity: 0, scale: 0.8, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigator.clipboard.writeText(`#${tag}`)}
            className="text-xs px-3 py-1.5 rounded-lg cursor-pointer select-none"
            style={{ background: "rgba(247,190,77,0.08)", border: "1px solid rgba(247,190,77,0.18)", color: "#F7BE4D" }}>
            #{tag}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

// ── CarouselTab ────────────────────────────────────────────────────
function CarouselTab({ slides, isStreaming }: { slides: string[]; isStreaming?: boolean }) {
  if (isStreaming) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 p-4 rounded-xl" style={{ background: "rgba(129,140,248,0.05)", border: "1px solid rgba(129,140,248,0.1)" }}>
            <div className="skeleton w-7 h-7 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-2.5 rounded w-full" />
              <div className="skeleton h-2.5 rounded w-[70%]" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">{slides.length} slides · carousel frame scripts</p>
      {slides.map((slide, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, type: "spring", stiffness: 260 }}
          whileHover={{ x: 4 }}
          className="flex items-start gap-3 p-4 rounded-xl border border-[#818cf8]/15 transition-colors"
          style={{ background: "rgba(129,140,248,0.04)" }}>
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
            style={{ background: "rgba(129,140,248,0.15)", color: "#818cf8" }}>{i + 1}</span>
          <p className="text-sm text-slate-300 leading-relaxed flex-1">{slide}</p>
          <CopyBtn text={slide} />
        </motion.div>
      ))}
    </div>
  )
}

// ── RefinementBar ──────────────────────────────────────────────────
function RefinementBar({ onRefine, disabled }: { onRefine: (a: string) => void; disabled: boolean }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Flame className="w-3.5 h-3.5 text-[#F7BE4D]" />
        <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">AI Refine</span>
        <span className="text-[10px] text-slate-700">· click to regenerate with a twist</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {REFINEMENTS.map((r, i) => (
          <motion.button key={r.action}
            onHoverStart={() => setHoveredIdx(i)}
            onHoverEnd={() => setHoveredIdx(null)}
            whileHover={!disabled ? { scale: 1.06, y: -2 } : {}}
            whileTap={!disabled ? { scale: 0.94 } : {}}
            onClick={() => {
              if (disabled) return
              setActiveIdx(i)
              onRefine(r.action)
              setTimeout(() => setActiveIdx(null), 3500)
            }}
            disabled={disabled}
            className="text-[11px] px-3 py-1.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: hoveredIdx === i ? `${r.color}15` : "rgba(255,255,255,0.04)",
              border: hoveredIdx === i ? `1px solid ${r.color}42` : "1px solid rgba(255,255,255,0.08)",
              color: hoveredIdx === i ? r.color : "#64748b",
              boxShadow: hoveredIdx === i ? `0 0 18px ${r.color}22` : "none",
            }}>
            {activeIdx === i ? (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" />
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
function AISuggestions({ onSelect, visible }: { onSelect: (s: string) => void; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-slate-600" />
              <span className="text-[11px] text-slate-600 font-medium">Trending ideas — click to use:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AI_SUGGESTIONS.map((s, i) => (
                <motion.button key={s}
                  initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, type: "spring", stiffness: 280 }}
                  whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={() => onSelect(s)}
                  className="text-[11px] px-3 py-1.5 rounded-lg text-slate-500 hover:text-white transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {s}
                </motion.button>
              ))}
            </div>
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
    analytics.copyClicked("all")
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }
  return (
    <motion.button onClick={handle} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
      style={{
        background: copied ? "rgba(52,211,153,0.12)" : "rgba(247,190,77,0.09)",
        border: copied ? "1px solid rgba(52,211,153,0.28)" : "1px solid rgba(247,190,77,0.24)",
        color: copied ? "#34d399" : "#F7BE4D",
        boxShadow: copied ? "0 0 18px rgba(52,211,153,0.15)" : "0 0 14px rgba(247,190,77,0.1)",
      }}>
      {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <ClipboardList className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy All"}
    </motion.button>
  )
}

// ── Main Page ──────────────────────────────────────────────────────
export default function GeneratePage() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  // Form state
  const [topic,       setTopic]       = useState("")
  const [product,     setProduct]     = useState("")
  const [blogUrl,     setBlogUrl]     = useState("")
  const [tone,        setTone]        = useState("engaging")
  const [brandVoice,  setBrandVoice]  = useState<Record<string, unknown> | null>(null)

  // Streaming state
  const [isStreaming,        setIsStreaming]        = useState(false)
  const [streamPhase,        setStreamPhase]        = useState("")
  const [streamedText,       setStreamedText]       = useState<Record<string, string>>({})
  const [visibleTabs,        setVisibleTabs]        = useState<string[]>([])
  const [completedPlatforms, setCompletedPlatforms] = useState<Set<string>>(new Set())
  const [finalResult,        setFinalResult]        = useState<FullResult | null>(null)
  const [activeTab,          setActiveTab]          = useState<PlatformKey>("instagram")

  // UI state
  const [error,        setError]        = useState("")
  const [showSuccess,  setShowSuccess]  = useState(false)
  const [topicFocused, setTopicFocused] = useState(false)
  const [planName,     setPlanName]     = useState("free")
  const [genCount,     setGenCount]     = useState(0)
  const [upgradeOpen,  setUpgradeOpen]  = useState(false)
  const [reacted,      setReacted]      = useState<"up" | "down" | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const t = searchParams.get("topic"); const tn = searchParams.get("tone")
    if (t)  setTopic(decodeURIComponent(t))
    if (tn) setTone(tn)
  }, [searchParams])

  // Warn before unloading if streaming or content is ready
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isStreaming || finalResult) { e.preventDefault(); e.returnValue = "" }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isStreaming, finalResult])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data: planRes } = await supabase
        .from("users")
        .select("plan_name, credits_used")
        .eq("id", session.user.id)
        .single()
      setGenCount(planRes?.credits_used ?? 0)
      setPlanName(planRes?.plan_name ?? "free")
      const bvRes = await fetch("/api/brand-voice", { headers: { authorization: `Bearer ${session.access_token}` } })
      const bvJson = await bvRes.json()
      if (bvJson.data) setBrandVoice(bvJson.data)
    })
  }, [])

  const generate = useCallback(async (topicOverride?: string) => {
    const effectiveTopic = topicOverride ?? topic
    if (!effectiveTopic.trim() && !blogUrl.trim()) { setError("Please enter a topic or blog URL"); return }
    if (planName === "free" && genCount >= FREE_LIMIT) {
      analytics.upgradeClicked("free_limit_hit")
      setUpgradeOpen(true)
      return
    }

    // Cancel any in-flight request
    abortRef.current?.abort()
    const abort = new AbortController()
    abortRef.current = abort
    const timeout = setTimeout(() => abort.abort(), 90_000)

    setIsStreaming(true)
    setError("")
    setFinalResult(null)
    setStreamedText({})
    setVisibleTabs([])
    setCompletedPlatforms(new Set())
    setStreamPhase(STREAM_PHASES[0])
    setReacted(null)
    const genStartedAt = Date.now()
    analytics.generationStarted({
      topic_length: effectiveTopic.trim().length,
      tone,
      has_product: !!product.trim(),
      has_blog_url: !!blogUrl.trim(),
    })

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/generate/stream", {
        method: "POST",
        signal: abort.signal,
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ topic: effectiveTopic, product, blogUrl, tone, brandVoice }),
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Stream failed" }))
        if (res.status === 402 || j.code === "UPGRADE_REQUIRED") {
          analytics.upgradeClicked("free_limit_hit")
          setUpgradeOpen(true)
          return
        }
        throw new Error(j.error || `HTTP ${res.status}`)
      }

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let   buffer  = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          const evt = parseSSE(line) as Record<string, unknown> | null
          if (!evt) continue

          switch (evt.event) {
            case "phase":
              setStreamPhase(evt.msg as string)
              break

            case "tab_open":
              setVisibleTabs(prev =>
                prev.includes(evt.platform as string) ? prev : [...prev, evt.platform as string]
              )
              setActiveTab(evt.platform as PlatformKey)
              break

            case "chunk": {
              const key = evt.platform as string
              if (evt.isArray) {
                // Hashtags or carousel — parse and store
                try {
                  const parsed = JSON.parse(evt.text as string)
                  setStreamedText(prev => ({ ...prev, [key]: JSON.stringify(parsed) }))
                } catch {}
              } else {
                setStreamedText(prev => ({
                  ...prev,
                  [key]: (prev[key] ?? "") + (evt.text as string),
                }))
              }
              break
            }

            case "platform_done":
              setCompletedPlatforms(prev => new Set([...prev, evt.platform as string]))
              break

            case "done": {
              const result = evt.result as FullResult
              setFinalResult(result)
              setIsStreaming(false)
              setShowSuccess(true)
              setTimeout(() => setShowSuccess(false), 3800)
              analytics.generationCompleted({
                tone,
                topic_length: effectiveTopic.trim().length,
                duration_ms: Date.now() - genStartedAt,
              })

              // Save to history
              const { data: { user } } = await supabase.auth.getUser()
              if (user) {
                await supabase.from("generations").insert({
                  user_id: user.id,
                  prompt:  [effectiveTopic, product, blogUrl].filter(Boolean).join(" | "),
                  platform: "all",
                  output:  JSON.stringify(result),
                })
                setGenCount(c => c + 1)
              }
              break
            }

            case "error":
              throw new Error(evt.msg as string)
          }
        }
      }
    } catch (e: unknown) {
      if ((e as Error).name === "AbortError") {
        setError("Generation timed out. Please try again.")
        setIsStreaming(false)
        return
      }
      const msg = e instanceof Error ? e.message : "Something went wrong"
      analytics.generationFailed(msg)
      setError(msg)
      setIsStreaming(false)
    } finally {
      clearTimeout(timeout)
    }
  }, [topic, product, blogUrl, tone, brandVoice, planName, genCount])

  const handleRefine = (action: string) => {
    if (!finalResult) return
    const current = (activeTab !== "hashtags" && activeTab !== "carousel")
      ? finalResult[activeTab as "instagram" | "linkedin" | "twitter"]
      : ""
    generate(`${topic} [REWRITE THIS ${activeTab.toUpperCase()} to be ${action}: "${current.slice(0, 120)}..."]`)
  }

  // Resolve what to show in tabs (streaming text OR final result)
  const getTabContent = (key: PlatformKey): string | string[] => {
    if (finalResult) return finalResult[key]
    const raw = streamedText[key]
    if (!raw) return key === "hashtags" || key === "carousel" ? [] : ""
    if (key === "hashtags" || key === "carousel") {
      try { return JSON.parse(raw) } catch { return [] }
    }
    return raw
  }

  const activeTabConfig = TABS.find(t => t.key === activeTab)!
  const showSuggestions  = topicFocused && !topic && !isStreaming && !finalResult
  const showResults      = (visibleTabs.length > 0) && (isStreaming || finalResult)

  return (
    <>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)}
        onSuccess={(plan) => { setPlanName(plan); setGenCount(0) }} />
      <SuccessToast show={showSuccess} />

      <div className="max-w-5xl space-y-5 relative">

        {/* Ambient background glows */}
        <div className="fixed top-0 left-60 right-0 h-screen pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px]"
            style={{ background: "radial-gradient(ellipse at top, rgba(247,190,77,0.07) 0%, transparent 55%)" }} />
          <div className="absolute top-1/3 right-[10%] w-72 h-72 rounded-full blur-3xl opacity-25"
            style={{ background: "radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)" }} />
          <div className="absolute bottom-1/4 left-[20%] w-56 h-56 rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(circle, rgba(225,48,108,0.12) 0%, transparent 70%)" }} />
        </div>

        {/* ── Input panel ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0d1526, #080c1a)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
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
                  <p className="text-[11px] text-slate-500">One idea → full content pack across 5 platforms</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.14)" }}>
                <motion.span className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                <span className="text-[11px] text-emerald-400 font-semibold">GPT-4o mini · live</span>
              </div>
            </div>

            {/* Topic */}
            <div className="mb-2">
              <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5 block">
                <Sparkles className="w-3 h-3 text-[#F7BE4D]" />
                Topic or Idea <span className="text-[#F7BE4D]">*</span>
              </label>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onFocus={() => setTopicFocused(true)}
                onBlur={() => setTimeout(() => setTopicFocused(false), 180)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate() }}
                placeholder={`e.g. "How AI is reshaping content marketing in 2026"`}
                rows={3}
                className="input-premium w-full px-4 py-3 text-sm resize-none leading-relaxed"
              />
            </div>

            <AISuggestions visible={showSuggestions} onSelect={s => { setTopic(s); setTopicFocused(false) }} />

            {/* Product + Blog URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5 block">
                  <Package className="w-3 h-3" /> Product / Brand
                  <span className="text-[10px] text-slate-600 ml-1">optional</span>
                </label>
                <input value={product} onChange={e => setProduct(e.target.value)}
                  placeholder="e.g. Intellixy, PostPilot AI..."
                  className="input-premium w-full px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5 block">
                  <LinkIcon className="w-3 h-3" /> Blog URL
                  <span className="text-[10px] text-slate-600 ml-1">optional</span>
                </label>
                <input value={blogUrl} onChange={e => setBlogUrl(e.target.value)}
                  placeholder="https://yourblog.com/post..." type="url"
                  className="input-premium w-full px-4 py-2.5 text-sm" />
              </div>
            </div>

            {/* Tone */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs text-slate-500 font-medium shrink-0">Tone:</span>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map(t => (
                  <motion.button key={t.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setTone(t.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                      tone === t.value
                        ? "bg-[#F7BE4D]/15 border-[#F7BE4D]/40 text-[#F7BE4D] font-semibold"
                        : "border-white/[0.07] text-slate-500 hover:border-white/14 hover:text-white"
                    }`}
                    style={tone === t.value ? { boxShadow: "0 0 14px rgba(247,190,77,0.14)" } : {}}>
                    {t.emoji} {t.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {planName === "free" && genCount >= FREE_LIMIT - 2 && genCount < FREE_LIMIT && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 mb-4">
                <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{FREE_LIMIT - genCount} free {FREE_LIMIT - genCount === 1 ? "generation" : "generations"} left.{" "}
                  <button onClick={() => setUpgradeOpen(true)} className="underline font-semibold hover:text-amber-300">Upgrade for unlimited</button>
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
              onClick={() => generate()} disabled={isStreaming}
              whileHover={!isStreaming ? { scale: 1.01, y: -1 } : {}}
              whileTap={!isStreaming ? { scale: 0.99 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-full py-3.5 text-sm flex items-center justify-center gap-2.5 rounded-xl font-bold transition-all duration-300 relative overflow-hidden"
              style={{
                background: isStreaming ? "rgba(247,190,77,0.08)" : "linear-gradient(135deg, #F7BE4D 0%, #ffd97d 100%)",
                color: isStreaming ? "#F7BE4D" : "#050816",
                boxShadow: isStreaming ? "none" : "0 0 30px rgba(247,190,77,0.35), 0 4px 16px rgba(247,190,77,0.2)",
                border: isStreaming ? "1px solid rgba(247,190,77,0.2)" : "none",
              }}>
              {/* Shimmer on idle */}
              {!isStreaming && (
                <motion.div className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }} />
              )}
              <AnimatePresence mode="wait">
                {isStreaming ? (
                  <motion.span key="streaming" className="flex items-center gap-2.5"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    AI is generating...
                  </motion.span>
                ) : (
                  <motion.span key="idle" className="flex items-center gap-2.5"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <Sparkles className="w-4 h-4" />
                    Generate Content
                    <span className="text-[10px] opacity-50 hidden sm:block">
                      {typeof navigator !== "undefined" && /Mac/.test(navigator.platform) ? "⌘" : "Ctrl"} Enter
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>

        {/* ── Streaming loader (shown while waiting for first tab) ── */}
        <AnimatePresence>
          {isStreaming && visibleTabs.length === 0 && (
            <StreamingLoader
              phase={streamPhase}
              visibleTabs={visibleTabs}
              completedPlatforms={completedPlatforms}
            />
          )}
        </AnimatePresence>

        {/* ── Live workspace (tabs appear as they stream) ─────────── */}
        <AnimatePresence>
          {showResults && (
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
                  {isStreaming ? (
                    <>
                      <motion.span className="w-2 h-2 rounded-full bg-[#F7BE4D]"
                        animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }} />
                      <span className="text-sm font-semibold text-white">Generating live</span>
                      <AnimatePresence mode="wait">
                        <motion.span key={streamPhase}
                          initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                          className="text-[11px] text-slate-600 hidden sm:block">
                          {streamPhase}
                        </motion.span>
                      </AnimatePresence>
                    </>
                  ) : (
                    <>
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className="w-2 h-2 rounded-full bg-emerald-400"
                        style={{ boxShadow: "0 0 8px rgba(52,211,153,0.6)" }} />
                      <span className="text-sm font-semibold text-white">Content ready</span>
                      {finalResult && (
                        <span className="text-[11px] text-slate-600 hidden sm:block">
                          {finalResult.hashtags.length} hashtags · {finalResult.carousel.length} slides
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {finalResult && <CopyAllBtn result={finalResult} />}
                  {!isStreaming && (
                    <motion.button onClick={() => generate()} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <RefreshCw className="w-3 h-3" />
                      <span className="hidden sm:block">Regenerate</span>
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Tabs — appear one by one */}
              <div className="flex overflow-x-auto border-b border-white/[0.05]" style={{ scrollbarWidth: "none" }}>
                {TABS.filter(t => visibleTabs.includes(t.key)).map((tab, i) => (
                  <motion.button key={tab.key}
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 320, damping: 22 }}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all relative flex-shrink-0 ${
                      activeTab === tab.key ? "text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                    style={activeTab === tab.key ? { color: tab.color } : {}}>
                    <span className="text-sm">{tab.icon}</span>
                    {tab.label}
                    {/* Streaming indicator on active tab */}
                    {isStreaming && visibleTabs[visibleTabs.length - 1] === tab.key && !completedPlatforms.has(tab.key) && (
                      <motion.span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: tab.color }}
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 0.65, repeat: Infinity }} />
                    )}
                    {completedPlatforms.has(tab.key) && (
                      <Check className="w-3 h-3 opacity-50" style={{ color: tab.color }} />
                    )}
                    {activeTab === tab.key && (
                      <motion.div layoutId="genTabLine"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ background: tab.color, boxShadow: `0 0 8px ${tab.color}80` }} />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-5">
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.16 }}>
                    {activeTab === "hashtags" ? (
                      <HashtagsTab
                        hashtags={(getTabContent("hashtags") as string[]) || []}
                        isStreaming={isStreaming && !completedPlatforms.has("hashtags")}
                      />
                    ) : activeTab === "carousel" ? (
                      <CarouselTab
                        slides={(getTabContent("carousel") as string[]) || []}
                        isStreaming={isStreaming && !completedPlatforms.has("carousel")}
                      />
                    ) : (
                      <PostCard
                        text={(getTabContent(activeTab) as string) || ""}
                        color={activeTabConfig.color}
                        charLimit={activeTabConfig.charLimit!}
                        onSchedule={() => router.push("/schedule")}
                        isStreamingThis={isStreaming && !completedPlatforms.has(activeTab)}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* AI refinement bar */}
              {!isStreaming && finalResult && activeTab !== "hashtags" && activeTab !== "carousel" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="px-5 pb-5 pt-1 border-t border-white/[0.04]">
                  <RefinementBar onRefine={handleRefine} disabled={isStreaming} />
                </motion.div>
              )}

              {/* Quick reaction */}
              {finalResult && !isStreaming && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center gap-3 px-5 pb-4 pt-2 border-t border-white/[0.03]"
                >
                  <span className="text-[11px] text-slate-600">Was this generation helpful?</span>
                  {(["up", "down"] as const).map(dir => (
                    <motion.button
                      key={dir}
                      onClick={() => {
                        if (reacted) return
                        setReacted(dir)
                        analytics.reactionGiven(dir === "up", "generation")
                      }}
                      whileHover={!reacted ? { scale: 1.22 } : {}}
                      whileTap={!reacted ? { scale: 0.9 } : {}}
                      className="text-xl transition-all"
                      style={{ opacity: reacted && reacted !== dir ? 0.2 : 1 }}
                    >
                      {dir === "up" ? "👍" : "👎"}
                    </motion.button>
                  ))}
                  <AnimatePresence>
                    {reacted && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[11px] text-slate-600"
                      >
                        {reacted === "up" ? "Glad it helped!" : "We'll make it better"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty state ────────────────────────────────────────── */}
        {!finalResult && !isStreaming && visibleTabs.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-14 text-center"
            style={{ background: "linear-gradient(145deg, #0d1526, #080c1a)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="w-20 h-20 rounded-2xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center"
                style={{ boxShadow: "0 0 40px rgba(247,190,77,0.08)" }}>
                <Sparkles className="w-9 h-9 text-[#F7BE4D]" />
              </div>
              {[
                { top: "-8%",  right: "-12%", delay: 0,   color: "#F7BE4D" },
                { top: "20%",  right: "-24%", delay: 0.4, color: "#818cf8" },
                { top: "-12%", right: "38%",  delay: 0.8, color: "#34d399" },
              ].map((p, i) => (
                <motion.div key={i} className="absolute w-2 h-2 rounded-full"
                  style={{ top: p.top, right: p.right, background: p.color, opacity: 0.6 }}
                  animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: p.delay, ease: "easeInOut" }} />
              ))}
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Generate your first AI content pack</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
              Watch the AI generate platform-ready posts live — Instagram, LinkedIn, Twitter, hashtags, and carousels appear one by one in real time.
            </p>

            <div className="flex items-center justify-center gap-2.5 flex-wrap mb-8">
              {TABS.map((f, i) => (
                <motion.div key={f.key}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border"
                  style={{ background: `${f.color}10`, borderColor: `${f.color}22`, color: f.color }}>
                  <span>{f.icon}</span>{f.label}
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-600 flex-wrap">
              <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[#F7BE4D]" /><span>GPT-4o mini</span></div>
              <div className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-700" /><span>Streams live</span></div>
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
