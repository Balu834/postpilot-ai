"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ImageIcon, Sparkles, Loader2, AlertCircle, Download, ExternalLink, RotateCcw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

/* ── Config ────────────────────────────────────────────────────── */

const STYLES = [
  { key: "photorealistic", label: "Photo",        icon: "📷", desc: "Real-world photography look" },
  { key: "illustration",   label: "Illustration", icon: "🎨", desc: "Digital art & flat design"    },
  { key: "minimalist",     label: "Minimal",      icon: "⬜", desc: "Clean, simple, elegant"       },
  { key: "abstract",       label: "Abstract",     icon: "🌀", desc: "Colorful geometric art"        },
  { key: "bold",           label: "Bold",         icon: "⚡", desc: "Poster-style, high contrast"  },
]

const SIZES = [
  { key: "square",    label: "Square",    ratio: "1:1",   desc: "Instagram, Facebook",  w: 64, h: 64 },
  { key: "portrait",  label: "Portrait",  ratio: "4:5",   desc: "Instagram Stories",    w: 51, h: 64 },
  { key: "landscape", label: "Landscape", ratio: "16:9",  desc: "Twitter, LinkedIn",    w: 64, h: 36 },
]

const EXAMPLE_PROMPTS = [
  "A minimalist workspace with a laptop, coffee cup, and plants on a wooden desk",
  "A vibrant city skyline at golden hour with warm light reflecting on glass buildings",
  "A personal trainer coaching a client in a modern gym, motivating atmosphere",
  "An e-commerce flat lay of skincare products on a marble surface",
  "A cozy coffee shop corner with books, warm lighting and autumn vibes",
  "A tech startup team brainstorming ideas on a glass whiteboard",
]

/* ── Component ─────────────────────────────────────────────────── */

export default function ImagesPage() {
  const [prompt,        setPrompt]        = useState("")
  const [style,         setStyle]         = useState("photorealistic")
  const [size,          setSize]          = useState("square")
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState("")
  const [imageUrl,      setImageUrl]      = useState("")
  const [revisedPrompt, setRevisedPrompt] = useState("")
  const [history,       setHistory]       = useState<{ url: string; prompt: string }[]>([])

  const selectedSize  = SIZES.find(s => s.key === size)!

  const handleGenerate = async () => {
    if (!prompt.trim()) { setError("Describe the image you want to create."); return }
    setLoading(true)
    setError("")
    setImageUrl("")
    setRevisedPrompt("")

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/images/generate", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ prompt, style, size }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Image generation failed")
      setImageUrl(data.url)
      setRevisedPrompt(data.revisedPrompt)
      setHistory(prev => [{ url: data.url, prompt }, ...prev].slice(0, 8))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!imageUrl) return
    try {
      const res   = await fetch(imageUrl)
      const blob  = await res.blob()
      const url   = URL.createObjectURL(blob)
      const a     = document.createElement("a")
      a.href      = url
      a.download  = `postpilot-image-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(imageUrl, "_blank")
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20
            flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-[#F7BE4D]" />
          </div>
          <h1 className="text-xl font-bold text-white">AI Image Generator</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
            bg-[#818cf8]/15 border border-[#818cf8]/25 text-[#818cf8]">
            DALL-E 3
          </span>
        </div>
        <p className="text-slate-500 text-sm ml-10.5">
          Generate post-ready images from text. Download or attach directly to scheduled posts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — controls */}
        <div className="space-y-5">

          {/* Prompt */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase
              tracking-widest mb-1.5">
              Describe your image
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. A minimalist workspace with a laptop and coffee cup, warm natural lighting…"
              rows={4}
              className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3
                text-sm text-white placeholder-slate-600 resize-none
                focus:outline-none focus:border-[#F7BE4D]/40 focus:bg-white/[0.05] transition-all"
            />

            {/* Example prompts */}
            <div className="mt-2 space-y-1">
              <p className="text-[10px] text-slate-700 font-medium">Quick examples:</p>
              <div className="flex flex-col gap-1">
                {EXAMPLE_PROMPTS.slice(0, 3).map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(ex)}
                    className="text-left text-[11px] text-slate-600 hover:text-slate-300
                      transition-colors truncate"
                  >
                    → {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase
              tracking-widest mb-2">
              Style
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {STYLES.map(s => (
                <button
                  key={s.key}
                  onClick={() => setStyle(s.key)}
                  title={s.desc}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border
                    text-center transition-all ${
                    style === s.key
                      ? "border-[#F7BE4D]/40 bg-[#F7BE4D]/08"
                      : "border-white/8 bg-white/[0.02] hover:border-white/15"
                  }`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className={`text-[10px] font-semibold leading-tight ${
                    style === s.key ? "text-[#F7BE4D]" : "text-slate-500"
                  }`}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase
              tracking-widest mb-2">
              Aspect Ratio
            </label>
            <div className="flex gap-2">
              {SIZES.map(s => (
                <button
                  key={s.key}
                  onClick={() => setSize(s.key)}
                  className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl border
                    text-left transition-all ${
                    size === s.key
                      ? "border-[#F7BE4D]/40 bg-[#F7BE4D]/08"
                      : "border-white/8 bg-white/[0.02] hover:border-white/15"
                  }`}
                >
                  {/* Mini ratio visualizer */}
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8">
                    <div
                      className="rounded border"
                      style={{
                        width:       s.w * 0.42,
                        height:      s.h * 0.42,
                        borderColor: size === s.key ? "rgba(247,190,77,0.5)" : "rgba(255,255,255,0.15)",
                        background:  size === s.key ? "rgba(247,190,77,0.1)" : "rgba(255,255,255,0.03)",
                      }}
                    />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${size === s.key ? "text-white" : "text-slate-400"}`}>
                      {s.label}
                    </p>
                    <p className="text-[10px] text-slate-600">{s.desc}</p>
                  </div>
                </button>
              ))}
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

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="btn-primary w-full py-3 text-sm font-semibold flex items-center
              justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating image…</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Image</>
            )}
          </button>

          {loading && (
            <p className="text-[11px] text-slate-600 text-center">
              DALL-E 3 takes 10–20 seconds. Hang tight…
            </p>
          )}
        </div>

        {/* Right — preview */}
        <div className="space-y-4">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            Preview
          </label>

          <div
            className="relative rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden
              flex items-center justify-center"
            style={{
              aspectRatio: size === "landscape" ? "16/9" : size === "portrait" ? "4/5" : "1/1",
              minHeight: 240,
            }}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 p-8 text-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-2 border-[#F7BE4D]/30
                      border-t-[#F7BE4D]"
                  />
                  <p className="text-xs text-slate-500">Creating your image…</p>
                </motion.div>
              ) : imageUrl ? (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="AI generated image"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3 p-8 text-center"
                >
                  <ImageIcon className="w-10 h-10 text-slate-700" />
                  <p className="text-sm text-slate-600">Your image will appear here</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Image actions */}
          <AnimatePresence>
            {imageUrl && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5
                      rounded-xl text-xs font-semibold border border-[#F7BE4D]/25
                      bg-[#F7BE4D]/10 text-[#F7BE4D] hover:bg-[#F7BE4D]/15 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5
                      rounded-xl text-xs font-semibold border border-white/10
                      bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/20
                      transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </a>
                  <button
                    onClick={() => { setImageUrl(""); setRevisedPrompt(""); setPrompt("") }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5
                      rounded-xl text-xs font-semibold border border-white/8
                      bg-white/[0.02] text-slate-500 hover:text-slate-300 transition-all"
                    title="Start over"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Link
                  href="/schedule"
                  className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5
                    rounded-xl text-xs font-semibold border border-white/10
                    bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/20
                    transition-all"
                >
                  Use in scheduled post →
                </Link>

                {revisedPrompt && revisedPrompt !== prompt && (
                  <div className="rounded-xl bg-white/[0.02] border border-white/8 px-3.5 py-3">
                    <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      DALL-E enhanced your prompt
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
                      {revisedPrompt}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* History */}
      {history.length > 1 && (
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
            This Session
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {history.slice(1).map((item, i) => (
              <button
                key={i}
                onClick={() => { setImageUrl(item.url); setPrompt(item.prompt) }}
                className="relative aspect-square rounded-xl overflow-hidden border border-white/8
                  hover:border-[#F7BE4D]/30 transition-all group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
