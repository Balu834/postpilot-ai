"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export default function CTA() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-12 text-center overflow-hidden border border-amber-200"
          style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fff7ed 100%)" }}
        >
          {/* Shiny background accents */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-40 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(247,190,77,0.4) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(129,140,248,0.3) 0%, transparent 70%)", filter: "blur(30px)" }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border border-amber-300 bg-white/70">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs text-amber-700 font-semibold">Start for free — no card needed</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4 leading-tight">
              Your AI social team
              <br />
              <span className="gradient-text">starts today.</span>
            </h2>

            <p className="text-slate-600 max-w-lg mx-auto mb-8 text-lg">
              Join thousands of creators and brands generating content at scale with PostPilot AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login"
                className="group flex items-center gap-2 bg-[#F7BE4D] text-[#050816] font-bold px-8 py-3.5 rounded-xl hover:bg-[#ffd166] transition-all glow-yellow text-base shadow-md">
                <Sparkles className="w-4 h-4" />
                Get started free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <p className="text-slate-500 text-xs mt-6">Free forever · No credit card · Cancel anytime</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
