"use client"

import { motion } from "framer-motion"
import { RefreshCw, LayoutGrid, Zap, Sparkles, CheckCircle2, Hash } from "lucide-react"

const FEATURES = [
  {
    icon: RefreshCw,
    title: "Repurpose Any Content",
    description:
      "Turn blogs, YouTube videos, podcasts, or any URL into 20+ platform-ready posts in one click. One piece of content — infinite reach.",
    outcome: "Never waste content again",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
  {
    icon: LayoutGrid,
    title: "Platform-Optimized Output",
    description:
      "LinkedIn gets thought-leadership. Twitter gets punchy threads. Instagram gets emotional hooks. The AI adapts format and tone automatically.",
    outcome: "Each platform gets its best version",
    color: "#6366f1",
    bg: "#eef2ff",
    border: "#c7d2fe",
  },
  {
    icon: Zap,
    title: "Viral Hook Generator",
    description:
      "Every post opens with a scroll-stopping hook. AI-crafted openings proven to drive clicks, saves, and shares — before you edit a word.",
    outcome: "3× average engagement boost",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  {
    icon: Sparkles,
    title: "Brand Voice Matching",
    description:
      "Feed PostPilot your best existing posts and it learns your tone, vocabulary, and style. Outputs sound like you — not generic AI.",
    outcome: "Authentically yours, every time",
    color: "#E1306C",
    bg: "#fdf2f8",
    border: "#fbcfe8",
  },
  {
    icon: CheckCircle2,
    title: "Schedule-Ready Exports",
    description:
      "Export directly to Buffer, Hootsuite, or CSV. Every post comes pre-formatted with captions and hashtags — ready to schedule in one click.",
    outcome: "From idea to calendar instantly",
    color: "#0077B5",
    bg: "#eff8ff",
    border: "#bfdbfe",
  },
  {
    icon: Hash,
    title: "30-Day Batch Mode",
    description:
      "One topic generates a complete content calendar across every platform. Plan a full month in under 10 minutes, not hours.",
    outcome: "A month of content in minutes",
    color: "#818cf8",
    bg: "#eef2ff",
    border: "#c7d2fe",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 relative" style={{ backgroundColor: "#ffffff" }}>
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(99,102,241,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.6,
        }}
      />
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(99,102,241,0.25),rgba(247,190,77,0.25),transparent)",
        }}
      />

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
              What it can do
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            It solves more problems than{" "}
            <span className="gradient-text">you expect</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            PostPilot AI isn&apos;t just a content generator — it&apos;s a complete content workflow that
            handles everything from idea to publish.
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
              whileHover={{ y: -5, transition: { duration: 0.18 } }}
              className="group relative bg-white rounded-2xl p-6 border border-slate-200 cursor-default overflow-hidden"
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
              {/* Hover wash */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{
                  background: `radial-gradient(ellipse at 0% 0%,${f.color}06 0%,transparent 60%)`,
                }}
              />

              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{ background: f.bg, border: `1px solid ${f.border}` }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>

              {/* Title */}
              <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug">{f.title}</h3>

              {/* Description */}
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{f.description}</p>

              {/* Outcome pill */}
              <div
                className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold"
                style={{
                  background: f.bg,
                  color: f.color,
                  border: `1px solid ${f.border}`,
                }}
              >
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                {f.outcome}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
