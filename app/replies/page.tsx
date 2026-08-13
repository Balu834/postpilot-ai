"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Sparkles, Loader2, AlertCircle, Copy, CheckCheck, Inbox, RefreshCw, Send, X, ExternalLink } from "lucide-react"
import { supabase } from "@/lib/supabase"

const PLATFORMS = [
  { key: "instagram", label: "Instagram",   icon: "IG", color: "#E1306C" },
  { key: "linkedin",  label: "LinkedIn",    icon: "in", color: "#0077B5" },
  { key: "twitter",   label: "Twitter / X", icon: "𝕏",  color: "#94a3b8" },
  { key: "facebook",  label: "Facebook",    icon: "f",  color: "#1877F2" },
  { key: "threads",   label: "Threads",     icon: "🧵", color: "#e2e8f0" },
  { key: "youtube",   label: "YouTube",     icon: "▶",  color: "#FF0000" },
]

const TONES = [
  { key: "friendly",     label: "Friendly",     icon: "😊" },
  { key: "professional", label: "Professional",  icon: "🎯" },
  { key: "witty",        label: "Witty",         icon: "😄" },
  { key: "empathetic",   label: "Empathetic",    icon: "🤝" },
  { key: "grateful",     label: "Grateful",      icon: "🙏" },
]

const EXAMPLE_COMMENTS = [
  "This is exactly what I needed to hear today! How long did it take you to learn this?",
  "I disagree. This approach doesn't work for everyone.",
  "Love this content! Can you make more videos about this topic?",
  "Where can I get more information about this? I'm really interested.",
]

interface Reply { label: string; text: string }

export default function RepliesPage() {
  const [mode, setMode] = useState<"manual" | "live">("manual")
  const [comment,  setComment]  = useState("")
  const [context,  setContext]  = useState("")
  const [platform, setPlatform] = useState("instagram")
  const [tone,     setTone]     = useState("friendly")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const [replies,  setReplies]  = useState<Reply[]>([])
  const [copied,   setCopied]   = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!comment.trim()) { setError("Paste a comment to reply to."); return }
    setLoading(true)
    setError("")
    setReplies([])
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/replies", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ comment, context, platform, tone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Generation failed")
      setReplies(data.replies ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (idx: number, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  const activePlatform = PLATFORMS.find(p => p.key === platform)!

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-[#F7BE4D]" />
          </div>
          <h1 className="text-xl font-bold text-white">Engagement Reply Generator</h1>
        </div>
        <p className="text-slate-500 text-sm ml-10.5">
          Paste any comment or DM and get 3 ready-to-send reply options — or pull real mentions live.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06] w-fit">
        {([
          { key: "manual" as const, label: "Manual Drafts" },
          { key: "live"   as const, label: "Live Inbox · X & Bluesky" },
        ]).map(t => (
          <button key={t.key} onClick={() => setMode(t.key)}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: mode === t.key ? "rgba(247,190,77,0.12)" : "transparent",
              color:      mode === t.key ? "#F7BE4D" : "rgba(255,255,255,0.35)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {mode === "live" && <LiveInbox />}

      {mode === "manual" && (<>
      {/* Platform */}
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Platform</p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => (
            <button key={p.key} onClick={() => setPlatform(p.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              style={platform === p.key
                ? { background: `${p.color}18`, color: p.color, borderColor: `${p.color}50` }
                : { background: "transparent", color: "#64748b", borderColor: "rgba(255,255,255,0.08)" }}>
              <span className="text-[11px]">{p.icon}</span>{p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-4">
        {/* Comment */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            Comment or DM to Reply To
          </label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
            placeholder="Paste the comment here…"
            className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3
              text-sm text-white placeholder-slate-600 resize-none
              focus:outline-none focus:border-[#F7BE4D]/40 transition-all" />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {EXAMPLE_COMMENTS.map((ex, i) => (
              <button key={i} onClick={() => setComment(ex)}
                className="text-[10px] text-slate-600 hover:text-slate-400 text-left transition-colors">
                → {ex.slice(0, 50)}…
              </button>
            ))}
          </div>
        </div>

        {/* Optional context */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            Your Post Context <span className="normal-case font-normal text-slate-700">(optional)</span>
          </label>
          <input type="text" value={context} onChange={e => setContext(e.target.value)}
            placeholder="e.g. Post about productivity tips for remote workers"
            className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5
              text-sm text-white placeholder-slate-600
              focus:outline-none focus:border-[#F7BE4D]/40 transition-all" />
        </div>

        {/* Tone */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
            Reply Tone
          </label>
          <div className="flex flex-wrap gap-2">
            {TONES.map(t => (
              <button key={t.key} onClick={() => setTone(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                  border transition-all ${
                  tone === t.key
                    ? "bg-[#F7BE4D]/15 border-[#F7BE4D]/30 text-[#F7BE4D]"
                    : "border-white/8 text-slate-500 hover:text-slate-300"
                }`}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10
          border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      <button onClick={handleGenerate} disabled={loading || !comment.trim()}
        className="btn-primary w-full py-3 text-sm font-semibold flex items-center
          justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" />Writing replies…</>
          : <><Sparkles className="w-4 h-4" />Generate 3 Replies</>}
      </button>

      {/* Replies */}
      <AnimatePresence>
        {replies.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              3 Reply Options · {activePlatform.label}
            </p>
            {replies.map((r, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-2
                  hover:border-white/15 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border
                    border-[#F7BE4D]/25 bg-[#F7BE4D]/10 text-[#F7BE4D]">
                    {r.label}
                  </span>
                  <button onClick={() => handleCopy(i, r.text)}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-[#F7BE4D] transition-colors">
                    {copied === i
                      ? <><CheckCheck className="w-3 h-3 text-emerald-400" />Copied!</>
                      : <><Copy className="w-3 h-3" />Copy</>}
                  </button>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{r.text}</p>
                <p className="text-[10px] text-slate-700">{r.text.length} chars</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      </>)}
    </div>
  )
}

// ── Live Inbox — X & Bluesky ─────────────────────────────────────────────
interface InboxItem {
  id: string
  platform: "twitter" | "bluesky"
  author_handle: string | null
  author_name: string | null
  content: string
  permalink: string | null
  ai_draft: string | null
}

const LIVE_PLATFORM_META: Record<string, { icon: string; color: string; label: string }> = {
  twitter: { icon: "𝕏", color: "#94a3b8", label: "Twitter / X" },
  bluesky: { icon: "🦋", color: "#0085ff", label: "Bluesky"    },
}

function LiveInbox() {
  const [items,    setItems]    = useState<InboxItem[]>([])
  const [drafts,   setDrafts]   = useState<Record<string, string>>({})
  const [syncing,  setSyncing]  = useState(false)
  const [synced,   setSynced]   = useState(false)
  const [error,    setError]    = useState("")
  const [errors,   setErrors]   = useState<string[]>([])
  const [connected, setConnected] = useState<{ twitter: boolean; bluesky: boolean }>({ twitter: false, bluesky: false })
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [dismissingId, setDismissingId] = useState<string | null>(null)

  const sync = async () => {
    setSyncing(true)
    setError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/replies/inbox", {
        headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Sync failed")
      setItems(data.inbox ?? [])
      setConnected(data.connected ?? { twitter: false, bluesky: false })
      setErrors(data.errors ?? [])
      setDrafts(Object.fromEntries((data.inbox ?? []).map((i: InboxItem) => [i.id, i.ai_draft ?? ""])))
      setSynced(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSyncing(false)
    }
  }

  const handleSend = async (id: string) => {
    setSendingId(id)
    const { data: { session } } = await supabase.auth.getSession()
    try {
      const res = await fetch(`/api/replies/inbox/${id}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body:    JSON.stringify({ text: drafts[id] ?? "" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to send")
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send reply")
    } finally {
      setSendingId(null)
    }
  }

  const handleDismiss = async (id: string) => {
    setDismissingId(id)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch(`/api/replies/inbox/${id}`, {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
    })
    setItems(prev => prev.filter(i => i.id !== id))
    setDismissingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Pulls real mentions &amp; replies from your connected Twitter/X and Bluesky accounts. You review and edit every reply before it sends.
        </p>
        <button onClick={sync} disabled={syncing}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl
            bg-white/8 text-slate-300 hover:bg-white/12 transition-all disabled:opacity-50">
          {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {syncing ? "Syncing…" : "Sync Now"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {synced && !connected.twitter && !connected.bluesky && (
        <div className="text-xs text-slate-500 bg-white/3 rounded-xl px-4 py-3 border border-white/6">
          Connect Twitter/X or Bluesky in Settings → Connected Accounts to start pulling mentions.
        </div>
      )}

      {errors.length > 0 && (
        <div className="text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3 space-y-1">
          {errors.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}

      {!syncing && synced && items.length === 0 && errors.length === 0 && (connected.twitter || connected.bluesky) && (
        <div className="text-xs text-slate-500 bg-white/3 rounded-xl px-4 py-3 border border-white/6 flex items-center gap-2">
          <Inbox className="w-4 h-4 flex-shrink-0" /> No new mentions right now.
        </div>
      )}

      <AnimatePresence>
        {items.map((item, i) => {
          const meta = LIVE_PLATFORM_META[item.platform]
          return (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs" style={{ color: meta.color }}>{meta.icon}</span>
                    <span className="text-xs font-semibold text-slate-300">{item.author_name || item.author_handle || "Someone"}</span>
                    {item.author_handle && <span className="text-[11px] text-slate-600">{item.author_handle}</span>}
                    {item.permalink && (
                      <a href={item.permalink} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-400 transition-colors">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.content}</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5">
                  Your Reply
                </label>
                <textarea
                  value={drafts[item.id] ?? ""}
                  onChange={e => setDrafts(prev => ({ ...prev, [item.id]: e.target.value }))}
                  rows={2}
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2.5
                    text-sm text-white placeholder-slate-600 resize-none
                    focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => handleSend(item.id)} disabled={sendingId === item.id || !drafts[item.id]?.trim()}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-[#F7BE4D] text-[#050816] px-3.5 py-2 rounded-xl
                    hover:bg-[#ffd166] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {sendingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {sendingId === item.id ? "Sending…" : "Send Reply"}
                </button>
                <button onClick={() => handleDismiss(item.id)} disabled={dismissingId === item.id}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-300
                    px-3 py-2 rounded-xl transition-colors disabled:opacity-40">
                  <X className="w-3.5 h-3.5" /> Dismiss
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
