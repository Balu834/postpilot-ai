"use client"

import { useState, useEffect, KeyboardEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Mic2, Sparkles, Save, CheckCircle2, X, Plus,
  Users, Building2, Target, Hash, MessageSquare, Smile,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import Sidebar from "@/components/dashboard/Sidebar"

const TONE_OPTIONS = [
  { value: "engaging",      label: "Engaging",      emoji: "🔥", desc: "High-energy, hype-driven" },
  { value: "professional",  label: "Professional",  emoji: "💼", desc: "Authoritative & polished" },
  { value: "witty",         label: "Witty",         emoji: "😄", desc: "Clever, humorous, punchy" },
  { value: "inspirational", label: "Inspirational", emoji: "✨", desc: "Uplifting & motivational" },
  { value: "educational",   label: "Educational",   emoji: "🎓", desc: "Informative & value-dense" },
  { value: "casual",        label: "Casual",        emoji: "👋", desc: "Friendly & conversational" },
]

const EMOJI_OPTIONS = [
  { value: "heavy",    label: "Heavy",    desc: "Emojis everywhere 🔥🚀✨" },
  { value: "moderate", label: "Moderate", desc: "Sprinkle where it fits 👍" },
  { value: "none",     label: "None",     desc: "Clean, no emojis" },
]

interface BrandVoice {
  brand_name: string
  industry: string
  tone: string
  audience: string
  key_topics: string[]
  avoid_words: string[]
  emoji_style: string
  sample_post: string
}

const DEFAULT: BrandVoice = {
  brand_name: "",
  industry: "",
  tone: "engaging",
  audience: "",
  key_topics: [],
  avoid_words: [],
  emoji_style: "moderate",
  sample_post: "",
}

function TagInput({
  tags, onChange, placeholder, color = "#F7BE4D",
}: {
  tags: string[]
  onChange: (t: string[]) => void
  placeholder: string
  color?: string
}) {
  const [input, setInput] = useState("")

  const add = () => {
    const val = input.trim()
    if (val && !tags.includes(val)) onChange([...tags, val])
    setInput("")
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add() }
    if (e.key === "Backspace" && !input && tags.length) onChange(tags.slice(0, -1))
  }

  return (
    <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-white/8 bg-white/[0.03] min-h-[48px] cursor-text"
      onClick={() => document.getElementById("tag-" + placeholder)?.focus()}>
      {tags.map((t) => (
        <span key={t} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
          {t}
          <button onClick={() => onChange(tags.filter((x) => x !== t))} className="opacity-60 hover:opacity-100">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        id={"tag-" + placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
      />
    </div>
  )
}

export default function BrandVoicePage() {
  const router = useRouter()
  const [voice, setVoice] = useState<BrandVoice>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [token, setToken] = useState("")

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push("/login"); return }
      setToken(session.access_token)
      const res = await fetch("/api/brand-voice", {
        headers: { authorization: `Bearer ${session.access_token}` },
      })
      const json = await res.json()
      if (json.data) setVoice({ ...DEFAULT, ...json.data })
      setLoading(false)
    })
  }, [router])

  const set = (key: keyof BrandVoice, val: string | string[]) =>
    setVoice((v) => ({ ...v, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    await fetch("/api/brand-voice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(voice),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-[#050816]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#F7BE4D]/30 border-t-[#F7BE4D] rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#050816] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center">
                <Mic2 className="w-5 h-5 text-[#F7BE4D]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Brand Voice</h1>
                <p className="text-sm text-slate-400">
                  Train the AI to write exactly like your brand
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">

            {/* Brand Identity */}
            <Section icon={Building2} title="Brand Identity" color="#F7BE4D">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Brand / Company name">
                  <input
                    value={voice.brand_name}
                    onChange={(e) => set("brand_name", e.target.value)}
                    placeholder="e.g. PostPilot AI"
                    className="input-field"
                  />
                </Field>
                <Field label="Industry / Niche">
                  <input
                    value={voice.industry}
                    onChange={(e) => set("industry", e.target.value)}
                    placeholder="e.g. SaaS, E-commerce, Fitness"
                    className="input-field"
                  />
                </Field>
              </div>
            </Section>

            {/* Tone */}
            <Section icon={Sparkles} title="Tone & Style" color="#818cf8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TONE_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => set("tone", t.value)}
                    className={`flex flex-col gap-1 p-4 rounded-xl border text-left transition-all ${
                      voice.tone === t.value
                        ? "border-[#818cf8]/60 bg-[#818cf8]/10"
                        : "border-white/6 bg-white/[0.02] hover:border-white/14"
                    }`}
                  >
                    <span className="text-xl">{t.emoji}</span>
                    <span className="text-sm font-semibold text-white">{t.label}</span>
                    <span className="text-[11px] text-slate-500">{t.desc}</span>
                    {voice.tone === t.value && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#818cf8] mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </Section>

            {/* Audience */}
            <Section icon={Users} title="Target Audience" color="#34d399">
              <Field label="Who are you speaking to?">
                <input
                  value={voice.audience}
                  onChange={(e) => set("audience", e.target.value)}
                  placeholder="e.g. Startup founders, content creators, marketing managers"
                  className="input-field"
                />
              </Field>
            </Section>

            {/* Topics & Avoid */}
            <Section icon={Hash} title="Content Rules" color="#f472b6">
              <div className="flex flex-col gap-4">
                <Field label="Key topics & themes" hint="Press Enter or comma to add">
                  <TagInput
                    tags={voice.key_topics}
                    onChange={(t) => set("key_topics", t)}
                    placeholder="Add topics — e.g. AI, Growth hacks, Productivity..."
                    color="#f472b6"
                  />
                </Field>
                <Field label="Words / phrases to AVOID" hint="Press Enter or comma to add">
                  <TagInput
                    tags={voice.avoid_words}
                    onChange={(t) => set("avoid_words", t)}
                    placeholder="e.g. synergy, leverage, paradigm shift..."
                    color="#f87171"
                  />
                </Field>
              </div>
            </Section>

            {/* Emoji style */}
            <Section icon={Smile} title="Emoji Usage" color="#fb923c">
              <div className="grid grid-cols-3 gap-3">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => set("emoji_style", e.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      voice.emoji_style === e.value
                        ? "border-[#fb923c]/60 bg-[#fb923c]/10"
                        : "border-white/6 bg-white/[0.02] hover:border-white/14"
                    }`}
                  >
                    <span className="text-sm font-semibold text-white block mb-1">{e.label}</span>
                    <span className="text-[11px] text-slate-500">{e.desc}</span>
                    {voice.emoji_style === e.value && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#fb923c] mt-1.5" />
                    )}
                  </button>
                ))}
              </div>
            </Section>

            {/* Sample post */}
            <Section icon={MessageSquare} title="Example Post" color="#22d3ee">
              <Field label="Paste an example of your ideal post" hint="The AI will mimic this style">
                <textarea
                  value={voice.sample_post}
                  onChange={(e) => set("sample_post", e.target.value)}
                  placeholder="Paste a post you love — the AI will learn from its style, length, and structure..."
                  rows={4}
                  className="input-field resize-none"
                />
              </Field>
            </Section>

            {/* Preview pill */}
            {(voice.brand_name || voice.audience || voice.key_topics.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5 border border-[#F7BE4D]/15"
              >
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-semibold">
                  AI will use this voice
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Writing as{" "}
                  <span className="text-[#F7BE4D] font-semibold">{voice.brand_name || "your brand"}</span>
                  {voice.industry && ` in the ${voice.industry} space`},
                  targeting{" "}
                  <span className="text-white font-medium">{voice.audience || "your audience"}</span>
                  {" "}with a{" "}
                  <span className="text-[#818cf8] font-semibold">{voice.tone}</span> tone
                  {voice.key_topics.length > 0 && `, focusing on ${voice.key_topics.slice(0, 3).join(", ")}`}.
                </p>
              </motion.div>
            )}

            {/* Save button */}
            <motion.button
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-[#050816] transition-all"
              style={{
                background: saved
                  ? "linear-gradient(135deg, #34d399, #10b981)"
                  : "linear-gradient(135deg, #F7BE4D, #ffd166)",
                boxShadow: saved
                  ? "0 0 24px rgba(52,211,153,0.4)"
                  : "0 0 24px rgba(247,190,77,0.35)",
              }}
            >
              <AnimatePresence mode="wait">
                {saved ? (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Brand Voice Saved!
                  </motion.span>
                ) : (
                  <motion.span
                    key="save"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-[#050816]/40 border-t-[#050816] rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? "Saving..." : "Save Brand Voice"}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <p className="text-center text-xs text-slate-600 -mt-2">
              Your saved voice is automatically applied to every AI generation
            </p>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field::placeholder { color: #64748b; }
        .input-field:focus { border-color: rgba(247,190,77,0.4); }
      `}</style>
    </div>
  )
}

function Section({
  icon: Icon, title, color, children,
}: {
  icon: React.ElementType
  title: string
  color: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-white/6"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}

function Field({
  label, hint, children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
        {hint && <span className="text-[10px] text-slate-600">{hint}</span>}
      </div>
      {children}
    </div>
  )
}
