"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Wand2, CalendarClock, BarChart3,
  Settings, Zap, LogOut, History, Repeat2, FolderOpen,
  LayoutTemplate,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import UpgradeModal from "@/components/UpgradeModal"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",    href: "/dashboard" },
  { icon: Wand2,           label: "Generate",     href: "/generate"  },
  { icon: Repeat2,         label: "Blog → Posts", href: "/repurpose", badge: "HOT" },
  { icon: LayoutTemplate,  label: "Templates",    href: "/templates" },
  { icon: FolderOpen,      label: "Workspace",    href: "/workspace" },
  { icon: CalendarClock,   label: "Schedule",     href: "/schedule"  },
  { icon: History,         label: "History",      href: "/history"   },
  { icon: BarChart3,       label: "Analytics",    href: "/analytics" },
  { icon: Settings,        label: "Settings",     href: "/settings"  },
]

const FREE_LIMIT = 10

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [email,       setEmail]       = useState("")
  const [initials,    setInitials]    = useState("U")
  const [credits,     setCredits]     = useState<number | null>(null)
  const [planName,    setPlanName]    = useState("free")
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user?.email) return
      setEmail(user.email)
      setInitials(user.email[0].toUpperCase())

      Promise.all([
        supabase.from("generations").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("users").select("plan_name").eq("id", user.id).single(),
      ]).then(([genRes, planRes]) => {
        setCredits(genRes.count ?? 0)
        setPlanName(planRes.data?.plan_name ?? "free")
      })
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  const isPro     = planName !== "free"
  const planLabel = isPro ? `${planName.charAt(0).toUpperCase()}${planName.slice(1)} Plan` : "Free Plan"
  const usedPct    = credits !== null ? Math.min((credits / FREE_LIMIT) * 100, 100) : 0
  const remaining  = credits !== null ? Math.max(FREE_LIMIT - credits, 0) : null
  const nearLimit  = credits !== null && credits >= FREE_LIMIT - 2

  return (
    <>
    <aside
      className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40"
      style={{
        background: "rgba(8, 12, 26, 0.92)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#F7BE4D] flex items-center justify-center glow-logo">
              <Zap className="w-5 h-5 text-[#050816]" fill="currentColor" strokeWidth={0} />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400
              border-2 border-[#080c1a]" />
          </div>
          <div className="leading-none">
            <div className="text-sm font-bold tracking-tight">
              <span className="text-white">PostPilot</span>
              <span className="text-[#F7BE4D]">AI</span>
            </div>
            <div className="text-[10px] text-slate-600 mt-0.5 font-medium">AI Content OS</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 3 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-[13px] font-medium transition-all duration-200 group ${
                  isActive
                    ? "nav-active"
                    : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navBar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5
                      rounded-full bg-[#F7BE4D]"
                    style={{ boxShadow: "0 0 8px rgba(247,190,77,0.6)" }}
                  />
                )}

                <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? "text-[#F7BE4D]" : "group-hover:text-slate-300"
                }`} />
                <span className="flex-1">{item.label}</span>

                {item.badge && !isActive && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full
                    bg-[#F7BE4D]/15 text-[#F7BE4D] border border-[#F7BE4D]/20 leading-none">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-2">

        {/* Credit meter */}
        <div className="rounded-xl px-3.5 py-3 border"
          style={{
            background: nearLimit
              ? "rgba(248,113,113,0.06)"
              : "rgba(255,255,255,0.02)",
            borderColor: nearLimit
              ? "rgba(248,113,113,0.15)"
              : "rgba(255,255,255,0.06)",
          }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">Free Credits</span>
            <span className={`text-[11px] font-bold tabular-nums ${
              nearLimit ? "text-red-400" : "text-slate-400"
            }`}>
              {credits !== null ? `${credits} / ${FREE_LIMIT}` : "..."}
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${usedPct}%`,
                background: nearLimit
                  ? "linear-gradient(90deg, #f87171, #ef4444)"
                  : "linear-gradient(90deg, #F7BE4D, #ffd166)",
              }}
            />
          </div>
          <p className="text-[10px] text-slate-600">
            {remaining !== null
              ? nearLimit
                ? remaining === 0 ? "Limit reached — upgrade for unlimited" : `${remaining} left — upgrade soon`
                : `${remaining} generations remaining`
              : "Loading..."}
          </p>
        </div>

        {/* Upgrade card — free users only */}
        {!isPro && (
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl p-3.5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(247,190,77,0.12) 0%, rgba(247,190,77,0.04) 100%)",
              border: "1px solid rgba(247,190,77,0.2)",
            }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#F7BE4D]/10 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Zap className="w-3.5 h-3.5 text-[#F7BE4D]" fill="currentColor" strokeWidth={0} />
                <span className="text-xs font-bold text-white">Upgrade to Pro</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                Unlimited generations, workspace & analytics.
              </p>
              <button onClick={() => setUpgradeOpen(true)} className="btn-primary w-full text-xs py-2 rounded-lg">
                Upgrade →
              </button>
            </div>
          </motion.div>
        )}

        {/* User row */}
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl
          hover:bg-white/[0.04] transition-colors group cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F7BE4D] to-[#f0a800]
            flex items-center justify-center flex-shrink-0
            text-[#050816] text-xs font-bold glow-yellow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-white truncate">{planLabel}</p>
            <p className="text-[10px] text-slate-600 truncate">{email || "Loading..."}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-600
              hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
    <UpgradeModal
      open={upgradeOpen}
      onClose={() => setUpgradeOpen(false)}
      onSuccess={(plan) => { setPlanName(plan); setCredits(0) }}
    />
    </>
  )
}
