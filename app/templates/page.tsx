"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowRight, Search, Heart, X, Zap } from "lucide-react"
import { analytics } from "@/lib/analytics"

// ── Template data ──────────────────────────────────────────────────────────
const TEMPLATES = [
  // Launch
  { id: "product-launch",   title: "Product Launch",      emoji: "🚀", category: "Launch",    color: "#F7BE4D", tone: "engaging",      engagement: "⚡ High conversion", reach: "18K–42K",
    description: "Announce a new product with maximum excitement and social proof",
    prompt: "We just launched [PRODUCT NAME]. It helps [TARGET AUDIENCE] to [KEY BENEFIT] without [MAIN PAIN POINT]. Here's what makes it different: [3 KEY FEATURES]." },
  { id: "feature-release",  title: "Feature Release",     emoji: "⚡", category: "Launch",    color: "#818cf8", tone: "professional",   engagement: "💬 High comments", reach: "12K–30K",
    description: "Announce a new feature update that solves a real user pain point",
    prompt: "We just shipped [FEATURE NAME] — the most requested update from our users. Here's what it does, why we built it, and how it changes [USE CASE]." },
  { id: "startup-launch",   title: "Startup Announcement",emoji: "🎯", category: "Launch",    color: "#34d399", tone: "founder",        engagement: "❤️ High likes", reach: "15K–40K",
    description: "Share the story of launching your startup with raw authenticity",
    prompt: "After [TIMEFRAME] of building in stealth, we're ready to share what we've been working on. [PRODUCT NAME] is [ONE SENTENCE PITCH]. We're opening [BETA/WAITLIST] today." },
  { id: "promotion",        title: "Promotion / Offer",   emoji: "📣", category: "Launch",    color: "#E1306C", tone: "marketing",      engagement: "⚡ High clicks", reach: "10K–24K",
    description: "Drive conversions with a compelling, urgency-driven offer",
    prompt: "Limited time: [SPECIFIC OFFER DETAILS] for [TARGET AUDIENCE]. [REASON WHY NOW IS THE TIME]. Here's exactly what you get: [LIST BENEFITS]." },

  // Growth
  { id: "saas-growth",      title: "SaaS Growth Hack",    emoji: "📈", category: "Growth",    color: "#818cf8", tone: "founder",        engagement: "🔁 High reshares", reach: "22K–60K",
    description: "Share a specific growth tactic that moved the needle for your SaaS",
    prompt: "We grew from [X] to [Y] users in [TIMEFRAME] using one underrated channel: [CHANNEL/TACTIC]. Here's the exact playbook we used, step by step." },
  { id: "hiring",           title: "We're Hiring",        emoji: "👥", category: "Growth",    color: "#f472b6", tone: "friendly",       engagement: "💬 High applications", reach: "8K–18K",
    description: "Attract top talent with an authentic, culture-forward hiring post",
    prompt: "We're hiring a [ROLE] at [COMPANY]. Not just anyone — we want someone who [SPECIFIC QUALITY]. What makes us different: [3 CULTURE POINTS]. Here's the role." },
  { id: "weekly-update",    title: "Weekly Update",       emoji: "📅", category: "Growth",    color: "#38bdf8", tone: "conversational", engagement: "💬 High comments", reach: "6K–14K",
    description: "Keep your audience updated on wins, learnings, and what's next",
    prompt: "Week [NUMBER] update — here's what happened, what broke, what worked, and what's coming next at [COMPANY/PROJECT]. Keeping it 100% transparent." },
  { id: "case-study",       title: "Case Study",          emoji: "📊", category: "Growth",    color: "#F7BE4D", tone: "professional",   engagement: "💾 High saves", reach: "20K–55K",
    description: "Prove your value with specific results and a compelling success story",
    prompt: "[CLIENT TYPE] went from [BEFORE STATE] to [AFTER STATE] in [TIMEFRAME] using [YOUR PRODUCT/METHOD]. Here's exactly how we did it, with real numbers." },

  // Education
  { id: "educational-thread", title: "Educational Thread", emoji: "📚", category: "Education", color: "#a78bfa", tone: "educational",   engagement: "💾 High saves", reach: "24K–58K",
    description: "Share deep insights that establish you as a thought leader",
    prompt: "Here's everything you need to know about [TOPIC] — a complete breakdown from beginner to advanced level in 2026. This took me [TIMEFRAME] to learn." },
  { id: "tutorial",          title: "How-To Tutorial",    emoji: "🛠️", category: "Education", color: "#0A66C2", tone: "educational",   engagement: "💾 High saves", reach: "20K–55K",
    description: "Step-by-step guide that delivers immediate, actionable value",
    prompt: "How to [ACHIEVE SPECIFIC RESULT] in [TIMEFRAME] — step-by-step for [TARGET AUDIENCE]. Even if you're starting from zero. Here's the full process:" },
  { id: "ai-news",           title: "AI News Breakdown",  emoji: "🤖", category: "Education", color: "#818cf8", tone: "technical",     engagement: "🔁 High reshares", reach: "28K–75K",
    description: "Break down the latest AI news and explain why it matters",
    prompt: "[AI NEWS/DEVELOPMENT] just happened. Here's what it actually means for [YOUR AUDIENCE], why most coverage is missing the point, and what to do about it." },
  { id: "marketing-tips",   title: "Marketing Tips",      emoji: "📣", category: "Education", color: "#f472b6", tone: "marketing",     engagement: "💾 High saves", reach: "18K–45K",
    description: "Share proven marketing tactics that get real results",
    prompt: "[NUMBER] marketing tactics that actually work in 2026 for [NICHE/INDUSTRY]. I've tested all of these personally. Here's what moved the needle most." },
  { id: "productivity",     title: "Productivity System", emoji: "⚙️", category: "Education", color: "#34d399", tone: "conversational", engagement: "💾 High saves", reach: "20K–50K",
    description: "Share a personal productivity system or framework",
    prompt: "The [NAME/FRAMEWORK] method that helped me [SPECIFIC OUTCOME]. I went from [BEFORE STATE] to [AFTER STATE] by following these [NUMBER] principles consistently." },

  // Engagement
  { id: "milestone",        title: "Milestone Celebration", emoji: "🎉", category: "Engagement", color: "#F7BE4D", tone: "inspirational", engagement: "❤️ High likes", reach: "14K–28K",
    description: "Celebrate achievements and bring your audience into the journey",
    prompt: "We just hit [MILESTONE: users/revenue/followers]. Here are [NUMBER] lessons we learned along the way that nobody talks about — raw and unfiltered." },
  { id: "behind-scenes",   title: "Behind the Scenes",   emoji: "🎬", category: "Engagement", color: "#94a3b8", tone: "conversational", engagement: "💬 High comments", reach: "11K–26K",
    description: "Build authentic connection by sharing your real process",
    prompt: "A day in my life building [PRODUCT/COMPANY/CAREER]. What really happens behind the scenes that most people never see. No filter, no polish." },
  { id: "customer-success", title: "Customer Success",   emoji: "⭐", category: "Engagement", color: "#34d399", tone: "professional",  engagement: "🔁 High reshares", reach: "16K–38K",
    description: "Let happy customers tell the story better than you can",
    prompt: "[CUSTOMER NAME/TYPE] shared something that made our whole team smile. They [SPECIFIC RESULT] using [PRODUCT/SERVICE]. Here's their story in their own words." },
  { id: "q-and-a",         title: "Q&A / Ask Me Anything", emoji: "💬", category: "Engagement", color: "#38bdf8", tone: "conversational", engagement: "💬 High replies", reach: "8K–20K",
    description: "Drive conversations by opening the floor to your audience",
    prompt: "I've been [DOING X] for [TIMEFRAME]. Ask me anything about [TOPIC]. I'll answer every question in the comments. Drop yours below 👇" },

  // Sales
  { id: "social-proof",    title: "Social Proof",        emoji: "💪", category: "Sales",     color: "#F7BE4D", tone: "marketing",     engagement: "⚡ High conversion", reach: "12K–30K",
    description: "Use testimonials and results to build trust and drive sales",
    prompt: "[NUMBER] [CUSTOMERS/USERS] have [ACHIEVED RESULT] with [PRODUCT] in [TIMEFRAME]. The most common thing they tell us: [SPECIFIC QUOTE OR PATTERN]." },
  { id: "pain-solution",   title: "Problem → Solution",  emoji: "🎯", category: "Sales",     color: "#818cf8", tone: "sales",         engagement: "⚡ High conversion", reach: "15K–35K",
    description: "Sell by deeply understanding and addressing the exact pain point",
    prompt: "If you're [TARGET AUDIENCE] and you're struggling with [SPECIFIC PAIN POINT], you're not alone. [NUMBER] people face this exact issue. Here's what actually fixes it." },
  { id: "objection",       title: "Objection Crusher",   emoji: "🛡️", category: "Sales",     color: "#E1306C", tone: "conversational", engagement: "💬 High comments", reach: "10K–22K",
    description: "Address the most common sales objection head-on with confidence",
    prompt: "The #1 objection we hear: '[COMMON OBJECTION]'. It's a fair concern. Here's why [PRODUCT/APPROACH] still works even if [OBJECTION SCENARIO]." },

  // Viral
  { id: "viral-hook",      title: "Viral Hook Post",     emoji: "🔥", category: "Viral",     color: "#ef4444", tone: "viral",         engagement: "🔁 High reshares", reach: "35K–120K",
    description: "Create a controversial take that gets shared organically",
    prompt: "Controversial take: [YOUR BOLD OPINION ABOUT TOPIC]. Most people disagree — but here's the data that proves it: [3 SUPPORTING POINTS]." },
  { id: "comparison",      title: "Comparison Post",     emoji: "⚖️", category: "Viral",     color: "#f472b6", tone: "engaging",      engagement: "💬 High debates", reach: "22K–65K",
    description: "Compare two approaches and give a decisive, opinionated verdict",
    prompt: "[OPTION A] vs [OPTION B] for [USE CASE]. I've personally tested both for [TIMEFRAME]. My brutally honest verdict: [STRONG OPINION]. Here's why." },
  { id: "unpopular-opinion", title: "Unpopular Opinion", emoji: "🌶️", category: "Viral",   color: "#fb923c", tone: "viral",         engagement: "💬 High debates", reach: "30K–100K",
    description: "Share a hot take that challenges the conventional wisdom in your niche",
    prompt: "Unpopular opinion: [CONTRARIAN BELIEF ABOUT YOUR INDUSTRY]. I know most people disagree. But after [EXPERIENCE/DATA], I'm convinced this is true." },

  // Stories
  { id: "founder-story",   title: "Founder Story",       emoji: "💡", category: "Stories",   color: "#34d399", tone: "storytelling",  engagement: "❤️ High likes", reach: "18K–45K",
    description: "Tell the authentic journey of building something from scratch",
    prompt: "[TIMEFRAME] ago, I was [SITUATION]. Today, [CURRENT STATE]. The journey between those two points taught me [KEY INSIGHT]. Here's the full story." },
  { id: "personal-brand",  title: "Personal Branding",   emoji: "🌟", category: "Stories",   color: "#a78bfa", tone: "storytelling",  engagement: "❤️ High likes", reach: "16K–38K",
    description: "Share the personal story that defines your brand and why you do what you do",
    prompt: "The moment I realized [KEY INSIGHT ABOUT YOUR WORK/MISSION]. It changed everything about how I approach [TOPIC]. Here's what I wish I knew sooner." },
] as const

type Template = typeof TEMPLATES[number]

const CATEGORIES = ["All", "Launch", "Growth", "Education", "Engagement", "Sales", "Viral", "Stories"]
const FAVORITES_KEY = "postpilot_template_favorites"

// ── TemplateCard ───────────────────────────────────────────────────────────
function TemplateCard({ template, index, isFav, onUse, onToggleFav }: {
  template: Template; index: number; isFav: boolean
  onUse: (t: Template) => void; onToggleFav: (id: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
      className="bg-white rounded-2xl p-5 flex flex-col cursor-pointer group border border-slate-200 transition-all relative"
      onClick={() => onUse(template)}
      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
    >
      {/* Favorite button */}
      <button
        onClick={e => { e.stopPropagation(); onToggleFav(template.id) }}
        className="absolute top-4 right-4 p-1.5 rounded-lg transition-all"
        style={{ color: isFav ? "#ef4444" : "#cbd5e1" }}
      >
        <Heart className="w-3.5 h-3.5" fill={isFav ? "#ef4444" : "none"} />
      </button>

      {/* Icon + category */}
      <div className="flex items-start gap-3 mb-4 pr-6">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${template.color}15`, border: `1px solid ${template.color}25` }}>
          {template.emoji}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#b45309] transition-colors leading-tight">
            {template.title}
          </h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
            style={{ background: `${template.color}12`, color: template.color, border: `1px solid ${template.color}20` }}>
            {template.category}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-4">
        {template.description}
      </p>

      {/* Prompt preview */}
      <div className="p-3 rounded-xl mb-4 text-[11px] text-slate-500 leading-relaxed italic line-clamp-2"
        style={{ background: `${template.color}06`, border: `1px solid ${template.color}15` }}>
        "{template.prompt.slice(0, 95)}…"
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${template.color}12`, color: template.color, border: `1px solid ${template.color}20` }}>
          {template.engagement}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">{template.reach} reach</span>
      </div>

      {/* CTA */}
      <button
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
        style={{ background: `${template.color}12`, color: template.color, border: `1px solid ${template.color}22` }}
      >
        Use Template
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </button>
    </motion.div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function TemplatesPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState("All")
  const [search,         setSearch]         = useState("")
  const [favorites,      setFavorites]      = useState<string[]>([])
  const [showFavsOnly,   setShowFavsOnly]   = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY)
      if (raw) setFavorites(JSON.parse(raw))
    } catch {}
  }, [])

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const filtered = TEMPLATES.filter(t => {
    const matchCat  = activeCategory === "All" || t.category === activeCategory
    const matchFavs = !showFavsOnly || favorites.includes(t.id)
    const matchSearch = !search.trim()
      || t.title.toLowerCase().includes(search.toLowerCase())
      || t.description.toLowerCase().includes(search.toLowerCase())
      || t.category.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchFavs && matchSearch
  })

  const handleUse = (template: Template) => {
    analytics.templateUsed(template.id, template.title, template.category)
    router.push(`/generate?topic=${encodeURIComponent(template.prompt)}&tone=${template.tone}`)
  }

  return (
    <div className="max-w-6xl space-y-5">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #ffffff 0%, #fefce8 100%)",
          border: "1px solid rgba(247,190,77,0.25)",
          boxShadow: "0 2px 16px rgba(247,190,77,0.08)",
        }}
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#F7BE4D]/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F7BE4D]/12 border border-[#F7BE4D]/22 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#F7BE4D]" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Content Templates</h1>
              <p className="text-[11px] text-slate-500">{TEMPLATES.length} proven frameworks — click any to generate instantly</p>
            </div>
          </div>

          {/* Search + Fav toggle */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search templates…"
                className="pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 outline-none w-52 transition-all"
                onFocus={e => { e.target.style.borderColor = "rgba(247,190,77,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(247,190,77,0.1)" }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none" }}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFavsOnly(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all"
              style={showFavsOnly
                ? { background: "#fee2e2", border: "1px solid #fca5a5", color: "#ef4444" }
                : { background: "white", border: "1px solid #e2e8f0", color: "#64748b" }
              }
            >
              <Heart className="w-3.5 h-3.5" fill={showFavsOnly ? "#ef4444" : "none"} />
              {favorites.length > 0 && <span>{favorites.length}</span>}
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mt-5">
          {CATEGORIES.map(cat => {
            const count = cat === "All"
              ? TEMPLATES.length
              : TEMPLATES.filter(t => t.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="text-xs px-3.5 py-1.5 rounded-xl border transition-all font-medium"
                style={activeCategory === cat
                  ? { background: "rgba(247,190,77,0.12)", border: "1px solid rgba(247,190,77,0.4)", color: "#b45309", fontWeight: 600 }
                  : { background: "white", border: "1px solid #e2e8f0", color: "#64748b" }
                }
              >
                {cat} <span className="opacity-60">({count})</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.div
            key={activeCategory + search + String(showFavsOnly)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filtered.map((template, i) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={i}
                isFav={favorites.includes(template.id)}
                onUse={handleUse}
                onToggleFav={toggleFav}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl p-14 text-center bg-white border border-slate-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 mb-1">
              {showFavsOnly ? "No favorited templates yet" : "No templates match your search"}
            </p>
            <button onClick={() => { setSearch(""); setShowFavsOnly(false); setActiveCategory("All") }}
              className="text-xs text-[#b45309] hover:underline mt-1">
              Clear filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200"
        style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
      >
        <div>
          <p className="text-sm font-bold text-slate-900 mb-1">Don't see what you need?</p>
          <p className="text-xs text-slate-500">Create fully custom posts from any topic on the Generate page.</p>
        </div>
        <button
          onClick={() => router.push("/generate")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#050816] whitespace-nowrap transition-all"
          style={{ background: "linear-gradient(135deg, #F7BE4D 0%, #ffd97d 100%)", boxShadow: "0 2px 12px rgba(247,190,77,0.3)" }}
        >
          <Sparkles className="w-4 h-4" />
          Custom Generate
        </button>
      </motion.div>
    </div>
  )
}
