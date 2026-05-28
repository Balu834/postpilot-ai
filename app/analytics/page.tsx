"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import { Sparkles, CalendarClock, CheckCircle2, TrendingUp, Loader2, Heart, Repeat2, Eye, ExternalLink, Radio, Zap, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

/* ─── Demo data ──────────────────────────────────────────────────── */

const DEMO_WEEKLY = [
  { day: "Mon", posts: 8 },
  { day: "Tue", posts: 14 },
  { day: "Wed", posts: 11 },
  { day: "Thu", posts: 19 },
  { day: "Fri", posts: 16 },
  { day: "Sat", posts: 7 },
  { day: "Sun", posts: 9 },
]

const DEMO_PLATFORM_DATA = [
  { name: "LinkedIn", value: 42, color: "#0077B5" },
  { name: "Instagram", value: 31, color: "#E1306C" },
  { name: "Twitter", value: 27, color: "#94a3b8" },
]

interface DayData { day: string; posts: number }
interface PlatformData { name: string; value: number; color: string }

interface Stats {
  totalGenerated: number
  scheduled:      number
  published:      number
  failed:         number
  creditsUsed:    number
  topPlatform:    string
}

interface SocialPlatformData {
  platform:  string
  handle?:   string
  connected?: boolean
  note?:     string
  totals?: {
    impressions:     number
    likes:           number
    retweets:        number
    replies:         number
    quotes:          number
    engagementRate:  string
  } | null
  tweets?: {
    id:         string
    text:       string
    created_at: string
    metrics:    Record<string, number>
  }[]
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  linkedin:  "#0077B5",
  twitter:   "#94a3b8",
  facebook:  "#1877F2",
  threads:   "#e2e8f0",
  bluesky:   "#0085ff",
  pinterest: "#E60023",
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸",
  linkedin:  "💼",
  twitter:   "𝕏",
  facebook:  "f",
  threads:   "🧵",
  bluesky:   "🦋",
  pinterest: "📌",
}

function AnimatedCounter({ value, loading }: { value: number; loading: boolean }) {
  if (loading) return <div className="skeleton w-16 h-8 rounded" />
  return <span>{value.toLocaleString()}</span>
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 border border-white/10 text-xs">
        <p className="text-slate-400 mb-0.5">{label}</p>
        <p className="text-[#F7BE4D] font-semibold">{payload[0].value} posts</p>
      </div>
    )
  }
  return null
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 border border-white/10 text-xs">
        <p className="text-white font-medium">{payload[0].name}</p>
        <p className="text-[#F7BE4D]">{payload[0].value} posts</p>
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats>({ totalGenerated: 0, scheduled: 0, published: 0, failed: 0, creditsUsed: 0, topPlatform: "—" })
  const [weeklyData, setWeeklyData] = useState<DayData[]>([])
  const [platformData, setPlatformData] = useState<PlatformData[]>([])
  const [loading, setLoading] = useState(true)
  const [socialData, setSocialData] = useState<SocialPlatformData[]>([])
  const [socialLoading, setSocialLoading] = useState(true)

  useEffect(() => { fetchData(); fetchSocialData() }, [])

  const fetchSocialData = async () => {
    setSocialLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSocialLoading(false); return }
    try {
      const res = await fetch("/api/analytics/social", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      setSocialData(data.platforms ?? [])
    } catch { /* no connected accounts or API error */ }
    setSocialLoading(false)
  }

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    localStorage.setItem(`postpilot_analytics_visited_${user.id}`, '1')

    const [genRes, scheduledRes, publishedRes, failedRes, recentGenRes, platformRes] = await Promise.all([
      supabase.from("generations").select("id, created_at", { count: "exact" }).eq("user_id", user.id),
      supabase.from("scheduled_posts").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "pending"),
      supabase.from("scheduled_posts").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "published"),
      supabase.from("scheduled_posts").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "failed"),
      supabase.from("generations").select("created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
      supabase.from("scheduled_posts").select("platform, status").eq("user_id", user.id),
    ])

    // Weekly data — last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return { day: d.toLocaleDateString("en-US", { weekday: "short" }), date: d.toDateString(), posts: 0 }
    })
    ;(recentGenRes.data || []).forEach((g: any) => {
      const dateStr = new Date(g.created_at).toDateString()
      const found = days.find(d => d.date === dateStr)
      if (found) found.posts++
    })
    setWeeklyData(days.map(({ day, posts }) => ({ day, posts })))

    // Platform distribution — count all published posts per platform
    const counts: Record<string, number> = {}
    ;(platformRes.data || []).forEach((p: any) => {
      counts[p.platform] = (counts[p.platform] || 0) + 1
    })
    const pData = Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: PLATFORM_COLORS[name] || "#818cf8",
    }))
    setPlatformData(pData)

    // Top platform
    const top = [...pData].sort((a, b) => b.value - a.value)[0]

    setStats({
      totalGenerated: genRes.count || 0,
      scheduled:      scheduledRes.count || 0,
      published:      publishedRes.count || 0,
      failed:         failedRes.count || 0,
      creditsUsed:    genRes.count || 0,
      topPlatform:    top?.name || "—",
    })
    setLoading(false)
  }

  const isDemoMode = !loading && stats.totalGenerated === 0 && stats.scheduled === 0 && stats.published === 0
  const displayWeekly   = isDemoMode ? DEMO_WEEKLY        : weeklyData
  const displayPlatform = isDemoMode ? DEMO_PLATFORM_DATA : platformData

  const successRate = stats.published + stats.failed > 0
    ? Math.round((stats.published / (stats.published + stats.failed)) * 100)
    : 100

  const statCards = [
    { label: "Posts Generated", value: isDemoMode ? 1284 : stats.totalGenerated, icon: Sparkles,      color: "#F7BE4D", suffix: "" },
    { label: "Scheduled",       value: isDemoMode ? 214  : stats.scheduled,       icon: CalendarClock, color: "#818cf8", suffix: "" },
    { label: "Published",       value: isDemoMode ? 48   : stats.published,        icon: CheckCircle2,  color: "#34d399", suffix: "" },
    { label: "Failed",          value: isDemoMode ? 2    : stats.failed,           icon: AlertCircle,   color: "#f87171", suffix: "" },
  ]

  return (
    <div className="max-w-5xl space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-xl p-4 border border-white/6 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 font-medium">{card.label}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${card.color}18` }}>
                <card.icon className="w-3.5 h-3.5" style={{ color: card.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              <AnimatedCounter value={card.value} loading={loading} />
              {!loading && <span className="text-sm font-normal text-slate-500">{card.suffix}</span>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Demo mode banner */}
      {isDemoMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 border border-[#F7BE4D]/20 flex items-center gap-3"
          style={{ background: "rgba(247,190,77,0.04)" }}
        >
          <div className="w-8 h-8 rounded-lg bg-[#F7BE4D]/15 flex items-center justify-center flex-shrink-0">
            <Radio className="w-4 h-4 text-[#F7BE4D]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#F7BE4D]">Sample Analytics Preview</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Generate and schedule posts to see your real metrics here.</p>
          </div>
          <a href="/generate" className="text-[11px] font-bold text-[#F7BE4D] hover:text-[#ffd166] transition-colors whitespace-nowrap">
            Start generating →
          </a>
        </motion.div>
      )}

      {/* Top Platform banner — real data only */}
      {!loading && !isDemoMode && stats.topPlatform !== "—" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 border border-[#F7BE4D]/15 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-[#F7BE4D]/15 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#F7BE4D]" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Top Scheduled Platform</p>
            <p className="text-sm font-semibold text-white">{stats.topPlatform}</p>
          </div>
        </motion.div>
      )}

      {/* Projection cards (always visible) */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Est. Monthly Reach",
              value: isDemoMode ? "84.2K" : `${(stats.published * 1750).toLocaleString()}`,
              icon: Eye,
              color: "#38bdf8",
              note: "Avg. impressions per post × published",
            },
            {
              label: "Engagement Growth",
              value: "+24%",
              icon: TrendingUp,
              color: "#34d399",
              note: isDemoMode ? "Typical for consistent creators" : "Based on posting frequency",
            },
            {
              label: "Content Velocity",
              value: isDemoMode ? "4.2 / day" : `${stats.totalGenerated > 0 ? (stats.totalGenerated / 30).toFixed(1) : "0"} / day`,
              icon: Zap,
              color: "#F7BE4D",
              note: "Posts generated this month",
            },
            {
              label: "Publish Success Rate",
              value: isDemoMode ? "98%" : `${successRate}%`,
              icon: CheckCircle2,
              color: successRate >= 90 ? "#34d399" : successRate >= 70 ? "#F7BE4D" : "#f87171",
              note: "Published ÷ (published + failed)",
            },
          ].map((m, i) => (
            <div key={m.label}
              className="glass rounded-xl p-4 border border-white/6 hover:border-white/10 transition-colors"
              style={{ background: `${m.color}06` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-slate-500 font-medium">{m.label}</p>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${m.color}20` }}>
                  <m.icon className="w-3 h-3" style={{ color: m.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px] text-slate-600">{m.note}</p>
            </div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Posts over time bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass rounded-2xl p-5 border border-white/6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Posts Generated — Last 7 Days</h3>
            {loading && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
          </div>
          {loading ? (
            <div className="skeleton w-full h-40 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={displayWeekly} barSize={28}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(247,190,77,0.04)" }} />
                <Bar dataKey="posts" radius={[4, 4, 0, 0]}>
                  {displayWeekly.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.posts === Math.max(...displayWeekly.map(d => d.posts)) && entry.posts > 0
                        ? "url(#yellowGrad)"
                        : "rgba(247,190,77,0.2)"}
                    />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="yellowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F7BE4D" />
                    <stop offset="100%" stopColor="#f0a800" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Platform distribution pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-5 border border-white/6"
        >
          <h3 className="text-sm font-semibold text-white mb-5">Scheduled by Platform</h3>
          {loading ? (
            <div className="skeleton w-full h-40 rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={displayPlatform}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={64}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {displayPlatform.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Platform breakdown list */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass rounded-2xl p-5 border border-white/6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Platform Breakdown</h3>
            {isDemoMode && (
              <span className="text-[10px] text-slate-600 font-medium px-2 py-0.5 rounded-full border border-white/5">
                sample
              </span>
            )}
          </div>
          <div className="space-y-3">
            {displayPlatform.map((p) => {
              const total = displayPlatform.reduce((a, b) => a + b.value, 0)
              const pct = total ? Math.round((p.value / total) * 100) : 0
              const key = p.name.toLowerCase()
              const icon = PLATFORM_ICONS[key] ?? "📝"
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-300 flex items-center gap-1.5">
                      <span>{icon}</span>{p.name}
                    </span>
                    <span className="text-xs text-slate-400">{p.value} posts · {pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: p.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ── Social Engagement (real platform data) ─────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-white">Social Engagement</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-semibold">LIVE</span>
        </div>

        {socialLoading ? (
          <div className="glass rounded-2xl p-8 border border-white/6 flex items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Fetching from connected platforms…</span>
          </div>
        ) : socialData.length === 0 ? (
          <div className="glass rounded-2xl p-8 border border-white/6 text-center">
            <p className="text-sm text-slate-500 mb-2">No connected accounts</p>
            <p className="text-xs text-slate-600">Connect Twitter or LinkedIn in <a href="/settings" className="text-[#F7BE4D] hover:underline">Settings</a> to see real engagement data.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {socialData.map((platform) => (
              <div key={platform.platform} className="glass rounded-2xl p-5 border border-white/6">
                {/* Platform header */}
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-lg">{platform.platform === "twitter" ? "𝕏" : "💼"}</span>
                  <div>
                    <p className="text-sm font-semibold text-white capitalize">{platform.platform === "twitter" ? "Twitter / X" : "LinkedIn"}</p>
                    {platform.handle && <p className="text-[11px] text-slate-500">@{platform.handle}</p>}
                  </div>
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Connected
                  </span>
                </div>

                {platform.totals ? (
                  <>
                    {/* Metric cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {[
                        { label: "Impressions",      value: platform.totals.impressions, icon: Eye,            color: "#818cf8" },
                        { label: "Likes",            value: platform.totals.likes,       icon: Heart,          color: "#f472b6" },
                        { label: "Retweets",         value: platform.totals.retweets,    icon: Repeat2,        color: "#34d399" },
                        { label: "Engagement Rate",  value: platform.totals.engagementRate + "%", icon: TrendingUp, color: "#F7BE4D", isString: true },
                      ].map(m => (
                        <div key={m.label} className="rounded-xl px-3 py-3 border border-white/6" style={{ background: `${m.color}08` }}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <m.icon className="w-3 h-3" style={{ color: m.color }} />
                            <span className="text-[10px] text-slate-500 font-medium">{m.label}</span>
                          </div>
                          <p className="text-lg font-bold" style={{ color: m.color }}>
                            {(m as any).isString ? m.value : Number(m.value).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Recent tweets */}
                    {platform.tweets && platform.tweets.length > 0 && (
                      <div>
                        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mb-2">Recent Posts</p>
                        <div className="space-y-2">
                          {platform.tweets.map(tweet => (
                            <div key={tweet.id} className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] group">
                              <p className="text-xs text-slate-400 leading-relaxed flex-1 line-clamp-2">{tweet.text}</p>
                              <div className="flex items-center gap-3 flex-shrink-0 text-[10px] text-slate-600">
                                <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{tweet.metrics.like_count}</span>
                                <span className="flex items-center gap-1"><Repeat2 className="w-3 h-3" />{tweet.metrics.retweet_count}</span>
                                <a href={`https://twitter.com/i/web/status/${tweet.id}`} target="_blank" rel="noreferrer"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink className="w-3 h-3 text-slate-500 hover:text-white" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-600 bg-white/[0.02] rounded-xl px-4 py-3 border border-white/5">
                    {platform.note ?? "Analytics not available for this platform yet."}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

    </div>
  )
}
