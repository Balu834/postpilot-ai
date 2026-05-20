"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    q: "Is there a free plan?",
    a: "Yes. The Free plan gives you 10 AI generations per month with no credit card required. You can upgrade to Pro or Agency anytime from your dashboard.",
  },
  {
    q: "Which social media platforms are supported?",
    a: "PostPilot AI supports Instagram, LinkedIn, and Twitter / X. Each post is tailored for the platform's tone, format, and character limits. Instagram support is coming soon for direct publishing.",
  },
  {
    q: "How does the AI generate content?",
    a: "We use GPT-4o to generate platform-specific captions based on your topic, tone, and brand preferences. The AI understands hashtag strategy, CTAs, and what performs well on each platform.",
  },
  {
    q: "Can I schedule posts in advance?",
    a: "Yes. Use the Content Calendar to schedule posts on specific dates. On Pro and Agency plans, posts publish automatically via connected Twitter and LinkedIn accounts.",
  },
  {
    q: "Is my data secure?",
    a: "All data is encrypted in transit and at rest. Your social tokens are stored securely server-side and never exposed to the frontend. We never post on your behalf without your explicit action.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. There are no lock-in contracts. You can cancel your subscription from the Settings page at any time, and you'll retain access until the end of your billing period.",
  },
]

function FAQItem({ item, index }: { item: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="border border-white/6 rounded-2xl overflow-hidden"
      style={{ background: "rgba(13,21,38,0.7)", backdropFilter: "blur(16px)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <span className="text-sm font-semibold text-white">{item.q}</span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: open ? "rgba(247,190,77,0.15)" : "rgba(255,255,255,0.05)",
          }}
        >
          {open
            ? <Minus className="w-3.5 h-3.5 text-[#F7BE4D]" />
            : <Plus className="w-3.5 h-3.5 text-slate-400" />
          }
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <p className="px-6 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 glass-sm rounded-full px-4 py-2 mb-6 border border-white/8">
            <span className="text-xs text-[#F7BE4D] font-medium tracking-wide uppercase">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Common <span className="gradient-text">questions</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {faqs.map((item, i) => (
            <FAQItem key={item.q} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
