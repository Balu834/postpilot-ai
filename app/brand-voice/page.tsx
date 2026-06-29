"use client"

import { useState, useEffect, KeyboardEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic2, Sparkles, Save, CheckCircle2, X, Plus,
  Users, Building2, Hash, MessageSquare, Smile,
  Target, Palette, Heart, ArrowRight,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

// ── Types ──────────────────────────────────────────────────────────────────
interface BrandVoice {
  brand_name:  string
  industry:    string
  mission:     string
  tone:        string
  audience:    string
  key_topics:  string[]
  avoid_words: string[]
  hashtags:    string[]
  cta:         string
  emoji_style: string
  sample_post: string
}

const DEFAULT: BrandVoice = {
  brand_name:  "",
  industry:    "",
  mission:     "",
  tone:        "professional",
  audience:    "",
  key_topics:  [],
  avoid_words: [],
  hashtags:    [],
  cta:         "",
  emoji_style: "moderate",
  sample_post: "",
}

// ── Options ────────────────────────────────────────────────────────────────
const TONE_OPTIONS = [
  { value: "professional",   label: "Professional",   emoji: "💼", desc: "Authoritative & polished" },
  { value: "viral",          label: "Viral",          emoji: "🔥", desc: "High-energy, bold, scroll-stopping" },
  { value: "storytelling",   label: "Storytelling",   emoji: "📖", desc: "Narrative-driven & personal" },
  { value: "founder",        label: "Founder",        emoji: "🚀", desc: "Honest, builder-focused voice" },
  { value: "educational",    label: "Educational",    emoji: "🎓", desc: "Value-dense & informative" },
  { value: "conversational", label: "Conversational", emoji: "💬", desc: "Friendly, casual & relatable" },
  { value: "marketing",      label: "Marketing",      emoji: "📣", desc: "Persuasive & brand-driven" },
  { value: "inspirational",  label: "Inspirational",  emoji: "✨", desc: "Uplifting & motivational" },
  { value: "technical",      label: "Technical",      emoji: "⚙️", desc: "Precise, expert-level insights" },
  { value: "friendly",       label: "Friendly",       emoji: "😊", desc: "Warm, approachable & fun" },
]

const EMOJI_OPTIONS = [
  { value: "heavy",    label: "Heavy 🔥🚀✨",  desc: "Emojis in almost every line" },
  { value: "moderate", label: "Moderate 👍",    desc: "Sprinkle where they fit" },
  { value: "none",     label: "None",            desc: "Clean, text-only style" },
]

// ── Sub-components ─────────────────────────────────────────────────────────
function TagInput({
  tags, onChange, placeholder, color = "#F7BE4D",
}: {
  tags: string[]; onChange: (t: string[]) => void; placeholder: string; color?: string
}) {
  const [input, setInput] = useState("")
  const add = () => {
    const val = input.trim().replace(/^#/, "")
    if (val && !tags.includes(val)) onChange([...tags, val])
    setInput("")
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add() }
    if (e.key === "Backspace" && !input && tags.length) onChange(tags.slice(0, -1))
  }

  return (
    <div
      className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-200 bg-white min-h-[52px] cursor-text"
      onClick={() => document.getElementById("tag-" + placeholder)?.focus()}
    >
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
          {t}
          <button onClick={() => onChange(tags.filter(x => x !== t))} className="opacity-60 hover:opacity-100">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        id={"tag-" + placeholder}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={tags.length === 0 ? placeholder : "Add more…"}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
      />
    </div>
  )
}

function Section({ icon: Icon, title, color, children }: {
  icon: React.ElementType; title: string; color: string; children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 border border-slate-200 bg-white"
      style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function InputField({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 text-sm text-slate-700 rounded-xl border border-slate-200 bg-white outline-none transition-all placeholder:text-slate-400"
      style={{ boxShadow: "none" }}
      onFocus={e => { e.target.style.borderColor = "rgba(247,190,77,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(247,190,77,0.1)" }}
      onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none" }}
    />
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function BrandVoicePage() {
  const [voice,   setVoice]   = useState<BrandVoice>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [token,   setToken]   = useState("")

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      setToken(session.access_token)
      const res  = await fetch("/api/brand-voice", { headers: { authorization: `Bearer ${session.access_token}` } })
      const json = await res.json()
      if (json.data) setVoice({ ...DEFAULT, ...json.data })
      setLoading(false)
    })
  }, [])

  const set = (key: keyof BrandVoice, val: string | string[]) =>
    setVoice(v => ({ ...v, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    await fetch("/api/brand-voice", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(voice),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-[#F7BE4D]/30 border-t-[#F7BE4D] rounded-full animate-spin" />
      </div>
    )
  }

  const hasPreview = voice.brand_name || voice.audience || voice.key_topics.length > 0

  return (
    <div className="max-w-3xl space-y-5">

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center">
            <Mic2 className="w-5 h-5 text-[#F7BE4D]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Brand Voice</h1>
            <p className="text-sm text-slate-500">Train the AI to write exactly like your brand</p>
          </div>
        </div>
      </motion.div>

      {/* Brand Identity */}
      <Section icon={Building2} title="Brand Identity" color="#F7BE4D">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Brand / Company Name">
            <InputField value={voice.brand_name} onChange={v => set("brand_name", v)} placeholder="e.g. PostPilot AI" />
          </Field>
          <Field label="Industry / Niche">
            <InputField value={voice.industry} onChange={v => set("industry", v)} placeholder="e.g. SaaS, Fitness, E-commerce" />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Mission / Value Proposition">
            <textarea
              value={voice.mission}
              onChange={e => set("mission", e.target.value)}
              placeholder="e.g. We help startup founders build personal brands that attract investors and customers…"
              rows={3}
              className="w-full px-4 py-2.5 text-sm text-slate-700 rounded-xl border border-slate-200 bg-white outline-none resize-none placeholder:text-slate-400 transition-all"
              onFocus={e => { e.target.style.borderColor = "rgba(247,190,77,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(247,190,77,0.1)" }}
              onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none" }}
            />
          </Field>
        </div>
      </Section>

      {/* Tone & Style */}
      <Section icon={Sparkles} title="Tone & Style" color="#818cf8">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {TONE_OPTIONS.map(t => (
            <button
              key={t.value}
              onClick={() => set("tone", t.value)}
              className="flex flex-col gap-1 p-3 rounded-xl border text-left transition-all"
              style={{
                background: voice.tone === t.value ? "rgba(129,140,248,0.08)" : "#f8fafc",
                border: voice.tone === t.value ? "1px solid rgba(129,140,248,0.4)" : "1px solid #e2e8f0",
                boxShadow: voice.tone === t.value ? "0 0 0 3px rgba(129,140,248,0.08)" : "none",
              }}
            >
              <span className="text-lg">{t.emoji}</span>
              <span className="text-xs font-semibold text-slate-800">{t.label}</span>
              <span className="text-[10px] text-slate-400 leading-relaxed">{t.desc}</span>
              {voice.tone === t.value && <CheckCircle2 className="w-3 h-3 text-[#818cf8] mt-0.5" />}
            </button>
          ))}
        </div>
      </Section>

      {/* Audience */}
      <Section icon={Users} title="Target Audience" color="#34d399">
        <Field label="Who are you speaking to?">
          <InputField
            value={voice.audience}
            onChange={v => set("audience", v)}
            placeholder="e.g. Startup founders aged 25–40, B2B SaaS marketers, content creators…"
          />
        </Field>
      </Section>

      {/* Content Rules */}
      <Section icon={Hash} title="Content Rules" color="#f472b6">
        <div className="space-y-4">
          <Field label="Key Topics & Themes" hint="Enter to add">
            <TagInput tags={voice.key_topics} onChange={t => set("key_topics", t)}
              placeholder="Add topics — e.g. AI tools, Growth, Productivity…" color="#f472b6" />
          </Field>
          <Field label="Frequently Used Hashtags" hint="Enter to add (# optional)">
            <TagInput tags={voice.hashtags} onChange={t => set("hashtags", t)}
              placeholder="Add hashtags — e.g. buildinpublic, saas, founder…" color="#F7BE4D" />
          </Field>
          <Field label="Words & Phrases to AVOID" hint="Enter to add">
            <TagInput tags={voice.avoid_words} onChange={t => set("avoid_words", t)}
              placeholder="e.g. synergy, leverage, disruptive, paradigm shift…" color="#f87171" />
          </Field>
        </div>
      </Section>

      {/* CTA */}
      <Section icon={Target} title="Default Call-to-Action" color="#fb923c">
        <Field label="Your preferred CTA" hint="Applied at end of posts when relevant">
          <InputField
            value={voice.cta}
            onChange={v => set("cta", v)}
            placeholder="e.g. Follow for daily SaaS growth tips · DM me 'GROW' to get started · Link in bio"
          />
        </Field>
      </Section>

      {/* Emoji usage */}
      <Section icon={Smile} title="Emoji Usage" color="#fb923c">
        <div className="grid grid-cols-3 gap-3">
          {EMOJI_OPTIONS.map(e => (
            <button
              key={e.value}
              onClick={() => set("emoji_style", e.value)}
              className="p-4 rounded-xl border text-left transition-all"
              style={{
                background: voice.emoji_style === e.value ? "rgba(251,146,60,0.08)" : "#f8fafc",
                border: voice.emoji_style === e.value ? "1px solid rgba(251,146,60,0.4)" : "1px solid #e2e8f0",
              }}
            >
              <span className="text-sm font-semibold text-slate-800 block mb-1">{e.label}</span>
              <span className="text-[11px] text-slate-500">{e.desc}</span>
              {voice.emoji_style === e.value && <CheckCircle2 className="w-3 h-3 text-[#fb923c] mt-1.5" />}
            </button>
          ))}
        </div>
      </Section>

      {/* Sample post */}
      <Section icon={MessageSquare} title="Example Post" color="#22d3ee">
        <Field label="Paste an example of your ideal post" hint="The AI will mimic this style">
          <textarea
            value={voice.sample_post}
            onChange={e => set("sample_post", e.target.value)}
            placeholder="Paste a post you love — the AI learns its style, length, rhythm, and structure…"
            rows={5}
            className="w-full px-4 py-3 text-sm text-slate-700 rounded-xl border border-slate-200 bg-white outline-none resize-none placeholder:text-slate-400 leading-relaxed transition-all"
            onFocus={e => { e.target.style.borderColor = "rgba(34,211,238,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(34,211,238,0.08)" }}
            onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none" }}
          />
        </Field>
      </Section>

      {/* AI Voice Preview */}
      <AnimatePresence>
        {hasPreview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl p-5 border border-[#F7BE4D]/30"
            style={{ background: "linear-gradient(145deg, #fffbeb 0%, #fefce8 100%)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F7BE4D]" />
              <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">AI will write as</p>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              Writing as{" "}
              <span className="text-[#b45309] font-semibold">{voice.brand_name || "your brand"}</span>
              {voice.industry && <span> in the <span className="font-medium">{voice.industry}</span> space</span>},
              targeting <span className="font-semibold text-slate-900">{voice.audience || "your audience"}</span>{" "}
              with a <span className="text-[#818cf8] font-semibold">{voice.tone}</span> tone
              {voice.key_topics.length > 0 && <span>, focusing on <span className="font-medium">{voice.key_topics.slice(0, 3).join(", ")}</span></span>}
              {voice.cta && <span>, always ending with "<em>{voice.cta}</em>"</span>}.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save button */}
      <motion.button
        onClick={handleSave}
        disabled={saving}
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        className="w-full py-4 rounded-2xl font-bold text-[#050816] text-sm relative overflow-hidden transition-all"
        style={{
          background: saved
            ? "linear-gradient(135deg, #34d399, #10b981)"
            : "linear-gradient(135deg, #F7BE4D 0%, #ffd97d 100%)",
          boxShadow: saved
            ? "0 4px 20px rgba(52,211,153,0.35)"
            : "0 4px 20px rgba(247,190,77,0.35)",
        }}
      >
        {!saved && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          />
        )}
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.span key="saved" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Brand Voice Saved!
            </motion.span>
          ) : (
            <motion.span key="save" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="flex items-center justify-center gap-2">
              {saving
                ? <div className="w-4 h-4 border-2 border-[#050816]/30 border-t-[#050816] rounded-full animate-spin" />
                : <Save className="w-4 h-4" />
              }
              {saving ? "Saving…" : "Save Brand Voice"}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <p className="text-center text-xs text-slate-400 -mt-2 pb-4">
        Your brand voice is automatically applied to every AI generation
      </p>
    </div>
  )
}
