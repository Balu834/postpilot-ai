"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"

const TRUST = [
  "No credit card required",
  "Free forever plan",
  "Cancel anytime",
]

export default function CTA() {
  return (
    <section className="py-24 px-6" style={{ backgroundColor: "#ffffff" }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-12 md:p-16 text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#fef9c3 0%,#fef3c7 40%,#fde68a 100%)",
            border: "2px solid rgba(247,190,77,0.4)",
            boxShadow: "0 20px 60px rgba(247,190,77,0.25), 0 4px 16px rgba(247,190,77,0.15)",
          }}
        >
          {/* Background glow accents */}
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(247,190,77,0.35) 0%,transparent 70%)", filter: "blur(50px)" }} />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(129,140,248,0.2) 0%,transparent 70%)", filter: "blur(40px)" }} />

          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border border-amber-300 bg-white/70">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs text-amber-700 font-semibold">Start free — no card needed</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
              Ready to Create{" "}
              <span className="gradient-text">30 Days of Content</span>
              <br />
              in Minutes?
            </h2>

            {/* Subtext */}
            <p className="text-slate-600 max-w-lg mx-auto mb-8 text-lg">
              Join thousands of creators and founders generating a month of social content
              in the time it used to take to write one post.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/login">
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 font-bold px-8 py-4 rounded-xl text-base cursor-pointer select-none"
                  style={{
                    background: "linear-gradient(135deg,#d97706,#F7BE4D,#ffd166)",
                    color: "#050816",
                    boxShadow: "0 0 32px rgba(247,190,77,0.5), 0 6px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Start Generating Free
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>

              <a href="#demo">
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 font-semibold px-8 py-4 rounded-xl text-base cursor-pointer select-none border border-amber-300 bg-white/80 text-slate-700 hover:bg-white transition-colors"
                >
                  Try Live Demo First
                </motion.div>
              </a>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center justify-center gap-5">
              {TRUST.map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm text-slate-600 font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
