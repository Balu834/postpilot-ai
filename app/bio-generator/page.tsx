"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserCircle, Sparkles, Loader2, AlertCircle, Copy, CheckCheck, Plus, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

const PLATFORMS = [
  { key: "linkedin",  label: "LinkedIn",    icon: "in", color: "#0077B5", max: 220  },
  { key: "instagram", label: "Instagram",   icon: "IG", color: "#E1306C", max: 150  },
  { key: "twitter",   label: "Twitter / X", icon: "𝕏",  color: "#94a3b8", max: 160  },
  { key: "facebook",  label: "Facebook",    icon: "f",  color: "#1877F2", max: 255  },
  { key: "youtube",   label: "YouTube",     icon: "▶",  color: "#FF0000", max: 200  },
  { key: "pinterest", label: "Pinterest",   icon: "📌", color: "#E60023", max: 160  },
]

const TONES = ["professional", "casual", "witty", "inspiring", "bold"]

const ROLE_EXAMPLES = [
  "SaaS Founder", "Fitness Coach", "Marketing Consultant",
  "Travel Photographer", "Fashion Designer", "Data Scientist",
]

export default function BioGeneratorPage() {
  const [name,     setName]     = useState("")
  const [role,     setRole]     = useState("")
  const [tone,     setTone]     = useState("professional")
  const [keywords, setKeywords] = useState<string[]>([])
  const [kwInput,  setKwInput]  = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const [bios,     setBios]     = useState<Record<string, string>>({})
  const [copied,   setCopied]   = useState<string | null>(null)

  const addKeyword = () => {
    const kw = kwInput.trim().replace(/^#/, "")
    if (kw && !keywords.includes(kw) && keywords.length < 8) {
      setKeywords(prev => [...prev, kw])
      setKwInput("")
    }
  }

  const handleGenerate = async () => {
    if (!name.trim() || !role.trim()) { setError("Name and role are required."); return }
    setLoading(true)
    setError("")
    setBios({})
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/bio/generate", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ name, role, keywords, tone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Generation failed")
      setBios(data)
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20
            flex items-center justify-center">
            <UserCircle className="w-4 h-4 text-[#F7BE4D]" />
          </div>
          <h1 className="text-xl font-bold text-white">Bio Generator</h1>
        </div>
        <p className="text-slate-500 text-sm ml-10.5">
          Generate optimized bios for every platform — tuned to character limits and platform norms.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-4">

        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5
                text-sm text-white placeholder-slate-600
                focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
            />
          </div>
          {/* Role */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
              Role / Title
            </label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. SaaS Founder & Growth Hacker"
              className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5
                text-sm text-white placeholder-slate-600
                focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {ROLE_EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => setRole(ex)}
                  className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {ex} ·
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            Keywords / Specialties
            <span className="normal-case font-normal text-slate-700 ml-1">(up to 8)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={kwInput}
              onChange={e => setKwInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addKeyword() } }}
              placeholder="e.g. AI, SaaS, growth — press Enter to add"
              className="flex-1 bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5
                text-sm text-white placeholder-slate-600
                focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
            />
            <button
              onClick={addKeyword}
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03]
                text-slate-400 hover:text-white hover:border-white/20 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {keywords.map(kw => (
                <span
                  key={kw}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                    bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 text-[#F7BE4D]"
                >
                  {kw}
                  <button onClick={() => setKeywords(prev => prev.filter(k => k !== kw))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tone */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
            Tone
          </label>
          <div className="flex flex-wrap gap-2">
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
        disabled={loading || !name.trim() || !role.trim()}
        className="btn-primary w-full py-3 text-sm font-semibold flex items-center
          justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating bios…</>
          : <><Sparkles className="w-4 h-4" /> Generate Bios for All Platforms</>}
      </button>

      {/* Results */}
      <AnimatePresence>
        {Object.keys(bios).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              Generated Bios
            </p>

            {PLATFORMS.filter(p => bios[p.key]).map((p, i) => {
              const bioText  = bios[p.key] ?? ""
              const len      = bioText.length
              const pct      = Math.min((len / p.max) * 100, 100)
              const overLimit = len > p.max
              const barColor  = overLimit ? "#f87171" : pct > 85 ? "#F7BE4D" : "#34d399"

              return (
                <motion.div
                  key={p.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-3
                    hover:border-white/15 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: p.color }}>{p.icon}</span>
                      <span className="text-sm font-semibold text-white">{p.label}</span>
                      <span className="text-[10px] text-slate-600">max {p.max} chars</span>
                    </div>
                    <button
                      onClick={() => handleCopy(p.key, bioText)}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500
                        hover:text-[#F7BE4D] transition-colors"
                    >
                      {copied === p.key
                        ? <><CheckCheck className="w-3 h-3 text-emerald-400" /> Copied!</>
                        : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {bioText}
                  </p>

                  {/* Char bar */}
                  <div className="space-y-1">
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: barColor }}
                      />
                    </div>
                    <p className={`text-[10px] font-medium ${overLimit ? "text-red-400" : "text-slate-600"}`}>
                      {len} / {p.max} chars {overLimit && "— over limit, consider shortening"}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
