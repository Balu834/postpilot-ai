"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password,     setPassword]     = useState("")
  const [confirm,      setConfirm]      = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [done,         setDone]         = useState(false)
  const [error,        setError]        = useState("")
  const [ready,        setReady]        = useState(false)

  // Supabase fires an AUTH_CHANGE event with type RECOVERY when the reset link is clicked.
  // We wait for that before showing the form so we have a valid session to call updateUser.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true)
    })
    // Also check for an existing session (user navigated here after link opened tab)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError("Passwords don't match"); return }
    if (password.length < 6)  { setError("Password must be at least 6 characters"); return }
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
    setTimeout(() => router.replace("/dashboard"), 2500)
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  }

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
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
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25
                flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password updated!</h2>
              <p className="text-sm text-slate-500">Redirecting you to your dashboard…</p>
            </motion.div>
          ) : !ready ? (
            <motion.div key="waiting" className="text-center">
              <div className="w-8 h-8 border-2 border-[#F7BE4D]/30 border-t-[#F7BE4D]
                rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-slate-500">Verifying your reset link…</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-7">
                <h2 className="text-2xl font-black text-white mb-1.5">Set new password</h2>
                <p className="text-sm text-slate-500">Choose a strong password for your account.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">New password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      className="w-full rounded-xl pl-10 pr-11 py-3 text-sm text-slate-200
                        placeholder-slate-700 focus:outline-none transition-all"
                      style={inputStyle}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = "rgba(247,190,77,0.4)"
                        e.currentTarget.style.boxShadow  = "0 0 0 3px rgba(247,190,77,0.08)"
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                        e.currentTarget.style.boxShadow  = "none"
                      }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600
                        hover:text-slate-300 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      required
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200
                        placeholder-slate-700 focus:outline-none transition-all"
                      style={inputStyle}
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

                {/* Strength indicator */}
                {password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => {
                        const strength = password.length >= 12 ? 4 : password.length >= 8 ? 3 : password.length >= 6 ? 2 : 1
                        return (
                          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{
                              background: i < strength
                                ? strength === 1 ? "#ef4444" : strength === 2 ? "#f59e0b" : strength === 3 ? "#F7BE4D" : "#34d399"
                                : "rgba(255,255,255,0.06)",
                            }} />
                        )
                      })}
                    </div>
                    <p className="text-[10px] text-slate-600">
                      {password.length < 6 ? "Too short" : password.length < 8 ? "Weak" : password.length < 12 ? "Good" : "Strong"}
                    </p>
                  </div>
                )}

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
                    : "Update password"
                  }
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
