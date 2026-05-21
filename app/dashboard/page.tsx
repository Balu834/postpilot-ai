"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Wand2, CalendarClock, BarChart3, TrendingUp,
  ArrowRight, Sparkles, Clock, CheckCircle2,
  Repeat2, History, Zap, FolderOpen, Circle,
  Copy, CheckCheck, Activity,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

/* ─── Types ──────────────────────────────────────────────────────── */

interface NicheData { color: string; badge: string; prompts: string[]; tip: string }
interface UserPrefs  { platforms: string[]; niche: string; tone: string; goal: string }
interface Stats      { generated: number; scheduled: number; published: number }
interface RecentPost { id: string; platform: string; content: string; time: string; status: string }

/* ─── Niche data ─────────────────────────────────────────────────── */

const NICHE_DATA: Record<string, NicheData> = {
  business: {
    color: "#F7BE4D", badge: "💼 Business / Finance",
    prompts: [
      "3 mistakes that killed my startup (and what I learned)",
      "How we went from ₹0 to ₹1L MRR in 90 days",
      "The one email strategy that grew our B2B sales by 40%",
    ],
    tip: "LinkedIn performs 3× better for B2B founders. Start there.",
  },
  fitness: {
    color: "#34d399", badge: "💪 Fitness / Health",
    prompts: [
      "Why 90% of beginners quit after 3 weeks (and how to avoid it)",
      "The morning routine that completely transformed my energy",
      "3 exercises you're doing wrong — fix these today",
    ],
    tip: "Reels and carousels drive the most fitness engagement on Instagram.",
  },
  tech: {
    color: "#818cf8", badge: "⚡ Tech / SaaS",
    prompts: [
      "The AI tools we use daily at our startup (honest review)",
      "Why we shipped in public and what actually happened",
      "5 developer tools that 10x'd our team's output",
    ],
    tip: "Twitter threads + LinkedIn posts is the winning combo for founders.",
  },
  personal: {
    color: "#f472b6", badge: "🌟 Personal Brand",
    prompts: [
      "The uncomfortable truth about growing a personal brand",
      "My content creation process that saves 10 hours a week",
      "How I gained 5K followers without posting every single day",
    ],
    tip: "Consistency over perfection. 5 posts a week beats 1 viral post.",
  },
  travel: {
    color: "#38bdf8", badge: "✈️ Travel",
    prompts: [
      "How I work remotely from Bali for ₹50K/month",
      "Hidden gems in Southeast Asia that most tourists miss",
      "My complete packing list for 30 days across 5 countries",
    ],
    tip: "Instagram Reels and YouTube Shorts dominate travel content.",
  },
  food: {
    color: "#fb923c", badge: "🍜 Food & Recipes",
    prompts: [
      "5-minute breakfast ideas that actually taste incredible",
      "The secret ingredient in my grandmother's classic recipe",
      "How I meal prep for an entire week in just 2 hours",
    ],
    tip: "Short-form video of the cooking process drives the most saves.",
  },
  fashion: {
    color: "#e879f9", badge: "👗 Fashion / Beauty",
    prompts: [
      "5 wardrobe essentials that work for literally every occasion",
      "How to build a capsule wardrobe on a budget",
      "The styling mistake making you look less put-together",
    ],
    tip: "Pinterest + Instagram is the winning formula for fashion creators.",
  },
  education: {
    color: "#a78bfa", badge: "📚 Education",
    prompts: [
      "The learning method that completely changed how I retain knowledge",
      "How to learn any skill in 30 days (my exact framework)",
      "3 study habits that top students consistently use",
    ],
    tip: "Carousels with clear steps consistently get saved and shared.",
  },
}

/* ─── Mini Sparkline (SVG) ───────────────────────────────────────── */

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  const w = 64, h = 24
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  })
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  )
}

/* ─── Animated counter ──────────────────────────────────────────── */

function Counter({ value, loading }: { value: number; loading: boolean }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (loading || value === 0) { setDisplay(0); return }
    let start = 0
    const steps = 40
    const increment = value / steps
    ref.current = setInterval(() => {
      start += increment
      if (start >= value) { setDisplay(value); clearInterval(ref.current!); return }
      setDisplay(Math.floor(start))
    }, 800 / steps)
    return () => clearInterval(ref.current!)
  }, [value, loading])

  if (loading) return <div className="skeleton w-14 h-8 rounded-lg" />
  return <span className="tabular-nums">{display}</span>
}

/* ─── Getting Started Card ───────────────────────────────────────── */

const ONBOARDING_STEPS = [
  { id: "generate",  label: "Generate your first campaign",  desc: "Paste any idea — get 5 platform posts in 60s", href: "/generate",   icon: Wand2,        color: "#F7BE4D" },
  { id: "workspace", label: "Save content to workspace",     desc: "Organise your best posts into campaigns",      href: "/workspace",  icon: FolderOpen,   color: "#818cf8" },
  { id: "schedule",  label: "Schedule your posts",           desc: "Plan your calendar weeks in advance",          href: "/schedule",   icon: CalendarClock, color: "#34d399" },
  { id: "analytics", label: "Track your analytics",          desc: "See growth, reach and engagement over time",   href: "/analytics",  icon: BarChart3,    color: "#f472b6" },
]

function GettingStartedCard({ stats, userId }: { stats: Stats; userId: string }) {
  const [dismissed, setDismissed] = useState(false)

  const getCompleted = () => {
    const done = new Set<string>()
    if (stats.generated > 0) done.add("generate")
    if (stats.scheduled > 0 || stats.published > 0) done.add("schedule")
    try {
      if (localStorage.getItem(`postpilot_workspace_saved_${userId}`)) done.add("workspace")
      if (localStorage.getItem(`postpilot_analytics_visited_${userId}`)) done.add("analytics")
    } catch {}
    return done
  }

  const completed  = getCompleted()
  const totalDone  = completed.size
  const allDone    = totalDone === ONBOARDING_STEPS.length
  const pct        = Math.round((totalDone / ONBOARDING_STEPS.length) * 100)

  useEffect(() => {
    try {
      if (localStorage.getItem(`postpilot_gs_dismissed_${userId}`)) setDismissed(true)
    } catch {}
  }, [userId])

  if (dismissed || allDone) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: "linear-gradient(145deg, #0d1526 0%, #080c1a 100%)",
        border: "1px solid rgba(247,190,77,0.14)",
      }}
    >
      {/* Ambient glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(247,190,77,0.08), transparent 70%)", filter: "blur(30px)" }} />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F7BE4D]/12 border border-[#F7BE4D]/22 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#F7BE4D]" fill="currentColor" strokeWidth={0} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Getting Started</h3>
              <p className="text-[11px] text-slate-500">{totalDone} of {ONBOARDING_STEPS.length} steps completed</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #F7BE4D, #ffd97d)" }}
                />
              </div>
              <span className="text-[11px] text-[#F7BE4D] font-bold tabular-nums">{pct}%</span>
            </div>
            <button
              onClick={() => {
                setDismissed(true)
                try { localStorage.setItem(`postpilot_gs_dismissed_${userId}`, "1") } catch {}
              }}
              className="text-slate-600 hover:text-slate-400 transition-colors text-xs px-1.5">
              ✕
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {ONBOARDING_STEPS.map((step, i) => {
            const done       = completed.has(step.id)
            const isCurrent  = !done && !ONBOARDING_STEPS.slice(0, i).every(s => completed.has(s.id)) === false
            const isNext     = !done && ONBOARDING_STEPS.slice(0, i).every(s => completed.has(s.id))
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
              >
                <Link href={step.href}>
                  <motion.div
                    whileHover={{ y: -2, backgroundColor: done ? undefined : `${step.color}0d` }}
                    transition={{ duration: 0.15 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl cursor-pointer transition-all duration-200 group"
                    style={{
                      background: done ? `${step.color}08` : isNext ? `${step.color}06` : "rgba(255,255,255,0.02)",
                      border: done ? `1px solid ${step.color}25` : isNext ? `1px solid ${step.color}18` : "1px solid rgba(255,255,255,0.05)",
                      boxShadow: isNext ? `0 0 20px ${step.color}10` : "none",
                    }}
                  >
                    {/* State icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {done ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: step.color }}>
                          <CheckCircle2 className="w-3 h-3 text-[#050816]" strokeWidth={3} />
                        </motion.div>
                      ) : isNext ? (
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: step.color }}>
                          <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 rounded-full"
                            style={{ background: step.color }} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-white/10" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold leading-snug ${done ? "text-slate-400 line-through" : isNext ? "text-white" : "text-slate-500"}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>

                    {isNext && (
                      <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: step.color }} />
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Activity Feed ──────────────────────────────────────────────── */

const DEMO_ACTIVITY = [
  { icon: "💼", action: "Generated LinkedIn campaign",    time: "2m ago",  color: "#0A66C2" },
  { icon: "📸", action: "Scheduled Instagram carousel",  time: "18m ago", color: "#E1306C" },
  { icon: "𝕏",  action: "Copied Twitter/X thread",       time: "1h ago",  color: "#94a3b8" },
  { icon: "🔥", action: "Generated 5-post content pack", time: "3h ago",  color: "#F7BE4D" },
]

interface ActivityItem { action: string; platform: string | null; created_at: string }

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const PLATFORM_ICON: Record<string, string> = {
  instagram: "📸", linkedin: "💼", twitter: "𝕏", facebook: "📘", youtube: "▶",
}
const PLATFORM_COLOR: Record<string, string> = {
  instagram: "#E1306C", linkedin: "#0A66C2", twitter: "#94a3b8", facebook: "#1877F2", youtube: "#FF0000",
}

function ActivityFeed({ items, isDemo }: { items: ActivityItem[]; isDemo: boolean }) {
  if (isDemo) {
    return (
      <div className="space-y-2">
        {DEMO_ACTIVITY.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.06 }} className="flex items-center gap-2.5 py-1.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
              style={{ background: `${item.color}15`, border: `1px solid ${item.color}20` }}>
              <span className="text-[11px] leading-none">{item.icon}</span>
            </div>
            <p className="text-[11px] text-slate-400 flex-1 leading-relaxed">{item.action}</p>
            <span className="text-[10px] text-slate-600 flex-shrink-0">{item.time}</span>
          </motion.div>
        ))}
        <p className="text-[10px] text-slate-700 pt-1 border-t border-white/[0.04]">
          Sample activity · yours will appear here
        </p>
      </div>
    )
  }

  if (items.length === 0) {
    return <p className="text-[11px] text-slate-600 py-1">No activity yet — start generating!</p>
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const color = item.platform ? (PLATFORM_COLOR[item.platform] ?? "#F7BE4D") : "#F7BE4D"
        const icon  = item.platform ? (PLATFORM_ICON[item.platform]  ?? "📝") : "✨"
        return (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.06 }} className="flex items-center gap-2.5 py-1.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
              style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
              <span className="text-[11px] leading-none">{icon}</span>
            </div>
            <p className="text-[11px] text-slate-400 flex-1 leading-relaxed">{item.action}</p>
            <span className="text-[10px] text-slate-600 flex-shrink-0">{timeAgo(item.created_at)}</span>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ─── Demo post card with engagement ────────────────────────────── */

interface DemoPost {
  platform: "instagram" | "linkedin" | "twitter"
  content: string
  time: string
  status: "published" | "pending"
  reach: string
  engagement: string
  trend: string
}

const DEMO_POSTS: DemoPost[] = [
  {
    platform: "linkedin",
    content: "AI won't replace creators. Creators using AI will replace creators who don't. Here are 5 tools changing content creation in 2026 👇",
    time: "2h ago",
    status: "published",
    reach: "6.4K",
    engagement: "3.2%",
    trend: "+18%",
  },
  {
    platform: "instagram",
    content: "I tested 12 AI tools for 30 days. Here's the one that completely changed my workflow — and it's not what most people recommend. 🧵",
    time: "Yesterday",
    status: "published",
    reach: "8.1K",
    engagement: "4.7%",
    trend: "+24%",
  },
  {
    platform: "twitter",
    content: "Hot take: manual social posting is dead. AI-generated content that converts > 3hrs writing captions. Here's my stack 🔥",
    time: "Fri 2:00 PM",
    status: "pending",
    reach: "12.8K",
    engagement: "2.9%",
    trend: "+12%",
  },
]

const platformColors: Record<string, string> = { instagram: "#E1306C", linkedin: "#0077B5", twitter: "#1DA1F2" }
const platformIcons:  Record<string, string>  = { instagram: "📸", linkedin: "💼", twitter: "𝕏" }

function DemoPostCard({ post, index }: { post: DemoPost; index: number }) {
  const [copied, setCopied] = useState(false)
  const color = platformColors[post.platform]
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.08 }}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
      className="flex items-start gap-3 p-3 rounded-xl transition-all group"
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm mt-0.5"
        style={{ background: `${color}18` }}>
        {platformIcons[post.platform]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-slate-300 capitalize">{post.platform}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            post.status === "published" ? "bg-emerald-500/12 text-emerald-400" : "bg-[#F7BE4D]/12 text-[#F7BE4D]"
          }`}>
            {post.status}
          </span>
          {post.status === "published" && (
            <span className="text-[10px] text-emerald-400 font-semibold ml-auto">{post.trend}</span>
          )}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{post.content}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] text-slate-600">{post.time}</span>
          {post.status === "published" && (
            <>
              <span className="text-[10px] text-slate-600">👁 {post.reach} reach</span>
              <span className="text-[10px] text-slate-600">❤️ {post.engagement} eng.</span>
            </>
          )}
        </div>
      </div>
      <motion.button
        onClick={() => { navigator.clipboard.writeText(post.content); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg"
        style={{ color: copied ? "#34d399" : "#475569" }}>
        {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </motion.button>
    </motion.div>
  )
}

/* ─── AI Suggestions widget ──────────────────────────────────────── */

function AISuggestions({ prefs }: { prefs: UserPrefs | null }) {
  const router = useRouter()
  if (!prefs?.niche || !NICHE_DATA[prefs.niche]) return null

  const data    = NICHE_DATA[prefs.niche]
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="rounded-2xl p-5 mb-5 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${data.color}0c 0%, rgba(8,12,26,0.6) 100%)`,
        border: `1px solid ${data.color}22`,
      }}
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${data.color}15, transparent 70%)`, filter: "blur(30px)" }} />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: data.color }} />
              <span className="text-xs font-bold text-white">AI Suggestions for You</span>
            </div>
            <div className="text-[11px] px-2 py-0.5 rounded-full inline-block"
              style={{ background: `${data.color}15`, color: data.color }}>
              {data.badge}
            </div>
          </div>
          <Link href="/templates" className="text-[11px] font-medium transition-colors hover:opacity-80"
            style={{ color: data.color }}>
            All templates →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-4">
          {data.prompts.map((prompt, i) => (
            <motion.button
              key={i}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
              onClick={() => router.push(`/generate?topic=${encodeURIComponent(prompt)}&tone=${prefs.tone || "professional"}`)}
              className="text-left p-3.5 rounded-xl transition-all group"
              style={{
                background: hovered === i ? `${data.color}12` : "rgba(255,255,255,0.025)",
                border: hovered === i ? `1px solid ${data.color}35` : "1px solid rgba(255,255,255,0.07)",
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <p className="text-xs text-slate-300 leading-relaxed mb-2">{prompt}</p>
              <div className="flex items-center gap-1" style={{ color: data.color }}>
                <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Generate this →
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-sm flex-shrink-0">💡</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            <span className="text-slate-400 font-medium">Pro tip: </span>
            {data.tip}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Hero generator ─────────────────────────────────────────────── */

const PLATFORMS = [
  { id: "instagram", icon: "📸", label: "Instagram", color: "#E1306C" },
  { id: "linkedin",  icon: "💼", label: "LinkedIn",  color: "#0A66C2" },
  { id: "twitter",   icon: "𝕏",  label: "Twitter/X", color: "#94a3b8" },
  { id: "facebook",  icon: "📘", label: "Facebook",  color: "#1877F2" },
  { id: "youtube",   icon: "▶",  label: "YouTube",   color: "#FF0000" },
]

const QUICK_SUGGESTIONS = [
  "LinkedIn growth strategy for startups",
  "AI marketing trends in 2026",
  "Instagram content ideas for creators",
  "How to go viral on Twitter/X",
  "5 productivity habits for founders",
]

const PARTICLES = [
  { x: "12%",  y: "22%", color: "#F7BE4D", dur: 3.2, delay: 0    },
  { x: "28%",  y: "65%", color: "#818cf8", dur: 4.0, delay: 0.6  },
  { x: "48%",  y: "18%", color: "#F7BE4D", dur: 3.6, delay: 1.1  },
  { x: "65%",  y: "72%", color: "#34d399", dur: 4.4, delay: 0.3  },
  { x: "80%",  y: "30%", color: "#818cf8", dur: 3.0, delay: 0.9  },
  { x: "90%",  y: "60%", color: "#F7BE4D", dur: 3.8, delay: 1.5  },
]

function HeroGenerate({ prefs, brandName }: { prefs: UserPrefs | null; brandName?: string }) {
  const router = useRouter()
  const [topic,       setTopic]       = useState("")
  const [focused,     setFocused]     = useState(false)
  const [hoveredChip, setHoveredChip] = useState<string | null>(null)

  const brand = brandName?.trim() || null

  const placeholder = (() => {
    if (brand) {
      const nicheExamples: Record<string, string> = {
        tech:      `e.g. "How ${brand} is building the future of AI in 2026"…`,
        business:  `e.g. "How ${brand} went from 0 to first 100 customers"…`,
        fitness:   `e.g. "Why ${brand}'s approach to fitness actually works"…`,
        personal:  `e.g. "The story behind ${brand} — what nobody tells you"…`,
        travel:    `e.g. "How ${brand} is redefining travel experiences in 2026"…`,
        food:      `e.g. "The secret behind ${brand}'s most-loved recipe"…`,
        fashion:   `e.g. "How ${brand} is changing the way people dress in 2026"…`,
        education: `e.g. "What makes ${brand}'s learning approach different"…`,
      }
      return (prefs?.niche && nicheExamples[prefs.niche])
        ? nicheExamples[prefs.niche]
        : `e.g. "How ${brand} is reshaping the industry in 2026"…`
    }
    if (!prefs?.niche) return `e.g. "How AI is reshaping content marketing in 2026"…`
    const examples: Record<string, string> = {
      tech:      `e.g. "Why we ditched Notion for Linear and never looked back"…`,
      fitness:   `e.g. "The 5-minute morning routine that changed my energy"…`,
      business:  `e.g. "How I closed our first ₹10L client with cold DMs"…`,
      personal:  `e.g. "The brutal truth about building a personal brand in 2026"…`,
      travel:    `e.g. "How I spent a month in Japan for under ₹80K"…`,
      food:      `e.g. "My 3-ingredient pasta that tastes like it took hours"…`,
      fashion:   `e.g. "5 outfits I wear on repeat every single week"…`,
      education: `e.g. "The Feynman technique: why it works and how to use it"…`,
    }
    return examples[prefs.niche] ?? `e.g. "How AI is reshaping content marketing in 2026"…`
  })()

  const canGenerate = topic.trim().length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl overflow-hidden mb-6"
      style={{
        background: "linear-gradient(145deg, #0d1526 0%, #080c1a 55%, #0c1020 100%)",
        border: "1px solid rgba(247,190,77,0.13)",
        boxShadow: "0 0 80px rgba(247,190,77,0.04), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Deep layered glows */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(247,190,77,0.07) 0%, transparent 65%)", filter: "blur(50px)" }} />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)", filter: "blur(40px)" }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(105deg, transparent 40%, rgba(247,190,77,0.025) 50%, transparent 60%)" }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
      />

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-[3px] h-[3px] rounded-full pointer-events-none"
          style={{ background: p.color, left: p.x, top: p.y, opacity: 0.4 }}
          animate={{ y: [-8, 8, -8], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      <div className="relative z-10 p-8 md:p-10">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
          style={{ background: "rgba(247,190,77,0.07)", border: "1px solid rgba(247,190,77,0.22)", backdropFilter: "blur(10px)" }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-[#F7BE4D]"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          <span className="text-[11px] text-[#F7BE4D] font-bold tracking-widest uppercase">AI Content Engine</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-[2rem] md:text-[2.6rem] font-extrabold text-white mb-3 leading-[1.08] tracking-tight"
        >
          Generate{" "}
          <motion.span
            animate={{ filter: ["drop-shadow(0 0 14px rgba(247,190,77,0.3))", "drop-shadow(0 0 28px rgba(247,190,77,0.55))", "drop-shadow(0 0 14px rgba(247,190,77,0.3))"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: "linear-gradient(135deg, #F7BE4D 0%, #ffd97d 40%, #F7BE4D 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              display: "inline-block",
            }}
          >
            30 Days
          </motion.span>{" "}
          of Content
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.5 }}
          className="text-slate-400 text-[15px] mb-8 max-w-xl leading-relaxed"
        >
          Drop a topic, blog post, or idea — get LinkedIn, Twitter, and Instagram posts in seconds.
        </motion.p>

        {/* Input + Button */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 max-w-2xl"
        >
          <div className="relative flex-1">
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={e => e.key === "Enter" && canGenerate && router.push(`/generate?topic=${encodeURIComponent(topic.trim())}`)}
              placeholder={placeholder}
              className="w-full px-5 py-[14px] text-sm text-white rounded-2xl outline-none transition-all duration-300 placeholder:text-slate-600"
              style={{
                background: focused ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
                border: focused ? "1px solid rgba(247,190,77,0.45)" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: focused ? "0 0 0 3px rgba(247,190,77,0.09), 0 0 28px rgba(247,190,77,0.08)" : "none",
                backdropFilter: "blur(10px)",
              }}
            />
          </div>

          <motion.button
            onClick={() => canGenerate && router.push(`/generate?topic=${encodeURIComponent(topic.trim())}${prefs?.tone ? `&tone=${prefs.tone}` : ""}`)}
            disabled={!canGenerate}
            whileHover={canGenerate ? { scale: 1.04, y: -2 } : {}}
            whileTap={canGenerate ? { scale: 0.96 } : {}}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="flex items-center justify-center gap-2 px-7 py-[14px] text-sm font-bold rounded-2xl transition-all duration-300 whitespace-nowrap relative overflow-hidden"
            style={{
              background: canGenerate ? "linear-gradient(135deg, #F7BE4D 0%, #ffd97d 100%)" : "rgba(255,255,255,0.05)",
              color: canGenerate ? "#050816" : "#334155",
              boxShadow: canGenerate ? "0 0 30px rgba(247,190,77,0.4), 0 4px 20px rgba(247,190,77,0.25), inset 0 1px 0 rgba(255,255,255,0.25)" : "none",
              cursor: canGenerate ? "pointer" : "not-allowed",
            }}
          >
            {canGenerate && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
              />
            )}
            <Sparkles className="w-4 h-4 relative" />
            <span className="relative">Generate</span>
          </motion.button>
        </motion.div>

        {/* Quick suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mt-4"
        >
          <p className="text-[11px] text-slate-600 mb-2 font-medium">Try:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_SUGGESTIONS.map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.42 + i * 0.05 }}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setTopic(s)
                  router.push(`/generate?topic=${encodeURIComponent(s)}${prefs?.tone ? `&tone=${prefs.tone}` : ""}`)
                }}
                className="text-[11px] px-3 py-1.5 rounded-xl text-slate-500 hover:text-[#F7BE4D] transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {s}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Platform chips */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
          className="flex flex-wrap items-center gap-2 mt-5"
        >
          <span className="text-[11px] text-slate-600 font-medium mr-1">Generates for:</span>
          {PLATFORMS.map((p, i) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.52 + i * 0.06, type: "spring", stiffness: 300, damping: 20 }}
              onHoverStart={() => setHoveredChip(p.id)}
              onHoverEnd={() => setHoveredChip(null)}
              whileHover={{ y: -2, scale: 1.06 }}
              className="flex items-center gap-1.5 text-[11px] px-3 py-[5px] rounded-full font-medium cursor-default select-none"
              style={{
                background: hoveredChip === p.id ? `${p.color}1a` : `${p.color}0d`,
                border: hoveredChip === p.id ? `1px solid ${p.color}55` : `1px solid ${p.color}25`,
                color: p.color,
                boxShadow: hoveredChip === p.id ? `0 0 14px ${p.color}28` : "none",
              }}
            >
              <span className="text-[12px] leading-none">{p.icon}</span>
              {p.label}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ─── Stats cards ────────────────────────────────────────────────── */

const DEMO_SPARKLINES: Record<string, number[]> = {
  generated:  [2, 4, 3, 7, 5, 9, 8],
  scheduled:  [1, 2, 1, 3, 4, 3, 5],
  published:  [0, 1, 2, 1, 3, 2, 4],
  engagement: [18, 22, 19, 27, 24, 31, 28],
}

const statConfigs = [
  { label: "Posts Generated", key: "generated" as const,  icon: Sparkles,    color: "#F7BE4D", change: "Total AI generations",  trend: "+18%", sparkKey: "generated"  },
  { label: "Scheduled",       key: "scheduled" as const,  icon: Clock,        color: "#818cf8", change: "Pending posts",         trend: "+12%", sparkKey: "scheduled"  },
  { label: "Published",       key: "published" as const,  icon: CheckCircle2, color: "#34d399", change: "Successfully sent",      trend: "+24%", sparkKey: "published"  },
  { label: "Engagement",      key: null,                   icon: TrendingUp,   color: "#f472b6", change: "Connect analytics",     trend: "+8%",  sparkKey: "engagement" },
]

const quickActions = [
  { icon: Wand2,        label: "Generate",      desc: "AI captions for any platform",    href: "/generate",  color: "#F7BE4D" },
  { icon: Repeat2,      label: "Blog → Posts",  desc: "Turn articles into 20 posts",     href: "/repurpose", color: "#818cf8" },
  { icon: CalendarClock, label: "Schedule",     desc: "Plan your content calendar",       href: "/schedule",  color: "#34d399" },
  { icon: BarChart3,    label: "Analytics",     desc: "Track growth & engagement",        href: "/analytics", color: "#f472b6" },
  { icon: History,      label: "History",       desc: "View all past generations",        href: "/history",   color: "#94a3b8" },
]

/* ─── Page ──────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [stats,       setStats]       = useState<Stats>({ generated: 0, scheduled: 0, published: 0 })
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [activity,    setActivity]    = useState<ActivityItem[]>([])
  const [loading,     setLoading]     = useState(true)
  const [prefs,       setPrefs]       = useState<UserPrefs | null>(null)
  const [brandName,   setBrandName]   = useState<string>("")
  const [greeting,    setGreeting]    = useState("Welcome back")
  const [userId,      setUserId]      = useState("")

  useEffect(() => {
    const hr = new Date().getHours()
    if (hr < 12) setGreeting("Good morning")
    else if (hr < 17) setGreeting("Good afternoon")
    else setGreeting("Good evening")
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const cached = localStorage.getItem(`postpilot_prefs_${user.id}`)
    if (cached) { try { setPrefs(JSON.parse(cached)) } catch {} }

    const [genRes, scheduledRes, publishedRes, recentRes, profileRes, brandRes, activityRes] = await Promise.all([
      supabase.from("generations").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("scheduled_posts").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "pending"),
      supabase.from("scheduled_posts").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "published"),
      supabase.from("scheduled_posts").select("id,content,platform,scheduled_time,status").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
      supabase.from("users").select("platforms,niche,tone,goal").eq("id", user.id).single(),
      supabase.from("brand_voices").select("brand_name").eq("user_id", user.id).maybeSingle(),
      supabase.from("activity_log").select("action,platform,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    ])

    setStats({ generated: genRes.count || 0, scheduled: scheduledRes.count || 0, published: publishedRes.count || 0 })
    setRecentPosts((recentRes.data || []).map((p: { id: string; platform: string; content: string; scheduled_time: string; status: string }) => ({
      id: p.id, platform: p.platform, content: p.content, status: p.status,
      time: p.status === "pending"
        ? `Scheduled: ${new Date(p.scheduled_time).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
        : new Date(p.scheduled_time).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    })))

    if (profileRes.data) {
      const p = profileRes.data as UserPrefs
      setPrefs(p)
      localStorage.setItem(`postpilot_prefs_${user.id}`, JSON.stringify(p))
    }
    if (brandRes.data?.brand_name) setBrandName(brandRes.data.brand_name)
    setActivity((activityRes.data ?? []) as ActivityItem[])
    setLoading(false)
  }

  const isNewUser     = !loading && stats.generated === 0
  const showDemoPosts = !loading && recentPosts.length === 0

  return (
    <div className="space-y-5 max-w-6xl">

      {/* Personalized greeting */}
      <AnimatePresence>
        {prefs?.niche && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{greeting} —</span>
            <span className="text-[11px] px-2.5 py-1 rounded-full"
              style={{
                background: `${NICHE_DATA[prefs.niche]?.color ?? "#F7BE4D"}15`,
                color: NICHE_DATA[prefs.niche]?.color ?? "#F7BE4D",
                border: `1px solid ${NICHE_DATA[prefs.niche]?.color ?? "#F7BE4D"}25`,
              }}>
              {NICHE_DATA[prefs.niche]?.badge}
            </span>
            <span className="text-sm text-slate-500">creator</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <HeroGenerate prefs={prefs} brandName={brandName} />

      {/* Getting Started card */}
      {userId && <GettingStartedCard stats={stats} userId={userId} />}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statConfigs.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="glass-card card-accent-top rounded-2xl p-4 cursor-default"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{s.label}</p>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}18` }}>
                <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">
              {s.key
                ? <Counter value={stats[s.key]} loading={loading} />
                : <span className="text-slate-600 text-lg">—</span>
              }
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[11px] text-slate-600">{s.change}</p>
              <div className="flex items-center gap-1.5">
                {isNewUser && <MiniSparkline values={DEMO_SPARKLINES[s.sparkKey]} color={s.color} />}
                <span className="text-[10px] font-semibold" style={{ color: s.color }}>{s.trend}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Suggestions (personalized) */}
      <AISuggestions prefs={prefs} />

      {/* Body grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Quick actions + upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-5 space-y-5"
        >
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Quick Actions</h2>
            <div className="space-y-1">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.04)" }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${action.color}15`, border: `1px solid ${action.color}20` }}>
                      <action.icon className="w-3.5 h-3.5" style={{ color: action.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{action.label}</p>
                      <p className="text-[11px] text-slate-600 truncate">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 transition-colors" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="p-4 rounded-2xl relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(247,190,77,0.1) 0%, rgba(247,190,77,0.04) 100%)",
              border: "1px solid rgba(247,190,77,0.18)",
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#F7BE4D]/8 rounded-full blur-xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap className="w-3.5 h-3.5 text-[#F7BE4D]" fill="currentColor" />
                <span className="text-xs font-bold text-white">Blog → 20 Posts</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">Turn any article into a full social media content pack.</p>
              <Link href="/repurpose" className="block w-full text-center text-xs font-bold btn-primary py-2 rounded-lg">
                Try it now →
              </Link>
            </div>
          </motion.div>

          {/* Activity feed */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Activity</h2>
            </div>
            <ActivityFeed items={activity} isDemo={isNewUser && activity.length === 0} />
          </div>
        </motion.div>

        {/* Recent posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-2 glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Recent Posts</h2>
              {showDemoPosts && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-600 border border-white/8">
                  Sample
                </span>
              )}
            </div>
            <Link href="/schedule" className="text-xs text-[#F7BE4D] hover:text-[#ffd166] transition-colors font-medium">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton w-24 h-2.5 rounded" />
                    <div className="skeleton w-full h-2.5 rounded" />
                    <div className="skeleton w-16 h-2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : showDemoPosts ? (
            <>
              <div className="space-y-0.5">
                {DEMO_POSTS.map((post, i) => (
                  <DemoPostCard key={i} post={post} index={i} />
                ))}
              </div>
              <div className="pt-4 mt-1 border-t border-white/[0.04] flex items-center justify-between">
                <p className="text-[11px] text-slate-600">This is a preview — generate your first post to see real content here.</p>
                <Link href="/generate"
                  className="text-xs font-bold text-[#F7BE4D] hover:text-[#ffd166] transition-colors whitespace-nowrap ml-3">
                  Generate now →
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-0.5">
              {recentPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  className="flex items-start gap-3 p-3 rounded-xl transition-colors group cursor-default"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm mt-0.5"
                    style={{ background: `${platformColors[post.platform] || "#818cf8"}18` }}>
                    {platformIcons[post.platform] || "📝"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-300 capitalize">{post.platform}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        post.status === "published" ? "bg-emerald-500/12 text-emerald-400" : "bg-[#F7BE4D]/12 text-[#F7BE4D]"
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate leading-relaxed">{post.content}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{post.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
