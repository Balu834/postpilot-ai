"use client"

import { motion } from "framer-motion"
import { Wand2, CalendarClock, BarChart3, RefreshCw, Zap, Globe } from "lucide-react"

const features = [
  { icon: Wand2,        title: "AI Caption Generator",  description: "Input a topic, product, or blog URL and get platform-perfect captions for Instagram, LinkedIn, and Twitter — with hashtags.", tag: "Core",      color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { icon: CalendarClock,title: "Smart Scheduler",       description: "Schedule posts at the optimal time for each platform. Visual calendar view, drag-and-drop, and auto-publish support.",        tag: "Scheduler", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
  { icon: BarChart3,    title: "Analytics Dashboard",   description: "Track generated posts, engagement metrics, and growth stats across all platforms in one beautiful dashboard.",                 tag: "Analytics", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  { icon: RefreshCw,    title: "Blog Repurposer",       description: "Paste a blog URL and instantly get 10+ social posts, short-form video scripts, and email snippets.",                         tag: "Repurpose", color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8" },
  { icon: Zap,          title: "Instant Generation",    description: "Generate a full month of content in under 60 seconds. Powered by GPT-4 with custom prompts fine-tuned for social.",          tag: "Speed",     color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
  { icon: Globe,        title: "Multi-Platform",        description: "Instagram, Facebook, LinkedIn, Twitter/X — each post is tailored for the platform's tone, format, and character limits.",    tag: "Platforms", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
]

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-white relative">
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, rgba(247,190,77,0.12) 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.4 }} />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border border-amber-200 bg-amber-50">
            <span className="text-xs text-amber-700 font-semibold tracking-wide uppercase">Everything you need</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Your complete AI content{" "}
            <span className="gradient-text">command center</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            One platform. Every social channel. Infinite content.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm group cursor-default hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{ background: feature.bg, border: `1px solid ${feature.border}` }}
              >
                <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-slate-900 text-base">{feature.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: feature.bg, color: feature.color, border: `1px solid ${feature.border}` }}>
                  {feature.tag}
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
