"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Zap, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight,
  Check, Star, TrendingUp, Calendar, Users, BarChart3,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

const FEATURES = [
  { icon: Sparkles, text: "AI-generated posts for every platform" },
  { icon: Calendar,   text: "Schedule 30 days of content in minutes" },
  { icon: TrendingUp, text: "Viral hooks crafted by AI that converts" },
  { icon: BarChart3,  text: "Analytics to track and grow your reach" },
]

const STATS = [
  { value: "12,000+", label: "Creators" },
  { value: "2M+",     label: "Posts made" },
  { value: "4.9★",   label: "Rating" },
]

const TESTIMONIAL = {
  quote: "PostPilot AI saves me 10 hours a week. I just paste my idea and get a full week of content instantly.",
  name: "Priya Sharma",
  handle: "@priyacreates",
  city: "Mumbai",
}

type Mode = "signin" | "signup"

/* ─── Left marketing panel ─────────────────────────────────── */
function LeftPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #060a1a 0%, #0a1128 50%, #07101f 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #F7BE4D 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #F7BE4D 0%, transparent 60%)" }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Logo */}
      <div className="relative flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#F7BE4D] flex items-center justify-center"
          style={{ boxShadow: "0 0 20px rgba(247,190,77,0.4)" }}>
          <Zap className="w-5 h-5 text-[#050816]" fill="currentColor" strokeWidth={0} />
        </div>
        <div className="leading-none">
          <div className="text-sm font-bold">
            <span className="text-white">PostPilot</span>
            <span className="text-[#F7BE4D]">AI</span>
          </div>
          <div className="text-[10px] text-slate-600 mt-0.5">AI Content OS</div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{
              background: "rgba(247,190,77,0.1)",
              border: "1px solid rgba(247,190,77,0.2)",
            }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-[#F7BE4D] font-semibold tracking-wide">TRUSTED BY 12,000+ INDIAN CREATORS</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.08] mb-5">
            Create{" "}
            <span
              className="relative"
              style={{
                background: "linear-gradient(90deg, #F7BE4D, #ffd166, #F7BE4D)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              30 days
            </span>{" "}
            of content in minutes.
          </h1>

          <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md">
            PostPilot AI writes your Instagram captions, LinkedIn posts, Twitter threads and more —
            then schedules everything while you sleep.
          </p>

          <ul className="space-y-3 mb-10">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(247,190,77,0.1)",
                    border: "1px solid rgba(247,190,77,0.15)",
                  }}>
                  <Icon className="w-3.5 h-3.5 text-[#F7BE4D]" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </li>
            ))}
          </ul>

          {/* Floating mock card */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-2xl p-4 max-w-sm"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F7BE4D] to-[#f0a800] flex items-center justify-center text-xs font-bold text-[#050816]">P</div>
              <div>
                <p className="text-xs font-semibold text-white">Priya Sharma</p>
                <p className="text-[10px] text-slate-500">@priyacreates · Just now</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-medium">Generated</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              🚀 The secret to growing from 0 to 10K followers? Consistency. Here&apos;s the exact content strategy I used...
            </p>
            <div className="flex items-center gap-2 mt-3">
              {["Instagram", "LinkedIn", "Twitter"].map(p => (
                <span key={p} className="text-[9px] px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(247,190,77,0.1)", color: "#F7BE4D", border: "1px solid rgba(247,190,77,0.15)" }}>
                  {p}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats + testimonial */}
      <div className="relative">
        {/* Stats row */}
        <div className="flex items-center gap-6 mb-6">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="text-lg font-black text-white">{value}</div>
              <div className="text-[10px] text-slate-600 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="rounded-xl p-4"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
          <div className="flex items-center gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-[#F7BE4D] text-[#F7BE4D]" />
            ))}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3 italic">&quot;{TESTIMONIAL.quote}&quot;</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F7BE4D] to-[#f0a800] flex items-center justify-center text-[10px] font-bold text-[#050816]">
              {TESTIMONIAL.name[0]}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white">{TESTIMONIAL.name}</p>
              <p className="text-[10px] text-slate-600">{TESTIMONIAL.handle} · {TESTIMONIAL.city}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Right auth panel ─────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user && data.session) {
          // DB trigger (handle_new_user) creates the users record automatically
          fetch("/api/email/welcome", {
            method: "POST",
            headers: { authorization: `Bearer ${data.session.access_token}` },
          }).catch(() => {})
          router.replace("/onboarding")
        }
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data.user && data.session) {
          localStorage.setItem(`postpilot_onboarded_${data.user.id}`, "true")
          // Send welcome email to new users who haven't received it yet
          fetch("/api/email/welcome", {
            method: "POST",
            headers: { authorization: `Bearer ${data.session.access_token}` },
          }).catch(() => {})
        }
        router.replace("/dashboard")
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LeftPanel />

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative"
        style={{ background: "#060b1c" }}>

        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(247,190,77,0.04) 0%, transparent 100%)",
          }}
        />

        {/* Mobile logo (hidden on desktop since left panel has one) */}
        <div className="flex lg:hidden items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-xl bg-[#F7BE4D] flex items-center justify-center"
            style={{ boxShadow: "0 0 16px rgba(247,190,77,0.4)" }}>
            <Zap className="w-4 h-4 text-[#050816]" fill="currentColor" strokeWidth={0} />
          </div>
          <span className="font-bold text-white text-lg">PostPilot<span className="text-[#F7BE4D]">AI</span></span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm relative"
        >
          {/* Mode headline */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mb-7"
            >
              <h2 className="text-2xl font-black text-white mb-1.5">
                {mode === "signin" ? "Welcome back 👋" : "Start creating today"}
              </h2>
              <p className="text-sm text-slate-500">
                {mode === "signin"
                  ? "Sign in to your PostPilot AI account"
                  : "Free to start — no credit card needed"}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Tab switcher */}
          <div className="flex bg-white/[0.04] rounded-xl p-1 mb-6 border border-white/[0.05]">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setSuccess("") }}
                className={`flex-1 text-sm font-semibold py-2.5 rounded-lg transition-all duration-200 ${
                  mode === m
                    ? "bg-[#F7BE4D] text-[#050816]"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {m === "signin" ? "Sign in" : "Sign up free"}
              </button>
            ))}
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 text-white text-sm font-medium py-3 rounded-xl transition-all mb-5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"
            }}
          >
            {googleLoading
              ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              : <GoogleIcon />
            }
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-[11px] text-slate-600">or with email</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-700 focus:outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = "rgba(247,190,77,0.4)"
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(247,190,77,0.08)"
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-slate-400 font-medium">Password</label>
                {mode === "signin" && (
                  <Link href="/forgot-password"
                    className="text-[11px] text-slate-500 hover:text-[#F7BE4D] transition-colors">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                  required
                  minLength={6}
                  className="w-full rounded-xl pl-10 pr-11 py-3 text-sm text-slate-200 placeholder-slate-700 focus:outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = "rgba(247,190,77,0.4)"
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(247,190,77,0.08)"
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error / success messages */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-emerald-400 text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {success}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm mt-1"
              style={{
                background: "linear-gradient(135deg, #F7BE4D 0%, #ffd166 100%)",
                color: "#050816",
                boxShadow: "0 4px 20px rgba(247,190,77,0.3)",
              }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#050816]/30 border-t-[#050816] rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {mode === "signin" ? "Sign in" : "Create free account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-5">
            {mode === "signin" ? "New to PostPilot? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError("") }}
              className="text-[#F7BE4D] hover:text-[#ffd166] transition-colors font-semibold"
            >
              {mode === "signin" ? "Sign up free →" : "Sign in"}
            </button>
          </p>

          <p className="text-center text-[10px] text-slate-700 mt-6 leading-relaxed">
            By continuing, you agree to our{" "}
            <span className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
            {" & "}
            <span className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </>
  )
}
