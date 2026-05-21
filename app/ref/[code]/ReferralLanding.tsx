"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Zap, Sparkles, CalendarClock, BarChart3, ArrowRight, Gift } from "lucide-react"

const PERKS = [
  { icon: Sparkles,     color: "#F7BE4D", label: "30 free AI generations",    desc: "Generate posts for any platform instantly"   },
  { icon: CalendarClock, color: "#818cf8", label: "Smart post scheduler",      desc: "Schedule weeks of content in minutes"        },
  { icon: BarChart3,    color: "#34d399", label: "Analytics dashboard",        desc: "Track growth across all your platforms"      },
  { icon: Gift,         color: "#f472b6", label: "5 bonus credits on signup",  desc: "Extra credits because a friend referred you" },
]

export default function ReferralLanding({
  code,
  referrerName,
}: {
  code: string
  referrerName: string | null
}) {
  const router = useRouter()

  const handleSignUp = () => {
    document.cookie = `postpilot_ref=${code}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
    router.push(`/login?ref=${code}`)
  }

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(247,190,77,0.08) 0%, transparent 60%)" }} />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, rgba(129,140,248,0.15), transparent 70%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-15"
        style={{ background: "radial-gradient(circle, rgba(244,114,182,0.12), transparent 70%)" }} />
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="relative w-full max-w-lg">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
          className="flex items-center justify-center gap-2.5 mb-10"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F7BE4D] flex items-center justify-center"
            style={{ boxShadow: "0 0 28px rgba(247,190,77,0.45)" }}>
            <Zap className="w-5 h-5 text-[#050816]" fill="currentColor" strokeWidth={0} />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">PostPilot AI</span>
        </motion.div>

        {/* Invite card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl p-8 mb-6 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #0d1526, #080c1a)",
            border: "1px solid rgba(247,190,77,0.18)",
            boxShadow: "0 0 60px rgba(247,190,77,0.05), 0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(105deg, transparent 40%, rgba(247,190,77,0.03) 50%, transparent 60%)" }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
          />

          <div className="relative">
            {/* Gift badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 350 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{ background: "rgba(247,190,77,0.1)", border: "1px solid rgba(247,190,77,0.25)" }}
            >
              <motion.span
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.6, delay: 0.8, repeat: Infinity, repeatDelay: 4 }}
              >
                🎁
              </motion.span>
              <span className="text-xs font-bold text-[#F7BE4D] tracking-wide uppercase">
                You&apos;ve been invited
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight tracking-tight">
              {referrerName ? (
                <>
                  <span
                    style={{
                      background: "linear-gradient(135deg, #F7BE4D, #ffd97d)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {referrerName}
                  </span>{" "}
                  invited you to
                </>
              ) : (
                "You&apos;re invited to"
              )}{" "}
              PostPilot AI
            </h1>

            <p className="text-slate-400 text-[15px] mb-8 max-w-sm mx-auto leading-relaxed">
              The AI-powered content engine that turns one idea into 30 days of posts —
              for Instagram, LinkedIn, Twitter, and more.
            </p>

            {/* CTA button */}
            <motion.button
              onClick={handleSignUp}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #F7BE4D 0%, #ffd97d 100%)",
                color: "#050816",
                boxShadow: "0 0 32px rgba(247,190,77,0.4), 0 4px 20px rgba(247,190,77,0.25)",
              }}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              />
              <Sparkles className="w-4 h-4 relative" />
              <span className="relative">Create free account</span>
              <ArrowRight className="w-4 h-4 relative" />
            </motion.button>

            <p className="text-[11px] text-slate-600 mt-4">
              No credit card required · Free forever plan available
            </p>
          </div>
        </motion.div>

        {/* Perks grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="grid grid-cols-2 gap-3"
        >
          {PERKS.map((perk, i) => (
            <motion.div
              key={perk.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
              className="rounded-2xl p-4"
              style={{
                background: `${perk.color}08`,
                border: `1px solid ${perk.color}18`,
              }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2.5"
                style={{ background: `${perk.color}18` }}>
                <perk.icon className="w-3.5 h-3.5" style={{ color: perk.color }} />
              </div>
              <p className="text-xs font-semibold text-white mb-1 leading-snug">{perk.label}</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">{perk.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-[11px] text-slate-700 mt-8"
        >
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
          >
            Sign in
          </button>
        </motion.p>
      </div>
    </div>
  )
}
