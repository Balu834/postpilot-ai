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
  linkedin?:  string
  twitter?:   string
  threads?:   string
  bluesky?:   string
  pinterest?: string
  hashtags?:  string[]
}

type PlatformKey = "instagram" | "linkedin" | "twitter" | "threads" | "bluesky" | "pinterest"

const platformConfig: { key: PlatformKey; label: string; icon: string; color: string }[] = [
  { key: "instagram", label: "Instagram",   icon: "📸", color: "#E1306C" },
  { key: "linkedin",  label: "LinkedIn",    icon: "💼", color: "#0077B5" },
  { key: "twitter",   label: "Twitter / X", icon: "𝕏",  color: "#94a3b8" },
  { key: "threads",   label: "Threads",     icon: "🧵", color: "#e2e8f0" },
  { key: "bluesky",   label: "Bluesky",     icon: "🦋", color: "#0085ff" },
  { key: "pinterest", label: "Pinterest",   icon: "📌", color: "#E60023" },
]

/* ─── Demo generations (shown when history is empty) ─────────────── */

const DEMO_GENS: Generation[] = [
  {
    id: "demo-gen-1",
    prompt: "How AI is changing content marketing in 2026",
    platform: "instagram",
    output: JSON.stringify({
      instagram: "AI won't replace creators.\n\nCreators using AI will replace creators who don't.\n\nHere are 5 tools changing content creation in 2026 👇\n\n1. PostPilot AI — multi-platform generation\n2. Synthesia — AI video\n3. Midjourney — AI visuals\n4. ElevenLabs — voice cloning\n5. Notion AI — structured thinking\n\nSave this. Share this.",
      linkedin: "Most content teams are still creating manually in 2026.\n\nThat's like using a typewriter when everyone else has a supercomputer.\n\nAI-assisted creation isn't the future. It's the present.\n\nHow top teams use it:\n• AI for ideation & first drafts\n• Humans for voice & strategy\n• Automation for repurposing\n\nThe result? 10x content. Same team.",
      twitter: "Hot take: The best content creators in 2026 won't be the most creative — they'll be the best AI prompt engineers.\n\nThe skill is shifting. Are you adapting?",
      threads: "Real talk — AI changed how I create content completely. Not because it does the thinking for me, but because it frees me to do more of it. The tools are here. The only question is whether you'll use them.",
      bluesky: "The creator economy shift nobody's talking about: AI didn't kill creativity. It killed the excuse not to create. 300 chars never felt so loaded.",
      pinterest: "5 AI content tools reshaping how creators work in 2026 — PostPilot for multi-platform posts, Midjourney for visuals, Synthesia for video, ElevenLabs for voice, and Notion AI for structured thinking. Save this for your next content strategy session.",
      hashtags: ["AIContent", "ContentMarketing", "SocialMediaStrategy", "CreatorEconomy", "DigitalMarketing", "ContentCreation", "AITools", "MarketingTips", "ContentStrategy", "FutureOfWork"],
    }),
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "demo-gen-2",
    prompt: "LinkedIn personal branding for SaaS founders",
    platform: "linkedin",
    output: JSON.stringify({
      instagram: "Building a SaaS company in public changed everything for us 📈\n\nWhat happened when we started sharing:\n• Inbound went up 340%\n• Partnerships came to us\n• Hiring became 10x easier\n• Revenue grew from word of mouth\n\nAuthenticity is the best marketing strategy.",
      linkedin: "Most SaaS founders underestimate LinkedIn.\n\nThey build the product. They don't build the audience.\n\nYour personal brand is your most valuable distribution channel.\n\nThe founders who win in 2026:\n✓ Share their journey, not just their wins\n✓ Teach what they learn in public\n✓ Build relationships before they need them\n✓ Show up consistently, even on hard days\n\nYour next 100 customers are reading LinkedIn right now.",
      twitter: "Controversial: The best SaaS growth strategy in 2026 isn't paid ads.\n\nIt's the founder's personal brand.\n\nEvery post is a sales call that scales.",
      threads: "Founders who treat LinkedIn like a diary and not a distribution channel are leaving millions on the table. Personal brand = your cheapest sales channel. Change my mind.",
      bluesky: "The SaaS founders winning in 2026 share one thing: they built their audience before they needed it. Distribution-first, product-second.",
      pinterest: "LinkedIn personal branding for SaaS founders — why showing up consistently beats going viral every time. Build your audience before you need it. Strategy inside.",
      hashtags: ["SaaSFounder", "PersonalBranding", "LinkedInStrategy", "StartupMarketing", "BuildInPublic", "SaaSGrowth", "FounderLife", "B2BMarketing", "ThoughtLeadership", "Entrepreneurship"],
    }),
    created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
  },
  {
    id: "demo-gen-3",
    prompt: "5 AI tools every creator needs in 2026",
    platform: "instagram",
    output: JSON.stringify({
      instagram: "The creator stack changed completely in 2026 🚀\n\nHere's what the top 1% of creators are using:\n\n✅ PostPilot AI — multi-platform content\n✅ Descript — AI-powered video editing\n✅ Midjourney — stunning AI visuals\n✅ ElevenLabs — voice cloning\n✅ Gamma — AI presentations\n\nYour competitors are already using these. Are you?",
      linkedin: "I analyzed the workflows of 50 successful creators in 2026.\n\nEvery single one uses at least 3 AI tools.\n\nHere's the stack that separates good from great:\n\n1. Content generation (PostPilot AI)\n2. Visual design (Midjourney + Canva AI)\n3. Video editing (Descript)\n4. Distribution (scheduling + automation)\n5. Analytics (data-driven decisions)\n\nAI doesn't replace the creator. It gives them superpowers.",
      twitter: "Unpopular opinion: Creators who refuse to use AI in 2026 aren't being authentic.\n\nThey're just less productive.\n\nThe tools changed. The craft didn't.",
      threads: "Five AI tools every creator needs right now. Not hype — actual tools I use. PostPilot for content, Descript for video, Midjourney for visuals, ElevenLabs for voice, Gamma for decks. Your workflow will never be the same.",
      bluesky: "The creators thriving in 2026 aren't the most talented. They're the most systematised. AI tools = systems. Systems = output. Output = audience.",
      pinterest: "Top AI tools for content creators in 2026 — build faster, create smarter, scale your brand across every platform. Save this creator toolkit for your next content planning session.",
      hashtags: ["CreatorTools", "AIForCreators", "ContentCreation", "CreatorEconomy", "SocialMediaTools", "AITools2026", "ContentStrategy", "DigitalCreator", "ContentMarketing", "GrowthHacks"],
    }),
    created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
  },
  {
    id: "demo-gen-4",
    prompt: "How to grow on LinkedIn from 0 to 10k followers",
    platform: "linkedin",
    output: JSON.stringify({
      instagram: "0 to 10K LinkedIn followers in 90 days 🎯\n\nThe playbook nobody talks about:\n\n1. Post at 8AM Tue–Thu (best times)\n2. Lead with a bold opening line\n3. Use white space, not paragraphs\n4. End with a question to drive comments\n5. Reply to every comment in first hour\n6. Engage with 10 posts before you post\n\nConsistency beats perfection every time.",
      linkedin: "I grew my LinkedIn from 0 to 10,000 followers in 90 days.\n\nNo shortcuts. No paid promotions. Just this system:\n\nMorning routine:\n→ Engage with 10 posts (20 min)\n→ Post at 8AM\n→ Reply to all comments in first hour\n\nContent mix:\n→ 3x educational posts/week\n→ 1x personal story/week\n→ 1x hot take/week\n\nKey insight: LinkedIn rewards early engagement. The algorithm is that simple.",
      twitter: "The LinkedIn growth playbook for 2026:\n\n• Post Tu/W/Th at 8AM\n• Bold first line (no preamble)\n• White space over paragraphs\n• End with a question\n• Reply every comment in hour 1\n\nDo this for 90 days. Watch what happens.",
      threads: "90 days. 0 to 10K followers. The only real secret? I showed up every single day at 8AM and replied to every comment within the first hour. The algorithm doesn't care how good your content is. It cares how fast people react to it.",
      bluesky: "LinkedIn growth is boring to talk about but wild to experience. Post consistently for 90 days and reply to every comment fast. That's it. That's the whole playbook.",
      pinterest: "LinkedIn growth strategy — from 0 to 10K followers in 90 days with a simple daily routine: post at 8AM Tue–Thu, lead with a hook, use white space, end with a question. Pin this for your content strategy.",
      hashtags: ["LinkedInGrowth", "PersonalBranding", "SocialMediaMarketing", "ContentStrategy", "LinkedInTips", "DigitalMarketing", "GrowthHacking", "LinkedInMarketing", "OnlinePresence", "CreatorTips"],
    }),
    created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
  },
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

function GenerationCard({ gen, onDelete, onToast, isDemo = false }: {
  gen: Generation
  onDelete: (id: string) => void
  onToast: (msg: string) => void
  isDemo?: boolean
}) {
  const router = useRouter()
  const [activePlatform, setActivePlatform] = useState<PlatformKey>("instagram")
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

  let parsed: ParsedOutput = {}
  try { parsed = JSON.parse(gen.output) } catch {}

  const activeText = (parsed as Record<string, string>)[activePlatform] || ""

  // Skip to first platform that has content if current one is empty
  const availablePlatforms = platformConfig.filter(p => !!(parsed as Record<string, string>)[p.key])

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
            {isDemo ? "Try this" : "Reuse"}
          </button>
          {!isDemo && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              title="Delete"
              className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Prompt */}
      <div className="px-5 pb-3">
        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mb-1">Prompt</p>
        <p className="text-xs text-slate-300 line-clamp-1">{gen.prompt}</p>
      </div>

      {/* Platform tabs — only platforms with content */}
      <div className="px-5 pb-3">
        <div className="flex gap-1.5 flex-wrap">
          {(availablePlatforms.length > 0 ? availablePlatforms : platformConfig.slice(0, 3)).map((p) => (
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
          style={{ borderColor: `${platformConfig.find(p => p.key === activePlatform)?.color ?? "#94a3b8"}15` }}
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

      {/* Empty state — show demo generations */}
      {!loading && generations.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Demo mode header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F7BE4D] animate-pulse" />
              <span className="text-[11px] text-slate-600 font-medium">Sample generations — generate yours to replace these</span>
            </div>
            <button
              onClick={() => router.push("/generate")}
              className="flex items-center gap-1.5 text-xs font-bold text-[#F7BE4D] hover:text-[#ffd166] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate now
            </button>
          </div>
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEMO_GENS.map((gen, i) => (
                <motion.div
                  key={gen.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <GenerationCard gen={gen} onDelete={() => {}} onToast={showToast} isDemo />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
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
