"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Inbox, AlertCircle, Clock, CheckCircle2, RefreshCw,
  Trash2, Send, Loader2, Bell, Activity,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

// ── Types ─────────────────────────────────────────────────────────
type PostStatus = "pending" | "published" | "failed" | "pending_approval" | "rejected"

interface InboxPost {
  id:             string
  content:        string
  platform:       string
  scheduled_time: string
  status:         PostStatus
  image_url:      string | null
}

interface ActivityItem {
  id:         string
  action:     string
  platform:   string | null
  created_at: string
}

// ── Config ────────────────────────────────────────────────────────
const PLATFORM_META: Record<string, { icon: string; color: string; label: string }> = {
  instagram: { icon: "📸", color: "#E1306C", label: "Instagram"   },
  linkedin:  { icon: "💼", color: "#0077B5", label: "LinkedIn"    },
  twitter:   { icon: "𝕏",  color: "#94a3b8", label: "Twitter / X" },
  facebook:  { icon: "f",  color: "#1877F2", label: "Facebook"    },
  threads:   { icon: "🧵", color: "#e2e8f0", label: "Threads"     },
  bluesky:   { icon: "🦋", color: "#0085ff", label: "Bluesky"     },
  pinterest: { icon: "📌", color: "#E60023", label: "Pinterest"   },
  youtube:   { icon: "▶",  color: "#FF0000", label: "YouTube"     },
}

function getPlatform(key: string) {
  return PLATFORM_META[key] ?? { icon: "📝", color: "#94a3b8", label: key }
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)    return "just now"
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Main Page ─────────────────────────────────────────────────────
export default function InboxPage() {
  const [failedPosts,    setFailedPosts]    = useState<InboxPost[]>([])
  const [approvalPosts,  setApprovalPosts]  = useState<InboxPost[]>([])
  const [activity,       setActivity]       = useState<ActivityItem[]>([])
  const [loading,        setLoading]        = useState(true)
  const [retrying,       setRetrying]       = useState<string | null>(null)
  const [deleting,       setDeleting]       = useState<string | null>(null)
  const [tab,            setTab]            = useState<"attention" | "activity">("attention")

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [failedRes, approvalRes, activityRes] = await Promise.all([
      supabase.from("scheduled_posts").select("*")
        .eq("user_id", user.id).eq("status", "failed")
        .order("scheduled_time", { ascending: false }).limit(20),
      supabase.from("scheduled_posts").select("*")
        .eq("user_id", user.id).eq("status", "pending_approval")
        .order("scheduled_time", { ascending: true }).limit(20),
      supabase.from("activity_log").select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(50),
    ])

    setFailedPosts((failedRes.data as InboxPost[]) || [])
    setApprovalPosts((approvalRes.data as InboxPost[]) || [])
    setActivity((activityRes.data as ActivityItem[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleRetry = async (post: InboxPost) => {
    setRetrying(post.id)
    const { data: { session } } = await supabase.auth.getSession()
    try {
      const res = await fetch("/api/social/publish", {
        method:  "POST",
        headers: { Authorization: `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ postId: post.id }),
      })
      if (res.ok) {
        setFailedPosts(ps => ps.filter(p => p.id !== post.id))
      }
    } catch {}
    setRetrying(null)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await supabase.from("scheduled_posts").delete().eq("id", id)
    setFailedPosts(ps => ps.filter(p => p.id !== id))
    setApprovalPosts(ps => ps.filter(p => p.id !== id))
    setDeleting(null)
  }

  const attentionCount = failedPosts.length + approvalPosts.length

  return (
    <div className="max-w-3xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Inbox className="w-5 h-5 text-[#F7BE4D]" />
            Inbox
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Posts needing attention &amp; recent activity</p>
        </div>
        <button onClick={load} disabled={loading}
          className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-40">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06] w-fit">
        {([
          { key: "attention", label: "Needs Attention", icon: Bell,     badge: attentionCount },
          { key: "activity",  label: "Activity Feed",   icon: Activity, badge: 0 },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: tab === t.key ? "rgba(247,190,77,0.12)" : "transparent",
              color:      tab === t.key ? "#F7BE4D" : "rgba(255,255,255,0.35)",
            }}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.badge > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {t.badge > 9 ? "9+" : t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
        </div>
      ) : tab === "attention" ? (

        /* ── Attention tab ── */
        <div className="space-y-5">
          {/* Failed posts */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-semibold text-white">Failed Posts</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-bold">
                {failedPosts.length}
              </span>
            </div>

            {failedPosts.length === 0 ? (
              <div className="glass rounded-2xl p-8 border border-white/6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No failed posts</p>
                <p className="text-xs text-slate-600 mt-1">All your posts published successfully</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {failedPosts.map((post, i) => {
                    const plt = getPlatform(post.platform)
                    return (
                      <motion.div key={post.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.04 }}
                        className="glass rounded-xl p-4 border border-red-500/15 hover:border-red-500/25 transition-colors"
                        style={{ background: "rgba(239,68,68,0.03)" }}>
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                            style={{ background: `${plt.color}18` }}>
                            {plt.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold" style={{ color: plt.color }}>{plt.label}</span>
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                                <AlertCircle className="w-2.5 h-2.5" />Failed
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 line-clamp-2 mb-1.5">{post.content}</p>
                            <p className="text-[11px] text-slate-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Scheduled: {new Date(post.scheduled_time).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button onClick={() => handleRetry(post)} disabled={retrying === post.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                              style={{ background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399" }}>
                              {retrying === post.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Send className="w-3.5 h-3.5" />}
                              {retrying === post.id ? "Retrying…" : "Retry"}
                            </button>
                            <button onClick={() => handleDelete(post.id)} disabled={deleting === post.id}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                              {deleting === post.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* Pending approval */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#818cf8]" />
              <h2 className="text-sm font-semibold text-white">Pending Approval</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#818cf8]/15 text-[#818cf8] border border-[#818cf8]/20 font-bold">
                {approvalPosts.length}
              </span>
            </div>

            {approvalPosts.length === 0 ? (
              <div className="glass rounded-2xl p-8 border border-white/6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No posts awaiting approval</p>
                <p className="text-xs text-slate-600 mt-1">Team approval workflow is idle</p>
              </div>
            ) : (
              <div className="space-y-2">
                {approvalPosts.map((post, i) => {
                  const plt = getPlatform(post.platform)
                  return (
                    <motion.div key={post.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="glass rounded-xl p-4 border border-[#818cf8]/15 hover:border-[#818cf8]/25 transition-colors"
                      style={{ background: "rgba(129,140,248,0.03)" }}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                          style={{ background: `${plt.color}18` }}>
                          {plt.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold" style={{ color: plt.color }}>{plt.label}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#818cf8]/15 text-[#818cf8] border border-[#818cf8]/20">
                              Needs Approval
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 line-clamp-2 mb-1.5">{post.content}</p>
                          <p className="text-[11px] text-slate-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due: {new Date(post.scheduled_time).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <button onClick={() => handleDelete(post.id)} disabled={deleting === post.id}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                          {deleting === post.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </section>

          {attentionCount === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-10 border border-white/6 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-base font-semibold text-white mb-1">All clear!</p>
              <p className="text-sm text-slate-500">No posts need your attention right now.</p>
            </motion.div>
          )}
        </div>

      ) : (

        /* ── Activity feed tab ── */
        <div className="glass rounded-2xl border border-white/6 overflow-hidden">
          {activity.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No activity yet</p>
              <p className="text-xs text-slate-600 mt-1">Generate and publish posts to see activity here</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {activity.map((item, i) => {
                const plt = item.platform ? getPlatform(item.platform) : null
                return (
                  <motion.div key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                      style={{ background: plt ? `${plt.color}18` : "rgba(247,190,77,0.10)" }}>
                      {plt ? plt.icon : "⚡"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 truncate">{item.action}</p>
                    </div>
                    <span className="text-[10px] text-slate-600 flex-shrink-0">{timeAgo(item.created_at)}</span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
