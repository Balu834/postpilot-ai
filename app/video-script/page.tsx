"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clapperboard, Sparkles, Loader2, AlertCircle, Copy, CheckCheck,
  Music2, Hash, Clock,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { analytics } from "@/lib/analytics"
import UpgradeModal from "@/components/UpgradeModal"

const DURATIONS = [
  { value: "15", label: "15s" },
  { value: "30", label: "30s" },
  { value: "60", label: "60s" },
]

const TONES = ["engaging", "professional", "casual", "witty", "inspiring", "educational"]

interface Beat {
  time:           string
  voiceover:      string
  visual:         string
  on_screen_text: string
}

interface VideoScript {
  hook:             string
  beats:            Beat[]
  caption:          string
  hashtags:         string[]
  audio_suggestion: string
}

function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handle}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
        copied
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
          : "bg-white/8 text-slate-300 hover:bg-white/12 border border-white/10"
      }`}>
      {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : label}
    </button>
  )
}

function formatFullScript(script: VideoScript): string {
  const beats = script.beats.map(b =>
    `[${b.time}]\nVO: ${b.voiceover}\nVisual: ${b.visual}${b.on_screen_text ? `\nText on screen: ${b.on_screen_text}` : ""}`
  ).join("\n\n")
  return `HOOK: ${script.hook}\n\n${beats}\n\nCAPTION:\n${script.caption}\n\nHASHTAGS:\n${script.hashtags.map(h => `#${h}`).join(" ")}\n\nAUDIO: ${script.audio_suggestion}`
}

export default function VideoScriptPage() {
  const [topic,       setTopic]       = useState("")
  const [duration,    setDuration]    = useState("30")
  const [tone,        setTone]        = useState("engaging")
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState("")
  const [script,      setScript]      = useState<VideoScript | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim()) { setError("Enter a topic or idea first."); return }
    setLoading(true)
    setError("")
    setScript(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/generate/video-script", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ topic, duration, tone }),
      })
      const data = await res.json()
      if (res.status === 402 || data.code === "UPGRADE_REQUIRED") {
        analytics.upgradeClicked("free_limit_hit")
        setUpgradeOpen(true)
        return
      }
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setScript(data.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#f472b6]/10 border border-[#f472b6]/20 flex items-center justify-center">
            <Clapperboard className="w-4.5 h-4.5 text-[#f472b6]" />
          </div>
          <h1 className="text-xl font-bold text-white">Video Script</h1>
        </div>
        <p className="text-slate-500 text-sm ml-11.5">
          Turn an idea into a shootable Reels / TikTok / Shorts script — hook, beats, caption &amp; hashtags.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            Topic or Idea
          </label>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. 3 mistakes killing your engagement on Instagram"
            rows={3}
            className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5
              text-sm text-white placeholder-slate-600 resize-none leading-relaxed
              focus:outline-none focus:border-[#F7BE4D]/40 focus:bg-white/[0.05] transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
              Length
            </label>
            <div className="flex gap-1.5">
              {DURATIONS.map(d => (
                <button key={d.value} onClick={() => setDuration(d.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    duration === d.value
                      ? "bg-[#F7BE4D]/15 border-[#F7BE4D]/30 text-[#F7BE4D]"
                      : "border-white/8 text-slate-500 hover:text-slate-300"
                  }`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
              Tone
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map(t => (
                <button key={t} onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-all ${
                    tone === t
                      ? "bg-[#F7BE4D]/15 border-[#F7BE4D]/30 text-[#F7BE4D]"
                      : "border-white/8 text-slate-500 hover:text-slate-300"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
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
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Writing your script…</>
          : <><Sparkles className="w-4 h-4" /> Generate Script</>}
      </button>

      {/* Result */}
      <AnimatePresence>
        {script && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                Script · {DURATIONS.find(d => d.value === duration)?.label}
              </p>
              <CopyBtn text={formatFullScript(script)} label="Copy Full Script" />
            </div>

            {/* Hook */}
            <div className="rounded-2xl border p-4"
              style={{ borderColor: "rgba(247,190,77,0.3)", background: "rgba(247,190,77,0.06)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F7BE4D] mb-1.5">
                Hook · 0-2s
              </p>
              <p className="text-base font-bold text-white leading-snug">&ldquo;{script.hook}&rdquo;</p>
            </div>

            {/* Beats */}
            <div className="space-y-2">
              {script.beats.map((b, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-white/8 bg-white/[0.02] p-4"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span className="text-[10px] font-bold text-slate-500 tabular-nums">{b.time}</span>
                  </div>
                  <p className="text-sm text-white leading-relaxed mb-2">{b.voiceover}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span><span className="text-slate-600">Visual:</span> {b.visual}</span>
                    {b.on_screen_text && (
                      <span><span className="text-slate-600">On-screen:</span> {b.on_screen_text}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Caption */}
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Caption</p>
                <CopyBtn text={script.caption} />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{script.caption}</p>
            </div>

            {/* Hashtags */}
            <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Hash className="w-3 h-3" /> Hashtags
                </p>
                <CopyBtn text={script.hashtags.map(h => `#${h}`).join(" ")} label="Copy All" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {script.hashtags.map(h => (
                  <span key={h} className="text-xs px-2.5 py-1 rounded-full bg-[#818cf8]/10 border border-[#818cf8]/20 text-[#818cf8]">
                    #{h}
                  </span>
                ))}
              </div>
            </div>

            {/* Audio suggestion */}
            <div className="flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] p-4">
              <Music2 className="w-4 h-4 text-[#34d399] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Audio</p>
                <p className="text-sm text-slate-300 leading-relaxed">{script.audio_suggestion}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
