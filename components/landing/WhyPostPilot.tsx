"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Check, ArrowRight, Sparkles } from "lucide-react"

const ROWS = [
  {
    feature:   "Platform coverage",
    others:    "One platform at a time",
    postpilot: "LinkedIn, Twitter, Instagram & more",
  },
  {
    feature:   "Content quality",
    others:    "Generic AI writing",
    postpilot: "Platform-optimized output",
  },
  {
    feature:   "Editing required",
    others:    "Hours of manual revisions",
    postpilot: "Publish-ready in one click",
  },
  {
    feature:   "Tools needed",
    others:    "5 separate apps",
    postpilot: "All-in-one workflow",
  },
  {
    feature:   "Time per month",
    others:    "8–12 hours",
    postpilot: "Under 10 minutes",
  },
]

const STATS = [
  { emoji: "🌐", value: "5+",       label: "Platforms" },
  { emoji: "⚡", value: "60 sec",   label: "To Generate" },
  { emoji: "📅", value: "30 Days",  label: "Of Content" },
]

export default function WhyPostPilot() {
  return (
    <section className="py-24 px-6 relative" style={{ backgroundColor: "#ffffff" }}>
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(247,190,77,0.5),rgba(99,102,241,0.3),transparent)",
        }}
      />

      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border border-amber-200 bg-amber-50">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#b45309" }}>
              Why PostPilot AI
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            The smarter way to{" "}
            <span className="gradient-text">create social content</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            Stop juggling five tools. Stop spending hours writing posts. Get everything in one workflow.
          </p>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-3xl overflow-hidden border border-slate-200 mb-12"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.04)" }}
        >
          {/* Column headers */}
          <div className="grid grid-cols-2 sm:grid-cols-3">
            {/* Feature label column — hidden on mobile */}
            <div className="hidden sm:block px-5 py-4 bg-slate-50 border-b border-r border-slate-200">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Feature
              </span>
            </div>
            {/* Others column header */}
            <div
              className="px-5 py-4 border-b border-r border-slate-200 flex items-center gap-2"
              style={{ background: "#fafafa" }}
            >
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <span className="text-slate-500 text-[10px] font-black">✗</span>
              </div>
              <span className="text-[12px] font-bold text-slate-500">Other AI Tools</span>
            </div>
            {/* PostPilot column header */}
            <div
              className="px-5 py-4 border-b border-slate-200 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg,#fffbeb,#fef9c3)" }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#F7BE4D,#fbbf24)" }}
              >
                <Check className="w-2.5 h-2.5 text-amber-900" />
              </div>
              <span className="text-[12px] font-bold text-amber-900">PostPilot AI</span>
              <span
                className="ml-auto text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ background: "#F7BE4D", color: "#050816" }}
              >
                🏆 Best
              </span>
            </div>
          </div>

          {/* Comparison rows */}
          {ROWS.map((row, i) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.12 + i * 0.07 }}
              className="grid grid-cols-2 sm:grid-cols-3"
            >
              {/* Feature name — hidden on mobile */}
              <div
                className={`hidden sm:flex px-5 py-3.5 border-r border-slate-100 items-center ${
                  i < ROWS.length - 1 ? "border-b" : ""
                }`}
                style={{ background: "#fafafa" }}
              >
                <span className="text-[11px] font-semibold text-slate-500">{row.feature}</span>
              </div>

              {/* Others */}
              <div
                className={`px-5 py-3.5 border-r border-slate-100 flex items-center gap-2 ${
                  i < ROWS.length - 1 ? "border-b" : ""
                }`}
                style={{ background: "#fafafa" }}
              >
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                  style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}
                >
                  ✗
                </span>
                <span className="text-[11px] text-slate-400">{row.others}</span>
              </div>

              {/* PostPilot */}
              <div
                className={`px-5 py-3.5 flex items-center gap-2 ${
                  i < ROWS.length - 1 ? "border-b border-amber-100" : ""
                }`}
                style={{ background: "linear-gradient(135deg,#fffef5,#fefce8)" }}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}
                >
                  <Check className="w-2 h-2 text-emerald-600" />
                </div>
                <span className="text-[11px] font-semibold text-slate-700">{row.postpilot}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-3 gap-2 sm:gap-4 mb-12"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              className="rounded-2xl p-4 sm:p-6 text-center border border-slate-200 bg-white"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <span className="text-2xl block mb-2">{stat.emoji}</span>
              <p
                className="text-2xl sm:text-3xl font-black mb-1"
                style={{
                  background: "linear-gradient(135deg,#d97706,#F7BE4D)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {stat.value}
              </p>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-center"
        >
          <Link href="/login">
            <motion.div
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex w-full sm:w-auto justify-center items-center gap-2.5 font-bold px-8 py-4 rounded-xl text-base cursor-pointer select-none"
              style={{
                background: "linear-gradient(135deg,#F7BE4D,#fbbf24)",
                color: "#050816",
                boxShadow: "0 0 28px rgba(247,190,77,0.35), 0 6px 18px rgba(0,0,0,0.08)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              Try PostPilot AI Free
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
          <p className="text-xs text-slate-400 mt-3">No credit card required · Free forever plan</p>
        </motion.div>
      </div>
    </section>
  )
}
