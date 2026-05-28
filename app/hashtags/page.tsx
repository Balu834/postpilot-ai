"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Hash, Sparkles, Copy, CheckCheck, Loader2,
  Bookmark, BookmarkCheck, Trash2, TrendingUp,
  Target, Gem, Zap, ChevronDown,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

// ── Types ─────────────────────────────────────────────────────────
interface HashtagResult {
  trending:  string[]
  high:      string[]
  medium:    string[]
  niche:     string[]
  strategy:  string
}

interface SavedSet {
  id:       string
  topic:    string
  platform: string
  tags:     string[]
  savedAt:  string
}

// ── Config ────────────────────────────────────────────────────────
const PLATFORMS = [
  { key: "instagram", label: "Instagram",   icon: "📸", color: "#E1306C" },
  { key: "twitter",   label: "Twitter / X", icon: "𝕏",  color: "#94a3b8" },
  { key: "linkedin",  label: "LinkedIn",    icon: "💼", color: "#0077B5" },
  { key: "pinterest", label: "Pinterest",   icon: "📌", color: "#E60023" },
  { key: "threads",   label: "Threads",     icon: "🧵", color: "#e2e8f0" },
  { key: "bluesky",   label: "Bluesky",     icon: "🦋", color: "#0085ff" },
]

const TIERS: { key: keyof Omit<HashtagResult, "strategy">; label: string; icon: typeof TrendingUp; color: string; desc: string }[] = [
  { key: "trending", label: "Trending",   icon: Zap,        color: "#f472b6", desc: "Viral right now · 10M+ posts" },
  { key: "high",     label: "High Volume", icon: TrendingUp, color: "#F7BE4D", desc: "Broad reach · 1M–10M posts" },
  { key: "medium",   label: "Mid-Range",  icon: Target,     color: "#34d399", desc: "Balanced · 100K–1M posts" },
  { key: "niche",    label: "Niche",      icon: Gem,        color: "#818cf8", desc: "High engagement · under 100K" },
]

const QUICK_TOPICS = [
  "Digital marketing", "Startup growth", "Personal branding",
  "AI tools", "Fitness motivation", "Content creation",
  "Entrepreneurship", "Remote work", "Mental health",
]

const STORAGE_KEY = "postpilot_saved_hashtag_sets"

function loadSaved(): SavedSet[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") } catch { return [] }
}
function saveSets(sets: SavedSet[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets))
}

// ── CopyBtn ────────────────────────────────────────────────────────
function CopyBtn({ tags, label = "Copy" }: { tags: string[]; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(tags.map(t => `#${t}`).join(" "))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={{
        background: copied ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)",
        border:     copied ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(255,255,255,0.08)",
        color:      copied ? "#34d399" : "#94a3b8",
      }}>
      {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : label}
    </button>
  )
}

// ── Hashtag chip ──────────────────────────────────────────────────
function Chip({ tag, color }: { tag: string; color: string }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(`#${tag}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <button onClick={handle}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-75"
      style={{ background: `${color}14`, border: `1px solid ${color}28`, color }}>
      {copied ? <CheckCheck className="w-3 h-3" /> : <span className="opacity-50">#</span>}
      {tag}
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function HashtagsPage() {
  const [topic,     setTopic]     = useState("")
  const [platform,  setPlatform]  = useState("instagram")
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState<HashtagResult | null>(null)
  const [error,     setError]     = useState("")
  const [savedSets, setSavedSets] = useState<SavedSet[]>([])
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => { setSavedSets(loadSaved()) }, [])

  const allTags = result
    ? [...(result.trending ?? []), ...(result.high ?? []), ...(result.medium ?? []), ...(result.niche ?? [])]
    : []

  const handleResearch = async () => {
    if (!topic.trim()) return
    setLoading(true); setError(""); setResult(null)
    const { data: { session } } = await supabase.auth.getSession()
    try {
      const res = await fetch("/api/hashtags/research", {
        method:  "POST",
        headers: { Authorization: `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ topic, platform }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Research failed")
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Research failed")
    }
    setLoading(false)
  }

  const handleSave = () => {
    if (!result || !topic) return
    const set: SavedSet = {
      id:       Math.random().toString(36).slice(2),
      topic,
      platform,
      tags:     allTags,
      savedAt:  new Date().toISOString(),
    }
    const updated = [set, ...savedSets].slice(0, 20)
    setSavedSets(updated)
    saveSets(updated)
  }

  const deleteSet = (id: string) => {
    const updated = savedSets.filter(s => s.id !== id)
    setSavedSets(updated)
    saveSets(updated)
  }

  const isSaved = result && savedSets.some(
    s => s.topic === topic && s.platform === platform
  )

  const activePlatform = PLATFORMS.find(p => p.key === platform)!

  return (
    <div className="max-w-4xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Hash className="w-5 h-5 text-[#F7BE4D]" />
            Hashtag Research
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">AI-powered hashtag discovery for every platform</p>
        </div>
        {savedSets.length > 0 && (
          <button onClick={() => setShowSaved(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: showSaved ? "rgba(247,190,77,0.12)" : "rgba(255,255,255,0.04)", border: showSaved ? "1px solid rgba(247,190,77,0.25)" : "1px solid rgba(255,255,255,0.08)", color: showSaved ? "#F7BE4D" : "#94a3b8" }}>
            <Bookmark className="w-3.5 h-3.5" />
            Saved Sets ({savedSets.length})
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSaved ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* Saved sets drawer */}
      <AnimatePresence>
        {showSaved && savedSets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass rounded-2xl border border-white/6 overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-white/[0.05]">
              <p className="text-xs font-semibold text-slate-400">Saved Hashtag Sets</p>
            </div>
            <div className="divide-y divide-white/[0.04] max-h-64 overflow-y-auto">
              {savedSets.map(set => {
                const plt = PLATFORMS.find(p => p.key === set.platform)
                return (
                  <div key={set.id} className="px-5 py-3 flex items-center gap-3 group">
                    <span className="text-base flex-shrink-0">{plt?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{set.topic}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{set.tags.length} tags · {plt?.label}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <CopyBtn tags={set.tags} label="Copy all" />
                      <button onClick={() => deleteSet(set.id)}
                        className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input card */}
      <div className="glass rounded-2xl p-5 border border-white/6 space-y-4">

        {/* Platform */}
        <div>
          <label className="text-xs text-slate-500 mb-2 block font-medium">Platform</label>
          <div className="flex gap-2 flex-wrap">
            {PLATFORMS.map(p => (
              <button key={p.key} onClick={() => setPlatform(p.key)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: platform === p.key ? `${p.color}18` : "rgba(255,255,255,0.03)",
                  border:     platform === p.key ? `1px solid ${p.color}40` : "1px solid rgba(255,255,255,0.07)",
                  color:      platform === p.key ? p.color : "rgba(255,255,255,0.3)",
                }}>
                <span>{p.icon}</span>{p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div>
          <label className="text-xs text-slate-500 mb-2 block font-medium">Topic / Niche</label>
          <div className="flex gap-2">
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleResearch()}
              placeholder="e.g. Personal branding for founders"
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
            />
            <button onClick={handleResearch} disabled={loading || !topic.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #F7BE4D, #ffd166)", color: "#050816", boxShadow: "0 4px 16px rgba(247,190,77,0.3)" }}>
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Sparkles className="w-4 h-4" />}
              {loading ? "Researching…" : "Research"}
            </button>
          </div>

          {/* Quick topic pills */}
          <div className="flex gap-1.5 flex-wrap mt-2.5">
            {QUICK_TOPICS.map(t => (
              <button key={t} onClick={() => setTopic(t)}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-white/[0.06] text-slate-500 hover:text-slate-300 hover:border-white/[0.12] transition-all">
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Strategy tip */}
            {result.strategy && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(247,190,77,0.06)", border: "1px solid rgba(247,190,77,0.15)" }}>
                <Sparkles className="w-3.5 h-3.5 text-[#F7BE4D] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">{result.strategy}</p>
              </div>
            )}

            {/* Copy all + Save */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">
                {allTags.length} hashtags for
                <span className="ml-1" style={{ color: activePlatform.color }}>{activePlatform.icon} {activePlatform.label}</span>
              </p>
              <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={!!isSaved}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                  style={{
                    background: isSaved ? "rgba(129,140,248,0.12)" : "rgba(255,255,255,0.05)",
                    border:     isSaved ? "1px solid rgba(129,140,248,0.25)" : "1px solid rgba(255,255,255,0.08)",
                    color:      isSaved ? "#818cf8" : "#94a3b8",
                  }}>
                  {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  {isSaved ? "Saved" : "Save set"}
                </button>
                <CopyBtn tags={allTags} label="Copy all" />
              </div>
            </div>

            {/* Tier cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TIERS.map(tier => {
                const tags = result[tier.key] ?? []
                if (tags.length === 0) return null
                return (
                  <motion.div key={tier.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-4 border border-white/6"
                    style={{ background: `${tier.color}05` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ background: `${tier.color}18` }}>
                          <tier.icon className="w-3.5 h-3.5" style={{ color: tier.color }} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{tier.label}</p>
                          <p className="text-[10px]" style={{ color: tier.color }}>{tier.desc}</p>
                        </div>
                      </div>
                      <CopyBtn tags={tags} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(tag => (
                        <Chip key={tag} tag={tag} color={tier.color} />
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Full combined set */}
            <div className="glass rounded-2xl p-4 border border-white/6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400">Full Set (ready to paste)</p>
                <CopyBtn tags={allTags} label="Copy all" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed break-words select-all">
                {allTags.map(t => `#${t}`).join(" ")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="glass rounded-2xl p-12 border border-white/6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center mx-auto mb-4">
            <Hash className="w-7 h-7 text-[#F7BE4D]" />
          </div>
          <p className="text-sm font-semibold text-white mb-1">Research any topic</p>
          <p className="text-xs text-slate-500">Enter a topic above to get AI-curated hashtags<br />sorted by volume tier for maximum reach</p>
        </div>
      )}
    </div>
  )
}
