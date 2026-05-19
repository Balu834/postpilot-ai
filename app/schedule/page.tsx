"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarClock, Plus, Trash2, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

type Platform = "linkedin" | "twitter" | "instagram"
type Status = "pending" | "published" | "failed"

interface ScheduledPost {
  id: string
  content: string
  platform: Platform
  scheduled_time: string
  status: Status
}

const platformConfig = {
  instagram: { label: "Instagram", icon: "📸", color: "#E1306C" },
  linkedin: { label: "LinkedIn", icon: "💼", color: "#0077B5" },
  twitter: { label: "Twitter / X", icon: "𝕏", color: "#94a3b8" },
}

const statusConfig = {
  pending: { label: "Scheduled", icon: Clock, color: "#F7BE4D", bg: "bg-[#F7BE4D]/12" },
  published: { label: "Published", icon: CheckCircle2, color: "#34d399", bg: "bg-emerald-500/12" },
  failed: { label: "Failed", icon: AlertCircle, color: "#ef4444", bg: "bg-red-500/12" },
}

export default function SchedulePage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ content: "", platform: "linkedin" as Platform, scheduled_time: "" })
  const [filter, setFilter] = useState<"all" | Status>("all")

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_time", { ascending: true })

    setPosts((data as ScheduledPost[]) || [])
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!form.content.trim() || !form.scheduled_time) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("scheduled_posts")
      .insert({
        user_id: user.id,
        content: form.content,
        platform: form.platform,
        scheduled_time: new Date(form.scheduled_time).toISOString(),
        status: "pending",
      })
      .select()
      .single()

    if (!error && data) {
      setPosts([data as ScheduledPost, ...posts])
      setForm({ content: "", platform: "linkedin", scheduled_time: "" })
      setShowForm(false)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("scheduled_posts").delete().eq("id", id)
    if (!error) setPosts(posts.filter(p => p.id !== id))
  }

  const filtered = filter === "all" ? posts : posts.filter(p => p.status === filter)

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["all", "pending", "published"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                filter === f
                  ? "bg-[#F7BE4D]/12 border-[#F7BE4D]/30 text-[#F7BE4D]"
                  : "border-white/8 text-slate-400 hover:text-white hover:border-white/15"
              }`}
            >
              {f === "all" ? "All posts" : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1.5 text-[10px] opacity-60">
                {f === "all" ? posts.length : posts.filter(p => p.status === f).length}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#F7BE4D] text-[#050816] text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-[#ffd166] transition-colors glow-yellow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Schedule Post
        </button>
      </div>

      {/* New post form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl p-5 border border-[#F7BE4D]/20">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-[#F7BE4D]" />
                New Scheduled Post
              </h3>
              <div className="space-y-3">
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your post content..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#F7BE4D]/40 resize-none transition-all"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block">Platform</label>
                    <select
                      value={form.platform}
                      onChange={e => setForm({ ...form, platform: e.target.value as Platform })}
                      className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">Twitter / X</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={form.scheduled_time}
                      onChange={e => setForm({ ...form, scheduled_time: e.target.value })}
                      className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-xs text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={saving}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-[#F7BE4D] text-[#050816] px-4 py-2 rounded-lg hover:bg-[#ffd166] transition-colors disabled:opacity-60"
                  >
                    {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                    Schedule Post
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 border border-white/5 text-center">
          <CalendarClock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No posts found</p>
          <p className="text-xs text-slate-600 mt-1">Click "Schedule Post" to add your first post</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post, i) => {
            const platform = platformConfig[post.platform]
            const status = statusConfig[post.status]
            const StatusIcon = status.icon
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-xl p-4 border border-white/6 hover:border-white/10 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                    style={{ background: `${platform.color}18` }}
                  >
                    {platform.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium text-slate-300">{platform.label}</span>
                      <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${status.bg}`} style={{ color: status.color }}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2 mb-2">{post.content}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      {new Date(post.scheduled_time).toLocaleString("en-US", {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
