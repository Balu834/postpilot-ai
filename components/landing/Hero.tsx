"use client"

import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { analytics } from "@/lib/analytics"

// Particles are client-only (framer-motion SSR serializes style props differently → hydration mismatch)
const HeroParticles = dynamic(() => import("./HeroParticles"), { ssr: false })

const AVATARS = [
  { letter: "P", color: "#E1306C" },
  { letter: "R", color: "#0077B5" },
  { letter: "A", color: "#818cf8" },
  { letter: "S", color: "#34d399" },
  { letter: "M", color: "#F7BE4D" },
]

const STATS = [
  { value: "50K+", label: "Posts generated" },
  { value: "10h",  label: "Saved per week" },
  { value: "3×",   label: "Engagement lift" },
]

const PLATFORMS = [
  { platform: "Instagram", icon: "📸", color: "#E1306C",
    text: "Just dropped our newest feature that's going to change how you create content forever. ✨ #ContentCreator #AI" },
  { platform: "Facebook",  icon: "👍", color: "#1877F2",
    text: "We're transforming how businesses create content with AI. Reach your audience faster, smarter, and with less effort." },
  { platform: "LinkedIn",  icon: "💼", color: "#0077B5",
    text: "Excited to share how AI is reshaping content creation. We've seen 3× engagement for businesses using AI strategies..." },
  { platform: "Twitter / X", icon: "𝕏", color: "#94a3b8",
    text: "hot take: manual social posting is dead. AI-generated content that converts > 3hrs writing captions. 🧵" },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>

      {/* Rainbow strip across top */}
      <div className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
        style={{ background: "linear-gradient(90deg, #F7BE4D, #f472b6, #818cf8, #34d399, #38bdf8, #F7BE4D)" }} />

      {/* ─── Content ─────────────────────────────────────── */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">

        {/* ── Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 glass-sm rounded-full px-4 py-2 mb-8 border border-[#F7BE4D]/25"
        >
          <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-[#F7BE4D]"
          />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#b45309' }}>
            AI-Powered Content Engine
          </span>
        </motion.div>

        {/* ── Headline ── */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <h1 className="font-black leading-[1.04] tracking-tight mb-6">
            <span className="block text-5xl md:text-7xl lg:text-[86px] text-slate-900">
              Turn One Idea Into
            </span>
            <span className="block text-5xl md:text-7xl lg:text-[86px]">
              <span
                style={{
                  background: "linear-gradient(135deg, #d97706 0%, #F7BE4D 45%, #f0a800 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 24px rgba(247,190,77,0.3))",
                }}
              >
                30 Days
              </span>
              <span className="text-slate-900"> Of </span>
              <motion.span
                animate={{ filter: ["drop-shadow(0 0 16px rgba(247,190,77,0.2))", "drop-shadow(0 0 32px rgba(247,190,77,0.5))", "drop-shadow(0 0 16px rgba(247,190,77,0.2))"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background: "linear-gradient(135deg, #0f172a 0%, #d97706 60%, #F7BE4D 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block",
                }}
              >
                Viral Content.
              </motion.span>
            </span>
          </h1>
        </motion.div>

        {/* ── Subheadline ── */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          Paste any idea or blog URL. Get LinkedIn, Twitter, Instagram posts,
          <br className="hidden md:block" />
          hashtags, and carousel slides — live-streamed in under 60 seconds.
        </motion.p>

        {/* ── CTAs ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          {/* Primary */}
          <Link href="/login" onClick={() => analytics.upgradeClicked("hero_cta", "signup")}>
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-2.5 font-bold px-8 py-4 rounded-xl text-[#050816] text-base cursor-pointer select-none"
              style={{
                background: "linear-gradient(135deg, #F7BE4D 0%, #ffd166 50%, #f0a800 100%)",
                boxShadow: "0 0 32px rgba(247,190,77,0.4), 0 6px 24px rgba(0,0,0,0.35)",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 0 50px rgba(247,190,77,0.65), 0 8px 30px rgba(0,0,0,0.4)"
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 0 32px rgba(247,190,77,0.4), 0 6px 24px rgba(0,0,0,0.35)"
              }}
            >
              <Sparkles className="w-4 h-4" />
              Start Generating Free
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.div>
          </Link>

          {/* Secondary */}
          <a href="#demo">
            <motion.div
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-8 py-4 rounded-xl text-base cursor-pointer select-none transition-colors duration-200 bg-white"
            >
              See How It Works
            </motion.div>
          </a>
        </motion.div>

        {/* ── Trust strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.56 }}
          className="flex flex-col items-center gap-2.5 mb-14"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {AVATARS.map((a) => (
                <div
                  key={a.letter}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                  style={{ background: a.color }}
                >
                  {a.letter}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500">
              <span className="text-slate-900 font-semibold">10,000+</span> AI posts generated this month
            </p>
          </div>
          <p className="text-xs text-slate-600 tracking-wide">
            Trusted by creators, startups, and agencies.
          </p>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="grid grid-cols-3 gap-8 max-w-xs mx-auto mb-16"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-slate-900 mb-0.5">{s.value}</div>
              <div className="text-[11px] text-slate-500 leading-tight">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Dashboard mockup ── */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.72 }}
          className="relative mx-auto max-w-4xl"
        >
          {/* Glow halo behind mockup */}
          <div
            className="absolute -inset-6 rounded-3xl pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 90%, rgba(247,190,77,0.1) 0%, transparent 65%)" }}
          />

          <div
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden relative"
            style={{ boxShadow: "0 4px 32px rgba(247,190,77,0.12), 0 20px 60px rgba(0,0,0,0.08)" }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-4 text-xs text-slate-400 font-mono">postpilot.ai/generate</span>
              <div className="ml-auto flex items-center gap-1.5">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                />
                <span className="text-[10px] text-emerald-600 font-medium">AI generating…</span>
              </div>
            </div>

            {/* Platform cards */}
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/50">
              {PLATFORMS.map((card, i) => (
                <motion.div
                  key={card.platform}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 + i * 0.1, duration: 0.4 }}
                  className="bg-white rounded-xl p-4 border border-slate-100 text-left shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base leading-none">{card.icon}</span>
                    <span className="text-[10px] font-semibold text-slate-700 leading-none">{card.platform}</span>
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2 + i * 0.4, repeat: Infinity }}
                      className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: card.color }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{card.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
