"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookmarkPlus, Trash2, CalendarClock, Wand2, Loader2, AlertCircle, FileEdit } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"

const PLATFORM_META: Record<string, { icon: string; color: string; label: string }> = {
  instagram: { icon: "📸", color: "#E1306C", label: "Instagram" },
  linkedin:  { icon: "💼", color: "#0A66C2", label: "LinkedIn"  },
  twitter:   { icon: "𝕏",  color: "#94a3b8", label: "Twitter"   },
  threads:   { icon: "🧵", color: "#e2e8f0", label: "Threads"   },
  bluesky:   { icon: "🦋", color: "#0085ff", label: "Bluesky"   },
  pinterest: { icon: "📌", color: "#E60023", label: "Pinterest"  },
}

interface Draft {
  id: string
  platform: string
  content: string
  topic: string | null
  created_at: string
}

function timeAgo(iso: string) {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return "just now"
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function DraftsPage() {
  const router = useRouter()
  const [drafts,   setDrafts]   = useState<Draft[]>([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error,    setError]    = useState("")

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }
    const res = await fetch("/api/drafts", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (res.ok) {
      const json = await res.json()
      setDrafts(json.drafts ?? [])
    } else {
      setError("Failed to load drafts")
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setDeleting(null); return }
    await fetch(`/api/drafts?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    setDrafts(prev => prev.filter(d => d.id !== id))
    setDeleting(null)
  }

  const handleSchedule = (draft: Draft) => {
    router.push(`/schedule?platform=${draft.platform}&content=${encodeURIComponent(draft.content)}`)
  }

  const handleUseInGenerate = (draft: Draft) => {
    if (draft.topic) router.push(`/generate?topic=${encodeURIComponent(draft.topic)}`)
    else router.push("/generate")
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center">
              <FileEdit className="w-4 h-4 text-[#F7BE4D]" />
            </div>
            <h1 className="text-xl font-bold text-white">Saved Drafts</h1>
          </div>
          <p className="text-slate-500 text-sm ml-10.5">
            Posts saved from the generator — pick up where you left off.
          </p>
        </div>
        <Link href="/generate">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
              border border-[#F7BE4D]/30 bg-[#F7BE4D]/10 text-[#F7BE4D] hover:bg-[#F7BE4D]/20 transition-all">
            <Wand2 className="w-3.5 h-3.5" />
            New Generation
          </motion.button>
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10
          border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#F7BE4D] animate-spin" />
        </div>
      ) : drafts.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] py-16 text-center">
          <BookmarkPlus className="w-10 h-10 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 font-semibold mb-1">No drafts yet</p>
          <p className="text-slate-600 text-sm mb-6">
            Use the &ldquo;Save Draft&rdquo; button on any generated post.
          </p>
          <Link href="/generate">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl inline-flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Generate a Post
            </motion.button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            {drafts.length} draft{drafts.length !== 1 ? "s" : ""} saved
          </p>
          <AnimatePresence>
            {drafts.map((draft, i) => {
              const meta = PLATFORM_META[draft.platform] ?? { icon: "📝", color: "#94a3b8", label: draft.platform }
              return (
                <motion.div key={draft.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 hover:border-white/15 transition-all"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}>
                        {meta.icon}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{meta.label}</p>
                        {draft.topic && (
                          <p className="text-[10px] text-slate-600 truncate max-w-[200px]">
                            Topic: {draft.topic}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-600 flex-shrink-0">{timeAgo(draft.created_at)}</span>
                  </div>

                  {/* Content preview */}
                  <p className="text-sm text-slate-300 leading-relaxed mb-4 line-clamp-3">
                    {draft.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleSchedule(draft)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                        border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white
                        hover:border-white/20 transition-all">
                      <CalendarClock className="w-3.5 h-3.5" />
                      Schedule
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleUseInGenerate(draft)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                        border border-[#F7BE4D]/20 bg-[#F7BE4D]/08 text-[#F7BE4D]
                        hover:bg-[#F7BE4D]/15 transition-all">
                      <Wand2 className="w-3.5 h-3.5" />
                      Regenerate
                    </motion.button>
                    <div className="flex-1" />
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(draft.id)}
                      disabled={deleting === draft.id}
                      className="p-1.5 rounded-lg text-slate-700 hover:text-red-400
                        hover:bg-red-500/10 transition-all disabled:opacity-40">
                      {deleting === draft.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
