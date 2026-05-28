"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Sparkles, Loader2, AlertCircle, Copy, CheckCheck } from "lucide-react"
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
          Paste any comment or DM and get 3 ready-to-send reply options in seconds.
        </p>
      </div>

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
    </div>
  )
}
