"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp, Sparkles, Loader2, AlertCircle, ArrowRight,
  RefreshCw, Flame, X, Copy, CheckCheck,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const NICHES = [
  { key: "business",  label: "Business",       icon: "💼" },
  { key: "tech",      label: "Tech / SaaS",    icon: "⚡" },
  { key: "personal",  label: "Personal Brand", icon: "🌟" },
  { key: "fitness",   label: "Fitness",        icon: "💪" },
  { key: "food",      label: "Food",           icon: "🍜" },
  { key: "travel",    label: "Travel",         icon: "✈️" },
  { key: "fashion",   label: "Fashion",        icon: "👗" },
  { key: "education", label: "Education",      icon: "📚" },
]

const PLATFORMS = [
  { key: "linkedin",  label: "LinkedIn",    icon: "in", color: "#0077B5" },
  { key: "instagram", label: "Instagram",   icon: "IG", color: "#E1306C" },
  { key: "twitter",   label: "Twitter / X", icon: "𝕏",  color: "#94a3b8" },
  { key: "threads",   label: "Threads",     icon: "🧵", color: "#e2e8f0" },
]

const FORMAT_COLORS: Record<string, string> = {
  Thread:        "#818cf8",
  Carousel:      "#f472b6",
  "Single Post": "#34d399",
  Reel:          "#fb923c",
  Poll:          "#F7BE4D",
}

const HEAT_LABELS = ["", "Low", "Moderate", "Good", "Hot", "🔥 Viral"]

interface Topic {
  title:    string
  why:      string
  format:   string
  hashtags: string[]
  heat:     number
}

interface AdaptVariation {
  angle:            string
  content:          string
  hook:             string
  engagement_score: number
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/[0.06] transition-all">
      {copied
        ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

export default function TrendingPage() {
  const router   = useRouter()
  const [niche,     setNiche]     = useState("business")
  const [platform,  setPlatform]  = useState("linkedin")
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState("")
  const [topics,    setTopics]    = useState<Topic[]>([])

  // Brand adapt
  const [adaptTopic,  setAdaptTopic]  = useState<Topic | null>(null)
  const [adapting,    setAdapting]    = useState(false)
  const [adaptResult, setAdaptResult] = useState<AdaptVariation[] | null>(null)

  const handleFetch = async () => {
    setLoading(true)
    setError("")
    setTopics([])
    setAdaptTopic(null)
    setAdaptResult(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/trending", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ niche, platform }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch trends")
      setTopics(data.topics ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleAdapt = async (topic: Topic) => {
    setAdaptTopic(topic)
    setAdaptResult(null)
    setAdapting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/trending", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ niche, platform, action: "adapt", topic: topic.title }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Adaptation failed")
      setAdaptResult(data.variations ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Adaptation failed")
    } finally {
      setAdapting(false)
    }
  }

  const handleUse = (title: string) => {
    router.push(`/generate?topic=${encodeURIComponent(title)}`)
  }

  const activePlatform = PLATFORMS.find(p => p.key === platform)!

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#F7BE4D]" />
            </div>
            <h1 className="text-xl font-bold text-white">Trending Topics</h1>
          </div>
          <p className="text-slate-500 text-sm ml-10.5">
            AI-curated high-engagement topics. Click to generate, or <span className="text-[#f472b6]">Adapt to Brand</span> for personalized variations.
          </p>
        </div>
        {topics.length > 0 && (
          <button onClick={handleFetch} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
              border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white
              hover:border-white/20 transition-all flex-shrink-0 disabled:opacity-40">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-4">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Your Niche</p>
          <div className="flex flex-wrap gap-2">
            {NICHES.map(n => (
              <button key={n.key} onClick={() => setNiche(n.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                  border transition-all ${
                  niche === n.key
                    ? "bg-[#F7BE4D]/15 border-[#F7BE4D]/30 text-[#F7BE4D]"
                    : "border-white/8 text-slate-500 hover:text-slate-300"
                }`}>
                <span>{n.icon}</span>{n.label}
              </button>
            ))}
          </div>
        </div>

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
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10
          border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      <button onClick={handleFetch} disabled={loading}
        className="btn-primary w-full py-3 text-sm font-semibold flex items-center
          justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" />Fetching trends…</>
          : <><Flame className="w-4 h-4" />Get Trending Topics</>}
      </button>

      <div className={`grid gap-6 ${adaptTopic ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Topics grid */}
        <AnimatePresence>
          {topics.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  {topics.length} Topics · {NICHES.find(n => n.key === niche)?.label} · {activePlatform.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topics.map((topic, i) => {
                  const formatColor = FORMAT_COLORS[topic.format] ?? "#94a3b8"
                  const heatPct     = ((topic.heat ?? 3) / 5) * 100
                  const heatColor   = topic.heat >= 5 ? "#f87171" : topic.heat >= 4 ? "#F7BE4D" : "#34d399"
                  const isSelected  = adaptTopic?.title === topic.title

                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`group rounded-2xl border bg-white/[0.02] p-4 space-y-3
                        transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#f472b6]/40 bg-[#f472b6]/[0.04]"
                          : "border-white/8 hover:border-white/20"
                      }`}
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-white leading-snug flex-1">
                          {topic.title}
                        </p>
                        <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-[#F7BE4D]
                          flex-shrink-0 mt-0.5 transition-colors"
                          onClick={() => handleUse(topic.title)} />
                      </div>

                      <p className="text-[12px] text-slate-500 leading-relaxed">{topic.why}</p>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-600">Engagement potential</span>
                          <span className="text-[10px] font-bold" style={{ color: heatColor }}>
                            {HEAT_LABELS[topic.heat] ?? ""}
                          </span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${heatPct}%` }}
                            transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ background: heatColor }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                          style={{ color: formatColor, borderColor: `${formatColor}30`, background: `${formatColor}10` }}>
                          {topic.format}
                        </span>
                        <div className="flex gap-1">
                          {topic.hashtags?.slice(0, 3).map((tag, j) => (
                            <span key={j} className="text-[10px] text-slate-600">#{tag}</span>
                          ))}
                        </div>
                      </div>

                      {/* Action row */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleUse(topic.title)}
                          className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold
                            text-slate-400 hover:text-white border border-white/8 hover:border-white/20
                            transition-all">
                          Generate Post →
                        </button>
                        <button
                          onClick={() => handleAdapt(topic)}
                          className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold
                            transition-all flex items-center justify-center gap-1"
                          style={isSelected
                            ? { background: "#f472b620", color: "#f472b6", border: "1px solid #f472b640" }
                            : { color: "#f472b6", border: "1px solid #f472b620", background: "transparent" }}>
                          <Sparkles className="w-3 h-3" />
                          Adapt to Brand
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Brand Adapt panel */}
        <AnimatePresence>
          {adaptTopic && (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="rounded-2xl border border-[#f472b6]/25 bg-[#f472b6]/[0.04] overflow-hidden self-start sticky top-24">

              <div className="flex items-center justify-between px-5 py-4 border-b border-[#f472b6]/15">
                <div>
                  <p className="text-[10px] font-semibold text-[#f472b6]/70 uppercase tracking-widest">
                    Trend → Brand Pipeline
                  </p>
                  <p className="text-sm font-bold text-white mt-0.5 line-clamp-1">{adaptTopic.title}</p>
                </div>
                <button onClick={() => { setAdaptTopic(null); setAdaptResult(null) }}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/[0.06] transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-5">
                {adapting ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <Loader2 className="w-6 h-6 text-[#f472b6] animate-spin" />
                    <p className="text-xs text-slate-500">Adapting to your brand voice…</p>
                  </div>
                ) : adaptResult ? (
                  <div className="space-y-4">
                    <p className="text-[10px] text-slate-600">
                      3 brand-voice variations · {activePlatform.label}
                    </p>
                    {adaptResult.map((v, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="rounded-xl border border-white/8 bg-white/[0.03] p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#f472b6] uppercase tracking-widest">
                            {v.angle}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-600">
                              {v.engagement_score}/10
                            </span>
                            <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-[#f472b6]"
                                style={{ width: `${(v.engagement_score / 10) * 100}%` }} />
                            </div>
                            <CopyButton text={v.content} />
                          </div>
                        </div>
                        <p className="text-xs text-[#f472b6]/70 font-medium italic">
                          "{v.hook}"
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {v.content}
                        </p>
                        <button
                          onClick={() => handleUse(adaptTopic.title)}
                          className="text-[10px] text-slate-600 hover:text-[#F7BE4D] transition-colors">
                          Generate full post →
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                    <Sparkles className="w-8 h-8 text-[#f472b6]/40" />
                    <p className="text-xs text-slate-500">Loading brand variations…</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
