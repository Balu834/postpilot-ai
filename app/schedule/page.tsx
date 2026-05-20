"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft, ChevronRight, Plus, X, CalendarDays,
  List, Clock, CheckCircle2, AlertCircle, Trash2, Loader2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

// ── Types ────────────────────────────────────────────────────────
type Platform = "linkedin" | "twitter" | "instagram"
type Status   = "pending" | "published" | "failed"
type View     = "calendar" | "list"

interface ScheduledPost {
  id:             string
  content:        string
  platform:       Platform
  scheduled_time: string
  status:         Status
}

// ── Config ───────────────────────────────────────────────────────
const PLATFORM = {
  instagram: { label: "Instagram", icon: "📸", color: "#E1306C" },
  linkedin:  { label: "LinkedIn",  icon: "💼", color: "#0077B5" },
  twitter:   { label: "Twitter/X", icon: "𝕏",  color: "#94a3b8" },
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

// ── Add Post Modal ────────────────────────────────────────────────
function AddPostModal({
  open, onClose, initialDate, onSave,
}: {
  open: boolean
  onClose: () => void
  initialDate: string
  onSave: (post: ScheduledPost) => void
}) {
  const [form,   setForm]   = useState({ content: "", platform: "linkedin" as Platform, scheduled_time: initialDate })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState("")

  useEffect(() => { setForm(f => ({ ...f, scheduled_time: initialDate })) }, [initialDate])

  const handleSave = async () => {
    if (!form.content.trim() || !form.scheduled_time) return
    setSaving(true); setError("")
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error: err } = await supabase
      .from("scheduled_posts")
      .insert({ user_id: user.id, content: form.content, platform: form.platform, scheduled_time: new Date(form.scheduled_time).toISOString(), status: "pending" })
      .select().single()

    if (err) { setError(err.message); setSaving(false); return }
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
function PostDetailInner({ post, onClose, onDelete }: {
  post: ScheduledPost; onClose: () => void; onDelete: (id: string) => void
}) {
  const cfg    = PLATFORM[post.platform]
  const stCfg  = STATUS[post.status]
  const StIcon = stCfg.Icon
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
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          {new Date(post.scheduled_time).toLocaleString("en-US", {
            weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </div>
      </div>
    </motion.div>
  )
}

function PostDetail({ post, onClose, onDelete }: {
  post: ScheduledPost | null; onClose: () => void; onDelete: (id: string) => void
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
          <PostDetailInner post={post} onClose={onClose} onDelete={onDelete} />
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

  // Calendar grid
  const numDays    = daysInMonth(curYear, curMonth)
  const startDay   = firstDay(curYear, curMonth)
  const totalCells = Math.ceil((startDay + numDays) / 7) * 7

  const postsByDay = useMemo(() => {
    const map: Record<string, ScheduledPost[]> = {}
    posts.forEach(p => {
      const key = new Date(p.scheduled_time).toLocaleDateString("en-CA")
      ;(map[key] ??= []).push(p)
    })
    return map
  }, [posts])

  const prevMonth = () => curMonth === 0 ? (setCurYear(y => y - 1), setCurMonth(11)) : setCurMonth(m => m - 1)
  const nextMonth = () => curMonth === 11 ? (setCurYear(y => y + 1), setCurMonth(0)) : setCurMonth(m => m + 1)

  const openAdd = (dateKey?: string) => {
    setAddDate(dateKey ? `${dateKey}T09:00` : "")
    setAddOpen(true)
  }

  // Stats
  const pendingCount   = posts.filter(p => p.status === "pending").length
  const publishedCount = posts.filter(p => {
    const d = new Date(p.scheduled_time)
    return p.status === "published" && d.getMonth() === curMonth && d.getFullYear() === curYear
  }).length
  const thisMonthCount = posts.filter(p => {
    const d = new Date(p.scheduled_time)
    return d.getMonth() === curMonth && d.getFullYear() === curYear
  }).length

  const filteredList = listFilter === "all" ? posts : posts.filter(p => p.status === listFilter)

  return (
    <>
      <AddPostModal
        open={addOpen} onClose={() => setAddOpen(false)}
        initialDate={addDate}
        onSave={post => setPosts(ps => [...ps, post])}
      />
      <PostDetail post={detail} onClose={() => setDetail(null)} onDelete={handleDelete} />

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
                <p className="text-sm text-slate-500 mb-1">No posts found</p>
                <p className="text-xs text-slate-600">Click "Schedule Post" to add your first post</p>
              </div>
            ) : (
              filteredList.map((post, i) => {
                const cfg    = PLATFORM[post.platform]
                const st     = STATUS[post.status]
                const StIcon = st.Icon
                return (
                  <motion.div key={post.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setDetail(post)}
                    className="glass-card rounded-xl p-4 border border-white/[0.06] hover:border-white/[0.10] transition-colors group cursor-pointer">
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
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(post.id) }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
