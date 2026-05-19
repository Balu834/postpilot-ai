"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  History, Copy, Trash2, Repeat2, CheckCheck,
  Sparkles, Clock, Hash, ChevronDown, ChevronUp,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Generation {
  id: string
  prompt: string
  platform: string
  output: string
  created_at: string
}

interface ParsedOutput {
  instagram?: string
  linkedin?: string
  twitter?: string
  hashtags?: string[]
}

const platformConfig = [
  { key: "instagram" as const, label: "Instagram", icon: "📸", color: "#E1306C" },
  { key: "linkedin" as const, label: "LinkedIn", icon: "💼", color: "#0077B5" },
  { key: "twitter" as const, label: "Twitter / X", icon: "𝕏", color: "#94a3b8" },
]

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function GenerationCard({ gen, onDelete, onToast }: {
  gen: Generation
  onDelete: (id: string) => void
  onToast: (msg: string) => void
}) {
  const router = useRouter()
  const [activePlatform, setActivePlatform] = useState<"instagram" | "linkedin" | "twitter">("instagram")
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

  let parsed: ParsedOutput = {}
  try { parsed = JSON.parse(gen.output) } catch {}

  const activeText = parsed[activePlatform] || ""

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeText)
    setCopied(true)
    onToast("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyHashtags = async () => {
    if (!parsed.hashtags?.length) return
    await navigator.clipboard.writeText(parsed.hashtags.map(h => `#${h}`).join(" "))
    onToast("Hashtags copied!")
  }

  const handleReuse = () => {
    const encoded = encodeURIComponent(gen.prompt)
    router.push(`/generate?topic=${encoded}`)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from("generations").delete().eq("id", gen.id)
    if (!error) onDelete(gen.id)
    else setDeleting(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="glass rounded-2xl border border-white/6 hover:border-white/10 transition-all duration-300 overflow-hidden group"
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#F7BE4D]/15 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#F7BE4D]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">AI Generated Post</p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-2.5 h-2.5" />
              {timeAgo(gen.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleReuse}
            title="Reuse prompt"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#F7BE4D] px-2 py-1.5 rounded-lg hover:bg-[#F7BE4D]/8 transition-all"
          >
            <Repeat2 className="w-3.5 h-3.5" />
            Reuse
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete"
            className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Prompt */}
      <div className="px-5 pb-3">
        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mb-1">Prompt</p>
        <p className="text-xs text-slate-300 line-clamp-1">{gen.prompt}</p>
      </div>

      {/* Platform tabs */}
      <div className="px-5 pb-3">
        <div className="flex gap-1.5">
          {platformConfig.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePlatform(p.key)}
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                activePlatform === p.key
                  ? "text-white border-transparent"
                  : "text-slate-500 border-white/6 hover:text-slate-300 hover:border-white/12"
              }`}
              style={activePlatform === p.key ? { background: `${p.color}20`, borderColor: `${p.color}30` } : {}}
            >
              <span className="text-sm">{p.icon}</span>
              <span className="font-medium">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        <div
          className="relative rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed bg-white/[0.03] border border-white/5 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
          style={{ borderColor: `${platformConfig.find(p => p.key === activePlatform)?.color}15` }}
        >
          <p className={expanded ? "" : "line-clamp-3"}>{activeText}</p>
          {activeText.length > 120 && (
            <button className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 mt-2 transition-colors">
              {expanded ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Show more</>}
            </button>
          )}
        </div>
      </div>

      {/* Hashtags */}
      {parsed.hashtags && parsed.hashtags.length > 0 && (
        <div className="px-5 pb-4">
          <button
            onClick={handleCopyHashtags}
            className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-[#F7BE4D] transition-colors group/hash"
          >
            <Hash className="w-3 h-3" />
            <span className="truncate max-w-xs">{parsed.hashtags.slice(0, 5).map(h => `#${h}`).join(" ")}</span>
            <Copy className="w-2.5 h-2.5 opacity-0 group-hover/hash:opacity-100 transition-opacity" />
          </button>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-white/[0.01]">
        <span className="text-[10px] text-slate-600">{activeText.length} chars</span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
            copied
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-white/5 hover:bg-[#F7BE4D]/10 text-slate-400 hover:text-[#F7BE4D] border border-white/8 hover:border-[#F7BE4D]/20"
          }`}
        >
          {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl border border-white/5 p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="skeleton w-7 h-7 rounded-lg" />
        <div className="space-y-1.5">
          <div className="skeleton w-32 h-3 rounded" />
          <div className="skeleton w-16 h-2.5 rounded" />
        </div>
      </div>
      <div className="skeleton w-48 h-2.5 rounded" />
      <div className="flex gap-1.5">
        <div className="skeleton w-20 h-7 rounded-lg" />
        <div className="skeleton w-20 h-7 rounded-lg" />
        <div className="skeleton w-20 h-7 rounded-lg" />
      </div>
      <div className="skeleton w-full h-16 rounded-xl" />
      <div className="skeleton w-full h-8 rounded-lg" />
    </div>
  )
}

export default function HistoryPage() {
  const router = useRouter()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState("")

  useEffect(() => { fetchGenerations() }, [])

  const fetchGenerations = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    setGenerations((data as Generation[]) || [])
    setLoading(false)
  }

  const handleDelete = (id: string) => {
    setGenerations(prev => prev.filter(g => g.id !== id))
    showToast("Generation deleted")
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 2500)
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#F7BE4D]/15 flex items-center justify-center">
              <History className="w-3.5 h-3.5 text-[#F7BE4D]" />
            </div>
            <h1 className="text-lg font-bold text-white">Generation History</h1>
          </div>
          <p className="text-sm text-slate-500 ml-9">All your AI-generated content in one place</p>
        </div>
        {!loading && generations.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{generations.length} generation{generations.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && generations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-16 border border-white/5 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center mx-auto mb-5">
            <History className="w-8 h-8 text-[#F7BE4D]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No generations yet</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
            Generate your first AI social post and it will appear here.
          </p>
          <button
            onClick={() => router.push("/generate")}
            className="flex items-center gap-2 bg-[#F7BE4D] text-[#050816] font-semibold px-6 py-2.5 rounded-xl hover:bg-[#ffd166] transition-all glow-yellow-sm mx-auto text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Generate Content
          </button>
        </motion.div>
      )}

      {/* Generation cards */}
      {!loading && generations.length > 0 && (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generations.map((gen, i) => (
              <motion.div
                key={gen.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GenerationCard gen={gen} onDelete={handleDelete} onToast={showToast} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 8, x: "-50%" }}
            className="fixed bottom-6 left-1/2 glass px-4 py-2.5 rounded-xl border border-[#F7BE4D]/20 text-sm text-white flex items-center gap-2 z-50 shadow-xl"
          >
            <CheckCheck className="w-4 h-4 text-[#F7BE4D]" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
