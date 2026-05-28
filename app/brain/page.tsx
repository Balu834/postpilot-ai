"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain, Sparkles, AlertCircle, RefreshCw,
  Target, TrendingUp, Lightbulb, Star, BarChart2, ArrowRight,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface Cluster {
  topic: string
  count: number
  avgRating: number
  platforms: string[]
}

interface BrainData {
  clusters: Cluster[]
  gaps: string[]
  insights: string[]
  topPerforming: string[]
  recommended_topics: string[]
  topPlatform: string | null
  totalPosts: number
  platformCounts: Record<string, number>
}

const PLATFORM_COLORS: Record<string, string> = {
  linkedin:  "#0077B5",
  instagram: "#E1306C",
  twitter:   "#94a3b8",
  threads:   "#e2e8f0",
  bluesky:   "#0085ff",
  pinterest: "#E60023",
  facebook:  "#1877F2",
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= value ? "text-[#F7BE4D] fill-[#F7BE4D]" : "text-slate-700"}`} />
      ))}
    </div>
  )
}

export default function BrainPage() {
  const router = useRouter()
  const [data,    setData]    = useState<BrainData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch("/api/brain", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to load")
      setData(json)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-[#F7BE4D]" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#F7BE4D] animate-ping" />
        </div>
        <p className="text-slate-500 text-sm">Analysing your content history…</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-[#F7BE4D]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Content Brain</h1>
            <p className="text-slate-500 text-xs">AI memory of everything you've posted</p>
          </div>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
            border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white
            hover:border-white/20 transition-all disabled:opacity-40">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10
          border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {data && data.totalPosts === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#F7BE4D]/20 bg-[#F7BE4D]/[0.04] p-10 text-center"
        >
          <Brain className="w-10 h-10 text-[#F7BE4D] mx-auto mb-4" />
          <h2 className="text-base font-bold text-white mb-2">Your Content Brain is empty</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
            Schedule and publish posts to start building your content memory.
          </p>
          <button onClick={() => router.push("/generate")}
            className="btn-primary px-6 py-2.5 text-sm font-semibold">
            Generate Your First Post →
          </button>
        </motion.div>
      ) : data ? (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Posts",     value: data.totalPosts,              icon: BarChart2,  color: "#F7BE4D" },
              { label: "Topics Covered",  value: data.clusters.length,         icon: Target,     color: "#818cf8" },
              { label: "Content Gaps",    value: data.gaps.length,             icon: Lightbulb,  color: "#34d399" },
              { label: "Top Platform",    value: data.topPlatform ?? "—",      icon: TrendingUp, color: "#f472b6" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <div className="w-7 h-7 rounded-lg mb-2 flex items-center justify-center"
                  style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                  <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                </div>
                <p className="text-lg font-bold text-white capitalize">{s.value}</p>
                <p className="text-[11px] text-slate-500">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* AI Insights */}
          {data.insights.length > 0 && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                AI Insights
              </p>
              <div className="space-y-2.5">
                {data.insights.map((insight, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#F7BE4D]/15 border border-[#F7BE4D]/25
                      flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-2.5 h-2.5 text-[#F7BE4D]" />
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Topic Clusters */}
          {data.clusters.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Topic Coverage Map
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.clusters.map((cluster, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 rounded-2xl border border-white/8
                      bg-white/[0.02] p-4 hover:border-white/15 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-[#818cf8]/10 border border-[#818cf8]/20
                      flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#818cf8]">
                      {cluster.count}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white capitalize">{cluster.topic}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {cluster.avgRating > 0 && <StarRating value={Math.round(cluster.avgRating)} />}
                        <div className="flex gap-1 flex-wrap">
                          {cluster.platforms?.slice(0, 3).map((p, j) => (
                            <span key={j} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize"
                              style={{
                                background: `${PLATFORM_COLORS[p] ?? "#94a3b8"}18`,
                                color:      PLATFORM_COLORS[p] ?? "#94a3b8",
                              }}>
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Content Gaps */}
            {data.gaps.length > 0 && (
              <div className="rounded-2xl border border-[#34d399]/20 bg-[#34d399]/[0.04] p-5">
                <p className="text-[11px] font-semibold text-[#34d399]/70 uppercase tracking-widest mb-3">
                  Content Gaps
                </p>
                <div className="space-y-2">
                  {data.gaps.map((gap, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#34d399] mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-slate-300">{gap}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Next Topics */}
            {data.recommended_topics?.length > 0 && (
              <div className="rounded-2xl border border-[#F7BE4D]/20 bg-[#F7BE4D]/[0.04] p-5">
                <p className="text-[11px] font-semibold text-[#F7BE4D]/70 uppercase tracking-widest mb-3">
                  Post These Next
                </p>
                <div className="space-y-2">
                  {data.recommended_topics.map((topic, i) => (
                    <button key={i}
                      onClick={() => router.push(`/generate?topic=${encodeURIComponent(topic)}`)}
                      className="w-full flex items-center gap-2 text-left group">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F7BE4D] flex-shrink-0" />
                      <p className="text-sm text-slate-300 group-hover:text-white transition-colors flex-1">
                        {topic}
                      </p>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-[#F7BE4D] transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Platform breakdown */}
          {data.platformCounts && Object.keys(data.platformCounts).length > 0 && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">
                Platform Distribution
              </p>
              <div className="space-y-2.5">
                {Object.entries(data.platformCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([platform, count]) => {
                    const pct   = Math.round((count / data.totalPosts) * 100)
                    const color = PLATFORM_COLORS[platform] ?? "#94a3b8"
                    return (
                      <div key={platform} className="flex items-center gap-3">
                        <p className="text-xs text-slate-400 capitalize w-20 flex-shrink-0">{platform}</p>
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: color }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 w-8 text-right tabular-nums">{pct}%</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
