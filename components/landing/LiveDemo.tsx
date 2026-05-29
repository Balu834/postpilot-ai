"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Loader2, Copy, CheckCheck, ArrowRight } from "lucide-react"
import Link from "next/link"

const EXAMPLE_TOPICS = [
  "How AI is changing content marketing",
  "3 lessons from building a startup",
  "The secret to viral LinkedIn posts",
  "Why most creators fail (and how to win)",
]

const PLATFORMS = [
  { key: "instagram" as const, label: "Instagram",   icon: "📸", color: "#E1306C" },
  { key: "linkedin"  as const, label: "LinkedIn",    icon: "💼", color: "#0077B5" },
  { key: "twitter"   as const, label: "Twitter / X", icon: "𝕏",  color: "#64748b" },
]

type Platform = "instagram" | "linkedin" | "twitter"
interface Result { instagram: string; linkedin: string; twitter: string }

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button suppressHydrationWarning
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md border transition-all"
      style={{
        background:  copied ? "#ecfdf5" : "#f8fafc",
        borderColor: copied ? "#a7f3d0" : "#e2e8f0",
        color:       copied ? "#059669" : "#64748b",
      }}>
      {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

export default function LiveDemo() {
  const [topic,     setTopic]     = useState("")
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState<Result | null>(null)
  const [error,     setError]     = useState("")
  const [activeTab, setActiveTab] = useState<Platform>("instagram")

  const generate = async (t?: string) => {
    const finalTopic = (t ?? topic).trim()
    if (!finalTopic) return
    setLoading(true); setResult(null); setError(""); if (t) setTopic(t)
    try {
      const res  = await fetch("/api/generate/demo", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body:   JSON.stringify({ topic: finalTopic }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Try again in a moment"); return }
      setResult(data)
      setActiveTab("instagram")
    } catch {
      setError("Something went wrong, please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-24 px-4 relative overflow-hidden bg-white">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(247,190,77,0.07) 0%, transparent 60%)" }} />

      <div className="max-w-3xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5 border border-amber-200 bg-amber-50 text-amber-700">
            <Sparkles className="w-3.5 h-3.5" />
            Try it right now — no sign up
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 leading-tight">
            Type a topic.{" "}
            <span style={{ background: "linear-gradient(135deg, #d97706, #F7BE4D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Watch AI write.
            </span>
          </h2>
          <p className="text-slate-500 text-base max-w-lg mx-auto">
            See your idea turn into platform-perfect posts for Instagram, LinkedIn, and Twitter — instantly.
          </p>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-1 mb-4 border border-slate-200 shadow-sm bg-white"
        >
          <div className="flex gap-2">
            <input
              suppressHydrationWarning
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generate()}
              placeholder="Enter any topic, idea, or product..."
              className="flex-1 bg-transparent px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none"
            />
            <button suppressHydrationWarning
              onClick={() => generate()}
              disabled={loading || !topic.trim()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex-shrink-0 m-0.5"
              style={{ background: "linear-gradient(135deg, #F7BE4D, #ffd166)", color: "#050816", boxShadow: "0 4px 12px rgba(247,190,77,0.35)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Generating…" : "Generate"}
            </button>
          </div>
        </motion.div>

        {/* Example topics */}
        {!result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 justify-center mb-8">
            {EXAMPLE_TOPICS.map(t => (
              <button suppressHydrationWarning key={t} onClick={() => generate(t)}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-all">
                {t}
              </button>
            ))}
          </motion.div>
        )}

        {error && <p className="text-center text-sm text-red-500 mb-6">{error}</p>}

        {/* Loading skeleton */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex border-b border-slate-100">
                {PLATFORMS.map(p => (
                  <div key={p.key} className="flex-1 py-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                    <span>{p.icon}</span>{p.label}
                  </div>
                ))}
              </div>
              <div className="p-6 space-y-3">
                <div className="h-3 rounded-full bg-slate-100 animate-pulse w-3/4" />
                <div className="h-3 rounded-full bg-slate-100 animate-pulse w-full" />
                <div className="h-3 rounded-full bg-slate-100 animate-pulse w-5/6" />
                <div className="h-3 rounded-full bg-slate-100 animate-pulse w-2/3 mt-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md"
            >
              {/* Platform tabs */}
              <div className="flex border-b border-slate-100 bg-slate-50">
                {PLATFORMS.map(p => (
                  <button suppressHydrationWarning key={p.key} onClick={() => setActiveTab(p.key)}
                    className="flex-1 py-3.5 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all relative"
                    style={{ color: activeTab === p.key ? p.color : "#94a3b8" }}>
                    <span>{p.icon}</span>{p.label}
                    {activeTab === p.key && (
                      <motion.div layoutId="demoTabLine"
                        className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                        style={{ background: p.color }} />
                    )}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {PLATFORMS.map(p => activeTab === p.key && (
                    <motion.div key={p.key}
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: `${p.color}15`, color: p.color }}>
                            {p.icon}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{p.label}</p>
                            <p className="text-[10px] text-slate-400">AI-generated · just now</p>
                          </div>
                        </div>
                        <CopyBtn text={result[p.key]} />
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result[p.key]}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Upgrade CTA */}
              <div className="px-6 pb-6">
                <div className="rounded-xl px-4 py-3.5 flex items-center justify-between gap-4 border border-amber-200"
                  style={{ background: "linear-gradient(135deg, #fffbeb, #fef9c3)" }}>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Want to schedule & publish this?</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Sign up free — 10 generations included, no credit card</p>
                  </div>
                  <Link href="/login"
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl flex-shrink-0 transition-all"
                    style={{ background: "linear-gradient(135deg, #F7BE4D, #ffd166)", color: "#050816", boxShadow: "0 4px 12px rgba(247,190,77,0.3)" }}>
                    Start free <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
