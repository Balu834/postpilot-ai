"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowRight, Zap, Search } from "lucide-react"

// ── Template data ─────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: "product-launch",
    title: "Product Launch",
    emoji: "🚀",
    category: "Launch",
    color: "#F7BE4D",
    description: "Announce a new product with maximum excitement and social proof",
    prompt: "We just launched [PRODUCT NAME]. It helps [TARGET AUDIENCE] to [KEY BENEFIT] without [MAIN PAIN POINT]. Here's what makes it different.",
    tone: "engaging",
    tags: ["Launch", "Startup"],
    engagement: "⚡ High conversion",
    reach: "18K–42K avg reach",
  },
  {
    id: "educational-thread",
    title: "Educational Thread",
    emoji: "📚",
    category: "Education",
    color: "#818cf8",
    description: "Share deep insights that establish you as a thought leader",
    prompt: "Here's everything you need to know about [TOPIC] — a complete breakdown from beginner to advanced level in 2026.",
    tone: "educational",
    tags: ["Education", "Thread"],
    engagement: "💾 High saves",
    reach: "24K–58K avg reach",
  },
  {
    id: "viral-hook",
    title: "Viral Hook Post",
    emoji: "🔥",
    category: "Viral",
    color: "#f472b6",
    description: "Create a controversial or surprising take that gets shared organically",
    prompt: "Controversial take: [YOUR BOLD OPINION ABOUT TOPIC]. Most people disagree — but here's the data that proves it.",
    tone: "witty",
    tags: ["Viral", "Engagement"],
    engagement: "🔁 High reshares",
    reach: "35K–120K avg reach",
  },
  {
    id: "startup-story",
    title: "Startup Story",
    emoji: "💡",
    category: "Launch",
    color: "#34d399",
    description: "Tell the behind-the-scenes story of building your company authentically",
    prompt: "We've been building in stealth for [TIMEFRAME]. Today we're finally sharing what we've been working on: [PRODUCT] — [ONE SENTENCE PITCH].",
    tone: "inspirational",
    tags: ["Startup", "Story"],
    engagement: "💬 High comments",
    reach: "12K–34K avg reach",
  },
  {
    id: "tutorial",
    title: "Tutorial / How-To",
    emoji: "🛠️",
    category: "Education",
    color: "#0077B5",
    description: "Step-by-step guide that delivers immediate, actionable value",
    prompt: "How to [ACHIEVE SPECIFIC RESULT] in [TIMEFRAME] — a complete step-by-step guide for [TARGET AUDIENCE] even if you're starting from zero.",
    tone: "educational",
    tags: ["Tutorial", "Education"],
    engagement: "💾 High saves",
    reach: "20K–55K avg reach",
  },
  {
    id: "milestone",
    title: "Milestone Celebration",
    emoji: "🎉",
    category: "Engagement",
    color: "#F7BE4D",
    description: "Celebrate achievements and bring your audience into the journey",
    prompt: "We just hit [MILESTONE NUMBER] [USERS/CUSTOMERS/FOLLOWERS/REVENUE]. Here are the [NUMBER] lessons we learned along the way that nobody talks about.",
    tone: "inspirational",
    tags: ["Milestone", "Community"],
    engagement: "❤️ High likes",
    reach: "14K–28K avg reach",
  },
  {
    id: "data-insight",
    title: "Data Insight",
    emoji: "📊",
    category: "Education",
    color: "#818cf8",
    description: "Share surprising statistics that challenge common assumptions",
    prompt: "[SHOCKING STAT] about [INDUSTRY / TOPIC]. Most people don't know this. Here's what the data really means for [TARGET AUDIENCE].",
    tone: "professional",
    tags: ["Data", "Insight"],
    engagement: "🔁 High reshares",
    reach: "28K–72K avg reach",
  },
  {
    id: "comparison",
    title: "Comparison Post",
    emoji: "⚖️",
    category: "Viral",
    color: "#f472b6",
    description: "Compare two opposing approaches and give a decisive verdict",
    prompt: "[OPTION A] vs [OPTION B] for [USE CASE / GOAL]. I've personally tested both for [TIMEFRAME]. Here's my brutally honest take.",
    tone: "engaging",
    tags: ["Comparison", "Opinion"],
    engagement: "💬 High debates",
    reach: "22K–65K avg reach",
  },
  {
    id: "motivational",
    title: "Motivational Insight",
    emoji: "💪",
    category: "Engagement",
    color: "#34d399",
    description: "Inspire your audience with authentic wisdom from real experience",
    prompt: "The single mindset shift that completely changed how I approach [TOPIC / CHALLENGE]. I wish someone had told me this [TIMEFRAME] ago.",
    tone: "inspirational",
    tags: ["Motivation", "Mindset"],
    engagement: "❤️ High likes",
    reach: "16K–40K avg reach",
  },
  {
    id: "promotion",
    title: "Promotion / Offer",
    emoji: "📣",
    category: "Launch",
    color: "#E1306C",
    description: "Drive conversions with a compelling, urgency-driven offer post",
    prompt: "Limited time: [SPECIFIC OFFER DETAILS] for [TARGET AUDIENCE]. [REASON WHY NOW IS THE TIME]. Here's exactly what you get.",
    tone: "engaging",
    tags: ["Promotion", "Sales"],
    engagement: "⚡ High clicks",
    reach: "10K–24K avg reach",
  },
  {
    id: "behind-scenes",
    title: "Behind the Scenes",
    emoji: "🎬",
    category: "Engagement",
    color: "#94a3b8",
    description: "Build authentic connection by sharing your real process and journey",
    prompt: "A day in my life building [PRODUCT / COMPANY / CAREER]. What really happens behind the scenes that most people never see.",
    tone: "engaging",
    tags: ["Behind Scenes", "Authentic"],
    engagement: "💬 High comments",
    reach: "11K–26K avg reach",
  },
  {
    id: "thought-leadership",
    title: "Thought Leadership",
    emoji: "🧠",
    category: "Education",
    color: "#0077B5",
    description: "Share an original perspective that positions you as a true expert",
    prompt: "Most [PROFESSIONALS / FOUNDERS / MARKETERS] believe [COMMON ASSUMPTION]. After [YEARS / EXPERIENCE], I've come to believe something completely different — and here's why.",
    tone: "professional",
    tags: ["Leadership", "Opinion"],
    engagement: "🔁 High reshares",
    reach: "30K–80K avg reach",
  },
]

const CATEGORIES = ["All", "Launch", "Education", "Viral", "Engagement"]

// ── TemplateCard ──────────────────────────────────────────────────
function TemplateCard({
  template, index, onUse,
}: {
  template: typeof TEMPLATES[0]
  index: number
  onUse: (t: typeof TEMPLATES[0]) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      className="glass-card rounded-2xl p-5 flex flex-col cursor-pointer group"
      onClick={() => onUse(template)}
    >
      {/* Icon + category badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
          flex-shrink-0"
          style={{ background: `${template.color}15`, border: `1px solid ${template.color}25` }}>
          {template.emoji}
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: `${template.color}15`,
            color: template.color,
            border: `1px solid ${template.color}20`,
          }}>
          {template.category}
        </span>
      </div>

      {/* Title + description */}
      <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-[#F7BE4D]
        transition-colors">
        {template.title}
      </h3>
      <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-4">
        {template.description}
      </p>

      {/* Prompt preview */}
      <div className="p-3 rounded-xl mb-3 text-[11px] text-slate-400 leading-relaxed
        italic line-clamp-2"
        style={{ background: `${template.color}07`, border: `1px solid ${template.color}15` }}>
        "{template.prompt.slice(0, 100)}..."
      </div>

      {/* Engagement + reach chips */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${template.color}12`, color: template.color, border: `1px solid ${template.color}20` }}>
          {template.engagement}
        </span>
        <span className="text-[10px] text-slate-600 font-medium">
          {template.reach}
        </span>
      </div>

      {/* CTA */}
      <button
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
          text-xs font-bold transition-all group-hover:gap-3"
        style={{
          background: `${template.color}15`,
          color: template.color,
          border: `1px solid ${template.color}20`,
        }}>
        Use Template
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function TemplatesPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState("All")
  const [search, setSearch] = useState("")

  const filtered = TEMPLATES.filter(t => {
    const matchCat = activeCategory === "All" || t.category === activeCategory
    const matchSearch = search.trim() === ""
      || t.title.toLowerCase().includes(search.toLowerCase())
      || t.description.toLowerCase().includes(search.toLowerCase())
      || t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  const handleUse = (template: typeof TEMPLATES[0]) => {
    const params = new URLSearchParams({
      topic: template.prompt,
      tone: template.tone,
    })
    router.push(`/generate?${params.toString()}`)
  }

  return (
    <div className="max-w-6xl space-y-6 relative">

      {/* Ambient background glow */}
      <div className="fixed top-0 left-60 right-0 h-screen pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
          style={{ background: "radial-gradient(ellipse at top, rgba(129,140,248,0.06) 0%, transparent 55%)" }} />
      </div>

      {/* ── Header ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-hero rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/[0.06]
          rounded-full blur-3xl pointer-events-none" />
        <div className="grid-bg absolute inset-0 opacity-25 pointer-events-none rounded-2xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25
                flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">AI Templates</h1>
                <p className="text-[11px] text-slate-500">
                  12 proven content frameworks — click to generate instantly
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="input-premium pl-9 pr-4 py-2 text-xs w-52 rounded-xl"
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 mt-5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-[#F7BE4D]/15 border-[#F7BE4D]/40 text-[#F7BE4D] font-semibold"
                    : "border-white/8 text-slate-500 hover:border-white/15 hover:text-slate-300"
                }`}>
                {cat === "All" ? `All (${TEMPLATES.length})` : cat}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Template grid ──────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key={activeCategory + search}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filtered.map((template, i) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={i}
                onUse={handleUse}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-14 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-sm text-slate-500">No templates match your search</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom CTA ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center
          justify-between gap-4"
      >
        <div>
          <p className="text-sm font-bold text-white mb-1">
            Don't see what you need?
          </p>
          <p className="text-xs text-slate-500">
            Create fully custom posts from scratch on the Generate page.
          </p>
        </div>
        <button
          onClick={() => router.push("/generate")}
          className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 whitespace-nowrap">
          <Sparkles className="w-4 h-4" />
          Custom Generate
        </button>
      </motion.div>
    </div>
  )
}
