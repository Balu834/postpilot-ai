"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Repeat, Loader2, AlertCircle, Pause, Play, Trash2, Clock, History } from "lucide-react"
import { supabase } from "@/lib/supabase"

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

const INTERVALS = [7, 14, 30, 60, 90]

interface EligiblePost { id: string; content: string; platform: string }
interface EvergreenSource {
  id: string; content: string; platform: string
  evergreen_active: boolean; evergreen_interval_days: number; evergreen_last_recycled_at: string | null
}
interface HistoryItem {
  id: string; content: string; platform: string
  scheduled_time: string; status: string; evergreen_source_id: string
}

function getPlatform(key: string) {
  return PLATFORM_META[key] ?? { icon: "📣", color: "#94a3b8", label: key }
}

function nextDue(last: string | null, intervalDays: number) {
  const base = last ? new Date(last).getTime() : Date.now()
  return new Date(base + intervalDays * 86400000)
}

export default function EvergreenPage() {
  const [eligible,   setEligible]   = useState<EligiblePost[]>([])
  const [sources,    setSources]    = useState<EvergreenSource[]>([])
  const [history,    setHistory]    = useState<HistoryItem[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState("")
  const [selectedId, setSelectedId] = useState("")
  const [interval,   setInterval_]  = useState(30)
  const [adding,     setAdding]     = useState(false)
  const [busyId,     setBusyId]     = useState<string | null>(null)
  const [tab,        setTab]        = useState<"queue" | "history">("queue")

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }

    const [queueRes, eligibleRes] = await Promise.all([
      fetch("/api/evergreen", { headers: { Authorization: `Bearer ${session.access_token}` } }),
      supabase.from("scheduled_posts")
        .select("id, content, platform")
        .eq("user_id", session.user.id)
        .eq("status", "published")
        .eq("is_evergreen", false)
        .order("scheduled_time", { ascending: false })
        .limit(50),
    ])

    if (queueRes.ok) {
      const data = await queueRes.json()
      setSources(data.sources ?? [])
      setHistory(data.history ?? [])
    }
    setEligible((eligibleRes.data as EligiblePost[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!selectedId) return
    setAdding(true)
    setError("")
    const { data: { session } } = await supabase.auth.getSession()
    try {
      const res = await fetch("/api/evergreen", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body:    JSON.stringify({ postId: selectedId, intervalDays: interval }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSelectedId("")
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add to queue")
    } finally {
      setAdding(false)
    }
  }

  const handleAction = async (id: string, action: "pause" | "resume" | "remove") => {
    setBusyId(id)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch(`/api/evergreen/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
      body:    JSON.stringify({ action }),
    })
    await load()
    setBusyId(null)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#34d399]/10 border border-[#34d399]/20 flex items-center justify-center">
            <Repeat className="w-4 h-4 text-[#34d399]" />
          </div>
          <h1 className="text-xl font-bold text-white">Evergreen Queue</h1>
        </div>
        <p className="text-slate-500 text-sm ml-10.5">
          Auto-recirculate your best posts on a repeat interval instead of letting them die after one post.
        </p>
      </div>

      {/* Add to queue */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-4">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Add a Published Post</p>
        {eligible.length === 0 ? (
          <p className="text-xs text-slate-600">No published posts available yet — publish something first, then come back to make it evergreen.</p>
        ) : (
          <>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5
                text-sm text-white focus:outline-none focus:border-[#F7BE4D]/40 transition-all">
              <option value="">Choose a published post…</option>
              {eligible.map(p => (
                <option key={p.id} value={p.id}>
                  [{getPlatform(p.platform).label}] {p.content.slice(0, 60)}
                </option>
              ))}
            </select>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Repeat every</p>
              <div className="flex flex-wrap gap-2">
                {INTERVALS.map(d => (
                  <button key={d} onClick={() => setInterval_(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      interval === d
                        ? "bg-[#34d399]/15 border-[#34d399]/30 text-[#34d399]"
                        : "border-white/8 text-slate-500 hover:text-slate-300"
                    }`}>
                    {d} days
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleAdd} disabled={adding || !selectedId}
              className="flex items-center gap-1.5 text-xs font-semibold bg-[#34d399] text-[#050816] px-4 py-2.5 rounded-xl
                hover:bg-[#4ade80] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Repeat className="w-3.5 h-3.5" />}
              {adding ? "Adding…" : "Add to Evergreen Queue"}
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06] w-fit">
        {([
          { key: "queue"   as const, label: `Active Queue (${sources.length})` },
          { key: "history" as const, label: "History" },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: tab === t.key ? "rgba(52,211,153,0.12)" : "transparent",
              color:      tab === t.key ? "#34d399" : "rgba(255,255,255,0.35)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
        </div>
      ) : tab === "queue" ? (
        sources.length === 0 ? (
          <div className="text-xs text-slate-500 bg-white/3 rounded-xl px-4 py-3 border border-white/6">
            Nothing in the queue yet.
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {sources.map(s => {
                const plt = getPlatform(s.platform)
                const due = nextDue(s.evergreen_last_recycled_at, s.evergreen_interval_days)
                return (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold" style={{ color: plt.color }}>{plt.icon} {plt.label}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full border"
                            style={s.evergreen_active
                              ? { color: "#34d399", borderColor: "rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.1)" }
                              : { color: "#94a3b8", borderColor: "rgba(148,163,184,0.2)", background: "rgba(148,163,184,0.08)" }}>
                            {s.evergreen_active ? "Active" : "Paused"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2 mb-1.5">{s.content}</p>
                        <p className="text-[11px] text-slate-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Every {s.evergreen_interval_days} days
                          {s.evergreen_active && ` · next ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => handleAction(s.id, s.evergreen_active ? "pause" : "resume")}
                          disabled={busyId === s.id}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-40">
                          {s.evergreen_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleAction(s.id, "remove")} disabled={busyId === s.id}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )
      ) : (
        history.length === 0 ? (
          <div className="text-xs text-slate-500 bg-white/3 rounded-xl px-4 py-3 border border-white/6 flex items-center gap-2">
            <History className="w-4 h-4 flex-shrink-0" /> Nothing recirculated yet.
          </div>
        ) : (
          <div className="space-y-2">
            {history.map(h => {
              const plt = getPlatform(h.platform)
              return (
                <div key={h.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold" style={{ color: plt.color }}>{plt.icon} {plt.label}</span>
                    <span className="text-[10px] text-slate-600">
                      {new Date(h.scheduled_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-[10px] text-slate-600 capitalize">· {h.status}</span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">{h.content}</p>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
