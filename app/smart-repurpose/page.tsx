"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wand2, Loader2, Copy, CheckCheck, AlertCircle,
  Sparkles, Image, ChevronDown, ChevronUp,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const SOURCE_TYPES = [
  { key: "podcast_transcript", label: "Podcast Transcript", emoji: "🎙️" },
  { key: "meeting_notes",      label: "Meeting Notes",      emoji: "📝" },
  { key: "newsletter",         label: "Newsletter",          emoji: "📧" },
  { key: "tweet_thread",       label: "Tweet Thread",        emoji: "🧵" },
  { key: "video_script",       label: "Video Script",        emoji: "🎬" },
  { key: "research_notes",     label: "Research / Notes",    emoji: "🔬" },
]

const PLATFORMS = [
  { key: "linkedin",  label: "LinkedIn",    color: "#0077B5", charLimit: 3000 },
  { key: "twitter",   label: "Twitter / X", color: "#94a3b8", charLimit: 280  },
  { key: "instagram", label: "Instagram",   color: "#E1306C", charLimit: 2200 },
  { key: "threads",   label: "Threads",     color: "#e2e8f0", charLimit: 500  },
  { key: "bluesky",   label: "Bluesky",     color: "#0085ff", charLimit: 300  },
  { key: "pinterest", label: "Pinterest",   color: "#E60023", charLimit: 500  },
]

interface PlatformResult {
  content: string
  thread?: string[]
  format: string
}

interface RepurposeResult {
  core_ideas:   string[]
  key_quote:    string
  linkedin:     PlatformResult
  twitter:      PlatformResult
  instagram:    PlatformResult
  threads:      PlatformResult
  bluesky:      PlatformResult
  pinterest:    PlatformResult
  image_prompts: string[]
  hashtags:     string[]
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy}
      className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/[0.06]
        transition-all flex-shrink-0">
      {copied
        ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

function PlatformCard({ platform, result }: { platform: typeof PLATFORMS[0]; result: PlatformResult }) {
  const [showThread, setShowThread] = useState(false)

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold"
            style={{ background: `${platform.color}20`, color: platform.color }}>
            {platform.label.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-white">{platform.label}</span>
          <span className="text-[10px] text-slate-600">{result.format}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] tabular-nums"
            style={{ color: result.content.length > platform.charLimit ? "#f87171" : "#64748b" }}>
            {result.content.length}/{platform.charLimit}
          </span>
          <CopyButton text={result.thread?.join("\n\n") ?? result.content} />
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
          {result.content}
        </p>
        {result.thread && result.thread.length > 1 && (
          <div className="mt-3">
            <button
              onClick={() => setShowThread(v => !v)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-[#94a3b8] hover:text-white transition-colors">
              {showThread ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showThread ? "Hide" : "View"} full thread ({result.thread.length} tweets)
            </button>
            <AnimatePresence>
              {showThread && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-3 space-y-2">
                  {result.thread.map((tweet, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-xl bg-white/[0.03]
                      border border-white/[0.05] px-3 py-2.5">
                      <span className="text-[10px] text-slate-600 mt-0.5 w-4 flex-shrink-0">{i + 1}</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{tweet}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SmartRepurposePage() {
  const router = useRouter()
  const [sourceType,  setSourceType]  = useState("podcast_transcript")
  const [content,     setContent]     = useState("")
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState("")
  const [result,      setResult]      = useState<RepurposeResult | null>(null)

  const handleGenerate = async () => {
    if (!content.trim()) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/smart-repurpose", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body:    JSON.stringify({ content, sourceType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#f472b6]/10 border border-[#f472b6]/20 flex items-center justify-center">
          <Wand2 className="w-5 h-5 text-[#f472b6]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Smart Repurpose Engine</h1>
          <p className="text-slate-500 text-xs">
            Transform any raw content into 6 platform-ready posts — in your brand voice
          </p>
        </div>
      </div>

      {/* Source selector */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-4">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Source Type</p>
          <div className="flex flex-wrap gap-2">
            {SOURCE_TYPES.map(s => (
              <button key={s.key} onClick={() => setSourceType(s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                  border transition-all ${
                  sourceType === s.key
                    ? "bg-[#f472b6]/15 border-[#f472b6]/30 text-[#f472b6]"
                    : "border-white/8 text-slate-500 hover:text-slate-300"
                }`}>
                <span>{s.emoji}</span>{s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
            Paste Your Content
          </p>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your transcript, notes, newsletter, or any source content here…"
            rows={8}
            className="input-premium w-full text-sm px-4 py-3 rounded-xl resize-none"
          />
          <p className="text-[10px] text-slate-600 mt-1.5">
            {content.length.toLocaleString()} chars · Brand voice applied automatically if configured
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10
            border border-red-500/20 rounded-xl px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          onClick={handleGenerate}
          disabled={loading || content.trim().length < 50}
          className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center
            gap-2 disabled:opacity-40 transition-all"
          style={{ background: "linear-gradient(135deg, #f472b6, #a855f7)", color: "#fff" }}>
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />Repurposing across 6 platforms…</>
            : <><Sparkles className="w-4 h-4" />Repurpose with Brand Voice</>}
        </motion.button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5">

            {/* Core ideas + key quote */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.core_ideas?.length > 0 && (
                <div className="rounded-2xl border border-[#f472b6]/20 bg-[#f472b6]/[0.04] p-5">
                  <p className="text-[11px] font-semibold text-[#f472b6]/70 uppercase tracking-widest mb-3">
                    Core Ideas Extracted
                  </p>
                  <div className="space-y-2">
                    {result.core_ideas.map((idea, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#f472b6] mt-1.5 flex-shrink-0" />
                        <p className="text-sm text-slate-300">{idea}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.key_quote && (
                <div className="rounded-2xl border border-[#F7BE4D]/20 bg-[#F7BE4D]/[0.04] p-5 flex flex-col justify-center">
                  <p className="text-[11px] font-semibold text-[#F7BE4D]/70 uppercase tracking-widest mb-2">
                    Key Quote
                  </p>
                  <div className="flex items-start gap-2">
                    <span className="text-3xl text-[#F7BE4D]/30 leading-none font-serif">"</span>
                    <p className="text-sm text-white font-medium leading-relaxed italic">{result.key_quote}</p>
                  </div>
                  <CopyButton text={`"${result.key_quote}"`} />
                </div>
              )}
            </div>

            {/* Platform posts */}
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              6 Platform Posts
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PLATFORMS.map(platform => {
                const r = result[platform.key as keyof RepurposeResult] as PlatformResult | undefined
                if (!r || typeof r !== "object") return null
                return <PlatformCard key={platform.key} platform={platform} result={r} />
              })}
            </div>

            {/* Image prompts */}
            {result.image_prompts?.length > 0 && (
              <div className="rounded-2xl border border-[#818cf8]/20 bg-[#818cf8]/[0.04] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Image className="w-4 h-4 text-[#818cf8]" />
                  <p className="text-[11px] font-semibold text-[#818cf8]/70 uppercase tracking-widest">
                    DALL-E Image Prompts
                  </p>
                </div>
                <div className="space-y-3">
                  {result.image_prompts.map((prompt, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-white/[0.03]
                      border border-white/[0.06] px-4 py-3">
                      <span className="text-xs text-[#818cf8] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-xs text-slate-300 leading-relaxed flex-1">{prompt}</p>
                      <CopyButton text={prompt} />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 mt-3">
                  Copy a prompt → paste into{" "}
                  <button onClick={() => router.push("/images")}
                    className="text-[#818cf8] hover:underline">
                    AI Images
                  </button>{" "}
                  to generate the visual
                </p>
              </div>
            )}

            {/* Hashtags */}
            {result.hashtags?.length > 0 && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Hashtags</p>
                  <CopyButton text={result.hashtags.map(h => `#${h}`).join(" ")} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium
                      bg-[#F7BE4D]/10 text-[#F7BE4D] border border-[#F7BE4D]/20">
                      #{tag}
                    </span>
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
