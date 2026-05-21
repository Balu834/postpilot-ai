"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft, ChevronRight, Plus, X, CalendarDays,
  List, Clock, CheckCircle2, AlertCircle, Trash2, Loader2, Send, ImageIcon,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { analytics } from "@/lib/analytics"

// ── Types ────────────────────────────────────────────────────────
type Platform = "linkedin" | "twitter" | "instagram" | "facebook"
type Status   = "pending" | "published" | "failed"
type View     = "calendar" | "list"

interface ScheduledPost {
  id:             string
  content:        string
  platform:       Platform
  scheduled_time: string
  status:         Status
  image_url:      string | null
}

// ── Config ───────────────────────────────────────────────────────
const PLATFORM = {
  instagram: { label: "Instagram", icon: "📸", color: "#E1306C" },
  linkedin:  { label: "LinkedIn",  icon: "💼", color: "#0077B5" },
  twitter:   { label: "Twitter/X", icon: "𝕏",  color: "#94a3b8" },
  facebook:  { label: "Facebook",  icon: "f",   color: "#1877F2" },
} as const

const STATUS = {
  pending:   { label: "Scheduled", Icon: Clock,        color: "#F7BE4D" },
  published: { label: "Published", Icon: CheckCircle2, color: "#34d399" },
  failed:    { label: "Failed",    Icon: AlertCircle,  color: "#ef4444" },
} as const

const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function firstDay(y: number, m: number)    { return new Date(y, m, 1).getDay() }

/* ─── Demo schedule posts (shown when calendar is empty) ──────────── */

function getDemoSchedulePosts(): ScheduledPost[] {
  const now  = new Date()
  const day  = now.getDay()
  // Start of current week (Monday)
  const mon  = new Date(now)
  mon.setDate(now.getDate() - ((day + 6) % 7))
  mon.setHours(0, 0, 0, 0)

  const at = (daysAhead: number, hour: number) =>
    new Date(mon.getTime() + daysAhead * 86400000 + hour * 3600000).toISOString()

  return [
    {
      id: "demo-s1",
      platform: "linkedin",
      status: "published",
      scheduled_time: at(0, 9),
      content: "AI won't replace creators. Creators using AI will replace creators who don't. Here's why every founder needs an AI content stack in 2026.",
      image_url: null,
    },
    {
      id: "demo-s2",
      platform: "instagram",
      status: "published",
      scheduled_time: at(1, 14),
      content: "Most startups don't fail because of product quality. They fail because nobody notices them. AI-powered content systems are the unfair advantage. 🚀",
      image_url: null,
    },
    {
      id: "demo-s3",
      platform: "twitter",
      status: "pending",
      scheduled_time: at(2, 10),
      content: "AI content creation in 2026: • Faster workflows • Better personalization • Multi-platform generation • Automated repurposing. Creators who adapt early win.",
      image_url: null,
    },
    {
      id: "demo-s4",
      platform: "linkedin",
      status: "pending",
      scheduled_time: at(3, 9),
      content: "I tested 12 AI content tools for 30 days so you don't have to. The results were shocking. Here's my brutally honest breakdown of what actually works.",
      image_url: null,
    },
    {
      id: "demo-s5",
      platform: "instagram",
      status: "pending",
      scheduled_time: at(4, 15),
      content: "The one thing separating successful creators from struggling ones isn't talent — it's systems. Here's the content system I wish I had when I started 👇",
      image_url: null,
    },
    {
      id: "demo-s6",
      platform: "twitter",
      status: "pending",
      scheduled_time: at(7, 11),
      content: "Hot take: Consistency > creativity for building an audience. The algorithm rewards people who show up. Your average daily post beats your once-a-week masterpiece.",
      image_url: null,
    },
    {
      id: "demo-s7",
      platform: "linkedin",
      status: "pending",
      scheduled_time: at(8, 8),
      content: "3 years ago I had 200 LinkedIn followers. Today: 28K. The only thing that changed? I started treating LinkedIn like a product, not a diary.",
      image_url: null,
    },
  ]
}

// ── Add Post Modal ────────────────────────────────────────────────
function AddPostModal({
  open, onClose, initialDate, onSave,
}: {
  open: boolean
  onClose: () => void
  initialDate: string
  onSave: (post: ScheduledPost) => void
}) {
  const [form,      setForm]      = useState({ content: "", platform: "linkedin" as Platform, scheduled_time: initialDate })
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState("")
  const [imageUrl,  setImageUrl]  = useState("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => { setForm(f => ({ ...f, scheduled_time: initialDate })) }, [initialDate])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError("")
    const { data: { session } } = await supabase.auth.getSession()
    const fd = new FormData()
    fd.append("file", file)
    const res  = await fetch("/api/upload/image", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
      body: fd,
    })
    const data = await res.json()
    if (!res.ok) setError(data.error || "Image upload failed")
    else setImageUrl(data.url)
    setUploading(false)
  }

  const handleSave = async () => {
    if (!form.content.trim() || !form.scheduled_time) return
    if (form.platform === "instagram" && !imageUrl) { setError("Instagram posts require an image"); return }
    setSaving(true); setError("")
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error: err } = await supabase
      .from("scheduled_posts")
      .insert({ user_id: user.id, content: form.content, platform: form.platform, scheduled_time: new Date(form.scheduled_time).toISOString(), status: "pending", image_url: imageUrl || null })
      .select().single()

    if (err) { setError(err.message); setSaving(false); return }
    analytics.scheduleCreated(form.platform)
    onSave(data as ScheduledPost)
    setForm({ content: "", platform: "linkedin", scheduled_time: "" })
    onClose()
    setSaving(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(5,8,22,0.85)", backdropFilter: "blur(12px)" }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.93, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: "rgba(10,14,30,0.98)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-white">Schedule Post</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Add a post to your content calendar</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Platform tabs */}
              <div>
                <label className="text-xs text-slate-500 mb-2 block font-medium">Platform</label>
                <div className="flex gap-2">
                  {(Object.entries(PLATFORM) as [Platform, typeof PLATFORM[Platform]][]).map(([key, cfg]) => (
                    <button key={key} onClick={() => setForm(f => ({ ...f, platform: key }))}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: form.platform === key ? `${cfg.color}20` : "rgba(255,255,255,0.03)",
                        border:     form.platform === key ? `1px solid ${cfg.color}50` : "1px solid rgba(255,255,255,0.07)",
                        color:      form.platform === key ? cfg.color : "rgba(255,255,255,0.35)",
                      }}>
                      <span>{cfg.icon}</span>{cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="text-xs text-slate-500 mb-2 block font-medium">Post Content</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Write your post content..."
                  rows={4}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#F7BE4D]/40 resize-none transition-all"
                />
                <p className="text-[10px] text-slate-600 mt-1 text-right">{form.content.length} chars</p>
              </div>

              {/* Image upload — Instagram only */}
              {form.platform === "instagram" && (
                <div>
                  <label className="text-xs text-slate-500 mb-2 block font-medium">
                    Image <span className="text-red-400">*</span>
                    <span className="text-slate-600 ml-1 font-normal">(required for Instagram)</span>
                  </label>
                  {imageUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#E1306C]/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Post image" className="w-full h-32 object-cover" />
                      <button
                        onClick={() => setImageUrl("")}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-black transition-all">
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 w-full h-24 rounded-xl border border-dashed border-white/10 hover:border-[#E1306C]/40 cursor-pointer transition-all bg-white/[0.02] hover:bg-[#E1306C]/5">
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={handleImageUpload} disabled={uploading} />
                      {uploading ? (
                        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                      ) : (
                        <>
                          <ImageIcon className="w-5 h-5 text-slate-600" />
                          <span className="text-[11px] text-slate-500">Click to upload · JPEG, PNG, WebP · max 8 MB</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              )}

              {/* Date & Time */}
              <div>
                <label className="text-xs text-slate-500 mb-2 block font-medium">Date & Time</label>
                <input type="datetime-local" value={form.scheduled_time}
                  onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[#F7BE4D]/40 transition-all" />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button onClick={onClose}
                  className="flex-1 text-xs text-slate-400 hover:text-white py-2.5 rounded-xl hover:bg-white/[0.04] border border-white/[0.06] transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave}
                  disabled={saving || !form.content.trim() || !form.scheduled_time}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #F7BE4D, #ffd166)", color: "#050816" }}>
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Schedule Post"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Post Detail Modal ─────────────────────────────────────────────
function PostDetailInner({ post, onClose, onDelete, onStatusChange }: {
  post: ScheduledPost; onClose: () => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Status) => void
}) {
  const cfg      = PLATFORM[post.platform]
  const stCfg    = STATUS[post.status]
  const StIcon   = stCfg.Icon
  const [publishing, setPublishing] = useState(false)
  const [pubError,   setPubError]   = useState("")

  const handlePublish = async () => {
    setPublishing(true); setPubError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res  = await fetch("/api/social/publish", {
        method:  "POST",
        headers: { Authorization: `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ postId: post.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onStatusChange(post.id, "published")
      onClose()
    } catch (err: unknown) {
      setPubError(err instanceof Error ? err.message : "Publish failed")
    } finally {
      setPublishing(false)
    }
  }

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="w-full max-w-md rounded-2xl overflow-hidden"
      style={{ background: "rgba(10,14,30,0.98)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-lg">{cfg.icon}</span>
          <span className="text-sm font-bold text-white">{cfg.label}</span>
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: `${stCfg.color}18`, color: stCfg.color }}>
            <StIcon className="w-2.5 h-2.5" />
            {stCfg.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { onDelete(post.id); onClose() }}
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <Clock className="w-3.5 h-3.5" />
          {new Date(post.scheduled_time).toLocaleString("en-US", {
            weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </div>
        {pubError && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-3">{pubError}</p>
        )}
        {post.status === "pending" && (
          <button onClick={handlePublish} disabled={publishing}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`, color: "#fff", boxShadow: `0 4px 16px ${cfg.color}30` }}>
            {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {publishing ? "Publishing..." : `Publish to ${cfg.label} Now`}
          </button>
        )}
      </div>
    </motion.div>
  )
}

function PostDetail({ post, onClose, onDelete, onStatusChange }: {
  post: ScheduledPost | null; onClose: () => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Status) => void
}) {
  return (
    <AnimatePresence>
      {post && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(5,8,22,0.7)", backdropFilter: "blur(8px)" }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <PostDetailInner post={post} onClose={onClose} onDelete={onDelete} onStatusChange={onStatusChange} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function SchedulePage() {
  const today = new Date()

  const [view,       setView]       = useState<View>("calendar")
  const [posts,      setPosts]      = useState<ScheduledPost[]>([])
  const [loading,    setLoading]    = useState(true)
  const [curYear,    setCurYear]    = useState(today.getFullYear())
  const [curMonth,   setCurMonth]   = useState(today.getMonth())
  const [addOpen,    setAddOpen]    = useState(false)
  const [addDate,    setAddDate]    = useState("")
  const [detail,     setDetail]     = useState<ScheduledPost | null>(null)
  const [listFilter, setListFilter] = useState<"all" | Status>("all")

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from("scheduled_posts").select("*").eq("user_id", user.id)
      .order("scheduled_time", { ascending: true })
    setPosts((data as ScheduledPost[]) || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from("scheduled_posts").delete().eq("id", id)
    setPosts(ps => ps.filter(p => p.id !== id))
  }

  const handleStatusChange = (id: string, status: Status) => {
    setPosts(ps => ps.map(p => p.id === id ? { ...p, status } : p))
  }

  // Calendar grid
  const numDays    = daysInMonth(curYear, curMonth)
  const startDay   = firstDay(curYear, curMonth)
  const totalCells = Math.ceil((startDay + numDays) / 7) * 7

  const demoPosts = useMemo(() => getDemoSchedulePosts(), [])
  const isDemo    = !loading && posts.length === 0

  const postsByDay = useMemo(() => {
    const map: Record<string, ScheduledPost[]> = {}
    const source = isDemo ? demoPosts : posts
    source.forEach(p => {
      const key = new Date(p.scheduled_time).toLocaleDateString("en-CA")
      ;(map[key] ??= []).push(p)
    })
    return map
  }, [posts, demoPosts, isDemo])

  const prevMonth = () => curMonth === 0 ? (setCurYear(y => y - 1), setCurMonth(11)) : setCurMonth(m => m - 1)
  const nextMonth = () => curMonth === 11 ? (setCurYear(y => y + 1), setCurMonth(0)) : setCurMonth(m => m + 1)

  const openAdd = (dateKey?: string) => {
    setAddDate(dateKey ? `${dateKey}T09:00` : "")
    setAddOpen(true)
  }

  // Stats — use demo data when no real posts
  const activePosts    = isDemo ? demoPosts : posts
  const pendingCount   = activePosts.filter(p => p.status === "pending").length
  const publishedCount = activePosts.filter(p => {
    const d = new Date(p.scheduled_time)
    return p.status === "published" && d.getMonth() === curMonth && d.getFullYear() === curYear
  }).length
  const thisMonthCount = activePosts.filter(p => {
    const d = new Date(p.scheduled_time)
    return d.getMonth() === curMonth && d.getFullYear() === curYear
  }).length

  const filteredList = listFilter === "all"
    ? activePosts
    : activePosts.filter(p => p.status === listFilter)

  return (
    <>
      <AddPostModal
        open={addOpen} onClose={() => setAddOpen(false)}
        initialDate={addDate}
        onSave={post => setPosts(ps => [...ps, post])}
      />
      <PostDetail post={detail} onClose={() => setDetail(null)} onDelete={handleDelete} onStatusChange={handleStatusChange} />

      <div className="max-w-5xl space-y-5">

        {/* ── Toolbar ─── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-bold text-white w-44 text-center select-none">
              {MONTHS[curMonth]} {curYear}
            </h2>
            <button onClick={nextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => { setCurYear(today.getFullYear()); setCurMonth(today.getMonth()) }}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.15] transition-all">
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-xl p-1 border border-white/[0.06]">
              {([["calendar", CalendarDays], ["list", List]] as const).map(([v, Icon]) => (
                <button key={v} onClick={() => setView(v)}
                  className="p-1.5 rounded-lg transition-all"
                  style={{
                    background: view === v ? "rgba(247,190,77,0.15)" : "transparent",
                    color:      view === v ? "#F7BE4D" : "rgba(255,255,255,0.3)",
                  }}>
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
            <button onClick={() => openAdd()}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
              style={{ background: "linear-gradient(135deg, #F7BE4D, #ffd166)", color: "#050816", boxShadow: "0 4px 16px rgba(247,190,77,0.3)" }}>
              <Plus className="w-3.5 h-3.5" />
              Schedule Post
            </button>
          </div>
        </div>

        {/* ── Stats ─── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "This Month", value: thisMonthCount, color: "#F7BE4D" },
            { label: "Scheduled",  value: pendingCount,   color: "#818cf8" },
            { label: "Published",  value: publishedCount, color: "#34d399" },
          ].map(s => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</span>
              <span className="text-xs text-slate-500">{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Demo mode banner */}
        {isDemo && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: "rgba(247,190,77,0.05)", border: "1px solid rgba(247,190,77,0.15)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#F7BE4D] animate-pulse flex-shrink-0" />
            <p className="text-[11px] text-slate-500">
              <span className="text-[#F7BE4D] font-semibold">Sample schedule</span> — schedule your first post to replace this demo calendar.
            </p>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
          </div>
        ) : view === "calendar" ? (

          /* ── Calendar Grid ─── */
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-white/[0.06]">
              {DAYS.map(d => (
                <div key={d} className="py-3 text-center text-[11px] font-semibold text-slate-600 select-none">{d}</div>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7">
              {Array.from({ length: totalCells }).map((_, i) => {
                const dayNum = i - startDay + 1
                const isThisMonth = dayNum >= 1 && dayNum <= numDays
                const dateKey  = isThisMonth
                  ? `${curYear}-${String(curMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
                  : ""
                const isToday  = dateKey === today.toLocaleDateString("en-CA")
                const dayPosts = dateKey ? (postsByDay[dateKey] ?? []) : []
                const isLastRow  = i >= totalCells - 7
                const isLastCol  = (i + 1) % 7 === 0

                return (
                  <div key={i}
                    onClick={() => isThisMonth && openAdd(dateKey)}
                    className={`min-h-[100px] p-2 border-r border-b border-white/[0.04] relative transition-colors
                      ${isLastRow ? "border-b-0" : ""}
                      ${isLastCol ? "border-r-0" : ""}
                      ${isThisMonth ? "cursor-pointer hover:bg-white/[0.025]" : "opacity-25 pointer-events-none"}`}
                  >
                    {/* Day number */}
                    <div className="flex justify-end mb-1">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold select-none ${
                          isToday ? "text-[#050816]" : "text-slate-500"
                        }`}
                        style={isToday ? { background: "#F7BE4D", boxShadow: "0 0 12px rgba(247,190,77,0.5)" } : {}}
                      >
                        {isThisMonth ? dayNum : ""}
                      </span>
                    </div>

                    {/* Post chips */}
                    <div className="space-y-0.5">
                      {dayPosts.slice(0, 3).map(post => (
                        <div key={post.id}
                          onClick={e => { e.stopPropagation(); setDetail(post) }}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate cursor-pointer hover:opacity-75 transition-opacity"
                          style={{
                            background: `${PLATFORM[post.platform].color}20`,
                            color:       PLATFORM[post.platform].color,
                            border:      `1px solid ${PLATFORM[post.platform].color}30`,
                          }}>
                          <span className="text-[9px] flex-shrink-0">{PLATFORM[post.platform].icon}</span>
                          <span className="truncate leading-none">{post.content.slice(0, 18)}</span>
                        </div>
                      ))}
                      {dayPosts.length > 3 && (
                        <p className="text-[10px] text-slate-600 px-1">+{dayPosts.length - 3} more</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

        ) : (

          /* ── List View ─── */
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {(["all", "pending", "published", "failed"] as const).map(f => (
                <button key={f} onClick={() => setListFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    listFilter === f
                      ? "bg-[#F7BE4D]/12 border-[#F7BE4D]/30 text-[#F7BE4D]"
                      : "border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.15]"
                  }`}>
                  {f === "all" ? "All posts" : f.charAt(0).toUpperCase() + f.slice(1)}
                  <span className="ml-1.5 text-[10px] opacity-60">
                    {f === "all" ? posts.length : posts.filter(p => p.status === f).length}
                  </span>
                </button>
              ))}
            </div>

            {filteredList.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <CalendarDays className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-1">No posts match this filter</p>
                <p className="text-xs text-slate-600">Try "All posts" or click "Schedule Post" to add content</p>
              </div>
            ) : (
              filteredList.map((post, i) => {
                const cfg    = PLATFORM[post.platform]
                const st     = STATUS[post.status]
                const StIcon = st.Icon
                const isPostDemo = post.id.startsWith("demo-")
                return (
                  <motion.div key={post.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => !isPostDemo && setDetail(post)}
                    className={`glass-card rounded-xl p-4 border border-white/[0.06] hover:border-white/[0.10] transition-colors group ${isPostDemo ? "cursor-default" : "cursor-pointer"}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                        style={{ background: `${cfg.color}18` }}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-300">{cfg.label}</span>
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: `${st.color}18`, color: st.color }}>
                            <StIcon className="w-2.5 h-2.5" />
                            {st.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2 mb-1.5">{post.content}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          {new Date(post.scheduled_time).toLocaleString("en-US", {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      </div>
                      {!isPostDemo && (
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(post.id) }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        )}
      </div>
    </>
  )
}
