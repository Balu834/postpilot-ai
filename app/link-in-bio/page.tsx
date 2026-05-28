"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Link2, Plus, Trash2, Copy, CheckCheck, ExternalLink,
  Loader2, CheckCircle2, Palette, Eye, Save, GripVertical,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

// ── Types ─────────────────────────────────────────────────────────
interface CustomLink { id: string; label: string; url: string; emoji: string }
interface SocialAccount { platform: string; username: string | null }

interface BioData {
  username:       string
  display_name:   string | null
  bio:            string | null
  avatar_url:     string | null
  theme:          Theme
  custom_links:   CustomLink[]
  show_platforms: boolean
}

type Theme = "dark" | "purple" | "gold" | "minimal"

// ── Config ────────────────────────────────────────────────────────
const THEMES: { key: Theme; label: string; preview: string }[] = [
  { key: "dark",    label: "Dark",    preview: "bg-[#050816]" },
  { key: "purple",  label: "Purple",  preview: "bg-[#1e1b4b]" },
  { key: "gold",    label: "Gold",    preview: "bg-[#0a0a00]" },
  { key: "minimal", label: "Minimal", preview: "bg-white" },
]

const PLATFORM_META: Record<string, { icon: string; color: string; label: string; baseUrl: string }> = {
  twitter:   { icon: "𝕏",  color: "#94a3b8", label: "Twitter / X", baseUrl: "https://twitter.com/" },
  linkedin:  { icon: "💼", color: "#0077B5", label: "LinkedIn",    baseUrl: "https://linkedin.com/in/" },
  instagram: { icon: "📸", color: "#E1306C", label: "Instagram",   baseUrl: "https://instagram.com/" },
  facebook:  { icon: "f",  color: "#1877F2", label: "Facebook",    baseUrl: "https://facebook.com/" },
  threads:   { icon: "🧵", color: "#e2e8f0", label: "Threads",     baseUrl: "https://threads.net/@" },
  bluesky:   { icon: "🦋", color: "#0085ff", label: "Bluesky",     baseUrl: "https://bsky.app/profile/" },
  pinterest: { icon: "📌", color: "#E60023", label: "Pinterest",   baseUrl: "https://pinterest.com/" },
  youtube:   { icon: "▶",  color: "#FF0000", label: "YouTube",     baseUrl: "https://youtube.com/@" },
}

const EMOJI_PRESETS = ["🔗", "🌐", "📧", "📱", "🛒", "📝", "🎬", "🎵", "📚", "💡", "🚀", "⭐"]

function uid() { return Math.random().toString(36).slice(2, 9) }

// ── Mini preview ──────────────────────────────────────────────────
function LivePreview({ bio, accounts, appUrl }: { bio: BioData; accounts: SocialAccount[]; appUrl: string }) {
  const themeStyles: Record<Theme, { bg: string; card: string; text: string; sub: string; border: string }> = {
    dark:    { bg: "#050816",     card: "rgba(255,255,255,0.05)", text: "#ffffff",   sub: "#94a3b8", border: "rgba(255,255,255,0.08)" },
    purple:  { bg: "#1e1b4b",     card: "rgba(129,140,248,0.12)", text: "#ffffff",   sub: "#a5b4fc", border: "rgba(129,140,248,0.2)"  },
    gold:    { bg: "#050800",     card: "rgba(247,190,77,0.08)",  text: "#ffffff",   sub: "#F7BE4D", border: "rgba(247,190,77,0.15)"  },
    minimal: { bg: "#f8fafc",     card: "rgba(0,0,0,0.04)",       text: "#0f172a",   sub: "#64748b", border: "rgba(0,0,0,0.08)"      },
  }
  const t = themeStyles[bio.theme]

  return (
    <div className="rounded-2xl overflow-hidden border border-white/8 h-full" style={{ background: t.bg, minHeight: 420 }}>
      <div className="flex flex-col items-center px-6 pt-8 pb-6 gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0"
          style={{ background: bio.theme === "gold" ? "rgba(247,190,77,0.2)" : bio.theme === "purple" ? "rgba(129,140,248,0.2)" : "rgba(255,255,255,0.08)", color: t.text }}>
          {bio.display_name?.[0]?.toUpperCase() ?? "U"}
        </div>
        {/* Name + bio */}
        <div className="text-center">
          <p className="text-sm font-bold" style={{ color: t.text }}>{bio.display_name || "Your Name"}</p>
          {bio.bio && <p className="text-xs mt-1 leading-relaxed" style={{ color: t.sub }}>{bio.bio}</p>}
          <p className="text-[10px] mt-1 opacity-40" style={{ color: t.sub }}>postpilot.ai/u/{bio.username || "username"}</p>
        </div>
        {/* Platform links */}
        {bio.show_platforms && accounts.length > 0 && (
          <div className="flex gap-2 flex-wrap justify-center">
            {accounts.map(acc => {
              const m = PLATFORM_META[acc.platform]
              if (!m) return null
              return (
                <div key={acc.platform}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
                  style={{ background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}30` }}>
                  <span>{m.icon}</span>
                  <span>{acc.username ?? m.label}</span>
                </div>
              )
            })}
          </div>
        )}
        {/* Custom links */}
        <div className="w-full space-y-2">
          {bio.custom_links.map(link => (
            <div key={link.id}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold"
              style={{ background: t.card, border: `1px solid ${t.border}`, color: t.text }}>
              <span>{link.emoji}</span>
              <span className="flex-1 truncate">{link.label || "Link label"}</span>
              <ExternalLink className="w-3 h-3 opacity-30" />
            </div>
          ))}
          {bio.custom_links.length === 0 && (
            <div className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-[11px]"
              style={{ background: t.card, border: `1px dashed ${t.border}`, color: t.sub }}>
              + Add custom links below
            </div>
          )}
        </div>
        {/* Branding */}
        <p className="text-[9px] opacity-25 mt-2" style={{ color: t.sub }}>Powered by PostPilot AI</p>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function LinkInBioPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""

  const [bio, setBio] = useState<BioData>({
    username: "", display_name: "", bio: "", avatar_url: null,
    theme: "dark", custom_links: [], show_platforms: true,
  })
  const [accounts,  setAccounts]  = useState<SocialAccount[]>([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState("")
  const [copied,    setCopied]    = useState(false)
  const [tab,       setTab]       = useState<"edit" | "preview">("edit")

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch("/api/link-in-bio", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const data = await res.json()
    if (data.bio) {
      setBio({
        username:       data.bio.username ?? "",
        display_name:   data.bio.display_name ?? "",
        bio:            data.bio.bio ?? "",
        avatar_url:     data.bio.avatar_url ?? null,
        theme:          data.bio.theme ?? "dark",
        custom_links:   data.bio.custom_links ?? [],
        show_platforms: data.bio.show_platforms ?? true,
      })
    }
    setAccounts(data.accounts ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch("/api/link-in-bio", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify(bio),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || "Save failed"); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const addLink = () => setBio(b => ({
    ...b,
    custom_links: [...b.custom_links, { id: uid(), label: "", url: "", emoji: "🔗" }],
  }))

  const removeLink = (id: string) => setBio(b => ({
    ...b,
    custom_links: b.custom_links.filter(l => l.id !== id),
  }))

  const updateLink = (id: string, field: keyof CustomLink, value: string) => setBio(b => ({
    ...b,
    custom_links: b.custom_links.map(l => l.id === id ? { ...l, [field]: value } : l),
  }))

  const pageUrl = `${appUrl}/u/${bio.username}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(pageUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-[#F7BE4D]" />
            Link in Bio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Your personal landing page for all platforms</p>
        </div>
        <div className="flex items-center gap-2">
          {bio.username && (
            <button onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: copied ? "#34d399" : "#94a3b8" }}>
              {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy link"}
            </button>
          )}
          {bio.username && (
            <a href={pageUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
              <Eye className="w-3.5 h-3.5" />
              Preview
            </a>
          )}
          <button onClick={handleSave} disabled={saving || !bio.username}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            style={{ background: saved ? "rgba(52,211,153,0.15)" : "linear-gradient(135deg, #F7BE4D, #ffd166)", color: saved ? "#34d399" : "#050816", border: saved ? "1px solid rgba(52,211,153,0.3)" : "none", boxShadow: saved ? "none" : "0 4px 16px rgba(247,190,77,0.3)" }}>
            {saving
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</>
              : saved
              ? <><CheckCircle2 className="w-3.5 h-3.5" />Saved!</>
              : <><Save className="w-3.5 h-3.5" />Save Page</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left: Editor ── */}
        <div className="space-y-5">

          {/* URL slug */}
          <div className="glass rounded-2xl p-5 border border-white/6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#F7BE4D]/15 flex items-center justify-center text-[10px] text-[#F7BE4D] font-bold">1</span>
              Your Page URL
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">{appUrl}/u/</span>
              <input
                value={bio.username}
                onChange={e => setBio(b => ({ ...b, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))}
                placeholder="yourname"
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-600">Letters, numbers, hyphens and underscores only. Min 3 characters.</p>
          </div>

          {/* Profile */}
          <div className="glass rounded-2xl p-5 border border-white/6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#F7BE4D]/15 flex items-center justify-center text-[10px] text-[#F7BE4D] font-bold">2</span>
              Profile
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block font-medium">Display Name</label>
                <input
                  value={bio.display_name ?? ""}
                  onChange={e => setBio(b => ({ ...b, display_name: e.target.value }))}
                  placeholder="Your Name"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block font-medium">Bio</label>
                <textarea
                  value={bio.bio ?? ""}
                  onChange={e => setBio(b => ({ ...b, bio: e.target.value }))}
                  placeholder="Creator · Founder · Sharing what I learn"
                  rows={2}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#F7BE4D]/40 resize-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="glass rounded-2xl p-5 border border-white/6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#F7BE4D]/15 flex items-center justify-center text-[10px] text-[#F7BE4D] font-bold">3</span>
              <Palette className="w-3.5 h-3.5" /> Theme
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map(t => (
                <button key={t.key} onClick={() => setBio(b => ({ ...b, theme: t.key }))}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all"
                  style={{
                    border:     bio.theme === t.key ? "1px solid rgba(247,190,77,0.5)" : "1px solid rgba(255,255,255,0.07)",
                    background: bio.theme === t.key ? "rgba(247,190,77,0.08)"          : "rgba(255,255,255,0.02)",
                  }}>
                  <div className={`w-8 h-8 rounded-lg ${t.preview} border border-white/10`} />
                  <span className="text-[10px] font-semibold"
                    style={{ color: bio.theme === t.key ? "#F7BE4D" : "#64748b" }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Social platforms toggle */}
          <div className="glass rounded-2xl p-5 border border-white/6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#F7BE4D]/15 flex items-center justify-center text-[10px] text-[#F7BE4D] font-bold">4</span>
                  Connected Platforms
                </h2>
                <p className="text-[11px] text-slate-500 mt-1 ml-7">
                  {accounts.length > 0
                    ? `Show ${accounts.length} connected account${accounts.length !== 1 ? "s" : ""} on your page`
                    : "Connect accounts in Settings to show them here"}
                </p>
              </div>
              <button
                onClick={() => setBio(b => ({ ...b, show_platforms: !b.show_platforms }))}
                className="relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0"
                style={{ background: bio.show_platforms ? "#F7BE4D" : "rgba(255,255,255,0.1)" }}>
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                  style={{ left: bio.show_platforms ? "calc(100% - 22px)" : "2px" }}
                />
              </button>
            </div>
            {bio.show_platforms && accounts.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {accounts.map(acc => {
                  const m = PLATFORM_META[acc.platform]
                  if (!m) return null
                  return (
                    <span key={acc.platform}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                      style={{ background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}25` }}>
                      {m.icon} {acc.username ?? m.label}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Custom links */}
          <div className="glass rounded-2xl p-5 border border-white/6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#F7BE4D]/15 flex items-center justify-center text-[10px] text-[#F7BE4D] font-bold">5</span>
                Custom Links
              </h2>
              <button onClick={addLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background: "rgba(247,190,77,0.08)", border: "1px solid rgba(247,190,77,0.2)", color: "#F7BE4D" }}>
                <Plus className="w-3.5 h-3.5" />
                Add Link
              </button>
            </div>

            {bio.custom_links.length === 0 && (
              <div className="text-center py-6 border border-dashed border-white/[0.06] rounded-xl">
                <Link2 className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-600">No links yet — click Add Link to start</p>
              </div>
            )}

            <div className="space-y-3">
              <AnimatePresence>
                {bio.custom_links.map(link => (
                  <motion.div key={link.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-slate-700 mt-3 flex-shrink-0" />
                    {/* Emoji picker */}
                    <div className="relative flex-shrink-0">
                      <select
                        value={link.emoji}
                        onChange={e => updateLink(link.id, "emoji", e.target.value)}
                        className="w-10 h-10 rounded-xl text-center text-base bg-white/[0.04] border border-white/[0.08] cursor-pointer focus:outline-none appearance-none"
                        style={{ WebkitAppearance: "none" }}>
                        {EMOJI_PRESETS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <input
                        value={link.label}
                        onChange={e => updateLink(link.id, "label", e.target.value)}
                        placeholder="Label (e.g. My Website)"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
                      />
                      <input
                        value={link.url}
                        onChange={e => updateLink(link.id, "url", e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
                      />
                    </div>
                    <button onClick={() => removeLink(link.id)}
                      className="p-2 mt-0.5 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Right: Live Preview ── */}
        <div className="lg:sticky lg:top-6 h-fit space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400">Live Preview</p>
            {bio.username && (
              <a href={pageUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-[#F7BE4D] transition-colors">
                <ExternalLink className="w-3 h-3" />
                Open page
              </a>
            )}
          </div>
          <LivePreview bio={bio} accounts={accounts} appUrl={appUrl} />
          {bio.username && (
            <div className="glass rounded-xl px-4 py-3 border border-white/6 flex items-center gap-2">
              <span className="text-xs text-slate-500 flex-1 truncate">{pageUrl}</span>
              <button onClick={copyLink}
                className="flex items-center gap-1.5 text-[11px] font-semibold flex-shrink-0 transition-colors"
                style={{ color: copied ? "#34d399" : "#F7BE4D" }}>
                {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
