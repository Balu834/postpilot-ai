"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Rss, Search, CheckSquare, Square, Loader2, Sparkles,
  CheckCircle2, CalendarClock, ExternalLink, Clock, AlertCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

// ── Types ─────────────────────────────────────────────────────────
interface Article {
  title:       string
  link:        string
  description: string
  pubDate:     string
}

// ── Config ────────────────────────────────────────────────────────
const PLATFORMS = [
  { key: "linkedin",  label: "LinkedIn",    icon: "💼", color: "#0077B5" },
  { key: "twitter",   label: "Twitter / X", icon: "𝕏",  color: "#94a3b8" },
  { key: "instagram", label: "Instagram",   icon: "📸", color: "#E1306C" },
  { key: "facebook",  label: "Facebook",    icon: "f",  color: "#1877F2" },
  { key: "threads",   label: "Threads",     icon: "🧵", color: "#e2e8f0" },
  { key: "bluesky",   label: "Bluesky",     icon: "🦋", color: "#0085ff" },
]

const TONES = [
  { value: "engaging",      label: "Engaging",      emoji: "🔥" },
  { value: "professional",  label: "Professional",  emoji: "💼" },
  { value: "educational",   label: "Educational",   emoji: "🎓" },
  { value: "inspirational", label: "Inspirational", emoji: "✨" },
]

const INTERVALS = [
  { value: 6,  label: "Every 6 hours" },
  { value: 12, label: "Every 12 hours" },
  { value: 24, label: "Every day" },
  { value: 48, label: "Every 2 days" },
]

const EXAMPLE_FEEDS = [
  { label: "TechCrunch",   url: "https://techcrunch.com/feed/" },
  { label: "Hacker News",  url: "https://news.ycombinator.com/rss" },
  { label: "Product Hunt", url: "https://www.producthunt.com/feed" },
]

function formatDate(str: string) {
  if (!str) return ""
  try {
    return new Date(str).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch { return str }
}

// ── Main Page ─────────────────────────────────────────────────────
export default function RSSPage() {
  const [feedUrl,    setFeedUrl]    = useState("")
  const [feedTitle,  setFeedTitle]  = useState("")
  const [articles,   setArticles]   = useState<Article[]>([])
  const [selected,   setSelected]   = useState<Set<number>>(new Set())
  const [platforms,  setPlatforms]  = useState<string[]>(["linkedin", "twitter"])
  const [tone,       setTone]       = useState("engaging")
  const [startDate,  setStartDate]  = useState("")
  const [interval,   setInterval]   = useState(24)
  const [fetching,   setFetching]   = useState(false)
  const [generating, setGenerating] = useState(false)
  const [fetchErr,   setFetchErr]   = useState("")
  const [genErr,     setGenErr]     = useState("")
  const [scheduled,  setScheduled]  = useState<number | null>(null)

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split("T")[0] + "T09:00"

  const handleFetch = async () => {
    if (!feedUrl.trim()) return
    setFetching(true); setFetchErr(""); setArticles([]); setSelected(new Set()); setScheduled(null)
    try {
      const res  = await fetch("/api/rss/parse", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ feedUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch feed")
      setArticles(data.articles)
      setFeedTitle(data.feedTitle || "")
      setSelected(new Set(data.articles.map((_: Article, i: number) => i)))
    } catch (err: unknown) {
      setFetchErr(err instanceof Error ? err.message : "Failed to fetch")
    }
    setFetching(false)
  }

  const toggleArticle = (i: number) => setSelected(prev => {
    const next = new Set(prev)
    next.has(i) ? next.delete(i) : next.add(i)
    return next
  })

  const toggleAll = () => {
    if (selected.size === articles.length) setSelected(new Set())
    else setSelected(new Set(articles.map((_, i) => i)))
  }

  const togglePlatform = (key: string) => setPlatforms(prev =>
    prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
  )

  const handleGenerate = async () => {
    if (selected.size === 0 || platforms.length === 0) return
    setGenerating(true); setGenErr(""); setScheduled(null)
    const { data: { session } } = await supabase.auth.getSession()
    const selectedArticles = [...selected].map(i => articles[i])
    try {
      const res  = await fetch("/api/rss/generate", {
        method:  "POST",
        headers: { Authorization: `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({
          articles:      selectedArticles,
          platforms,
          tone,
          startDate:     startDate || defaultDate,
          intervalHours: interval,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setScheduled(data.scheduled)
    } catch (err: unknown) {
      setGenErr(err instanceof Error ? err.message : "Generation failed")
    }
    setGenerating(false)
  }

  const totalPosts = selected.size * platforms.length

  return (
    <div className="max-w-4xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Rss className="w-5 h-5 text-[#F7BE4D]" />
          RSS Auto-Import
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Paste any blog RSS feed — AI generates and schedules posts automatically</p>
      </div>

      {/* Step 1: Feed URL */}
      <div className="glass rounded-2xl p-5 border border-white/6 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-[#F7BE4D]/15 flex items-center justify-center text-[10px] text-[#F7BE4D] font-bold">1</span>
          Feed URL
        </h2>
        <div className="flex gap-2">
          <input
            value={feedUrl}
            onChange={e => setFeedUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleFetch()}
            placeholder="https://yourblog.com/feed or https://example.com/rss.xml"
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
          />
          <button onClick={handleFetch} disabled={fetching || !feedUrl.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #F7BE4D, #ffd166)", color: "#050816", boxShadow: "0 4px 16px rgba(247,190,77,0.3)" }}>
            {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {fetching ? "Fetching…" : "Fetch Feed"}
          </button>
        </div>
        {/* Example feeds */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-slate-600 font-medium">Try:</span>
          {EXAMPLE_FEEDS.map(f => (
            <button key={f.url} onClick={() => setFeedUrl(f.url)}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-white/[0.06] text-slate-500 hover:text-slate-300 hover:border-white/12 transition-all">
              {f.label}
            </button>
          ))}
        </div>
        {fetchErr && (
          <div className="flex items-center gap-2 text-red-400 text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {fetchErr}
          </div>
        )}
      </div>

      {/* Step 2: Article selection */}
      <AnimatePresence>
        {articles.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-white/6 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#F7BE4D]/15 flex items-center justify-center text-[10px] text-[#F7BE4D] font-bold">2</span>
                  {feedTitle ? `"${feedTitle.slice(0, 40)}"` : "Articles"}
                  <span className="text-[10px] text-slate-500 font-normal">{articles.length} found</span>
                </h2>
              </div>
              <button onClick={toggleAll}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                {selected.size === articles.length
                  ? <><CheckSquare className="w-4 h-4 text-[#F7BE4D]" />Deselect all</>
                  : <><Square className="w-4 h-4" />Select all</>}
              </button>
            </div>
            <div className="divide-y divide-white/[0.04] max-h-96 overflow-y-auto">
              {articles.map((article, i) => (
                <div key={i}
                  onClick={() => toggleArticle(i)}
                  className="flex items-start gap-3 px-5 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors group">
                  <div className="mt-0.5 flex-shrink-0">
                    {selected.has(i)
                      ? <CheckSquare className="w-4 h-4 text-[#F7BE4D]" />
                      : <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white line-clamp-1 leading-snug">{article.title}</p>
                    {article.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{article.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      {article.pubDate && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-600">
                          <Clock className="w-2.5 h-2.5" />{formatDate(article.pubDate)}
                        </span>
                      )}
                      {article.link && (
                        <a href={article.link} target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-[#F7BE4D] transition-colors">
                          <ExternalLink className="w-2.5 h-2.5" />View
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-white/[0.05] bg-white/[0.01]">
              <p className="text-[11px] text-slate-500">
                {selected.size} of {articles.length} articles selected
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: Generation settings */}
      <AnimatePresence>
        {articles.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5 border border-white/6 space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#F7BE4D]/15 flex items-center justify-center text-[10px] text-[#F7BE4D] font-bold">3</span>
              Generation Settings
            </h2>

            {/* Platforms */}
            <div>
              <label className="text-xs text-slate-500 mb-2 block font-medium">Platforms</label>
              <div className="flex gap-2 flex-wrap">
                {PLATFORMS.map(p => (
                  <button key={p.key} onClick={() => togglePlatform(p.key)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: platforms.includes(p.key) ? `${p.color}18` : "rgba(255,255,255,0.03)",
                      border:     platforms.includes(p.key) ? `1px solid ${p.color}40` : "1px solid rgba(255,255,255,0.07)",
                      color:      platforms.includes(p.key) ? p.color : "rgba(255,255,255,0.3)",
                    }}>
                    <span>{p.icon}</span>{p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="text-xs text-slate-500 mb-2 block font-medium">Tone</label>
              <div className="flex gap-2 flex-wrap">
                {TONES.map(t => (
                  <button key={t.value} onClick={() => setTone(t.value)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: tone === t.value ? "rgba(247,190,77,0.12)" : "rgba(255,255,255,0.03)",
                      border:     tone === t.value ? "1px solid rgba(247,190,77,0.35)" : "1px solid rgba(255,255,255,0.07)",
                      color:      tone === t.value ? "#F7BE4D" : "rgba(255,255,255,0.3)",
                    }}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-2 block font-medium">Start Date & Time</label>
                <input type="datetime-local"
                  value={startDate || defaultDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-2 block font-medium">Post Interval</label>
                <div className="grid grid-cols-2 gap-2">
                  {INTERVALS.map(iv => (
                    <button key={iv.value} onClick={() => setInterval(iv.value)}
                      className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: interval === iv.value ? "rgba(247,190,77,0.12)" : "rgba(255,255,255,0.03)",
                        border:     interval === iv.value ? "1px solid rgba(247,190,77,0.35)" : "1px solid rgba(255,255,255,0.07)",
                        color:      interval === iv.value ? "#F7BE4D" : "rgba(255,255,255,0.3)",
                      }}>
                      {iv.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
              style={{ background: "rgba(247,190,77,0.05)", border: "1px solid rgba(247,190,77,0.12)" }}>
              <Sparkles className="w-3.5 h-3.5 text-[#F7BE4D] flex-shrink-0" />
              <p className="text-[11px] text-slate-400">
                Will generate <span className="text-[#F7BE4D] font-bold">{totalPosts} posts</span> from{" "}
                <span className="text-[#F7BE4D] font-bold">{selected.size} articles</span> across{" "}
                <span className="text-[#F7BE4D] font-bold">{platforms.length} platform{platforms.length !== 1 ? "s" : ""}</span>,
                spaced {INTERVALS.find(iv => iv.value === interval)?.label.toLowerCase()}
              </p>
            </div>

            {genErr && (
              <div className="flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{genErr}
              </div>
            )}

            {/* CTA */}
            <AnimatePresence mode="wait">
              {scheduled !== null ? (
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold"
                  style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399" }}>
                  <CheckCircle2 className="w-4 h-4" />
                  {scheduled} posts scheduled!
                  <a href="/schedule" className="underline text-emerald-300 hover:text-white transition-colors ml-1">
                    View calendar →
                  </a>
                </motion.div>
              ) : (
                <motion.button key="btn"
                  onClick={handleGenerate}
                  disabled={generating || selected.size === 0 || platforms.length === 0}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #F7BE4D, #ffd166)", color: "#050816", boxShadow: "0 4px 24px rgba(247,190,77,0.3)" }}>
                  {generating
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Generating {totalPosts} posts… this may take a moment</>
                    : <><CalendarClock className="w-4 h-4" />Generate &amp; Schedule {totalPosts} Posts</>}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!articles.length && !fetching && (
        <div className="glass rounded-2xl p-12 border border-white/6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center mx-auto mb-4">
            <Rss className="w-7 h-7 text-[#F7BE4D]" />
          </div>
          <p className="text-sm font-semibold text-white mb-1">Paste your RSS feed URL above</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Works with any RSS or Atom feed — WordPress, Ghost, Substack,<br />
            Medium, HubSpot, Webflow, Wix, and more
          </p>
        </div>
      )}
    </div>
  )
}
