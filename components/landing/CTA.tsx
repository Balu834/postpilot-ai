"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export default function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative glass rounded-3xl p-12 text-center overflow-hidden border border-white/8"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F7BE4D]/5 via-transparent to-purple-500/5 pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 glass-sm rounded-full px-4 py-2 mb-6 border border-[#F7BE4D]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#F7BE4D]" />
              <span className="text-xs text-[#F7BE4D] font-medium">Start for free — no card needed</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Your AI social team
              <br />
              <span className="gradient-text">starts today.</span>
            </h2>

            <p className="text-slate-400 max-w-lg mx-auto mb-8 text-lg">
              Join thousands of creators and brands generating content at scale with PostPilot AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="group flex items-center gap-2 bg-[#F7BE4D] text-[#050816] font-semibold px-8 py-3.5 rounded-xl hover:bg-[#ffd166] transition-all glow-yellow text-base"
              >
                <Sparkles className="w-4 h-4" />
                Get started free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <p className="text-slate-600 text-xs mt-6">Free forever · No credit card · Cancel anytime</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
