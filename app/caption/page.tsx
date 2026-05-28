"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Upload, Sparkles, Loader2, AlertCircle, Copy, CheckCheck, RotateCcw } from "lucide-react"
import { supabase } from "@/lib/supabase"

const PLATFORMS = [
  { key: "linkedin",  label: "LinkedIn",    icon: "in", color: "#0077B5" },
  { key: "instagram", label: "Instagram",   icon: "IG", color: "#E1306C" },
  { key: "twitter",   label: "Twitter / X", icon: "𝕏",  color: "#94a3b8" },
  { key: "facebook",  label: "Facebook",    icon: "f",  color: "#1877F2" },
  { key: "threads",   label: "Threads",     icon: "🧵", color: "#e2e8f0" },
]

const TONES = ["engaging", "professional", "inspirational", "casual", "witty"]

export default function CaptionPage() {
  const fileRef      = useRef<HTMLInputElement>(null)
  const [preview,    setPreview]    = useState("")
  const [base64,     setBase64]     = useState("")
  const [mimeType,   setMimeType]   = useState("image/jpeg")
  const [tone,       setTone]       = useState("engaging")
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState("")
  const [captions,   setCaptions]   = useState<Record<string, string>>({})
  const [description,setDescription]= useState("")
  const [copied,     setCopied]     = useState<string | null>(null)
  const [dragOver,   setDragOver]   = useState(false)

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image file."); return }
    if (file.size > 5 * 1024 * 1024)    { setError("Image must be under 5MB."); return }
    setError("")
    setCaptions({})
    setDescription("")
    setMimeType(file.type)
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      setBase64(dataUrl.split(",")[1])
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleGenerate = async () => {
    if (!base64) { setError("Upload an image first."); return }
    setLoading(true)
    setError("")
    setCaptions({})
    setDescription("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/caption", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ imageBase64: base64, mimeType, tone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Caption generation failed")
      const { imageDescription, ...rest } = data
      setDescription(imageDescription ?? "")
      setCaptions(rest)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const reset = () => {
    setPreview(""); setBase64(""); setCaptions({}); setDescription(""); setError("")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center">
            <Camera className="w-4 h-4 text-[#F7BE4D]" />
          </div>
          <h1 className="text-xl font-bold text-white">Caption from Image</h1>
        </div>
        <p className="text-slate-500 text-sm ml-10.5">
          Upload any photo and get AI-written captions for every platform instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — upload */}
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => !preview && fileRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed overflow-hidden transition-all
              ${preview ? "border-white/15 cursor-default" : "cursor-pointer hover:border-white/25"}
              ${dragOver ? "border-[#F7BE4D]/50 bg-[#F7BE4D]/05" : "border-white/10"}`}
            style={{ aspectRatio: "1/1" }}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }} />

            {preview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="uploaded" className="w-full h-full object-cover" />
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white
                    hover:bg-black/80 transition-all backdrop-blur-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
                <Upload className={`w-10 h-10 ${dragOver ? "text-[#F7BE4D]" : "text-slate-600"}`} />
                <div>
                  <p className="text-sm font-semibold text-slate-400">Drop image here</p>
                  <p className="text-[11px] text-slate-600 mt-1">or click to browse · JPG, PNG, WEBP · max 5MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Tone */}
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Caption Tone</p>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map(t => (
                <button key={t} onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-all ${
                    tone === t
                      ? "bg-[#F7BE4D]/15 border-[#F7BE4D]/30 text-[#F7BE4D]"
                      : "border-white/8 text-slate-500 hover:text-slate-300"
                  }`}>{t}</button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10
              border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading || !base64}
            className="btn-primary w-full py-3 text-sm font-semibold flex items-center
              justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing image…</>
              : <><Sparkles className="w-4 h-4" />Generate Captions</>}
          </button>
        </div>

        {/* Right — captions */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            {Object.keys(captions).length > 0 ? "Generated Captions" : "Captions will appear here"}
          </p>

          {description && (
            <div className="rounded-xl bg-white/[0.02] border border-white/8 px-4 py-3">
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">AI sees</p>
              <p className="text-xs text-slate-400 italic">{description}</p>
            </div>
          )}

          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-2">
                {PLATFORMS.map((_, i) => (
                  <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 space-y-2">
                    <div className="skeleton h-3 w-24 rounded" />
                    <div className="skeleton h-3 w-full rounded" />
                    <div className="skeleton h-3 w-4/5 rounded" />
                  </div>
                ))}
              </motion.div>
            )}

            {Object.keys(captions).length > 0 && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
                {PLATFORMS.filter(p => captions[p.key]).map((p, i) => (
                  <motion.div key={p.key}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-2
                      hover:border-white/15 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: p.color }}>{p.icon}</span>
                        <span className="text-xs font-semibold text-white">{p.label}</span>
                      </div>
                      <button onClick={() => handleCopy(p.key, captions[p.key])}
                        className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-[#F7BE4D] transition-colors">
                        {copied === p.key
                          ? <><CheckCheck className="w-3 h-3 text-emerald-400" />Copied</>
                          : <><Copy className="w-3 h-3" />Copy</>}
                      </button>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{captions[p.key]}</p>
                    <p className="text-[10px] text-slate-700">{captions[p.key].length} chars</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
