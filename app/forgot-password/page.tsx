"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
          style={{ background: "radial-gradient(ellipse at top, rgba(247,190,77,0.08) 0%, transparent 60%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 rounded-xl bg-[#F7BE4D] flex items-center justify-center"
            style={{ boxShadow: "0 0 16px rgba(247,190,77,0.4)" }}>
            <Zap className="w-4 h-4 text-[#050816]" fill="currentColor" strokeWidth={0} />
          </div>
          <span className="font-bold text-white">PostPilot<span className="text-[#F7BE4D]">AI</span></span>
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25
                flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                We sent a password reset link to{" "}
                <span className="text-slate-300 font-medium">{email}</span>.
                It expires in 1 hour.
              </p>
              <p className="text-xs text-slate-600 mb-6">
                Didn&apos;t get it? Check your spam folder or{" "}
                <button onClick={() => setSent(false)}
                  className="text-[#F7BE4D] hover:text-[#ffd166] transition-colors">
                  try again
                </button>.
              </p>
              <Link href="/login"
                className="flex items-center justify-center gap-2 text-sm text-slate-400
                  hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-7">
                <h2 className="text-2xl font-black text-white mb-1.5">Forgot password?</h2>
                <p className="text-sm text-slate-500">
                  Enter your email and we&apos;ll send a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200
                        placeholder-slate-700 focus:outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = "rgba(247,190,77,0.4)"
                        e.currentTarget.style.boxShadow  = "0 0 0 3px rgba(247,190,77,0.08)"
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                        e.currentTarget.style.boxShadow  = "none"
                      }}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-red-400 text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 font-bold py-3
                    rounded-xl text-sm disabled:opacity-60 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #F7BE4D 0%, #ffd166 100%)",
                    color: "#050816",
                    boxShadow: "0 4px 20px rgba(247,190,77,0.3)",
                  }}
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-[#050816]/30 border-t-[#050816] rounded-full animate-spin" />
                    : "Send reset link"
                  }
                </button>
              </form>

              <Link href="/login"
                className="flex items-center justify-center gap-2 text-sm text-slate-500
                  hover:text-slate-300 transition-colors mt-5">
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
