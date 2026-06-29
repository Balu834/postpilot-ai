"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Wand2, CalendarClock, BarChart3,
  Settings, Zap, LogOut, History, Repeat2, FolderOpen,
  LayoutTemplate, Mic2, Inbox, Link2, Hash, Rss,
  Gauge, Globe, Lightbulb, ImageIcon,
  Layers, GitBranch, FileSpreadsheet, UserCircle,
  Camera, MessageSquare, RefreshCw, TrendingUp, FileBarChart, FileEdit, CalendarDays, Eye, Users,
  Brain, Target, Wand,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import UpgradeModal from "@/components/UpgradeModal"
import { useSidebar } from "@/lib/sidebar-context"

// ─── Nav grouped into sections ───────────────────────────────────
type NavItem = { icon: React.ElementType; label: string; href: string; badge?: string }
type NavSection = { label?: string; items: NavItem[] }

const navSections: NavSection[] = [
  {
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    label: "Generate",
    items: [
      { icon: Wand2,         label: "Generate",      href: "/generate"  },
      { icon: ImageIcon,     label: "AI Images",     href: "/images",   badge: "NEW" },
      { icon: Camera,        label: "Image Caption", href: "/caption"   },
      { icon: Layers,        label: "Carousel",      href: "/carousel"  },
      { icon: GitBranch,     label: "A/B Variants",  href: "/variants"  },
      { icon: MessageSquare, label: "Reply AI",       href: "/replies"   },
      { icon: RefreshCw,     label: "Recycle Post",  href: "/recycle"   },
      { icon: TrendingUp,    label: "Trending",      href: "/trending"  },
    ],
  },
  {
    label: "Transform",
    items: [
      { icon: Mic2,           label: "Brand Voice",     href: "/brand-voice",    badge: "NEW" },
      { icon: Repeat2,        label: "Blog → Posts",    href: "/repurpose",      badge: "HOT" },
      { icon: Wand,           label: "Smart Repurpose", href: "/smart-repurpose", badge: "AI" },
      { icon: Brain,          label: "Content Brain",   href: "/brain",           badge: "NEW" },
      { icon: Rss,            label: "RSS Import",      href: "/rss"              },
      { icon: LayoutTemplate, label: "Templates",       href: "/templates"        },
    ],
  },
  {
    label: "Plan",
    items: [
      { icon: Target,        label: "Campaigns", href: "/campaign", badge: "NEW" },
      { icon: CalendarClock, label: "Schedule",  href: "/schedule"  },
      { icon: CalendarDays,  label: "Calendar",  href: "/calendar"  },
      { icon: FileEdit,      label: "Drafts",    href: "/drafts"    },
      { icon: FolderOpen,    label: "Workspace", href: "/workspace" },
    ],
  },
  {
    label: "Analyze",
    items: [
      { icon: BarChart3,  label: "Analytics",     href: "/analytics"   },
      { icon: Gauge,      label: "Post Scorer",   href: "/score",   badge: "AI" },
      { icon: Lightbulb,  label: "Content Ideas", href: "/ideas"       },
      { icon: Hash,       label: "Hashtags",      href: "/hashtags"    },
      { icon: History,    label: "History",       href: "/history"     },
      { icon: Eye,        label: "Post Preview",  href: "/preview"     },
    ],
  },
  {
    label: "Publish",
    items: [
      { icon: Inbox,           label: "Inbox",         href: "/inbox"        },
      { icon: Link2,           label: "Link in Bio",   href: "/link-in-bio"  },
      { icon: Globe,           label: "UTM Builder",   href: "/utm"          },
      { icon: UserCircle,      label: "Bio Generator", href: "/bio-generator" },
      { icon: FileSpreadsheet, label: "Bulk Schedule", href: "/bulk"         },
      { icon: Users,           label: "Team",          href: "/team", badge: "Agency" },
      { icon: FileBarChart,    label: "Reports",       href: "/reports"      },
    ],
  },
  {
    items: [
      { icon: Settings, label: "Settings", href: "/settings" },
    ],
  },
]

const FREE_LIMIT = 10

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { open, close } = useSidebar()
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
  const usedPct   = credits !== null ? Math.min((credits / FREE_LIMIT) * 100, 100) : 0
  const remaining = credits !== null ? Math.max(FREE_LIMIT - credits, 0) : null
  const nearLimit = credits !== null && credits >= FREE_LIMIT - 2

  return (
    <>
    {/* Mobile overlay */}
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
        />
      )}
    </AnimatePresence>

    <aside
      className={`fixed left-0 top-0 h-screen w-60 flex flex-col z-40 transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      style={{
        background: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        boxShadow: "2px 0 16px rgba(0,0,0,0.06)",
      }}
    >
      {/* Brand mark */}
      <div className="px-4 pt-5 pb-3 flex items-center gap-2.5 border-b border-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-icon.svg" alt="PostPilot AI" className="h-7 w-auto flex-shrink-0" />
        <span className="text-sm font-extrabold text-slate-900 tracking-tight">
          PostPilot <span style={{ color: "#d97706" }}>AI</span>
        </span>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-2.5 py-2 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-1" : ""}>
            {section.label && (
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400 px-3 pt-3 pb-1.5 select-none">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} onClick={close}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl
                        text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? "nav-active"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navBar"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[#F7BE4D]"
                          style={{ boxShadow: "0 0 8px rgba(247,190,77,0.7)" }}
                        />
                      )}
                      <item.icon className={`w-[15px] h-[15px] flex-shrink-0 transition-colors ${
                        isActive ? "text-[#d97706]" : "group-hover:text-slate-700"
                      }`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && !isActive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full
                          bg-[#F7BE4D]/15 text-[#b45309] border border-[#F7BE4D]/30 leading-none flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-2 border-t border-slate-100 pt-3">

        {/* Credit meter */}
        <div className="rounded-xl px-3.5 py-3 border"
          style={{
            background: nearLimit ? "rgba(254,202,202,0.2)" : "#fafafa",
            borderColor: nearLimit ? "rgba(248,113,113,0.3)" : "#e2e8f0",
          }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">Free Credits</span>
            <span className={`text-[11px] font-bold tabular-nums ${nearLimit ? "text-red-500" : "text-slate-600"}`}>
              {credits !== null ? `${credits} / ${FREE_LIMIT}` : "..."}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
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
          <p className="text-[10px] text-slate-400">
            {remaining !== null
              ? nearLimit
                ? remaining === 0 ? "Limit reached — upgrade for unlimited" : `${remaining} left — upgrade soon`
                : `${remaining} generations remaining`
              : "Loading..."}
          </p>
        </div>

        {/* Upgrade card */}
        {!isPro && (
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl p-3.5 relative overflow-hidden cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%)",
              border: "1px solid rgba(247,190,77,0.35)",
              boxShadow: "0 2px 12px rgba(247,190,77,0.15)",
            }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#F7BE4D]/15 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-[#d97706]" fill="currentColor" strokeWidth={0} />
                <span className="text-xs font-bold text-slate-800">Upgrade to Pro</span>
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
          hover:bg-slate-50 transition-colors group cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F7BE4D] to-[#f0a800]
            flex items-center justify-center flex-shrink-0 text-[#050816] text-xs font-bold glow-yellow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-800 truncate">{planLabel}</p>
            <p className="text-[10px] text-slate-400 truncate">{email || "Loading..."}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400
              hover:text-red-500 hover:bg-red-50 transition-all">
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
