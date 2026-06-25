"use client"

import { motion } from "framer-motion"
import { Briefcase, MessageSquare, Camera, Hash, LayoutGrid, RefreshCw } from "lucide-react"

const FEATURES = [
  {
    icon: Briefcase,
    title: "LinkedIn Post Generator",
    description: "Generate professional, thought-leader posts that drive profile views and connection requests — with hooks, CTAs, and perfect formatting.",
    tag: "LinkedIn",
    color: "#0077B5",
    bg: "#eff8ff",
    border: "#bfdbfe",
  },
  {
    icon: MessageSquare,
    title: "Twitter Thread Generator",
    description: "Turn any idea into viral Twitter threads with punchy hooks, numbered breakdowns, and engagement-optimized endings.",
    tag: "Twitter / X",
    color: "#1e293b",
    bg: "#f8fafc",
    border: "#e2e8f0",
  },
  {
    icon: Camera,
    title: "Instagram Caption Generator",
    description: "Craft scroll-stopping captions with emotional hooks, storytelling arcs, and curated hashtag sets that expand your reach.",
    tag: "Instagram",
    color: "#E1306C",
    bg: "#fdf2f8",
    border: "#fbcfe8",
  },
  {
    icon: Hash,
    title: "Viral Hashtag Generator",
    description: "Get researched hashtag clusters for every platform — mixing high-volume, niche, and trending tags to maximize discoverability.",
    tag: "All Platforms",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  {
    icon: LayoutGrid,
    title: "Carousel Creator",
    description: "Generate multi-slide carousel content with a title slide, 5–7 content slides, and a CTA slide — ready to design instantly.",
    tag: "Carousel",
    color: "#818cf8",
    bg: "#eef2ff",
    border: "#c7d2fe",
  },
  {
    icon: RefreshCw,
    title: "AI Content Repurposing",
    description: "Paste a blog URL or article. Get 20+ posts across LinkedIn, Twitter, and Instagram in one click — never waste content again.",
    tag: "Repurpose",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 relative" style={{ backgroundColor: "#ffffff" }}>
      {/* Dot grid background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.6,
        }} />
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.25),rgba(247,190,77,0.25),transparent)" }} />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border border-amber-200 bg-amber-50">
            <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#b45309" }}>
              Everything you need
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Your complete AI content{" "}
            <span className="gradient-text">command center</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            One platform. Every social channel. Infinite content — ready in seconds.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative bg-white rounded-2xl p-6 border border-slate-200 cursor-default overflow-hidden transition-all duration-300"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLDivElement).style.boxShadow =
                  `0 8px 30px ${f.color}18, 0 2px 8px rgba(0,0,0,0.05)`
                ;(e.currentTarget as HTMLDivElement).style.borderColor = `${f.color}35`
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 6px rgba(0,0,0,0.04)"
                ;(e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0"
              }}
            >
              {/* Hover background wash */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(ellipse at 0% 0%,${f.color}06 0%,transparent 60%)` }}
              />

              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{ background: f.bg, border: `1px solid ${f.border}` }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>

              {/* Title + tag */}
              <div className="flex items-start gap-2 mb-2">
                <h3 className="font-semibold text-slate-900 text-base leading-snug flex-1">{f.title}</h3>
              </div>
              <span
                className="inline-block text-[10px] px-2.5 py-0.5 rounded-full font-semibold mb-3"
                style={{ background: f.bg, color: f.color, border: `1px solid ${f.border}` }}
              >
                {f.tag}
              </span>

              <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
