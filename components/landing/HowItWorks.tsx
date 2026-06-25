"use client"

import { motion } from "framer-motion"
import { Lightbulb, Wand2, SendHorizonal, ArrowRight } from "lucide-react"

const STEPS = [
  {
    number: "01",
    icon: Lightbulb,
    title: "Paste Your Idea",
    description:
      "Drop any topic, product, or blog URL. Choose your tone — casual, professional, or punchy. That's it.",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    glow: "rgba(217,119,6,0.15)",
    preview: [
      { label: "Topic",     value: "AI productivity tools for founders" },
      { label: "Tone",      value: "Casual & conversational" },
      { label: "Platforms", value: "Instagram · LinkedIn · X · Bluesky" },
    ],
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI Creates Content",
    description:
      "GPT-4o generates platform-perfect posts with hooks, hashtags, CTAs, and character limits respected — for every platform at once.",
    color: "#6366f1",
    bg: "#eef2ff",
    border: "#c7d2fe",
    glow: "rgba(99,102,241,0.15)",
    preview: [
      { label: "Instagram", value: "✨ Working smarter, not harder..." },
      { label: "LinkedIn",  value: "Founders: here's what AI can do for..." },
      { label: "Twitter/X", value: "hot take: AI writing > blank page 🧵" },
    ],
  },
  {
    number: "03",
    icon: SendHorizonal,
    title: "Publish Everywhere",
    description:
      "Pick dates on the visual calendar, connect your accounts, and let PostPilot auto-publish at peak engagement times.",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    glow: "rgba(5,150,105,0.15)",
    preview: [
      { label: "Mon 9 AM",  value: "Instagram post — ✓ published" },
      { label: "Tue 11 AM", value: "LinkedIn post — ✓ published" },
      { label: "Wed 8 AM",  value: "X thread — publishing now…" },
    ],
  },
]

export default function HowItWorks() {
  return (
    <section id="demo" className="py-24 px-6 relative" style={{ backgroundColor: "#ffffff" }}>
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg,transparent,rgba(247,190,77,0.5),transparent)" }} />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%,rgba(247,190,77,0.06) 0%,transparent 60%)" }} />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border border-amber-200 bg-amber-50">
            <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#b45309" }}>
              How it works
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            From idea to published{" "}
            <span className="gradient-text">in 60 seconds</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            Three steps. Zero stress. A full month of content — ready to go.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-[88px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px"
            style={{ background: "linear-gradient(90deg,rgba(247,190,77,0.3),rgba(99,102,241,0.3),rgba(5,150,105,0.3))" }} />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.14 }}
              className="flex flex-col"
            >
              {/* Step icon + number */}
              <div className="flex flex-col items-center mb-6 relative">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center mb-3 relative z-10"
                  style={{
                    background: step.bg,
                    border: `2px solid ${step.border}`,
                    boxShadow: `0 8px 24px ${step.glow}`,
                  }}
                >
                  <step.icon className="w-7 h-7" style={{ color: step.color }} />
                </motion.div>
                <span
                  className="text-xs font-black tracking-widest uppercase"
                  style={{ color: step.color, opacity: 0.6 }}
                >
                  Step {step.number}
                </span>
              </div>

              {/* Text */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
              </div>

              {/* Preview card */}
              <motion.div
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="rounded-2xl p-4 flex flex-col gap-3 mt-auto border"
                style={{
                  background: step.bg,
                  borderColor: step.border,
                  boxShadow: `0 4px 16px ${step.glow}`,
                }}
              >
                {step.preview.map((row) => (
                  <div key={row.label} className="flex items-start gap-2.5">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest pt-0.5 flex-shrink-0"
                      style={{ color: step.color, minWidth: 60 }}
                    >
                      {row.label}
                    </span>
                    <span className="text-xs text-slate-700 leading-snug">{row.value}</span>
                  </div>
                ))}
              </motion.div>

              {/* Arrow (between steps on mobile) */}
              {i < STEPS.length - 1 && (
                <div className="flex justify-center mt-6 md:hidden">
                  <ArrowRight className="w-5 h-5 text-slate-300 rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-slate-400 mt-14"
        >
          Average generation time: <span className="font-semibold text-slate-600">3–8 seconds</span> · No prompt engineering needed · Works for any niche
        </motion.p>
      </div>
    </section>
  )
}
