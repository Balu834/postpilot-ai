"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap, Loader2, Plus, Trash2, CalendarCheck, ChevronDown,
  ChevronUp, ArrowRight, CheckCircle2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const NICHES = [
  { key: "business",  label: "Business",      emoji: "💼" },
  { key: "tech",      label: "Tech / SaaS",   emoji: "⚡" },
  { key: "personal",  label: "Personal Brand", emoji: "🌟" },
  { key: "fitness",   label: "Fitness",        emoji: "💪" },
  { key: "food",      label: "Food",           emoji: "🍜" },
  { key: "travel",    label: "Travel",         emoji: "✈️" },
  { key: "education", label: "Education",      emoji: "📚" },
  { key: "ecommerce", label: "E-commerce",     emoji: "🛒" },
]

const PLATFORMS = [
  { key: "linkedin",  label: "LinkedIn",    color: "#0077B5" },
  { key: "instagram", label: "Instagram",   color: "#E1306C" },
  { key: "twitter",   label: "Twitter / X", color: "#94a3b8" },
  { key: "threads",   label: "Threads",     color: "#e2e8f0" },
  { key: "facebook",  label: "Facebook",    color: "#1877F2" },
]

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "#0077B5", instagram: "#E1306C", twitter: "#94a3b8",
  threads: "#e2e8f0", facebook: "#1877F2", bluesky: "#0085ff",
}

interface CampaignPost {
  week: number
  day: number
  platform: string
  topic: string
  content: string
  format: string
  goal_alignment: string
  scheduled_time?: string
}

interface Campaign {
  id: string
  name: string
  goal: string
  niche: string
  platforms: string[]
  weeks: number
  posts: CampaignPost[]
  status: string
  created_at: string
}

function timeAgo(iso: string) {
  const diff  = Date.now() - new Date(iso).getTime()
  const days  = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  if (days > 0)  return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return "just now"
}

export default function CampaignPage() {
  const router = useRouter()
  const [campaigns,   setCampaigns]   = useState<Campaign[]>([])
  const [loading,     setLoading]     = useState(true)
  const [generating,  setGenerating]  = useState(false)
  const [scheduling,  setScheduling]  = useState<string | null>(null)
  const [expanded,    setExpanded]    = useState<string | null>(null)
  const [strategy,    setStrategy]    = useState<Record<string, string>>({})
  const [error,       setError]       = useState("")
  const [success,     setSuccess]     = useState("")

  // Form
  const [goal,       setGoal]       = useState("")
  const [niche,      setNiche]      = useState("business")
  const [platforms,  setPlatforms]  = useState<string[]>(["linkedin", "instagram"])
  const [weeks,      setWeeks]      = useState(4)
  const [showForm,   setShowForm]   = useState(false)

  const togglePlatform = (key: string) =>
    setPlatforms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key])

  const loadCampaigns = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }
    const res = await fetch("/api/campaign", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (res.ok) {
      const data = await res.json()
      setCampaigns(data.campaigns ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadCampaigns() }, [loadCampaigns])

  const handleGenerate = async () => {
    if (!goal.trim() || platforms.length === 0) return
    setGenerating(true)
    setError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/campaign", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ goal, niche, platforms, weeks }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate")
      setCampaigns(prev => [data.campaign, ...prev])
      setStrategy(prev => ({ ...prev, [data.campaign.id]: data.strategy }))
      setExpanded(data.campaign.id)
      setGoal("")
      setShowForm(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed")
    } finally {
      setGenerating(false)
    }
  }

  const handleScheduleAll = async (campaignId: string) => {
    setScheduling(campaignId)
    setError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/campaign", {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ campaignId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to schedule")
      setSuccess(`${data.scheduled} posts scheduled!`)
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: "scheduled" } : c))
      setTimeout(() => setSuccess(""), 4000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Scheduling failed")
    } finally {
      setScheduling(null)
    }
  }

  const handleDelete = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch(`/api/campaign?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    })
    setCampaigns(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#818cf8]/10 border border-[#818cf8]/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#818cf8]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Campaign Planner</h1>
            <p className="text-slate-500 text-xs">Goal-driven multi-week content campaigns</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold
            text-[#050816] transition-all"
          style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa)" }}>
          <Plus className="w-3.5 h-3.5" />
          New Campaign
        </motion.button>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10
              border border-red-500/20 rounded-xl px-4 py-3">
            <span className="w-4 h-4 flex-shrink-0">⚠</span>{error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10
              border border-emerald-500/20 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />{success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden"
          >
            <div className="rounded-2xl border border-[#818cf8]/25 bg-[#818cf8]/[0.04] p-6 space-y-5">
              <p className="text-[11px] font-semibold text-[#818cf8]/70 uppercase tracking-widest">
                Campaign Goal
              </p>

              <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="e.g. Grow LinkedIn following from 500 to 2000 in 4 weeks by showcasing thought leadership in fintech..."
                rows={3}
                className="input-premium w-full text-sm px-4 py-3 rounded-xl resize-none"
              />

              {/* Niche */}
              <div>
                <p className="text-[11px] text-slate-500 mb-2">Niche</p>
                <div className="flex flex-wrap gap-2">
                  {NICHES.map(n => (
                    <button key={n.key} onClick={() => setNiche(n.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        niche === n.key
                          ? "bg-[#818cf8]/15 border-[#818cf8]/30 text-[#818cf8]"
                          : "border-white/8 text-slate-500 hover:text-slate-300"
                      }`}>
                      <span>{n.emoji}</span>{n.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div>
                <p className="text-[11px] text-slate-500 mb-2">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p.key} onClick={() => togglePlatform(p.key)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                      style={platforms.includes(p.key)
                        ? { background: `${p.color}18`, color: p.color, borderColor: `${p.color}50` }
                        : { color: "#64748b", borderColor: "rgba(255,255,255,0.08)" }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weeks */}
              <div className="flex items-center gap-4">
                <p className="text-[11px] text-slate-500">Campaign length</p>
                <div className="flex items-center gap-2 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]">
                  {[2, 4, 6, 8].map(w => (
                    <button key={w} onClick={() => setWeeks(w)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={weeks === w
                        ? { background: "rgba(129,140,248,0.2)", color: "#818cf8" }
                        : { color: "#64748b" }}>
                      {w} wks
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={handleGenerate}
                disabled={generating || !goal.trim() || platforms.length === 0}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center
                  gap-2 disabled:opacity-40 transition-all text-white"
                style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa)" }}>
                {generating
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Generating campaign…</>
                  : <><Zap className="w-4 h-4" />Generate {weeks}-Week Campaign</>}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaigns list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#818cf8] animate-spin" />
        </div>
      ) : campaigns.length === 0 && !showForm ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#818cf8]/20 bg-[#818cf8]/[0.04] p-10 text-center"
        >
          <Zap className="w-10 h-10 text-[#818cf8] mx-auto mb-4" />
          <h2 className="text-base font-bold text-white mb-2">No campaigns yet</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
            Tell the AI your goal and it will plan a full content campaign with ready-to-post content.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary px-6 py-2.5 text-sm font-semibold">
            Create First Campaign
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign, i) => {
            const isExpanded = expanded === campaign.id
            const postsByWeek: Record<number, CampaignPost[]> = {}
            for (const p of campaign.posts) {
              postsByWeek[p.week] = [...(postsByWeek[p.week] ?? []), p]
            }

            return (
              <motion.div key={campaign.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">

                {/* Campaign header */}
                <div className="flex items-center gap-3 p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : campaign.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-white truncate">{campaign.name}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        campaign.status === "scheduled"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                          : "bg-white/5 text-slate-500 border border-white/10"
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{campaign.goal}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-600">{campaign.weeks}wks · {campaign.posts.length} posts</span>
                      <span className="text-[10px] text-slate-600">·</span>
                      <span className="text-[10px] text-slate-600">{timeAgo(campaign.created_at)}</span>
                      {campaign.platforms?.map(p => (
                        <span key={p} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize"
                          style={{
                            background: `${PLATFORM_COLORS[p] ?? "#94a3b8"}15`,
                            color: PLATFORM_COLORS[p] ?? "#94a3b8",
                          }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {campaign.status !== "scheduled" && (
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={e => { e.stopPropagation(); handleScheduleAll(campaign.id) }}
                        disabled={scheduling === campaign.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                          text-white disabled:opacity-40 transition-all"
                        style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa)" }}>
                        {scheduling === campaign.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <><CalendarCheck className="w-3.5 h-3.5" />Schedule All</>}
                      </motion.button>
                    )}
                    {campaign.status === "scheduled" && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                        bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />Scheduled
                      </div>
                    )}
                    <button onClick={e => { e.stopPropagation(); handleDelete(campaign.id) }}
                      className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-slate-600" />
                      : <ChevronDown className="w-4 h-4 text-slate-600" />}
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden border-t border-white/[0.06]">
                      <div className="p-5 space-y-5">
                        {strategy[campaign.id] && (
                          <div className="rounded-xl bg-[#818cf8]/[0.06] border border-[#818cf8]/20 px-4 py-3">
                            <p className="text-[11px] font-semibold text-[#818cf8]/70 uppercase tracking-widest mb-1">
                              Strategy
                            </p>
                            <p className="text-sm text-slate-300 leading-relaxed">{strategy[campaign.id]}</p>
                          </div>
                        )}

                        {Object.entries(postsByWeek)
                          .sort(([a], [b]) => Number(a) - Number(b))
                          .map(([week, posts]) => (
                            <div key={week}>
                              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                                Week {week}
                              </p>
                              <div className="space-y-2">
                                {posts.map((post, j) => {
                                  const color = PLATFORM_COLORS[post.platform] ?? "#94a3b8"
                                  return (
                                    <div key={j} className="flex items-start gap-3 p-3 rounded-xl
                                      border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                                      <div className="w-5 h-5 rounded-md flex-shrink-0 flex items-center
                                        justify-center text-[9px] font-bold mt-0.5"
                                        style={{ background: `${color}20`, color }}>
                                        {post.platform.slice(0, 2).toUpperCase()}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="text-xs font-semibold text-white">{post.topic}</p>
                                          <span className="text-[9px] text-slate-600">{post.format}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                                          {post.content}
                                        </p>
                                        <p className="text-[10px] text-slate-700 mt-1">{post.goal_alignment}</p>
                                      </div>
                                      <button
                                        onClick={() => {
                                          router.push(`/generate?topic=${encodeURIComponent(post.topic)}`)
                                        }}
                                        className="text-slate-700 hover:text-[#818cf8] transition-colors flex-shrink-0 mt-0.5">
                                        <ArrowRight className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
