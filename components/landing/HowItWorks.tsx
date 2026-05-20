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
    color: "#F7BE4D",
    preview: [
      { label: "Topic", value: "AI productivity tools for founders" },
      { label: "Tone", value: "Casual & conversational" },
      { label: "Platforms", value: "Instagram · LinkedIn · X" },
    ],
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI writes your posts",
    description:
      "GPT-4 generates platform-perfect captions with hashtags, CTAs, and character limits respected — for every platform at once.",
    color: "#818cf8",
    preview: [
      { label: "Instagram", value: "✨ Working smarter, not harder..." },
      { label: "LinkedIn", value: "Founders: here's what AI can do for..." },
      { label: "Twitter / X", value: "hot take: AI writing > blank page 🧵" },
    ],
  },
  {
    number: "03",
    icon: SendHorizonal,
    title: "Schedule & publish",
    description:
      "Pick your dates on the visual calendar, connect your accounts, and let PostPilot auto-publish at the right time.",
    color: "#34d399",
    preview: [
      { label: "Mon 9 AM", value: "Instagram post — scheduled" },
      { label: "Tue 10 AM", value: "LinkedIn post — scheduled" },
      { label: "Wed 8 AM", value: "X thread — publishing now..." },
    ],
  },
]

export default function HowItWorks() {
  return (
    <section id="demo" className="py-24 px-6 relative">
      {/* Subtle grid bg */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass-sm rounded-full px-4 py-2 mb-6 border border-white/8">
            <span className="text-xs text-[#F7BE4D] font-medium tracking-wide uppercase">
              How it works
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            From idea to published{" "}
            <span className="gradient-text">in 60 seconds</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Three steps. Zero stress. A full month of content ready to go.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">

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
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
                  style={{ background: `${step.color}18`, border: `1px solid ${step.color}40` }}
                >
                  <step.icon className="w-5 h-5" style={{ color: step.color }} />
                </div>
                <span
                  className="text-5xl font-black opacity-15 leading-none"
                  style={{ color: step.color }}
                >
                  {step.number}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
              </div>

              {/* Preview card */}
              <div
                className="glass rounded-2xl p-4 border border-white/6 flex flex-col gap-2.5 mt-auto"
                style={{ boxShadow: `0 0 24px ${step.color}0a` }}
              >
                {step.preview.map((row) => (
                  <div key={row.label} className="flex items-start gap-2">
                    <span className="text-[10px] font-semibold text-slate-500 w-20 flex-shrink-0 pt-0.5">
                      {row.label}
                    </span>
                    <span className="text-xs text-slate-300 leading-snug">{row.value}</span>
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
