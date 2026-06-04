"use client"

import { motion } from "framer-motion"
import { Lightbulb, Wand2, SendHorizonal } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Lightbulb,
    title: "Drop your idea",
    description:
      "Enter a topic, product name, or paste a blog URL. Tell us your tone — casual, professional, or punchy.",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    preview: [
      { label: "Topic",     value: "AI productivity tools for founders" },
      { label: "Tone",      value: "Casual & conversational" },
      { label: "Platforms", value: "Instagram · LinkedIn · X" },
    ],
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI writes your posts",
    description:
      "GPT-4 generates platform-perfect captions with hashtags, CTAs, and character limits respected — for every platform at once.",
    color: "#6366f1",
    bg: "#eef2ff",
    border: "#c7d2fe",
    preview: [
      { label: "Instagram", value: "✨ Working smarter, not harder..." },
      { label: "LinkedIn",  value: "Founders: here's what AI can do for..." },
      { label: "Twitter/X", value: "hot take: AI writing > blank page 🧵" },
    ],
  },
  {
    number: "03",
    icon: SendHorizonal,
    title: "Schedule & publish",
    description:
      "Pick your dates on the visual calendar, connect your accounts, and let PostPilot auto-publish at the right time.",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    preview: [
      { label: "Mon 9AM",  value: "Instagram post — scheduled" },
      { label: "Tue 10AM", value: "LinkedIn post — scheduled" },
      { label: "Wed 8AM",  value: "X thread — publishing now..." },
    ],
  },
]

export default function HowItWorks() {
  return (
    <section id="demo" className="py-24 px-6 relative" style={{ backgroundColor: '#ffffff' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(247,190,77,0.2) 0%, transparent 60%)" }} />
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(247,190,77,0.6), transparent)" }} />

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
            <span className="text-xs text-amber-700 font-semibold tracking-wide uppercase">
              How it works
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            From idea to published{" "}
            <span className="gradient-text">in 60 seconds</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            Three steps. Zero stress. A full month of content ready to go.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.12 }}
              className="flex flex-col gap-5"
            >
              {/* Step header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: step.bg, border: `1px solid ${step.border}` }}
                >
                  <step.icon className="w-5 h-5" style={{ color: step.color }} />
                </div>
                <span
                  className="text-5xl font-black leading-none"
                  style={{ color: step.color, opacity: 0.25 }}
                >
                  {step.number}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
              </div>

              {/* Preview card */}
              <div
                className="rounded-2xl p-4 flex flex-col gap-2.5 mt-auto border"
                style={{
                  background: step.bg,
                  borderColor: step.border,
                  boxShadow: `0 4px 16px ${step.color}10`,
                }}
              >
                {step.preview.map((row) => (
                  <div key={row.label} className="flex items-start gap-2">
                    <span
                      className="text-[10px] font-bold w-20 flex-shrink-0 pt-0.5 uppercase tracking-wide"
                      style={{ color: step.color }}
                    >
                      {row.label}
                    </span>
                    <span className="text-xs text-slate-600 leading-snug">{row.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
