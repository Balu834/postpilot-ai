"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GitBranch, Sparkles, Loader2, AlertCircle, Copy, CheckCheck, CalendarClock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

const PLATFORMS = [
  { key: "linkedin",  label: "LinkedIn",    icon: "in", color: "#0077B5" },
  { key: "twitter",   label: "Twitter / X", icon: "𝕏",  color: "#94a3b8" },
  { key: "instagram", label: "Instagram",   icon: "IG", color: "#E1306C" },
  { key: "threads",   label: "Threads",     icon: "🧵", color: "#e2e8f0" },
  { key: "facebook",  label: "Facebook",    icon: "f",  color: "#1877F2" },
  { key: "bluesky",   label: "Bluesky",     icon: "🦋", color: "#0085ff" },
]

const TONES = ["professional", "casual", "witty", "inspiring", "educational"]

const ANGLE_COLORS: Record<string, string> = {
  "Bold / Direct": "#f87171",
  "Story-led":     "#818cf8",
  "Question Hook": "#34d399",
}

interface Variant {
  angle:   string
  hook:    string
  content: string
}

export default function VariantsPage() {
  const [topic,    setTopic]    = useState("")
  const [platform, setPlatform] = useState("linkedin")
  const [tone,     setTone]     = useState("professional")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const [variants, setVariants] = useState<Variant[]>([])
  const [copied,   setCopied]   = useState<number | null>(null)
  const [picked,   setPicked]   = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!topic.trim()) { setError("Enter a topic first."); return }
    setLoading(true)
    setError("")
    setVariants([])
    setPicked(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/variants", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ topic, platform, tone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Generation failed")
      setVariants(data.variants ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (idx: number) => {
    await navigator.clipboard.writeText(variants[idx].content)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  const activePlatform = PLATFORMS.find(p => p.key === platform)!

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20
            flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-[#F7BE4D]" />
          </div>
          <h1 className="text-xl font-bold text-white">A/B Post Variants</h1>
        </div>
        <p className="text-slate-500 text-sm ml-10.5">
          Generate 3 versions of the same post — different angles, same topic. Pick the best.
        </p>
      </div>

      {/* Platform */}
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Platform</p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => (
            <button
              key={p.key}
              onClick={() => setPlatform(p.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              style={platform === p.key
                ? { background: `${p.color}18`, color: p.color, borderColor: `${p.color}50` }
                : { background: "transparent", color: "#64748b", borderColor: "rgba(255,255,255,0.08)" }
              }
            >
              <span className="text-[11px]">{p.icon}</span> {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            Topic or Message
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGenerate()}
            placeholder="e.g. Why I quit my corporate job to go all-in on my startup"
            className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5
              text-sm text-white placeholder-slate-600
              focus:outline-none focus:border-[#F7BE4D]/40 focus:bg-white/[0.05] transition-all"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            Tone
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map(t => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-all ${
                  tone === t
                    ? "bg-[#F7BE4D]/15 border-[#F7BE4D]/30 text-[#F7BE4D]"
                    : "border-white/8 text-slate-500 hover:text-slate-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10
          border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
        className="btn-primary w-full py-3 text-sm font-semibold flex items-center
          justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating 3 variants…</>
          : <><Sparkles className="w-4 h-4" /> Generate 3 Variants</>}
      </button>

      {/* Variants */}
      <AnimatePresence>
        {variants.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                3 Variants · {activePlatform.label}
              </p>
              {picked !== null && (
                <Link
                  href={`/schedule`}
                  className="flex items-center gap-1.5 text-xs text-[#F7BE4D] hover:underline"
                >
                  <CalendarClock className="w-3.5 h-3.5" /> Schedule picked variant →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {variants.map((v, i) => {
                const color   = ANGLE_COLORS[v.angle] ?? "#F7BE4D"
                const isPicked = picked === i
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="relative rounded-2xl border p-4 flex flex-col gap-3 transition-all cursor-pointer"
                    style={isPicked
                      ? { borderColor: `${color}50`, background: `${color}08` }
                      : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }
                    }
                    onClick={() => setPicked(i)}
                  >
                    {/* Angle badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ color, borderColor: `${color}30`, background: `${color}12` }}
                      >
                        {v.angle}
                      </span>
                      {isPicked && (
                        <span className="text-[10px] font-bold text-emerald-400">✓ Picked</span>
                      )}
                    </div>

                    {/* Hook */}
                    <p className="text-xs font-bold text-white leading-snug">
                      &ldquo;{v.hook}…&rdquo;
                    </p>

                    {/* Content */}
                    <p className="text-sm text-slate-400 leading-relaxed flex-1 whitespace-pre-wrap">
                      {v.content}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                      <span className="text-[10px] text-slate-700">{v.content.length} chars</span>
                      <button
                        onClick={e => { e.stopPropagation(); handleCopy(i) }}
                        className="flex items-center gap-1 text-[11px] font-medium text-slate-500
                          hover:text-[#F7BE4D] transition-colors"
                      >
                        {copied === i
                          ? <><CheckCheck className="w-3 h-3 text-emerald-400" /> Copied</>
                          : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                    </div>
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
