"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gauge, Sparkles, Loader2, AlertCircle, ChevronRight, RotateCcw } from "lucide-react"
import { supabase } from "@/lib/supabase"

const PLATFORMS = [
  { key: "linkedin",  label: "LinkedIn",    icon: "in", color: "#0077B5" },
  { key: "twitter",   label: "Twitter / X", icon: "𝕏",  color: "#94a3b8" },
  { key: "instagram", label: "Instagram",   icon: "IG", color: "#E1306C" },
  { key: "facebook",  label: "Facebook",    icon: "f",  color: "#1877F2" },
  { key: "threads",   label: "Threads",     icon: "🧵", color: "#e2e8f0" },
  { key: "bluesky",   label: "Bluesky",     icon: "🦋", color: "#0085ff" },
]

interface ScoreResult {
  score:       number
  hook:        number
  clarity:     number
  virality:    number
  platformFit: number
  engagement:  number
  tips:        string[]
}

const SUB_SCORES = [
  { key: "hook",        label: "Hook",          desc: "How compelling is the opening line?" },
  { key: "clarity",     label: "Clarity",       desc: "Is the message clear and readable?" },
  { key: "virality",    label: "Virality",       desc: "Shareability and emotional resonance" },
  { key: "platformFit", label: "Platform Fit",  desc: "Matches platform norms and format" },
  { key: "engagement",  label: "Engagement",    desc: "Likelihood of likes, comments, shares" },
] as const

function scoreColor(v: number) {
  if (v >= 75) return "#34d399"
  if (v >= 50) return "#F7BE4D"
  return "#f87171"
}

function scoreLabel(v: number) {
  if (v >= 80) return "Excellent"
  if (v >= 65) return "Good"
  if (v >= 50) return "Average"
  if (v >= 35) return "Weak"
  return "Poor"
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex-1">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  )
}

export default function ScorePage() {
  const [platform, setPlatform] = useState("linkedin")
  const [content,  setContent]  = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const [result,   setResult]   = useState<ScoreResult | null>(null)

  const handleScore = async () => {
    if (!content.trim()) { setError("Paste a post to score."); return }
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/score", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          Authorization:   `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ content, platform }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Scoring failed")
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const overallColor  = result ? scoreColor(result.score)  : "#F7BE4D"
  const activePlatform = PLATFORMS.find(p => p.key === platform)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20
            flex items-center justify-center">
            <Gauge className="w-4 h-4 text-[#F7BE4D]" />
          </div>
          <h1 className="text-xl font-bold text-white">AI Post Scorer</h1>
        </div>
        <p className="text-slate-500 text-sm ml-10.5">
          Paste any post and get an instant AI score with improvement tips.
        </p>
      </div>

      {/* Platform selector */}
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Platform
        </p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => (
            <button
              key={p.key}
              onClick={() => setPlatform(p.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                border transition-all ${
                platform === p.key
                  ? "border-[#F7BE4D]/40 text-white"
                  : "border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/15"
              }`}
              style={platform === p.key ? { background: `${p.color}18`, color: p.color, borderColor: `${p.color}50` } : {}}
            >
              <span className="text-[11px]">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Your Post
        </p>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={`Paste your ${activePlatform?.label ?? "social"} post here…`}
          rows={6}
          className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3
            text-sm text-white placeholder-slate-600 resize-none
            focus:outline-none focus:border-[#F7BE4D]/40 focus:bg-white/[0.05]
            transition-all"
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-slate-600">{content.length} characters</span>
          {content && (
            <button onClick={() => { setContent(""); setResult(null) }}
              className="text-[11px] text-slate-600 hover:text-slate-400 flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          )}
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
        onClick={handleScore}
        disabled={loading || !content.trim()}
        className="btn-primary w-full py-3 text-sm font-semibold flex items-center
          justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing post…</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Score My Post</>
        )}
      </button>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Overall score */}
            <div
              className="rounded-2xl p-6 border text-center"
              style={{
                background:   `${overallColor}0d`,
                borderColor:  `${overallColor}30`,
              }}
            >
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Overall Score
              </p>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="text-7xl font-black leading-none mb-2"
                style={{ color: overallColor }}
              >
                {result.score}
              </motion.div>
              <p className="text-sm font-semibold" style={{ color: overallColor }}>
                {scoreLabel(result.score)}
              </p>
            </div>

            {/* Sub-scores */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Breakdown
              </p>
              {SUB_SCORES.map(({ key, label, desc }) => {
                const val   = result[key]
                const color = scoreColor(val)
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-sm font-semibold text-white">{label}</span>
                        <span className="text-[11px] text-slate-600 ml-2">{desc}</span>
                      </div>
                      <span className="text-sm font-bold tabular-nums" style={{ color }}>
                        {val}
                      </span>
                    </div>
                    <ScoreBar value={val} color={color} />
                  </div>
                )
              })}
            </div>

            {/* Tips */}
            {result.tips?.length > 0 && (
              <div className="rounded-2xl border border-[#F7BE4D]/15 bg-[#F7BE4D]/[0.04] p-5">
                <p className="text-xs font-semibold text-[#F7BE4D] uppercase tracking-widest mb-3">
                  Improvement Tips
                </p>
                <div className="space-y-2.5">
                  {result.tips.map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-start gap-2.5"
                    >
                      <ChevronRight className="w-4 h-4 text-[#F7BE4D] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
