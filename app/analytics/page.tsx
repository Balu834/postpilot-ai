"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import { Sparkles, CalendarClock, CheckCircle2, TrendingUp, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface DayData { day: string; posts: number }
interface PlatformData { name: string; value: number; color: string }

interface Stats {
  totalGenerated: number
  scheduled: number
  published: number
  creditsUsed: number
  topPlatform: string
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  linkedin: "#0077B5",
  twitter: "#94a3b8",
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
  const [stats, setStats] = useState<Stats>({ totalGenerated: 0, scheduled: 0, published: 0, creditsUsed: 0, topPlatform: "—" })
  const [weeklyData, setWeeklyData] = useState<DayData[]>([])
  const [platformData, setPlatformData] = useState<PlatformData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [genRes, scheduledRes, publishedRes, recentGenRes, platformRes] = await Promise.all([
      supabase.from("generations").select("id, created_at", { count: "exact" }).eq("user_id", user.id),
      supabase.from("scheduled_posts").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "pending"),
      supabase.from("scheduled_posts").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "published"),
      supabase.from("generations").select("created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
      supabase.from("scheduled_posts").select("platform").eq("user_id", user.id),
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

    // Platform distribution
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
    const top = pData.sort((a, b) => b.value - a.value)[0]

    setStats({
      totalGenerated: genRes.count || 0,
      scheduled: scheduledRes.count || 0,
      published: publishedRes.count || 0,
      creditsUsed: genRes.count || 0,
      topPlatform: top?.name || "—",
    })
    setLoading(false)
  }

  const statCards = [
    { label: "Total Generated", value: stats.totalGenerated, icon: Sparkles, color: "#F7BE4D", suffix: "" },
    { label: "Scheduled Posts", value: stats.scheduled, icon: CalendarClock, color: "#818cf8", suffix: "" },
    { label: "Published", value: stats.published, icon: CheckCircle2, color: "#34d399", suffix: "" },
    { label: "Credits Used", value: stats.creditsUsed, icon: TrendingUp, color: "#f472b6", suffix: " / 50" },
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

      {/* Top Platform banner */}
      {!loading && stats.topPlatform !== "—" && (
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
          ) : weeklyData.every(d => d.posts === 0) ? (
            <div className="h-40 flex items-center justify-center text-slate-600 text-sm">
              No generations this week — start creating!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyData} barSize={28}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(247,190,77,0.04)" }} />
                <Bar dataKey="posts" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.posts === Math.max(...weeklyData.map(d => d.posts)) && entry.posts > 0
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
          ) : platformData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-600 text-sm text-center">
              Schedule your first post to see breakdown
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={64}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {platformData.map((entry, i) => (
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
      {!loading && platformData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass rounded-2xl p-5 border border-white/6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Platform Breakdown</h3>
          <div className="space-y-3">
            {platformData.map((p) => {
              const total = platformData.reduce((a, b) => a + b.value, 0)
              const pct = total ? Math.round((p.value / total) * 100) : 0
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-300">{p.name}</span>
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

      {/* Empty state — no data at all */}
      {!loading && stats.totalGenerated === 0 && stats.scheduled === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-12 border border-white/5 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-7 h-7 text-[#F7BE4D]" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">No data yet</h3>
          <p className="text-sm text-slate-500">Generate and schedule posts to see your analytics.</p>
        </motion.div>
      )}
    </div>
  )
}
