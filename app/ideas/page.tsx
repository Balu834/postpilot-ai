"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lightbulb, Sparkles, Loader2, AlertCircle, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"

const PLATFORMS = [
  { key: "LinkedIn",    icon: "in", color: "#0077B5" },
  { key: "Instagram",   icon: "IG", color: "#E1306C" },
  { key: "Twitter",     icon: "𝕏",  color: "#94a3b8" },
  { key: "Facebook",    icon: "f",  color: "#1877F2" },
  { key: "Threads",     icon: "🧵", color: "#e2e8f0" },
  { key: "Pinterest",   icon: "📌", color: "#E60023" },
]

const NICHE_EXAMPLES = [
  "SaaS startup", "Fitness coach", "E-commerce fashion",
  "Real estate agent", "Digital marketing agency", "Personal finance",
  "Food blogger", "Tech startup", "Life coach",
]

const FORMAT_COLORS: Record<string, string> = {
  Tip:             "#34d399",
  Story:           "#818cf8",
  Poll:            "#f472b6",
  Quote:           "#F7BE4D",
  "Behind the Scenes": "#fb923c",
  "How-To":        "#22d3ee",
  CTA:             "#f87171",
  Listicle:        "#a78bfa",
}

const PLATFORM_ICONS: Record<string, { icon: string; color: string }> = {
  LinkedIn:  { icon: "in", color: "#0077B5" },
  Instagram: { icon: "IG", color: "#E1306C" },
  Twitter:   { icon: "𝕏",  color: "#94a3b8" },
  Facebook:  { icon: "f",  color: "#1877F2" },
  Threads:   { icon: "🧵", color: "#e2e8f0" },
  Pinterest: { icon: "📌", color: "#E60023" },
  Bluesky:   { icon: "🦋", color: "#0085ff" },
}

interface Idea {
  day:      number
  dayLabel: string
  platform: string
  format:   string
  hook:     string
  idea:     string
  hashtags: string[]
}

export default function IdeasPage() {
  const [niche,     setNiche]     = useState("")
  const [platforms, setPlatforms] = useState<string[]>(["LinkedIn", "Instagram"])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState("")
  const [ideas,     setIdeas]     = useState<Idea[]>([])

  const togglePlatform = (p: string) => {
    setPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  const handleGenerate = async () => {
    if (!niche.trim())       { setError("Enter your niche or industry."); return }
    if (!platforms.length)   { setError("Select at least one platform."); return }
    setLoading(true)
    setError("")
    setIdeas([])
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/ideas", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ niche, platforms, count: 7 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to generate ideas")
      setIdeas(data.ideas ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20
            flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-[#F7BE4D]" />
          </div>
          <h1 className="text-xl font-bold text-white">Content Ideas Generator</h1>
        </div>
        <p className="text-slate-500 text-sm ml-10.5">
          Get a 7-day content calendar tailored to your niche and platforms.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-5">

        {/* Niche */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase
            tracking-widest mb-1.5">
            Your Niche / Industry
          </label>
          <input
            type="text"
            value={niche}
            onChange={e => setNiche(e.target.value)}
            placeholder="e.g. SaaS startup, Fitness coach, E-commerce fashion…"
            className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5
              text-sm text-white placeholder-slate-600
              focus:outline-none focus:border-[#F7BE4D]/40 focus:bg-white/[0.05] transition-all"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {NICHE_EXAMPLES.map(n => (
              <button
                key={n}
                onClick={() => setNiche(n)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                  niche === n
                    ? "bg-[#F7BE4D]/15 border-[#F7BE4D]/30 text-[#F7BE4D]"
                    : "border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/15"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase
            tracking-widest mb-1.5">
            Platforms
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => {
              const active = platforms.includes(p.key)
              return (
                <button
                  key={p.key}
                  onClick={() => togglePlatform(p.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                    border transition-all`}
                  style={active
                    ? { background: `${p.color}18`, color: p.color, borderColor: `${p.color}50` }
                    : { background: "transparent", color: "#64748b", borderColor: "rgba(255,255,255,0.08)" }
                  }
                >
                  <span className="text-[11px]">{p.icon}</span>
                  {p.key}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10
          border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleGenerate}
        disabled={loading || !niche.trim() || !platforms.length}
        className="btn-primary w-full py-3 text-sm font-semibold flex items-center
          justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating 7-day plan…</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Generate 7-Day Content Plan</>
        )}
      </button>

      {/* Ideas grid */}
      <AnimatePresence>
        {ideas.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-slate-500" />
              <p className="text-sm font-semibold text-slate-400">
                7-Day Content Calendar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ideas.map((idea, i) => {
                const platformMeta = PLATFORM_ICONS[idea.platform] ?? { icon: "📣", color: "#94a3b8" }
                const formatColor  = FORMAT_COLORS[idea.format] ?? "#94a3b8"

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 space-y-3
                      hover:border-white/15 transition-all"
                  >
                    {/* Day + platform + format */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          Day {idea.day}
                        </span>
                        <span className="text-[11px] text-slate-700">·</span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {idea.dayLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                          style={{ color: formatColor, borderColor: `${formatColor}30`, background: `${formatColor}12` }}
                        >
                          {idea.format}
                        </span>
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-lg"
                          style={{ color: platformMeta.color, background: `${platformMeta.color}18` }}
                        >
                          {platformMeta.icon} {idea.platform}
                        </span>
                      </div>
                    </div>

                    {/* Hook */}
                    <p className="text-sm font-semibold text-white leading-snug">
                      &ldquo;{idea.hook}&rdquo;
                    </p>

                    {/* Idea */}
                    <p className="text-[13px] text-slate-400 leading-relaxed">
                      {idea.idea}
                    </p>

                    {/* Hashtags */}
                    {idea.hashtags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {idea.hashtags.slice(0, 4).map((tag, j) => (
                          <span
                            key={j}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full
                              bg-white/[0.04] border border-white/8 text-slate-500"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
