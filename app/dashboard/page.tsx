"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Wand2, CalendarClock, BarChart3, TrendingUp,
  ArrowRight, Sparkles, Clock, CheckCircle2,
  Repeat2, History, Zap,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

/* ─── Niche personalization data ──────────────────────────────── */

interface NicheData {
  color: string
  badge: string
  prompts: string[]
  tip: string
}

const NICHE_DATA: Record<string, NicheData> = {
  business: {
    color: "#F7BE4D",
    badge: "💼 Business / Finance",
    prompts: [
      "3 mistakes that killed my startup (and what I learned)",
      "How we went from ₹0 to ₹1L MRR in 90 days",
      "The one email strategy that grew our B2B sales by 40%",
    ],
    tip: "LinkedIn performs 3× better for B2B founders. Start there.",
  },
  fitness: {
    color: "#34d399",
    badge: "💪 Fitness / Health",
    prompts: [
      "Why 90% of beginners quit after 3 weeks (and how to avoid it)",
      "The morning routine that completely transformed my energy",
      "3 exercises you're doing wrong — fix these today",
    ],
    tip: "Reels and carousels drive the most fitness engagement on Instagram.",
  },
  tech: {
    color: "#818cf8",
    badge: "⚡ Tech / SaaS",
    prompts: [
      "The AI tools we use daily at our startup (honest review)",
      "Why we shipped in public and what actually happened",
      "5 developer tools that 10x'd our team's output",
    ],
    tip: "Twitter threads + LinkedIn posts is the winning combo for founders.",
  },
  personal: {
    color: "#f472b6",
    badge: "🌟 Personal Brand",
    prompts: [
      "The uncomfortable truth about growing a personal brand",
      "My content creation process that saves 10 hours a week",
      "How I gained 5K followers without posting every single day",
    ],
    tip: "Consistency over perfection. 5 posts a week beats 1 viral post.",
  },
  travel: {
    color: "#38bdf8",
    badge: "✈️ Travel",
    prompts: [
      "How I work remotely from Bali for ₹50K/month",
      "Hidden gems in Southeast Asia that most tourists miss",
      "My complete packing list for 30 days across 5 countries",
    ],
    tip: "Instagram Reels and YouTube Shorts dominate travel content.",
  },
  food: {
    color: "#fb923c",
    badge: "🍜 Food & Recipes",
    prompts: [
      "5-minute breakfast ideas that actually taste incredible",
      "The secret ingredient in my grandmother's classic recipe",
      "How I meal prep for an entire week in just 2 hours",
    ],
    tip: "Short-form video of the cooking process drives the most saves.",
  },
  fashion: {
    color: "#e879f9",
    badge: "👗 Fashion / Beauty",
    prompts: [
      "5 wardrobe essentials that work for literally every occasion",
      "How to build a capsule wardrobe on a budget",
      "The styling mistake making you look less put-together",
    ],
    tip: "Pinterest + Instagram is the winning formula for fashion creators.",
  },
  education: {
    color: "#a78bfa",
    badge: "📚 Education",
    prompts: [
      "The learning method that completely changed how I retain knowledge",
      "How to learn any skill in 30 days (my exact framework)",
      "3 study habits that top students consistently use",
    ],
    tip: "Carousels with clear steps consistently get saved and shared.",
  },
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

/* ─── AI Suggestions widget ────────────────────────────────────── */

interface UserPrefs { platforms: string[]; niche: string; tone: string; goal: string }

function AISuggestions({ prefs }: { prefs: UserPrefs | null }) {
  const router = useRouter()
  if (!prefs?.niche || !NICHE_DATA[prefs.niche]) return null

  const data  = NICHE_DATA[prefs.niche]
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
      {/* Ambient glow */}
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
          <Link href="/templates"
            className="text-[11px] font-medium transition-colors hover:opacity-80"
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

        {/* Pro tip */}
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

/* ─── Hero generate ─────────────────────────────────────────────── */

function HeroGenerate({ prefs }: { prefs: UserPrefs | null }) {
  const router  = useRouter()
  const [topic, setTopic] = useState("")

  const placeholder = (() => {
    if (!prefs?.niche) return "e.g. 'How AI is reshaping content marketing in 2025'…"
    const examples: Record<string, string> = {
      tech:      "e.g. 'Why we ditched Notion for Linear and never looked back'…",
      fitness:   "e.g. 'The 5-minute morning routine that changed my energy'…",
      business:  "e.g. 'How I closed our first ₹10L client with cold DMs'…",
      personal:  "e.g. 'The brutal truth about building a personal brand in 2025'…",
      travel:    "e.g. 'How I spent a month in Japan for under ₹80K'…",
      food:      "e.g. 'My 3-ingredient pasta that tastes like it took hours'…",
      fashion:   "e.g. '5 outfits I wear on repeat every single week'…",
      education: "e.g. 'The Feynman technique: why it works and how to use it'…",
    }
    return examples[prefs.niche] ?? "e.g. 'How AI is reshaping content marketing in 2025'…"
  })()

  const activePlatforms = prefs?.platforms?.length
    ? [
        { id: "instagram", icon: "📸", label: "Instagram", color: "#E1306C" },
        { id: "linkedin",  icon: "💼", label: "LinkedIn",  color: "#0077B5" },
        { id: "twitter",   icon: "🐦", label: "Twitter/X", color: "#1DA1F2" },
      ].filter(p => prefs.platforms.includes(p.id))
    : [
        { id: "instagram", icon: "📸", label: "Instagram", color: "#E1306C" },
        { id: "linkedin",  icon: "💼", label: "LinkedIn",  color: "#0077B5" },
        { id: "twitter",   icon: "🐦", label: "Twitter/X", color: "#94a3b8" },
      ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-hero rounded-3xl p-8 mb-6 relative overflow-hidden"
    >
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#F7BE4D]/[0.05] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-500/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="grid-bg absolute inset-0 opacity-40 pointer-events-none rounded-3xl" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 glass-sm rounded-full px-3.5 py-1.5 border border-[#F7BE4D]/20 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F7BE4D] pulse-dot" />
          <span className="text-[11px] text-[#F7BE4D] font-semibold tracking-wide uppercase">AI Content Engine</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
          Generate <span className="gradient-text">30 Days</span> of Content
        </h1>
        <p className="text-slate-400 text-sm mb-6 max-w-lg">
          Drop a topic, blog post, or idea — get LinkedIn, Twitter, and Instagram posts in seconds.
        </p>

        <div className="flex gap-3 max-w-2xl">
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && topic.trim() && router.push(`/generate?topic=${encodeURIComponent(topic.trim())}`)}
            placeholder={placeholder}
            className="flex-1 input-premium px-4 py-3 text-sm"
          />
          <button
            onClick={() => topic.trim() && router.push(`/generate?topic=${encodeURIComponent(topic.trim())}${prefs?.tone ? `&tone=${prefs.tone}` : ""}`)}
            disabled={!topic.trim()}
            className="btn-primary px-6 py-3 text-sm flex items-center gap-2 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </button>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <span className="text-[11px] text-slate-600">Generates for:</span>
          {activePlatforms.map(p => (
            <span key={p.id} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border"
              style={{ background: `${p.color}12`, borderColor: `${p.color}25`, color: p.color }}>
              <span>{p.icon}</span>{p.label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Stat cards ────────────────────────────────────────────────── */

const statConfigs = [
  { label: "Posts Generated", key: "generated" as const, icon: Sparkles,     color: "#F7BE4D", change: "Total AI generations" },
  { label: "Scheduled",       key: "scheduled" as const, icon: Clock,         color: "#818cf8", change: "Pending posts" },
  { label: "Published",       key: "published" as const, icon: CheckCircle2,  color: "#34d399", change: "Successfully sent" },
  { label: "Engagement",      key: null,                 icon: TrendingUp,    color: "#f472b6", change: "Connect analytics" },
]

const quickActions = [
  { icon: Wand2,       label: "Generate",      desc: "AI captions for any platform",    href: "/generate",  color: "#F7BE4D" },
  { icon: Repeat2,     label: "Blog → Posts",  desc: "Turn articles into 20 posts",     href: "/repurpose", color: "#818cf8" },
  { icon: CalendarClock,label: "Schedule",     desc: "Plan your content calendar",       href: "/schedule",  color: "#34d399" },
  { icon: BarChart3,   label: "Analytics",     desc: "Track growth & engagement",        href: "/analytics", color: "#f472b6" },
  { icon: History,     label: "History",       desc: "View all past generations",        href: "/history",   color: "#94a3b8" },
]

interface Stats { generated: number; scheduled: number; published: number }
interface RecentPost { id: string; platform: string; content: string; time: string; status: string }

const platformColors: Record<string, string> = { instagram: "#E1306C", linkedin: "#0077B5", twitter: "#1DA1F2" }
const platformIcons:  Record<string, string>  = { instagram: "📸", linkedin: "💼", twitter: "🐦" }

/* ─── Page ──────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [stats,       setStats]       = useState<Stats>({ generated: 0, scheduled: 0, published: 0 })
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [loading,     setLoading]     = useState(true)
  const [prefs,       setPrefs]       = useState<UserPrefs | null>(null)
  const [greeting,    setGreeting]    = useState("Welcome back")

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

    // Load prefs from localStorage first (instant), then verify from DB
    const cached = localStorage.getItem(`postpilot_prefs_${user.id}`)
    if (cached) {
      try { setPrefs(JSON.parse(cached)) } catch {}
    }

    const [genRes, scheduledRes, publishedRes, recentRes, profileRes] = await Promise.all([
      supabase.from("generations").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("scheduled_posts").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "pending"),
      supabase.from("scheduled_posts").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "published"),
      supabase.from("scheduled_posts").select("id,content,platform,scheduled_time,status").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
      supabase.from("users").select("platforms,niche,tone,goal").eq("id", user.id).single(),
    ])

    setStats({ generated: genRes.count || 0, scheduled: scheduledRes.count || 0, published: publishedRes.count || 0 })
    setRecentPosts((recentRes.data || []).map((p: {id: string; platform: string; content: string; scheduled_time: string; status: string}) => ({
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

    setLoading(false)
  }

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Personalized greeting */}
      <AnimatePresence>
        {prefs?.niche && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
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
      <HeroGenerate prefs={prefs} />

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
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{s.label}</p>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}18` }}>
                <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {s.key
                ? <Counter value={stats[s.key]} loading={loading} />
                : <span className="text-slate-600 text-lg">—</span>
              }
            </div>
            <p className="text-[11px] text-slate-600">{s.change}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Suggestions (personalized) */}
      <AISuggestions prefs={prefs} />

      {/* Body grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-5"
        >
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h2>
          <div className="space-y-1.5">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <motion.div
                  whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.04)" }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer group"
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 p-4 rounded-2xl relative overflow-hidden"
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
        </motion.div>

        {/* Recent posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-2 glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Recent Posts</h2>
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
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <CalendarClock className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-sm text-slate-500 mb-1">No posts scheduled yet</p>
              <Link href="/generate" className="text-xs text-[#F7BE4D] hover:text-[#ffd166] transition-colors">
                Generate your first post →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  className="flex items-start gap-3 p-3 rounded-xl transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm mt-0.5"
                    style={{ background: `${platformColors[post.platform] || "#818cf8"}18` }}>
                    {platformIcons[post.platform] || "📝"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-300 capitalize">{post.platform}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        post.status === "published"
                          ? "bg-emerald-500/12 text-emerald-400"
                          : "bg-[#F7BE4D]/12 text-[#F7BE4D]"
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
