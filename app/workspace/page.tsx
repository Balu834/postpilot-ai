"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  FolderOpen, Plus, Trash2, Copy, CheckCheck, ArrowRight,
  Wand2, Repeat2, CalendarClock, Sparkles, X, ChevronDown,
  ChevronRight, Edit3, Check,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

// ── Types ─────────────────────────────────────────────────────────
interface Campaign {
  id: string
  name: string
  color: string
  createdAt: string
  generationIds: string[]
}

interface Generation {
  id: string
  prompt: string
  created_at: string
  output: Record<string, string | string[]>
}

const CAMPAIGN_COLORS = [
  "#F7BE4D", "#818cf8", "#34d399", "#f472b6",
  "#0077B5", "#E1306C", "#94a3b8",
]

const PLATFORM_LABELS: Record<string, { icon: string; color: string; label: string }> = {
  linkedin:  { icon: "💼", color: "#0077B5", label: "LinkedIn"    },
  twitter:   { icon: "𝕏",  color: "#94a3b8", label: "Twitter / X" },
  instagram: { icon: "📸", color: "#E1306C", label: "Instagram"   },
  hashtags:  { icon: "#️⃣", color: "#F7BE4D", label: "Hashtags"    },
  carousel:  { icon: "🎨", color: "#818cf8", label: "Carousel"    },
  carousels: { icon: "🎨", color: "#818cf8", label: "Carousels"   },
  reels:     { icon: "🎬", color: "#f472b6", label: "Reels"       },
  cta:       { icon: "📣", color: "#34d399", label: "CTAs"        },
}

const DEMO_GENERATIONS: Generation[] = [
  {
    id: "demo-1",
    prompt: "How AI is changing content marketing in 2025",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    output: {
      linkedin: [
        "AI isn't replacing content creators — it's giving them superpowers. Here's how forward-thinking marketers are using AI to create 10x more content without sacrificing quality. The key? Using AI for ideation and structure, humans for voice and strategy. 🚀",
        "The content teams that will win in 2025 are the ones treating AI as a creative partner, not a replacement. 3 things they do differently: 1) They use AI for first drafts, not final copy. 2) They train AI on their brand voice. 3) They measure engagement, not just output.",
      ],
      twitter: [
        "Hot take: The best content creators in 2025 won't be the most creative — they'll be the best AI prompt engineers. The skill is shifting. Are you adapting?",
        "AI content tools in 2025: ✅ First drafts ✅ Ideation ✅ Repurposing ❌ Brand voice ❌ Emotional nuance ❌ Original research Know what to delegate.",
      ],
      instagram: [
        "POV: You just turned one blog post into 20 pieces of content in under 10 minutes 🤯 This is the power of AI-assisted content marketing. Not replacing creativity — amplifying it. What content workflow are you automating right now?",
      ],
      hashtags: ["ContentMarketing", "AIMarketing", "ContentStrategy", "DigitalMarketing", "SocialMedia"],
    },
  },
  {
    id: "demo-2",
    prompt: "Productivity tips for remote workers",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    output: {
      linkedin: [
        "After 3 years of remote work, the #1 productivity hack I've found isn't a tool or routine — it's ruthlessly protecting your deep work hours. Block 2-4 hours every morning. No meetings. No Slack. Just focused execution. Your output will triple.",
      ],
      twitter: [
        "Remote work productivity hack nobody talks about: End your workday with a 5-minute 'shutdown ritual.' Write tomorrow's top 3 tasks. Close all tabs. Say 'shutdown complete.' Your brain actually stops working overtime.",
        "The remote worker's paradox: You're always at work, so you're never really at work. Fix this by having a physical 'start ritual' (coffee + 5 min planning) and 'end ritual' (close laptop, go outside). Boundaries are the new productivity.",
      ],
      hashtags: ["RemoteWork", "Productivity", "WorkFromHome", "DeepWork", "FutureOfWork"],
    },
  },
]

// ── Utility ───────────────────────────────────────────────────────
const LS_KEY = "postpilot_campaigns"

function loadCampaigns(): Campaign[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]")
  } catch { return [] }
}

function saveCampaigns(campaigns: Campaign[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(campaigns))
}

function randomColor() {
  return CAMPAIGN_COLORS[Math.floor(Math.random() * CAMPAIGN_COLORS.length)]
}

// ── CopyBtn ───────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className={`p-1.5 rounded-lg transition-all ${
        copied ? "text-emerald-400 bg-emerald-500/10" : "text-slate-600 hover:text-slate-300 hover:bg-white/8"
      }`}>
      {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

// ── GenerationCard ────────────────────────────────────────────────
function GenerationCard({
  gen, campaignColor, campaigns, onAddToCampaign,
}: {
  gen: Generation
  campaignColor?: string
  campaigns: Campaign[]
  onAddToCampaign: (genId: string, campaignId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showCampaignPicker, setShowCampaignPicker] = useState(false)

  const platforms = Object.keys(gen.output).filter(k => k !== "hashtags" && k !== "carousel")
  const date = new Date(gen.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })

  return (
    <motion.div
      layout
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${campaignColor ?? "#F7BE4D"}15`, border: `1px solid ${campaignColor ?? "#F7BE4D"}20` }}>
          <Sparkles className="w-4 h-4" style={{ color: campaignColor ?? "#F7BE4D" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{gen.prompt}</p>
          <p className="text-[11px] text-slate-600 mt-0.5">{date} · {platforms.length} platforms</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Platform icons */}
          <div className="hidden sm:flex items-center gap-1">
            {platforms.slice(0, 4).map(p => (
              <span key={p} className="text-xs">{PLATFORM_LABELS[p]?.icon ?? "📝"}</span>
            ))}
          </div>
          {/* Add to campaign */}
          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setShowCampaignPicker(!showCampaignPicker) }}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/8 transition-all"
              title="Add to campaign">
              <FolderOpen className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {showCampaignPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  onClick={e => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1 w-48 glass-card rounded-xl border
                    border-white/10 shadow-2xl z-20 overflow-hidden py-1">
                  <p className="text-[10px] text-slate-600 px-3 py-1.5 font-medium uppercase tracking-wide">
                    Add to campaign
                  </p>
                  {campaigns.length === 0 ? (
                    <p className="text-xs text-slate-500 px-3 py-2">No campaigns yet</p>
                  ) : (
                    campaigns.map(c => (
                      <button key={c.id}
                        onClick={() => { onAddToCampaign(gen.id, c.id); setShowCampaignPicker(false) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300
                          hover:bg-white/5 transition-colors text-left">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: c.color }} />
                        {c.name}
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-600 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/[0.06]"
          >
            <div className="p-4 space-y-4">
              {platforms.map(platform => {
                const pl = PLATFORM_LABELS[platform]
                const items = gen.output[platform]
                if (!pl || !items) return null
                const list = Array.isArray(items) ? items : [items]

                return (
                  <div key={platform}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{pl.icon}</span>
                      <span className="text-xs font-semibold" style={{ color: pl.color }}>{pl.label}</span>
                    </div>
                    <div className="space-y-2">
                      {list.map((text, i) => (
                        <div key={i}
                          className="flex items-start gap-2 p-3 rounded-xl text-xs text-slate-300
                            leading-relaxed group"
                          style={{ background: `${pl.color}06`, border: `1px solid ${pl.color}15` }}>
                          <span className="flex-1">{text}</span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <CopyBtn text={text} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function WorkspacePage() {
  const router = useRouter()
  const [campaigns, setCampaigns]         = useState<Campaign[]>([])
  const [generations, setGenerations]     = useState<Generation[]>([])
  const [loadingGens, setLoadingGens]     = useState(true)
  const [activeCampaign, setActiveCampaign] = useState<string | null>(null)
  const [showNewModal, setShowNewModal]   = useState(false)
  const [newCampaignName, setNewCampaignName] = useState("")
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [editingName, setEditingName]     = useState("")

  // Load campaigns from localStorage
  useEffect(() => { setCampaigns(loadCampaigns()) }, [])

  // Load generations from Supabase
  const fetchGenerations = useCallback(async () => {
    setLoadingGens(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoadingGens(false); return }

    const { data } = await supabase
      .from("generations")
      .select("id, prompt, created_at, output")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30)

    if (data && data.length > 0) {
      setGenerations(data.map(g => ({
        ...g,
        output: (() => { try { return JSON.parse(g.output) } catch { return {} } })(),
      })))
    } else {
      // Show demo data for empty state
      setGenerations(DEMO_GENERATIONS)
    }
    setLoadingGens(false)
  }, [])

  useEffect(() => { fetchGenerations() }, [fetchGenerations])

  const createCampaign = () => {
    if (!newCampaignName.trim()) return
    const c: Campaign = {
      id: crypto.randomUUID(),
      name: newCampaignName.trim(),
      color: randomColor(),
      createdAt: new Date().toISOString(),
      generationIds: [],
    }
    const updated = [c, ...campaigns]
    setCampaigns(updated)
    saveCampaigns(updated)
    setNewCampaignName("")
    setShowNewModal(false)
    setActiveCampaign(c.id)
  }

  const deleteCampaign = (id: string) => {
    const updated = campaigns.filter(c => c.id !== id)
    setCampaigns(updated)
    saveCampaigns(updated)
    if (activeCampaign === id) setActiveCampaign(null)
  }

  const renameCampaign = (id: string) => {
    const updated = campaigns.map(c => c.id === id ? { ...c, name: editingName } : c)
    setCampaigns(updated)
    saveCampaigns(updated)
    setEditingId(null)
  }

  const addToCampaign = (genId: string, campaignId: string) => {
    const updated = campaigns.map(c =>
      c.id === campaignId && !c.generationIds.includes(genId)
        ? { ...c, generationIds: [genId, ...c.generationIds] }
        : c
    )
    setCampaigns(updated)
    saveCampaigns(updated)
  }

  const currentCampaign = campaigns.find(c => c.id === activeCampaign)
  const visibleGenerations = activeCampaign
    ? generations.filter(g => currentCampaign?.generationIds.includes(g.id))
    : generations

  return (
    <div className="max-w-6xl space-y-5">

      {/* Ambient glow */}
      <div className="fixed top-0 left-60 right-0 h-screen pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px]"
          style={{ background: "radial-gradient(ellipse at top, rgba(52,211,153,0.05) 0%, transparent 55%)" }} />
      </div>

      {/* ── Page header ───────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-hero rounded-2xl p-6 relative overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-25 pointer-events-none rounded-2xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25
              flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Content Workspace</h1>
              <p className="text-[11px] text-slate-500">
                Organize generations into campaigns · {generations.length} generations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/generate")}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border
                border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all">
              <Wand2 className="w-3.5 h-3.5" />
              Generate
            </button>
            <button onClick={() => setShowNewModal(true)}
              className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2">
              <Plus className="w-3.5 h-3.5" />
              New Campaign
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Main layout ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* Campaign sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-white/[0.06]">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Campaigns
              </p>
            </div>

            <div className="p-2">
              {/* All content */}
              <button
                onClick={() => setActiveCampaign(null)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                  text-sm transition-all ${
                  activeCampaign === null
                    ? "bg-white/8 text-white"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/4"
                }`}>
                <Sparkles className="w-3.5 h-3.5 text-[#F7BE4D]" />
                <span className="flex-1 text-left text-xs font-medium">All Content</span>
                <span className="text-[10px] text-slate-600">{generations.length}</span>
              </button>

              {/* Campaign list */}
              {campaigns.map(c => (
                <div key={c.id}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all
                    cursor-pointer group ${
                    activeCampaign === c.id
                      ? "bg-white/8"
                      : "hover:bg-white/4"
                  }`}
                  onClick={() => setActiveCampaign(c.id)}>
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: c.color }} />

                  {editingId === c.id ? (
                    <input
                      autoFocus
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") renameCampaign(c.id); if (e.key === "Escape") setEditingId(null) }}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 bg-transparent text-xs text-white outline-none border-b border-white/20"
                    />
                  ) : (
                    <span className={`flex-1 text-xs font-medium ${
                      activeCampaign === c.id ? "text-white" : "text-slate-400"
                    }`}>
                      {c.name}
                    </span>
                  )}

                  <span className="text-[10px] text-slate-600">
                    {c.generationIds.length}
                  </span>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                    {editingId === c.id ? (
                      <button onClick={e => { e.stopPropagation(); renameCampaign(c.id) }}
                        className="p-0.5 text-emerald-400">
                        <Check className="w-3 h-3" />
                      </button>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); setEditingId(c.id); setEditingName(c.name) }}
                        className="p-0.5 text-slate-600 hover:text-slate-300 transition-colors">
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                    <button onClick={e => { e.stopPropagation(); deleteCampaign(c.id) }}
                      className="p-0.5 text-slate-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {campaigns.length === 0 && (
                <p className="text-[11px] text-slate-700 px-3 py-2 text-center">
                  No campaigns yet.<br />
                  <button onClick={() => setShowNewModal(true)}
                    className="text-[#F7BE4D] hover:underline mt-1">
                    Create one →
                  </button>
                </p>
              )}
            </div>

            <div className="px-3 pb-3">
              <button onClick={() => setShowNewModal(true)}
                className="w-full flex items-center justify-center gap-1.5 text-[11px]
                  text-slate-500 hover:text-white px-3 py-2 rounded-xl border border-dashed
                  border-white/8 hover:border-white/15 transition-all">
                <Plus className="w-3.5 h-3.5" />
                New Campaign
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="glass-card rounded-2xl p-4 mt-4 space-y-2">
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide mb-3">
              Quick Actions
            </p>
            {[
              { icon: Wand2,    label: "Generate Content",  href: "/generate",   color: "#F7BE4D" },
              { icon: Repeat2,  label: "Blog → 24 Posts",   href: "/repurpose",  color: "#818cf8" },
              { icon: CalendarClock, label: "Schedule Posts", href: "/schedule", color: "#34d399" },
            ].map(a => (
              <button key={a.href}
                onClick={() => router.push(a.href)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                  text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all text-left">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${a.color}15` }}>
                  <a.icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                </div>
                {a.label}
                <ChevronRight className="w-3 h-3 text-slate-700 ml-auto" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Generation list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-3"
        >
          {/* List header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">
                {currentCampaign ? currentCampaign.name : "All Content"}
              </h2>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {visibleGenerations.length} generation{visibleGenerations.length !== 1 ? "s" : ""}
                {activeCampaign && currentCampaign && !currentCampaign.generationIds.length &&
                  " · Add content by clicking 📁 on any generation below"}
              </p>
            </div>
          </div>

          {/* Generations */}
          {loadingGens ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-4 flex gap-3">
                  <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 rounded w-3/4" />
                    <div className="skeleton h-2.5 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleGenerations.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {visibleGenerations.map((gen, i) => (
                  <motion.div key={gen.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: i * 0.04 }}>
                    <GenerationCard
                      gen={gen}
                      campaignColor={currentCampaign?.color}
                      campaigns={campaigns}
                      onAddToCampaign={addToCampaign}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : activeCampaign ? (
            <div className="glass-card rounded-2xl p-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <FolderOpen className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-sm text-slate-500 mb-1">Campaign is empty</p>
              <p className="text-xs text-slate-600 mb-4">
                Click the folder icon on any generation to add it here
              </p>
              <button onClick={() => setActiveCampaign(null)}
                className="text-xs text-[#F7BE4D] hover:text-[#ffd166] transition-colors">
                View all content →
              </button>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20
                flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-[#F7BE4D]" />
              </div>
              <p className="text-sm text-slate-500 mb-1">No content yet</p>
              <p className="text-xs text-slate-600 mb-4">
                Generate your first AI content to see it here
              </p>
              <button onClick={() => router.push("/generate")}
                className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5 mx-auto">
                <Wand2 className="w-3.5 h-3.5" />
                Generate Content
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── New campaign modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {showNewModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowNewModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                glass-card rounded-2xl p-6 w-full max-w-sm border border-white/12 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-white">New Campaign</h3>
                <button onClick={() => setShowNewModal(false)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/8 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                autoFocus
                value={newCampaignName}
                onChange={e => setNewCampaignName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") createCampaign() }}
                placeholder="e.g. Q2 Launch, Weekly Content, Product Promo..."
                className="input-premium w-full px-4 py-3 text-sm mb-4"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 text-sm rounded-xl border border-white/10
                    text-slate-400 hover:text-white hover:border-white/20 transition-all">
                  Cancel
                </button>
                <button
                  onClick={createCampaign}
                  disabled={!newCampaignName.trim()}
                  className="flex-1 btn-primary py-2.5 text-sm">
                  Create Campaign
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

