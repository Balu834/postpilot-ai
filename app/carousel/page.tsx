"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Layers, Sparkles, Loader2, AlertCircle, Copy, CheckCheck, RotateCcw, Download, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

const TONES = ["engaging", "educational", "inspiring", "professional", "casual", "witty"]

const PLATFORMS = [
  { key: "instagram", label: "Instagram Carousel", icon: "IG", color: "#E1306C",
    desc: "Multi-slide post with headline + body per slide" },
  { key: "twitter",   label: "Twitter Thread",     icon: "𝕏",  color: "#94a3b8",
    desc: "Connected tweets, each under 280 chars" },
]

interface Slide {
  slide:     number
  headline?: string
  body:      string
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }
  return { copied, copy }
}

function CopyBtn({ text, id }: { text: string; id: string }) {
  const { copied, copy } = useCopy()
  return (
    <button
      onClick={() => copy(text, id)}
      className="p-1.5 rounded-lg text-slate-600 hover:text-[#F7BE4D] hover:bg-[#F7BE4D]/10
        transition-all flex-shrink-0"
      title="Copy"
    >
      {copied === id
        ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

export default function CarouselPage() {
  const [topic,    setTopic]    = useState("")
  const [platform, setPlatform] = useState("instagram")
  const [tone,     setTone]     = useState("engaging")
  const [count,    setCount]    = useState(7)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const [title,    setTitle]    = useState("")
  const [slides,   setSlides]   = useState<Slide[]>([])
  const [copiedAll, setCopiedAll] = useState(false)

  const [theme,            setTheme]            = useState("gold")
  const [linkedinConnected, setLinkedinConnected] = useState(false)
  const [downloadingPdf,   setDownloadingPdf]   = useState(false)
  const [pdfError,         setPdfError]         = useState("")
  const [linkedinCommentary, setLinkedinCommentary] = useState("")
  const [postingLinkedin,  setPostingLinkedin]  = useState(false)
  const [linkedinPosted,   setLinkedinPosted]   = useState(false)
  const [linkedinError,    setLinkedinError]    = useState("")

  const isThread = platform === "twitter"

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from("social_accounts").select("platform").eq("user_id", user.id).eq("platform", "linkedin").single()
      setLinkedinConnected(!!data)
    })
  }, [])

  const handleGenerate = async () => {
    if (!topic.trim()) { setError("Enter a topic first."); return }
    setLoading(true)
    setError("")
    setSlides([])
    setTitle("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/carousel/generate", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ topic, platform, tone, count }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Generation failed")
      setTitle(data.title ?? "")
      setSlides(data.slides ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const allText = isThread
    ? slides.map((s, i) => `${i + 1}/${slides.length} ${s.body}`).join("\n\n")
    : slides.map(s => `Slide ${s.slide}\n${s.headline ?? ""}\n${s.body}`).join("\n\n---\n\n")

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true)
    setPdfError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/carousel/render-pdf", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body:    JSON.stringify({ slides, theme }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Failed to render PDF")
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href = url
      a.download = `${title || "carousel"}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: unknown) {
      setPdfError(e instanceof Error ? e.message : "Failed to download PDF")
    } finally {
      setDownloadingPdf(false)
    }
  }

  const handlePostLinkedin = async () => {
    setPostingLinkedin(true)
    setLinkedinError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/carousel/post-linkedin", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body:    JSON.stringify({ slides, theme, title, commentary: linkedinCommentary }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to post to LinkedIn")
      setLinkedinPosted(true)
    } catch (e: unknown) {
      setLinkedinError(e instanceof Error ? e.message : "Failed to post to LinkedIn")
    } finally {
      setPostingLinkedin(false)
    }
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(allText)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const activePlatform = PLATFORMS.find(p => p.key === platform)!

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20
            flex items-center justify-center">
            <Layers className="w-4 h-4 text-[#F7BE4D]" />
          </div>
          <h1 className="text-xl font-bold text-white">Carousel & Thread Builder</h1>
        </div>
        <p className="text-slate-500 text-sm ml-10.5">
          Generate slide-by-slide carousels for Instagram or threaded posts for Twitter/X.
        </p>
      </div>

      {/* Platform */}
      <div className="grid grid-cols-2 gap-3">
        {PLATFORMS.map(p => (
          <button
            key={p.key}
            onClick={() => setPlatform(p.key)}
            className="flex items-start gap-3 p-4 rounded-xl border text-left transition-all"
            style={platform === p.key
              ? { background: `${p.color}12`, borderColor: `${p.color}40` }
              : { background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }
            }
          >
            <span className="text-sm font-bold mt-0.5 flex-shrink-0" style={{ color: platform === p.key ? p.color : "#64748b" }}>
              {p.icon}
            </span>
            <div>
              <p className={`text-sm font-semibold ${platform === p.key ? "text-white" : "text-slate-400"}`}>
                {p.label}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">{p.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-4">

        {/* Topic */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGenerate()}
            placeholder={isThread
              ? "e.g. 5 habits that changed my productivity forever"
              : "e.g. How to build a morning routine that sticks"}
            className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5
              text-sm text-white placeholder-slate-600
              focus:outline-none focus:border-[#F7BE4D]/40 focus:bg-white/[0.05] transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Tone */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
              Tone
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border capitalize transition-all ${
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

          {/* Count */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
              {isThread ? "Tweets" : "Slides"} — {count}
            </label>
            <input
              type="range"
              min={3}
              max={12}
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="w-full accent-[#F7BE4D]"
            />
            <div className="flex justify-between text-[10px] text-slate-700 mt-1">
              <span>3</span><span>12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10
          border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
        className="btn-primary w-full py-3 text-sm font-semibold flex items-center
          justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating {isThread ? "thread" : "carousel"}…</>
          : <><Sparkles className="w-4 h-4" /> Generate {isThread ? `${count}-Tweet Thread` : `${count}-Slide Carousel`}</>}
      </button>

      {/* Results */}
      <AnimatePresence>
        {slides.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Title + copy all */}
            <div className="flex items-center justify-between">
              <div>
                {title && <p className="text-sm font-bold text-white">{title}</p>}
                <p className="text-[11px] text-slate-500">
                  {slides.length} {isThread ? "tweets" : "slides"} · {isThread ? "thread" : "carousel"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSlides([]); setTitle("") }}
                  className="text-[11px] text-slate-600 hover:text-slate-400 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
                <button
                  onClick={copyAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                    bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 text-[#F7BE4D]
                    hover:bg-[#F7BE4D]/15 transition-all"
                >
                  {copiedAll
                    ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</>
                    : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
                </button>
              </div>
            </div>

            {/* Slides */}
            <div className="space-y-2.5">
              {slides.map((slide, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 rounded-xl border border-white/8 bg-white/[0.02]
                    px-4 py-3.5 group hover:border-white/15 transition-all"
                >
                  {/* Slide number */}
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                      text-[11px] font-bold mt-0.5"
                    style={{
                      background:   `${activePlatform.color}18`,
                      color:        activePlatform.color,
                      border:       `1px solid ${activePlatform.color}30`,
                    }}
                  >
                    {isThread ? `${i + 1}` : slide.slide}
                  </div>

                  <div className="flex-1 min-w-0">
                    {!isThread && slide.headline && (
                      <p className="text-sm font-bold text-white mb-1 leading-snug">
                        {slide.headline}
                      </p>
                    )}
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {isThread && <span className="text-[11px] text-slate-600 mr-1">{i + 1}/{slides.length}</span>}
                      {slide.body}
                    </p>
                    {isThread && (
                      <p className="text-[10px] text-slate-700 mt-1">
                        {`${i + 1}/${slides.length} ${slide.body}`.length} chars
                      </p>
                    )}
                  </div>

                  <CopyBtn
                    text={isThread
                      ? `${i + 1}/${slides.length} ${slide.body}`
                      : `${slide.headline ?? ""}\n\n${slide.body}`}
                    id={`slide-${i}`}
                  />
                </motion.div>
              ))}
            </div>

            {/* Export as document */}
            {!isThread && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-4 mt-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Export as Document
                </p>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                    Visual Theme
                  </label>
                  <div className="flex gap-2">
                    {(["gold", "dark", "light"] as const).map(t => (
                      <button key={t} onClick={() => setTheme(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-all ${
                          theme === t
                            ? "bg-[#F7BE4D]/15 border-[#F7BE4D]/30 text-[#F7BE4D]"
                            : "border-white/8 text-slate-500 hover:text-slate-300"
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {pdfError && (
                  <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{pdfError}
                  </div>
                )}

                <button onClick={handleDownloadPdf} disabled={downloadingPdf}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-white/8 text-slate-200 px-4 py-2.5 rounded-xl
                    hover:bg-white/12 transition-all disabled:opacity-40">
                  {downloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  {downloadingPdf ? "Rendering…" : "Download as PDF"}
                </button>

                <div className="border-t border-white/6 pt-4 space-y-3">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                    Post as LinkedIn Document
                  </p>
                  {!linkedinConnected ? (
                    <p className="text-xs text-slate-500 bg-white/3 rounded-xl px-4 py-3 border border-white/6">
                      Connect LinkedIn in Settings → Connected Accounts to post carousels directly.
                    </p>
                  ) : linkedinPosted ? (
                    <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Published to LinkedIn.
                    </p>
                  ) : (
                    <>
                      <textarea
                        value={linkedinCommentary}
                        onChange={e => setLinkedinCommentary(e.target.value)}
                        placeholder="Write a caption for this post…"
                        rows={2}
                        className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5
                          text-sm text-white placeholder-slate-600 resize-none
                          focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
                      />
                      {linkedinError && (
                        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{linkedinError}
                        </div>
                      )}
                      <button onClick={handlePostLinkedin} disabled={postingLinkedin}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-[#0077B5] text-white px-4 py-2.5 rounded-xl
                          hover:bg-[#0086cc] transition-all disabled:opacity-40">
                        {postingLinkedin ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="text-[10px] font-black">in</span>}
                        {postingLinkedin ? "Publishing…" : "Post to LinkedIn"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
