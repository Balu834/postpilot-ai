"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Zap, ChevronDown, ChevronUp } from "lucide-react"

interface Metrics {
  overall: number
  hook: number
  readability: number
  engagement: number
  cta: number
  emotional: number
}

export function analyzeContent(text: string): Metrics {
  if (!text || text.length < 20) {
    return { overall: 0, hook: 0, readability: 0, engagement: 0, cta: 0, emotional: 0 }
  }

  const lower = text.toLowerCase()
  const wordCount = text.split(/\s+/).filter(Boolean).length
  const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]/gu) || []).length
  const hasQuestion = text.includes("?")
  const hasBullets = /\n[-•*]|\n\d+\./.test(text)

  // Hook
  const hookTriggers = ["how", "why", "what if", "the truth", "stop ", "here's", "i made", "i learned", "mistake", "secret", "reveal", "nobody", "shocking", "unpopular", "hot take", "i quit", "we grew", "thread 🧵"]
  const hasHook = hookTriggers.some(p => lower.slice(0, 120).includes(p))
  const startsWithNum = /^\d+/.test(text.trim())
  const hook = Math.min(100, (hasHook ? 60 : 25) + (startsWithNum ? 25 : 0) + (text.trim().charAt(0) === text.trim().charAt(0).toUpperCase() ? 5 : 0) + (wordCount > 20 ? 10 : 0))

  // Readability
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5)
  const avgWords = sentences.length > 0 ? wordCount / sentences.length : 30
  const readability = Math.min(100,
    (avgWords < 18 ? 50 : avgWords < 28 ? 35 : 15) +
    (wordCount >= 50 && wordCount <= 300 ? 35 : wordCount >= 30 ? 22 : 10) +
    (hasBullets ? 15 : 0)
  )

  // Engagement
  const youCount = (lower.match(/\byou\b|\byour\b/g) || []).length
  const engagement = Math.min(100,
    (emojiCount >= 3 ? 25 : emojiCount >= 1 ? 14 : 0) +
    (hasQuestion ? 22 : 0) +
    (youCount >= 3 ? 28 : youCount >= 1 ? 16 : 0) +
    (hasBullets ? 15 : 0) +
    (wordCount >= 80 ? 10 : 5)
  )

  // CTA
  const ctaKeywords = ["follow", "share", "comment", "dm me", "click", "sign up", "join", "👇", "save", "link in bio", "tag someone", "let me know", "what do you think", "agree?", "drop", "reply"]
  const hasCTA = ctaKeywords.some(w => lower.slice(-250).includes(w))
  const cta = Math.min(100, (hasCTA ? 68 : 22) + (text.slice(-120).includes("?") ? 22 : 0) + (emojiCount > 0 ? 10 : 0))

  // Emotional impact
  const emotionalWords = ["love", "hate", "fear", "hope", "dream", "struggle", "success", "fail", "grow", "transform", "change", "believe", "inspire", "amazing", "incredible", "brutal", "honest", "truth", "story", "journey", "proud", "grateful", "hard", "real"]
  const emotionalCount = emotionalWords.filter(w => lower.includes(w)).length
  const emotional = Math.min(100, (emotionalCount * 12) + (emojiCount * 4) + (hasBullets ? 8 : 0) + (hasQuestion ? 10 : 0))

  const overall = Math.round((hook + readability + engagement + cta + emotional) / 5)
  return { overall, hook, readability, engagement, cta, emotional }
}

function ScoreBar({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  const [animated, setAnimated] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  const levelLabel = value >= 80 ? "Excellent" : value >= 60 ? "Good" : value >= 40 ? "Average" : "Needs work"
  const levelColor = value >= 80 ? "#10b981" : value >= 60 ? "#F7BE4D" : value >= 40 ? "#f97316" : "#ef4444"

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 flex-shrink-0">
        <p className="text-[11px] font-semibold text-slate-700">{label}</p>
        <p className="text-[10px]" style={{ color: levelColor }}>{levelLabel}</p>
      </div>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${animated}%` }}
          transition={{ duration: 0.8, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="text-[11px] font-bold text-slate-600 w-8 text-right tabular-nums">{value}</span>
    </div>
  )
}

const METRIC_CONFIGS = [
  { key: "hook" as const,        label: "Hook",          color: "#F7BE4D", delay: 100 },
  { key: "engagement" as const,  label: "Engagement",    color: "#818cf8", delay: 200 },
  { key: "readability" as const, label: "Readability",   color: "#34d399", delay: 300 },
  { key: "cta" as const,         label: "CTA Quality",   color: "#f472b6", delay: 400 },
  { key: "emotional" as const,   label: "Emotional",     color: "#fb923c", delay: 500 },
]

function getOverallColor(score: number): string {
  if (score >= 80) return "#10b981"
  if (score >= 60) return "#F7BE4D"
  if (score >= 40) return "#f97316"
  return "#ef4444"
}

function getSuggestions(metrics: Metrics): string[] {
  const tips: string[] = []
  if (metrics.hook < 60)        tips.push("Start with a bold statement or question to hook readers immediately.")
  if (metrics.engagement < 60)  tips.push("Add 'you/your' language and a question to boost engagement.")
  if (metrics.cta < 60)         tips.push("End with a clear call-to-action — ask a question or say '👇 comment below'.")
  if (metrics.emotional < 50)   tips.push("Add emotional words like 'honest', 'struggle', or 'transform' for impact.")
  if (metrics.readability < 60) tips.push("Break long paragraphs into shorter lines or bullet points.")
  return tips.slice(0, 3)
}

export default function ViralScore({ text, visible }: { text: string; visible: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const metrics = analyzeContent(text)
  const color = getOverallColor(metrics.overall)
  const suggestions = getSuggestions(metrics)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl overflow-hidden border border-slate-200 bg-white"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          {/* Header row */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            {/* Score ring */}
            <div className="relative flex-shrink-0">
              <svg width="52" height="52" className="-rotate-90">
                <circle cx="26" cy="26" r="22" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                <motion.circle
                  cx="26" cy="26" r="22" fill="none"
                  stroke={color} strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 22}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - metrics.overall / 100) }}
                  transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  className="text-xs font-black tabular-nums" style={{ color }}>
                  {metrics.overall}
                </motion.span>
              </div>
            </div>

            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" style={{ color }} />
                <span className="text-sm font-bold text-slate-900">Viral Score</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${color}15`, color }}>
                  {metrics.overall >= 80 ? "🔥 High potential" : metrics.overall >= 60 ? "⚡ Good" : metrics.overall >= 40 ? "📝 Average" : "💡 Needs work"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {expanded ? "Click to collapse analysis" : "Click to see detailed breakdown"}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>

          {/* Expanded breakdown */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="overflow-hidden border-t border-slate-100"
              >
                <div className="px-5 py-4 space-y-3">
                  {METRIC_CONFIGS.map(m => (
                    <ScoreBar key={m.key} label={m.label} value={metrics[m.key]} color={m.color} delay={m.delay} />
                  ))}

                  {suggestions.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Zap className="w-3.5 h-3.5 text-[#F7BE4D]" />
                        <span className="text-[11px] font-bold text-slate-700">Improvement tips</span>
                      </div>
                      <ul className="space-y-1.5">
                        {suggestions.map((tip, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.07 }}
                            className="flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed"
                          >
                            <span className="text-[#F7BE4D] flex-shrink-0 mt-0.5">→</span>
                            {tip}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
