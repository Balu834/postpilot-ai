"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { analytics } from "@/lib/analytics"

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.5 + 0.5,
  delay: Math.random() * 5,
  duration: Math.random() * 8 + 10,
}))

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
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">

      {/* ─── Background ─────────────────────────────────── */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Centre radial sweep */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(247,190,77,0.09) 0%, transparent 65%)" }}
      />

      {/* Gold orb — top left */}
      <motion.div
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(247,190,77,0.07) 0%, transparent 70%)", filter: "blur(70px)" }}
      />

      {/* Indigo orb — bottom right */}
      <motion.div
        animate={{ scale: [1, 1.22, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-0 right-[8%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)", filter: "blur(70px)" }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.id % 3 === 0 ? "#F7BE4D" : p.id % 3 === 1 ? "#818cf8" : "#34d399",
            }}
            animate={{ y: [0, -40, 0], opacity: [0, 0.5, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

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
          <span className="text-xs text-[#F7BE4D] font-semibold tracking-widest uppercase">
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
            <span className="block text-5xl md:text-7xl lg:text-[86px] text-white">
              Turn One Idea Into
            </span>
            <span className="block text-5xl md:text-7xl lg:text-[86px]">
              <span
                style={{
                  background: "linear-gradient(135deg, #F7BE4D 0%, #ffd166 45%, #f0a800 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 32px rgba(247,190,77,0.45))",
                }}
              >
                30 Days
              </span>
              <span className="text-white"> Of </span>
              <motion.span
                animate={{ filter: ["drop-shadow(0 0 20px rgba(247,190,77,0.3))", "drop-shadow(0 0 40px rgba(247,190,77,0.6))", "drop-shadow(0 0 20px rgba(247,190,77,0.3))"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background: "linear-gradient(135deg, #fff 0%, #F7BE4D 60%, #ffd166 100%)",
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
              className="flex items-center gap-2 text-slate-300 hover:text-white border border-white/10 hover:border-white/25 px-8 py-4 rounded-xl text-base cursor-pointer select-none transition-colors duration-200"
              style={{ backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.03)" }}
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
                  className="w-8 h-8 rounded-full border-2 border-[#050816] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                  style={{ background: a.color }}
                >
                  {a.letter}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              <span className="text-white font-semibold">10,000+</span> AI posts generated this month
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
              <div className="text-2xl font-black text-white mb-0.5">{s.value}</div>
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
            className="glass rounded-2xl border border-white/8 overflow-hidden relative"
            style={{ boxShadow: "0 0 0 1px rgba(247,190,77,0.1), 0 40px 100px rgba(0,0,0,0.55)" }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-4 text-xs text-slate-500 font-mono">postpilot.ai/generate</span>
              <div className="ml-auto flex items-center gap-1.5">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                />
                <span className="text-[10px] text-emerald-400 font-medium">AI generating…</span>
              </div>
            </div>

            {/* Platform cards */}
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              {PLATFORMS.map((card, i) => (
                <motion.div
                  key={card.platform}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 + i * 0.1, duration: 0.4 }}
                  className="glass-sm rounded-xl p-4 border border-white/5 text-left"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base leading-none">{card.icon}</span>
                    <span className="text-[10px] font-semibold text-slate-300 leading-none">{card.platform}</span>
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2 + i * 0.4, repeat: Infinity }}
                      className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: card.color }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{card.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
