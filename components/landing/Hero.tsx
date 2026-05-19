"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles, TrendingUp, Clock } from "lucide-react"

const stats = [
  { label: "Posts generated", value: "2M+" },
  { label: "Time saved / week", value: "12h" },
  { label: "Avg engagement lift", value: "3.4×" },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden grid-bg radial-glow">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F7BE4D]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 glass-sm rounded-full px-4 py-2 mb-8 border border-[#F7BE4D]/20"
        >
          <span className="w-2 h-2 rounded-full bg-[#F7BE4D] pulse-dot" />
          <span className="text-xs text-[#F7BE4D] font-medium tracking-wide uppercase">AI-Powered Content Engine</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-6"
        >
          Turn One Idea Into{" "}
          <span className="gradient-text">30 Days</span>
          <br />
          Of Content.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Generate captions, schedule posts, and grow your audience using AI.
          <br className="hidden md:block" />
          Your AI Social Media Team — available 24/7.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/login"
            className="group flex items-center gap-2 bg-[#F7BE4D] text-[#050816] font-semibold px-7 py-3.5 rounded-xl hover:bg-[#ffd166] transition-all duration-200 glow-yellow text-base"
          >
            <Sparkles className="w-4 h-4" />
            Start generating free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#demo"
            className="flex items-center gap-2 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 px-7 py-3.5 rounded-xl transition-all duration-200 text-base"
          >
            See how it works
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative mx-auto max-w-4xl"
        >
          <div className="glass rounded-2xl border border-white/8 overflow-hidden glow-yellow">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-4 text-xs text-slate-500 font-mono">postpilot.ai/generate</span>
            </div>
            {/* Mock content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { platform: "Instagram", icon: "📸", color: "#E1306C", text: "Just dropped our newest feature that's going to change how you create content forever. The future is AI-powered. ✨ #ContentCreator #AI" },
                { platform: "LinkedIn", icon: "💼", color: "#0077B5", text: "Excited to share how AI is reshaping content creation. We've seen 3x engagement increases for businesses using automated social strategies..." },
                { platform: "Twitter / X", icon: "𝕏", color: "#94a3b8", text: "hot take: manual social media posting is dead. AI-generated content that actually converts > spending 3hrs writing captions. 🧵" },
              ].map((card) => (
                <div key={card.platform} className="glass-sm rounded-xl p-4 border border-white/5 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{card.icon}</span>
                    <span className="text-xs font-semibold text-slate-300">{card.platform}</span>
                    <span className="ml-auto w-2 h-2 rounded-full pulse-dot" style={{ background: card.color }} />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
