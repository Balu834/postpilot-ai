"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CalendarDays, ChevronLeft, ChevronRight, Loader2,
  Plus, Clock, LayoutGrid, List,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

const PLATFORM_META: Record<string, { icon: string; color: string }> = {
  instagram: { icon: "📸", color: "#E1306C" },
  linkedin:  { icon: "💼", color: "#0A66C2" },
  twitter:   { icon: "𝕏",  color: "#94a3b8" },
  threads:   { icon: "🧵", color: "#cbd5e1" },
  bluesky:   { icon: "🦋", color: "#0085ff" },
  pinterest: { icon: "📌", color: "#E60023" },
  facebook:  { icon: "🤝", color: "#1877F2" },
}

const STATUS_COLORS: Record<string, string> = {
  pending:   "#F7BE4D",
  published: "#34d399",
  failed:    "#f87171",
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

interface Post {
  id: string
  platform: string
  content: string
  status: string
  scheduled_time: string
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function startOfMonth(y: number, m: number) {
  return new Date(y, m, 1).getDay()
}
function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate()
}

export default function CalendarPage() {
  const today = new Date()
  const [year,   setYear]   = useState(today.getFullYear())
  const [month,  setMonth]  = useState(today.getMonth())
  const [posts,  setPosts]  = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [view,   setView]   = useState<"month" | "list">("month")

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }

    const from = new Date(year, month, 1).toISOString()
    const to   = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

    const { data } = await supabase
      .from("scheduled_posts")
      .select("id,platform,content,status,scheduled_time")
      .eq("user_id", session.user.id)
      .gte("scheduled_time", from)
      .lte("scheduled_time", to)
      .order("scheduled_time", { ascending: true })

    setPosts(data ?? [])
    setLoading(false)
  }, [year, month])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  // Group posts by day
  const postsByDay: Record<number, Post[]> = {}
  for (const p of posts) {
    const d = new Date(p.scheduled_time).getDate()
    if (!postsByDay[d]) postsByDay[d] = []
    postsByDay[d].push(p)
  }

  const firstDow  = startOfMonth(year, month)
  const totalDays = daysInMonth(year, month)
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedPosts = selectedDay ? (postsByDay[selectedDay] ?? []) : []
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-[#F7BE4D]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Content Calendar</h1>
            <p className="text-slate-500 text-xs">Visual overview of all scheduled content</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]">
            {([["month", LayoutGrid], ["list", List]] as const).map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)}
                className="p-1.5 rounded-lg transition-all"
                style={view === v
                  ? { background: "#F7BE4D", color: "#050816" }
                  : { color: "#64748b" }}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
          <Link href="/schedule">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                btn-primary">
              <Plus className="w-3.5 h-3.5" />
              New Post
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Month navigator */}
      <div className="flex items-center gap-4">
        <button onClick={prevMonth}
          className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.07]
            text-slate-400 hover:text-white hover:border-white/20 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-base font-bold text-white min-w-[160px] text-center">
          {MONTHS[month]} {year}
        </h2>
        <button onClick={nextMonth}
          className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.07]
            text-slate-400 hover:text-white hover:border-white/20 transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
        {loading && <Loader2 className="w-4 h-4 text-[#F7BE4D] animate-spin ml-2" />}
        <div className="ml-auto flex items-center gap-3">
          {[["pending","Scheduled"],["published","Published"],["failed","Failed"]].map(([s, label]) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s] }} />
              <span className="text-[10px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <div className="rounded-2xl border border-white/8 bg-white/[0.015] overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/[0.06]">
            {DAYS.map(d => (
              <div key={d} className="py-2.5 text-center text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              const dayPosts = day ? (postsByDay[day] ?? []) : []
              const selected = day === selectedDay
              const today_   = day ? isToday(day) : false

              return (
                <motion.div
                  key={idx}
                  onClick={() => day && setSelectedDay(selected ? null : day)}
                  className={`min-h-[80px] p-2 border-b border-r border-white/[0.04] transition-all cursor-pointer ${
                    day ? "hover:bg-white/[0.03]" : "opacity-0 pointer-events-none"
                  } ${selected ? "bg-[#F7BE4D]/05 border border-[#F7BE4D]/20" : ""}`}
                >
                  {day && (
                    <>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                        today_
                          ? "bg-[#F7BE4D] text-[#050816]"
                          : "text-slate-400"
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayPosts.slice(0, 2).map(p => {
                          const meta = PLATFORM_META[p.platform] ?? { icon: "📝", color: "#94a3b8" }
                          return (
                            <div key={p.id}
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium truncate"
                              style={{ background: `${STATUS_COLORS[p.status]}14`, color: STATUS_COLORS[p.status] }}>
                              <span className="text-[8px]">{meta.icon}</span>
                              <span className="truncate">{p.content.slice(0, 18)}…</span>
                            </div>
                          )
                        })}
                        {dayPosts.length > 2 && (
                          <p className="text-[9px] text-slate-600 pl-1">+{dayPosts.length - 2} more</p>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="space-y-2">
          {posts.length === 0 && !loading ? (
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] py-16 text-center">
              <CalendarDays className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-semibold mb-1">No posts this month</p>
              <p className="text-slate-600 text-sm">Schedule posts to see them here.</p>
            </div>
          ) : (
            posts.map((p, i) => {
              const meta = PLATFORM_META[p.platform] ?? { icon: "📝", color: "#94a3b8" }
              return (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-white/8 bg-white/[0.02]
                    hover:border-white/15 transition-all">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{p.content}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span className="text-[11px] text-slate-500">
                        {new Date(p.scheduled_time).toLocaleDateString()} · {formatTime(p.scheduled_time)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0"
                    style={{ background: `${STATUS_COLORS[p.status]}18`, color: STATUS_COLORS[p.status] }}>
                    {p.status}
                  </span>
                </motion.div>
              )
            })
          )}
        </div>
      )}

      {/* Day detail panel */}
      <AnimatePresence>
        {selectedDay !== null && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="rounded-2xl border border-[#F7BE4D]/20 bg-[#F7BE4D]/[0.03] p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">
                {MONTHS[month]} {selectedDay}, {year}
                <span className="ml-2 text-slate-500 font-normal text-xs">
                  {selectedPosts.length} post{selectedPosts.length !== 1 ? "s" : ""}
                </span>
              </h3>
              <button onClick={() => setSelectedDay(null)} className="text-slate-600 hover:text-slate-400 transition-colors text-xs">
                Close
              </button>
            </div>

            {selectedPosts.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-600 text-sm">No posts scheduled this day.</p>
                <Link href="/schedule" className="text-[#F7BE4D] text-xs mt-2 inline-block hover:underline">
                  Schedule a post →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedPosts.map(p => {
                  const meta = PLATFORM_META[p.platform] ?? { icon: "📝", color: "#94a3b8" }
                  return (
                    <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold" style={{ color: meta.color }}>
                            {p.platform.charAt(0).toUpperCase() + p.platform.slice(1)}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {formatTime(p.scheduled_time)}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ml-auto"
                            style={{ background: `${STATUS_COLORS[p.status]}18`, color: STATUS_COLORS[p.status] }}>
                            {p.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{p.content}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
