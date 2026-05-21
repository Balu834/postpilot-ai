"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Repeat2, Sparkles, RefreshCw, Copy, CheckCheck, Hash, Zap,
  CheckCircle2, Clock, CalendarClock, Edit3, ChevronDown, Check,
  ThumbsUp, MessageSquare, Share2, Send, Download, Palette,
  ChevronUp,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { analytics } from "@/lib/analytics"

// ── Types ──────────────────────────────────────────────────────────────
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

// ── Constants ──────────────────────────────────────────────────────────
const toneOptions = [
  { value: "engaging",      label: "Engaging",      emoji: "🔥" },
  { value: "professional",  label: "Professional",  emoji: "💼" },
  { value: "witty",         label: "Witty",         emoji: "😄" },
  { value: "educational",   label: "Educational",   emoji: "🎓" },
  { value: "inspirational", label: "Inspirational", emoji: "✨" },
]

const STREAM_SEQUENCE = [
  { key: "linkedin",  label: "LinkedIn posts",     color: "#0077B5", delay: 700  },
  { key: "twitter",   label: "Twitter threads",    color: "#94a3b8", delay: 1500 },
  { key: "instagram", label: "Instagram captions", color: "#E1306C", delay: 2200 },
  { key: "carousels", label: "Carousel decks",     color: "#818cf8", delay: 2900 },
  { key: "reels",     label: "Reels hooks",        color: "#f472b6", delay: 3500 },
  { key: "cta",       label: "CTA captions",       color: "#34d399", delay: 4100 },
]

const tabs = [
  { key: "linkedin"  as const, label: "LinkedIn",    icon: "💼", color: "#0077B5" },
  { key: "twitter"   as const, label: "Twitter / X", icon: "𝕏",  color: "#94a3b8" },
  { key: "instagram" as const, label: "Instagram",   icon: "📸", color: "#E1306C" },
  { key: "carousels" as const, label: "Carousels",   icon: "🎨", color: "#818cf8" },
  { key: "reels"     as const, label: "Reels Hooks", icon: "🎬", color: "#f472b6" },
  { key: "cta"       as const, label: "CTAs",        icon: "📣", color: "#34d399" },
]

const PLATFORM_BADGES: Record<string, string[]> = {
  linkedin:  ["Engaging", "Professional", "Growth Focused"],
  twitter:   ["Punchy",   "Engaging",     "Viral-ready"   ],
  instagram: ["Visual",   "Engaging",     "Trend-worthy"  ],
  carousels: ["Educational", "Swipeable", "Value-packed"  ],
  reels:     ["Hooky",    "Short-form",   "Trend-aware"   ],
  cta:       ["Conversion", "Action-driven", "Persuasive" ],
}

const IMAGE_GRADIENTS = [
  "linear-gradient(135deg, #1a1a3e 0%, #0d0d2b 100%)",
  "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  "linear-gradient(135deg, #200122 0%, #6f0000 100%)",
  "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  "linear-gradient(135deg, #134e5e 0%, #265e40 100%)",
]

const TIMEZONES = [
  "(GMT-08:00) Pacific Time",
  "(GMT-05:00) Eastern Time",
  "(GMT+00:00) UTC / London",
  "(GMT+01:00) Central Europe",
  "(GMT+05:30) Asia/Kolkata",
  "(GMT+08:00) Singapore",
  "(GMT+09:00) Tokyo",
]

function getTodayStr() {
  return new Date().toISOString().split("T")[0]
}

// ── CopyBtn ────────────────────────────────────────────────────────────
function CopyBtn({ text, label = "Copy", solidLabel = "Copy All", variant = "ghost" }: {
  text: string; label?: string; solidLabel?: string; variant?: "ghost" | "solid"
}) {
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
        {copied ? "Copied!" : solidLabel}
      </button>
    )
  }
  return (
    <button onClick={handle}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
        copied
          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          : "text-slate-400 hover:text-white bg-white/4 hover:bg-white/8 border-white/8"
      }`}>
      {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : label}
    </button>
  )
}

// ── StreamingLoader ────────────────────────────────────────────────────
function StreamingLoader({ completedKeys }: { completedKeys: string[] }) {
  const progressPct = Math.min((completedKeys.length / STREAM_SEQUENCE.length) * 100, 95)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-[#F7BE4D]/20 animate-ping" style={{ animationDuration: "1.4s" }} />
            <div className="w-10 h-10 rounded-full bg-[#F7BE4D]/15 border border-[#F7BE4D]/30 flex items-center justify-center relative z-10">
              <Sparkles className="w-5 h-5 text-[#F7BE4D] animate-pulse" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">AI is building your content pack</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Generating across 6 platforms simultaneously</p>
          </div>
          <span className="text-xs font-bold text-[#F7BE4D] tabular-nums">{progressPct.toFixed(0)}%</span>
        </div>
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
      <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
        {STREAM_SEQUENCE.map((p, i) => {
          const isDone   = completedKeys.includes(p.key)
          const isActive = !isDone && completedKeys.length === i
          return (
            <motion.div key={p.key}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-300 ${
                isDone   ? "border-emerald-500/20 bg-emerald-500/5"
                : isActive ? "border-[#F7BE4D]/25 bg-[#F7BE4D]/6"
                           : "border-white/5 bg-white/[0.02]"
              }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDone ? "bg-emerald-500/20" : isActive ? "bg-[#F7BE4D]/20" : "bg-white/5"
              }`}>
                {isDone   ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                : isActive ? <RefreshCw    className="w-3.5 h-3.5 text-[#F7BE4D] animate-spin" />
                           : <Clock        className="w-3.5 h-3.5 text-slate-700" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-300 leading-tight">{p.label}</p>
                <p className={`text-[10px] font-semibold mt-0.5 ${
                  isDone ? "text-emerald-400" : isActive ? "text-[#F7BE4D]" : "text-slate-700"
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

// ── ImageCard ──────────────────────────────────────────────────────────
function ImageCard({ text, index, platformColor }: { text: string; index: number; platformColor: string }) {
  const gradient = IMAGE_GRADIENTS[index % IMAGE_GRADIENTS.length]
  const words = text.replace(/#\w+/g, "").trim().split(/\s+/)
  const title = words.slice(0, 7).join(" ") + (words.length > 7 ? "..." : "")

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ background: gradient, minHeight: 188 }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(circle at 25% 25%, ${platformColor}25 0%, transparent 55%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.04) 0%, transparent 55%)`,
      }} />
      {/* Decorative grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 200 190" preserveAspectRatio="none">
        <line x1="0" y1="47" x2="200" y2="47" stroke="white" strokeWidth="0.5" />
        <line x1="0" y1="95" x2="200" y2="95" stroke="white" strokeWidth="0.5" />
        <line x1="0" y1="143" x2="200" y2="143" stroke="white" strokeWidth="0.5" />
        <circle cx="160" cy="36" r="36" fill="none" stroke="white" strokeWidth="0.5" />
        <circle cx="160" cy="36" r="20" fill="none" stroke="white" strokeWidth="0.5" />
      </svg>
      {/* Accent shape */}
      <div className="absolute top-4 right-4 w-14 h-14 rounded-full opacity-20"
        style={{ background: platformColor, filter: "blur(16px)" }} />
      {/* Title */}
      <div className="relative z-10 p-4 flex flex-col h-full" style={{ minHeight: 188 }}>
        <div className="flex-1 flex items-center justify-center px-2">
          <p className="text-white font-bold text-sm leading-snug text-center drop-shadow-lg">{title}</p>
        </div>
        {/* Brand footer */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-[#F7BE4D]/20 border border-[#F7BE4D]/30 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-[#F7BE4D]" />
            </div>
            <span className="text-[10px] text-white/50 font-medium">PostPilot AI</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── PostCard ───────────────────────────────────────────────────────────
function PostCard({
  text, index, color, platform, hashtags, onSelect, isSelected,
}: {
  text: string; index: number; color: string; platform: TabKey
  hashtags: string[]; onSelect: (t: string) => void; isSelected: boolean
}) {
  const [showImage, setShowImage] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText,  setEditText]  = useState(text)
  const badges = PLATFORM_BADGES[platform] ?? []
  const displayText = isEditing ? editText : text
  const displayTags = hashtags.slice(0, 5)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onSelect(displayText)}
      className="rounded-xl overflow-hidden cursor-pointer transition-all"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${isSelected ? "rgba(247,190,77,0.3)" : "rgba(255,255,255,0.06)"}`,
        boxShadow: isSelected ? "0 0 0 1px rgba(247,190,77,0.1)" : "none",
      }}
    >
      <div className="flex">
        {/* ── Left: text ── */}
        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-start gap-3">
            {/* Number badge */}
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
              style={{ background: `${color}20`, color }}>
              {index + 1}
            </span>

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={5}
                  onClick={e => e.stopPropagation()}
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                    text-sm text-slate-200 leading-relaxed resize-none outline-none
                    focus:border-[#F7BE4D]/30 transition-colors"
                />
              ) : (
                <p className="text-sm text-slate-300 leading-relaxed">{displayText}</p>
              )}

              {/* Hashtags */}
              {displayTags.length > 0 && (
                <p className="text-xs mt-2.5 leading-relaxed font-medium" style={{ color }}>
                  {displayTags.map(t => `#${t}`).join(" ")}
                </p>
              )}

              {/* Tone badges */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {badges.map(b => (
                  <span key={b} className="text-[10px] px-2 py-0.5 rounded-md border border-white/8
                    text-slate-500 bg-white/[0.03]">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4 pl-9 flex-wrap" onClick={e => e.stopPropagation()}>
            <CopyBtn text={displayText} />

            {isEditing ? (
              <button onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border
                  border-emerald-500/30 text-emerald-400 bg-emerald-500/10 transition-all">
                <Check className="w-3 h-3" />
                Save
              </button>
            ) : (
              <button onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border
                  border-white/8 text-slate-400 hover:text-white bg-white/4 hover:bg-white/8 transition-all">
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            )}

            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border
              border-white/8 text-slate-400 hover:text-white bg-white/4 hover:bg-white/8 transition-all">
              <RefreshCw className="w-3 h-3" />
              Regenerate
            </button>

            {/* Create Image — primary gold */}
            <button
              onClick={() => setShowImage(v => !v)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
              style={showImage ? {
                background: "rgba(247,190,77,0.12)",
                color: "#F7BE4D",
                border: "1px solid rgba(247,190,77,0.25)",
              } : {
                background: "linear-gradient(135deg, #F7BE4D 0%, #f0a800 100%)",
                color: "#050816",
                boxShadow: "0 0 14px rgba(247,190,77,0.3)",
              }}>
              <Sparkles className="w-3 h-3" />
              {showImage ? "Hide Image" : "Create Image"}
            </button>
          </div>
        </div>

        {/* ── Right: image ── */}
        <AnimatePresence>
          {showImage && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="flex-shrink-0 overflow-hidden"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="p-3 h-full flex flex-col gap-2.5" onClick={e => e.stopPropagation()}>
                <ImageCard text={displayText} index={index} platformColor={color} />
                {/* Image actions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button className="flex items-center gap-1 text-[10px] px-2 py-1.5 rounded-lg
                    border border-white/8 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                  <button className="flex items-center gap-1 text-[10px] px-2 py-1.5 rounded-lg
                    border border-white/8 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <RefreshCw className="w-3 h-3" />
                    Regenerate Image
                  </button>
                  <button className="flex items-center gap-1 text-[10px] px-2 py-1.5 rounded-lg
                    border border-white/8 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <Palette className="w-3 h-3" />
                    Change Style
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── PostPreview ────────────────────────────────────────────────────────
function PostPreview({ text, platform, hashtags }: { text: string; platform: TabKey; hashtags: string[] }) {
  const tab = tabs.find(t => t.key === platform)!

  if (platform === "twitter") {
    return (
      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">Y</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-white font-semibold text-xs">Your Company</p>
              <p className="text-slate-600 text-[10px]">@company · now</p>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed line-clamp-5">{text}</p>
            {hashtags.length > 0 && (
              <p className="text-[#94a3b8] text-xs mt-1">{hashtags.slice(0, 3).map(t => `#${t}`).join(" ")}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-slate-600 text-[10px]">
              <button className="flex items-center gap-1 hover:text-slate-400"><MessageSquare className="w-3 h-3" /> Reply</button>
              <button className="flex items-center gap-1 hover:text-slate-400"><Share2 className="w-3 h-3" /> Repost</button>
              <button className="flex items-center gap-1 hover:text-slate-400"><ThumbsUp className="w-3 h-3" /> Like</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (platform === "instagram" || platform === "reels") {
    return (
      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center text-white font-bold text-[10px]">Y</div>
          <p className="text-white font-semibold text-xs flex-1">yourcompany</p>
          <button className="text-[#E1306C] font-semibold text-[10px]">Follow</button>
        </div>
        <p className="text-slate-300 text-xs leading-relaxed line-clamp-4">{text}</p>
        {hashtags.length > 0 && (
          <p className="text-[#E1306C] text-[10px] mt-1">{hashtags.slice(0, 3).map(t => `#${t}`).join(" ")}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-slate-600 text-[10px]">
          <button className="flex items-center gap-1 hover:text-slate-400"><ThumbsUp className="w-3 h-3" /></button>
          <button className="flex items-center gap-1 hover:text-slate-400"><MessageSquare className="w-3 h-3" /></button>
          <button className="flex items-center gap-1 hover:text-slate-400"><Share2 className="w-3 h-3" /></button>
        </div>
      </div>
    )
  }

  // LinkedIn / Carousels / CTAs
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-8 h-8 rounded-full bg-[#0077B5] flex items-center justify-center text-white font-bold text-xs">Y</div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-xs">Your Company</p>
          <p className="text-slate-600 text-[10px]">Now · 🌐</p>
        </div>
        <button className="text-slate-600 text-base leading-none">···</button>
      </div>
      <p className="text-slate-300 text-xs leading-relaxed line-clamp-5">{text}</p>
      {hashtags.length > 0 && (
        <p className="text-[#0077B5] text-xs mt-1.5">{hashtags.slice(0, 4).map(t => `#${t}`).join(" ")}</p>
      )}
      <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-white/5 text-slate-600 text-[10px]">
        <button className="flex items-center gap-1 hover:text-slate-400"><ThumbsUp className="w-3 h-3" /> Like</button>
        <button className="flex items-center gap-1 hover:text-slate-400"><MessageSquare className="w-3 h-3" /> Comment</button>
        <button className="flex items-center gap-1 hover:text-slate-400"><Share2 className="w-3 h-3" /> Repost</button>
        <button className="flex items-center gap-1 hover:text-slate-400"><Send className="w-3 h-3" /> Send</button>
      </div>
    </div>
  )
}

// ── ScheduleSidebar ────────────────────────────────────────────────────
function ScheduleSidebar({ selectedText, platform, hashtags }: {
  selectedText: string; platform: TabKey; hashtags: string[]
}) {
  const [schedPlatform, setSchedPlatform] = useState<TabKey>(platform)
  const [date,     setDate]     = useState(getTodayStr())
  const [time,     setTime]     = useState("10:00")
  const [timezone, setTimezone] = useState("(GMT+05:30) Asia/Kolkata")
  const [loading,  setLoading]  = useState(false)
  const [scheduled, setScheduled] = useState(false)

  useEffect(() => { setSchedPlatform(platform) }, [platform])

  const currentTab = tabs.find(t => t.key === schedPlatform)!

  const handleSchedule = async () => {
    if (!selectedText || loading) return
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const dt = new Date(`${date}T${time}:00`)
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ platform: schedPlatform, content: selectedText, scheduled_at: dt.toISOString() }),
      })
      if (res.ok) { setScheduled(true); setTimeout(() => setScheduled(false), 3000) }
    } catch {}
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* Schedule panel */}
      <div className="glass-card rounded-2xl p-5 border border-white/[0.06]">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-7 h-7 rounded-lg bg-[#F7BE4D]/15 flex items-center justify-center flex-shrink-0">
            <CalendarClock className="w-3.5 h-3.5 text-[#F7BE4D]" />
          </div>
          <h3 className="text-sm font-bold text-white">Schedule Post</h3>
        </div>

        <div className="space-y-3.5">
          {/* Platform */}
          <div>
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5 block">Platform</label>
            <div className="relative">
              <select
                value={schedPlatform}
                onChange={e => setSchedPlatform(e.target.value as TabKey)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm
                  text-white appearance-none outline-none focus:border-[#F7BE4D]/30 cursor-pointer">
                {tabs.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm">
                {currentTab.icon}
              </div>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5 block">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={getTodayStr()}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white
                outline-none focus:border-[#F7BE4D]/30 [color-scheme:dark] cursor-pointer" />
          </div>

          {/* Time */}
          <div>
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5 block">Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white
                outline-none focus:border-[#F7BE4D]/30 [color-scheme:dark] cursor-pointer" />
          </div>

          {/* Timezone */}
          <div>
            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5 block">Timezone</label>
            <div className="relative">
              <select value={timezone} onChange={e => setTimezone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm
                  text-white appearance-none outline-none focus:border-[#F7BE4D]/30 cursor-pointer">
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Schedule button */}
        <button
          onClick={handleSchedule}
          disabled={!selectedText || loading || scheduled}
          className="w-full mt-5 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          style={{
            background: scheduled
              ? "linear-gradient(135deg, #34d399 0%, #059669 100%)"
              : "linear-gradient(135deg, #F7BE4D 0%, #f0a800 100%)",
            color: "#050816",
            boxShadow: scheduled ? "0 0 20px rgba(52,211,153,0.25)" : "0 0 20px rgba(247,190,77,0.3)",
          }}>
          {loading ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Scheduling...</>
          ) : scheduled ? (
            <><CheckCircle2 className="w-4 h-4" /> Scheduled!</>
          ) : "Schedule"}
        </button>
        <p className="text-center text-[10px] text-slate-600 mt-2">
          {scheduled ? "Post added to your calendar." : "This post will be scheduled"}
        </p>
      </div>

      {/* Post preview */}
      <div className="glass-card rounded-2xl p-5 border border-white/[0.06]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">{currentTab.icon}</span>
          <h3 className="text-sm font-bold text-white">Post Preview</h3>
        </div>
        {selectedText ? (
          <PostPreview text={selectedText} platform={schedPlatform} hashtags={hashtags} />
        ) : (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
            <p className="text-xs text-slate-600">Click any post to preview it here</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── EmptyState ─────────────────────────────────────────────────────────
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
      className="glass-card rounded-2xl p-14 text-center">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="w-20 h-20 rounded-2xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20
          flex items-center justify-center float">
          <Repeat2 className="w-9 h-9 text-[#F7BE4D]" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Turn any content into 24 posts</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        Paste a blog post, YouTube transcript, newsletter, or any long-form content —
        get a full cross-platform content pack in seconds.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-lg mx-auto mb-8">
        {platforms.map(p => (
          <div key={p.label} className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl border"
            style={{ background: `${p.color}10`, borderColor: `${p.color}20`, color: p.color }}>
            <span>{p.icon}</span><span>{p.label}</span>
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

// ── Main Page ──────────────────────────────────────────────────────────
export default function RepurposePage() {
  const [content,  setContent]  = useState("")
  const [tone,     setTone]     = useState("engaging")
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState<RepurposeResult | null>(null)
  const [error,    setError]    = useState("")
  const [activeTab, setActiveTab] = useState<TabKey>("linkedin")
  const [streamDone, setStreamDone] = useState<string[]>([])
  const [selectedText, setSelectedText] = useState("")
  const [showInput, setShowInput] = useState(true)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

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

  const handleGenerate = async () => {
    if (!content.trim()) { setError("Paste your blog or article above"); return }
    setLoading(true)
    setError("")
    setResult(null)
    analytics.blogToPostsUsed(content.trim().startsWith("http"))

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ content, tone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setResult(data.data)
      setActiveTab("linkedin")
      setShowInput(false)
      if (data.data?.linkedin?.[0]) setSelectedText(data.data.linkedin[0])
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
    <div className="space-y-5 relative">
      {/* Ambient glows */}
      <div className="fixed top-0 left-60 right-0 h-screen pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
          style={{ background: "radial-gradient(ellipse at top, rgba(247,190,77,0.07) 0%, transparent 55%)" }} />
      </div>

      {/* ── Input panel ──────────────────────────────────────────── */}
      <AnimatePresence>
        {(!result || showInput) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="glass-hero rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#F7BE4D]/[0.06] rounded-full blur-3xl pointer-events-none" />
            <div className="grid-bg absolute inset-0 opacity-25 pointer-events-none rounded-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F7BE4D]/15 border border-[#F7BE4D]/25 flex items-center justify-center">
                    <Repeat2 className="w-5 h-5 text-[#F7BE4D]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Blog → 24 Posts</h2>
                    <p className="text-[11px] text-slate-500">Paste any content — get a full cross-platform content pack</p>
                  </div>
                </div>
                {result && (
                  <button onClick={() => setShowInput(false)}
                    className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                    <ChevronUp className="w-3.5 h-3.5" />
                    Collapse
                  </button>
                )}
              </div>

              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Paste your blog post, article, YouTube transcript, newsletter, or any long-form content here..."
                rows={6}
                className="input-premium w-full px-4 py-3 text-sm mb-4 resize-none leading-relaxed"
              />

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

              <button onClick={handleGenerate} disabled={loading}
                className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2.5">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span key="l" className="flex items-center gap-2.5"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating 24 posts...
                    </motion.span>
                  ) : (
                    <motion.span key="i" className="flex items-center gap-2.5"
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                      <Sparkles className="w-4 h-4" />
                      Generate 24 Posts
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Collapsed source bar ─────────────────────────────────── */}
      {result && !showInput && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center justify-between glass-sm rounded-xl px-4 py-2.5 border border-white/8">
          <span className="text-xs text-slate-500 truncate max-w-sm">
            Source: {content.slice(0, 70)}{content.length > 70 ? "..." : ""}
          </span>
          <button onClick={() => setShowInput(true)}
            className="text-xs text-[#F7BE4D] hover:text-[#ffd166] transition-colors flex items-center gap-1 ml-3 flex-shrink-0">
            Edit source →
          </button>
        </motion.div>
      )}

      {/* ── Streaming loader ──────────────────────────────────────── */}
      <AnimatePresence>
        {loading && <StreamingLoader completedKeys={streamDone} />}
      </AnimatePresence>

      {/* ── Results: two-column layout ────────────────────────────── */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-5 items-start"
          >
            {/* ── Main content area ── */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* Stats bar */}
              <div className="glass-card rounded-xl px-4 py-3 flex items-center justify-between border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #34d399" }} />
                  <span className="text-sm font-semibold text-white">{totalPosts} posts ready</span>
                  <span className="text-xs text-slate-600">{result.hashtags.length} hashtags</span>
                </div>
                <div className="flex items-center gap-2">
                  <CopyBtn text={activeItems.join("\n\n")} variant="solid" solidLabel="Copy All" />
                  <button onClick={handleGenerate}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/8
                      text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <RefreshCw className="w-3 h-3" />
                    Regenerate All
                  </button>
                </div>
              </div>

              {/* Tabs + cards */}
              <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
                {/* Platform tabs */}
                <div className="flex overflow-x-auto border-b border-white/[0.06]" style={{ scrollbarWidth: "none" }}>
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key)
                        if (result[tab.key]?.[0]) setSelectedText(result[tab.key][0])
                      }}
                      className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap
                        transition-all relative flex-shrink-0 ${
                        activeTab === tab.key ? "text-white" : "text-slate-500 hover:text-slate-300"
                      }`}
                      style={activeTab === tab.key ? { color: tab.color } : {}}>
                      <span>{tab.icon}</span>
                      {tab.label}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          background: activeTab === tab.key ? `${tab.color}20` : "rgba(255,255,255,0.05)",
                          color: activeTab === tab.key ? tab.color : "#64748b",
                        }}>
                        {result[tab.key]?.length ?? 0}
                      </span>
                      {activeTab === tab.key && (
                        <motion.div layoutId="repTabLine"
                          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                          style={{ background: tab.color }} />
                      )}
                    </button>
                  ))}
                </div>

                {/* Post cards */}
                <div className="p-4 space-y-3">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3">
                      {activeItems.map((text, i) => (
                        <PostCard
                          key={i}
                          text={text}
                          index={i}
                          color={activeTabConfig.color}
                          platform={activeTab}
                          hashtags={result!.hashtags}
                          onSelect={setSelectedText}
                          isSelected={selectedText === text}
                        />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Hashtag section */}
                {result.hashtags.length > 0 && (
                  <div className="px-5 pb-5 pt-2 border-t border-white/[0.05]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5 text-[#F7BE4D]" />
                        <span className="text-xs font-semibold text-white">Hashtags</span>
                        <span className="text-[10px] text-slate-600">{result.hashtags.length} tags</span>
                      </div>
                      <CopyBtn text={result.hashtags.map(h => `#${h}`).join(" ")} variant="solid" solidLabel="Copy All" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.map(tag => (
                        <motion.span key={tag}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => navigator.clipboard.writeText(`#${tag}`)}
                          className="text-xs px-2.5 py-1 rounded-lg cursor-pointer transition-all hover:scale-105 active:scale-95 select-none"
                          style={{ background: "rgba(247,190,77,0.08)", border: "1px solid rgba(247,190,77,0.15)", color: "#F7BE4D" }}>
                          #{tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right sidebar ── */}
            <div className="w-[300px] flex-shrink-0 sticky top-5">
              <ScheduleSidebar
                selectedText={selectedText}
                platform={activeTab}
                hashtags={result.hashtags}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ───────────────────────────────────────────── */}
      {!result && !loading && <EmptyState />}
    </div>
  )
}
