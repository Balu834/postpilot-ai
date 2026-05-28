"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileBarChart, Sparkles, Loader2, AlertCircle, Printer,
  CheckCircle2, XCircle, Clock, BarChart3, TrendingUp, Zap,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

const PLATFORMS = ["instagram","linkedin","twitter","facebook","threads","bluesky","pinterest","youtube"]

const PLATFORM_META: Record<string, { icon: string; color: string; label: string }> = {
  instagram: { icon: "IG", color: "#E1306C", label: "Instagram" },
  linkedin:  { icon: "in", color: "#0077B5", label: "LinkedIn"  },
  twitter:   { icon: "𝕏",  color: "#94a3b8", label: "Twitter"   },
  facebook:  { icon: "f",  color: "#1877F2", label: "Facebook"  },
  threads:   { icon: "🧵", color: "#e2e8f0", label: "Threads"   },
  bluesky:   { icon: "🦋", color: "#0085ff", label: "Bluesky"   },
  pinterest: { icon: "📌", color: "#E60023", label: "Pinterest" },
  youtube:   { icon: "▶",  color: "#FF0000", label: "YouTube"   },
}

const STATUS_COLORS = {
  published: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", label: "Published" },
  pending:   { bg: "bg-[#F7BE4D]/10",   text: "text-[#F7BE4D]",   border: "border-[#F7BE4D]/20",   label: "Scheduled" },
  failed:    { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20",     label: "Failed"    },
}

interface Summary {
  totalPosts: number; published: number; scheduled: number
  failed: number; generated: number; successRate: number; topPlatform: string | null
}
interface RecentPost {
  id: string; platform: string; content: string; status: string; scheduled_time: string
}
interface Report {
  summary: Summary
  platformBreakdown: Record<string, { total: number; published: number; failed: number }>
  recentPosts: RecentPost[]
}

const PRESET_RANGES = [
  { label: "Last 7 days",  days: 7  },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
]

function toDateInput(d: Date) {
  return d.toISOString().split("T")[0]
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; color: string
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-black text-white tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-slate-600 mt-1">{sub}</p>}
    </div>
  )
}

export default function ReportsPage() {
  const today   = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 86400000)

  const [from,       setFrom]       = useState(toDateInput(weekAgo))
  const [to,         setTo]         = useState(toDateInput(today))
  const [selected,   setSelected]   = useState<string[]>([])
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState("")
  const [report,     setReport]     = useState<Report | null>(null)

  const applyPreset = (days: number) => {
    const end   = new Date()
    const start = new Date(end.getTime() - days * 86400000)
    setFrom(toDateInput(start))
    setTo(toDateInput(end))
  }

  const togglePlatform = (p: string) =>
    setSelected(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const handleGenerate = async () => {
    setLoading(true)
    setError("")
    setReport(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/reports/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ from, to, platforms: selected.length ? selected : null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to generate report")
      setReport(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => window.print()

  const topPlatformMeta = report?.summary.topPlatform
    ? PLATFORM_META[report.summary.topPlatform]
    : null

  const platformEntries = report
    ? Object.entries(report.platformBreakdown).sort((a, b) => b[1].total - a[1].total)
    : []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 print:py-4">

      {/* Header */}
      <div className="flex items-start justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center">
              <FileBarChart className="w-4 h-4 text-[#F7BE4D]" />
            </div>
            <h1 className="text-xl font-bold text-white">Client Report Generator</h1>
          </div>
          <p className="text-slate-500 text-sm ml-10.5">
            Generate shareable analytics reports for any date range. Print or save as PDF.
          </p>
        </div>
        {report && (
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
              bg-white/[0.03] border border-white/10 text-slate-400 hover:text-white
              hover:border-white/20 transition-all flex-shrink-0">
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-4 print:hidden">

        {/* Preset ranges */}
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Date Range</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_RANGES.map(p => (
              <button key={p.days} onClick={() => applyPreset(p.days)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/8
                  text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all">
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-600 mb-1">From</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2
                  text-sm text-white focus:outline-none focus:border-[#F7BE4D]/40 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-600 mb-1">To</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2
                  text-sm text-white focus:outline-none focus:border-[#F7BE4D]/40 transition-all" />
            </div>
          </div>
        </div>

        {/* Platform filter */}
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
            Platforms <span className="normal-case font-normal text-slate-700">(leave empty for all)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => {
              const meta   = PLATFORM_META[p]
              const active = selected.includes(p)
              return (
                <button key={p} onClick={() => togglePlatform(p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                  style={active
                    ? { background: `${meta.color}18`, color: meta.color, borderColor: `${meta.color}50` }
                    : { background: "transparent", color: "#64748b", borderColor: "rgba(255,255,255,0.08)" }}>
                  <span className="text-[11px]">{meta.icon}</span>{meta.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10
          border border-red-500/20 rounded-xl px-4 py-3 print:hidden">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      <button onClick={handleGenerate} disabled={loading}
        className="btn-primary w-full py-3 text-sm font-semibold flex items-center
          justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed print:hidden">
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" />Generating report…</>
          : <><Sparkles className="w-4 h-4" />Generate Report</>}
      </button>

      {/* ── Report output ── */}
      <AnimatePresence>
        {report && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-6">

            {/* Report header (print-friendly) */}
            <div className="rounded-2xl border border-[#F7BE4D]/15 bg-[#F7BE4D]/[0.03] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-white">PostPilot AI — Analytics Report</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {new Date(from).toLocaleDateString("en-IN", { month:"long",day:"numeric",year:"numeric" })}
                    {" → "}
                    {new Date(to).toLocaleDateString("en-IN", { month:"long",day:"numeric",year:"numeric" })}
                    {selected.length > 0 && ` · ${selected.map(p => PLATFORM_META[p]?.label).join(", ")}`}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#F7BE4D] flex items-center justify-center
                  shadow-[0_0_20px_rgba(247,190,77,0.4)]">
                  <Zap className="w-5 h-5 text-[#050816]" fill="currentColor" strokeWidth={0} />
                </div>
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total Posts"   value={report.summary.totalPosts}   icon={BarChart3}    color="#818cf8" />
              <StatCard label="Published"     value={report.summary.published}    icon={CheckCircle2} color="#34d399" />
              <StatCard label="Scheduled"     value={report.summary.scheduled}    icon={Clock}        color="#F7BE4D" />
              <StatCard label="AI Generated"  value={report.summary.generated}    icon={Sparkles}     color="#f472b6" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatCard label="Failed"        value={report.summary.failed}                       icon={XCircle}   color="#f87171"
                sub={report.summary.failed > 0 ? "Check Inbox for details" : "No failures 🎉"} />
              <StatCard label="Success Rate"  value={`${report.summary.successRate}%`}            icon={TrendingUp} color="#34d399"
                sub="Published ÷ attempted" />
              {topPlatformMeta && (
                <StatCard label="Top Platform" value={topPlatformMeta.label} icon={BarChart3} color={topPlatformMeta.color}
                  sub="Most active this period" />
              )}
            </div>

            {/* Platform breakdown */}
            {platformEntries.length > 0 && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">
                  Platform Breakdown
                </p>
                <div className="space-y-3">
                  {platformEntries.map(([platform, counts]) => {
                    const meta  = PLATFORM_META[platform] ?? { icon: "📣", color: "#94a3b8", label: platform }
                    const maxTotal = platformEntries[0][1].total
                    const pct   = maxTotal > 0 ? (counts.total / maxTotal) * 100 : 0
                    return (
                      <div key={platform}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold" style={{ color: meta.color }}>{meta.icon}</span>
                            <span className="text-sm text-white font-medium">{meta.label}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px]">
                            <span className="text-emerald-400">{counts.published} published</span>
                            {counts.failed > 0 && <span className="text-red-400">{counts.failed} failed</span>}
                            <span className="text-slate-500 font-semibold">{counts.total} total</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: meta.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recent posts */}
            {report.recentPosts.length > 0 && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-white/8">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                    Posts in This Period ({report.recentPosts.length})
                  </p>
                </div>
                <div className="divide-y divide-white/[0.04] max-h-96 overflow-y-auto print:max-h-none">
                  {report.recentPosts.map(post => {
                    const pm  = PLATFORM_META[post.platform] ?? { icon: "📣", color: "#94a3b8", label: post.platform }
                    const sc  = STATUS_COLORS[post.status as keyof typeof STATUS_COLORS] ?? STATUS_COLORS.pending
                    return (
                      <div key={post.id} className="flex items-start gap-3 px-5 py-3">
                        <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: pm.color }}>{pm.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 leading-relaxed truncate">{post.content}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5">
                            {new Date(post.scheduled_time).toLocaleDateString("en-IN", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${sc.bg} ${sc.text} ${sc.border}`}>
                          {sc.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {report.summary.totalPosts === 0 && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-12 text-center">
                <FileBarChart className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">No posts in this period</p>
                <p className="text-[11px] text-slate-600 mt-1">Try expanding the date range or removing platform filters.</p>
              </div>
            )}

            {/* Print footer */}
            <div className="hidden print:block text-center pt-4 border-t border-white/10">
              <p className="text-xs text-slate-600">Generated by PostPilot AI · postpilot.app</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
