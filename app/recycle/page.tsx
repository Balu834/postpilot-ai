"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw, Sparkles, Loader2, AlertCircle, Copy, CheckCheck, CalendarClock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

const PLATFORM_META: Record<string, { icon: string; color: string; label: string }> = {
  instagram: { icon: "IG", color: "#E1306C", label: "Instagram" },
  linkedin:  { icon: "in", color: "#0077B5", label: "LinkedIn"  },
  twitter:   { icon: "𝕏",  color: "#94a3b8", label: "Twitter"   },
  facebook:  { icon: "f",  color: "#1877F2", label: "Facebook"  },
  threads:   { icon: "🧵", color: "#e2e8f0", label: "Threads"   },
  bluesky:   { icon: "🦋", color: "#0085ff", label: "Bluesky"   },
  pinterest: { icon: "📌", color: "#E60023", label: "Pinterest" },
}

const ANGLES = [
  { key: "fresh",     label: "Fresh Take",    desc: "Same message, new hook & structure" },
  { key: "opposite",  label: "Flip It",       desc: "Argue the opposite or challenge it"  },
  { key: "story",     label: "Story-led",     desc: "Reframe as a personal anecdote"      },
  { key: "listicle",  label: "Make a List",   desc: "Restructure as numbered points"      },
  { key: "question",  label: "Question Hook", desc: "Open with a thought-provoking ask"   },
  { key: "statistic", label: "Lead with Data","desc": "Start with a fact or stat"         },
]

interface Post { id: string; content: string; platform: string; scheduled_time: string; status: string }

export default function RecyclePage() {
  const [posts,    setPosts]    = useState<Post[]>([])
  const [selected, setSelected] = useState<Post | null>(null)
  const [angle,    setAngle]    = useState("fresh")
  const [loading,  setLoading]  = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error,    setError]    = useState("")
  const [recycled, setRecycled] = useState("")
  const [copied,   setCopied]   = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from("scheduled_posts")
        .select("id,content,platform,scheduled_time,status")
        .eq("user_id", user.id)
        .in("status", ["published", "pending"])
        .order("created_at", { ascending: false })
        .limit(30)
      setPosts(data ?? [])
      setFetching(false)
    })
  }, [])

  const handleRecycle = async () => {
    if (!selected) return
    setLoading(true)
    setError("")
    setRecycled("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/recycle", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ originalContent: selected.content, platform: selected.platform, angle }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Recycling failed")
      setRecycled(data.recycled)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(recycled)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-[#F7BE4D]" />
          </div>
          <h1 className="text-xl font-bold text-white">Post Recycler</h1>
        </div>
        <p className="text-slate-500 text-sm ml-10.5">
          Breathe new life into old posts. Pick one, choose an angle, get a fresh version instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — post picker */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            Pick a Post to Recycle
          </p>

          {fetching ? (
            <div className="space-y-2">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5 space-y-2">
                  <div className="skeleton h-3 w-20 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-8 text-center">
              <RefreshCw className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No posts yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">Schedule some posts first, then come back to recycle them.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {posts.map(post => {
                const pm    = PLATFORM_META[post.platform] ?? { icon: "📣", color: "#94a3b8", label: post.platform }
                const isSelected = selected?.id === post.id
                return (
                  <button key={post.id} onClick={() => { setSelected(post); setRecycled(""); setError("") }}
                    className="w-full text-left rounded-xl border p-3.5 transition-all"
                    style={isSelected
                      ? { borderColor: `${pm.color}40`, background: `${pm.color}08` }
                      : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-bold" style={{ color: pm.color }}>{pm.icon}</span>
                      <span className="text-[11px] font-semibold text-slate-500">{pm.label}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-auto ${
                        post.status === "published"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-[#F7BE4D]/12 text-[#F7BE4D]"
                      }`}>{post.status}</span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{post.content}</p>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Right — angle + result */}
        <div className="space-y-4">
          {/* Angle picker */}
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Recycling Angle</p>
            <div className="grid grid-cols-2 gap-2">
              {ANGLES.map(a => (
                <button key={a.key} onClick={() => setAngle(a.key)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    angle === a.key
                      ? "border-[#F7BE4D]/40 bg-[#F7BE4D]/08"
                      : "border-white/8 bg-white/[0.02] hover:border-white/15"
                  }`}>
                  <p className={`text-xs font-semibold ${angle === a.key ? "text-white" : "text-slate-400"}`}>
                    {a.label}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{a.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10
              border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <button onClick={handleRecycle} disabled={loading || !selected}
            className="btn-primary w-full py-3 text-sm font-semibold flex items-center
              justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Recycling post…</>
              : <><Sparkles className="w-4 h-4" />Recycle This Post</>}
          </button>

          {/* Result */}
          <AnimatePresence>
            {recycled && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-xl border border-[#F7BE4D]/15 bg-[#F7BE4D]/[0.03] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-[#F7BE4D] uppercase tracking-wider">Recycled Version</p>
                  <button onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-[#F7BE4D] transition-colors">
                    {copied
                      ? <><CheckCheck className="w-3 h-3 text-emerald-400" />Copied!</>
                      : <><Copy className="w-3 h-3" />Copy</>}
                  </button>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{recycled}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-700">{recycled.length} chars</p>
                  <Link href="/schedule"
                    className="flex items-center gap-1 text-[11px] text-[#F7BE4D] hover:underline">
                    <CalendarClock className="w-3 h-3" />Schedule →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
