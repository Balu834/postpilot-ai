"use client"

import { usePathname } from "next/navigation"
import { Bell, Search, Menu } from "lucide-react"
import { useSidebar } from "@/lib/sidebar-context"

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/dashboard":  { title: "Dashboard",        subtitle: "Welcome back — let's create something great"         },
  "/generate":   { title: "Generate",         subtitle: "Turn your ideas into platform-ready posts"            },
  "/repurpose":  { title: "Blog → 24 Posts",  subtitle: "Paste any content — get a full cross-platform pack"  },
  "/templates":  { title: "Templates",        subtitle: "12 proven content frameworks — click and generate"    },
  "/workspace":  { title: "Workspace",        subtitle: "Organize your content into campaigns"                 },
  "/schedule":   { title: "Schedule",         subtitle: "Plan and manage your content calendar"                },
  "/history":    { title: "History",          subtitle: "All your AI generations in one place"                 },
  "/analytics":  { title: "Analytics",        subtitle: "Track performance across all platforms"               },
  "/settings":    { title: "Settings",         subtitle: "Manage your account and preferences"                  },
  "/brand-voice": { title: "Brand Voice",      subtitle: "Train your AI to write in your unique voice"           },
}

export default function Header() {
  const pathname = usePathname()
  const { toggle } = useSidebar()
  const meta = pageMeta[pathname] ?? { title: "PostPilot AI", subtitle: "" }

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3.5
        border-b border-white/[0.05]"
      style={{
        background: "rgba(8, 12, 26, 0.85)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center
            text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all flex-shrink-0"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <Menu className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-white leading-tight">{meta.title}</h1>
          <p className="text-[11px] text-slate-600 mt-0.5 hidden sm:block">{meta.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
          <input
            placeholder="Search..."
            className="input-premium pl-9 pr-4 py-2 text-xs w-44 rounded-xl"
          />
        </div>

        <button
          className="relative w-8 h-8 rounded-xl flex items-center justify-center
            transition-all hover:bg-white/[0.06]"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <Bell className="w-3.5 h-3.5 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full
            bg-[#F7BE4D] glow-yellow-sm" />
        </button>
      </div>
    </header>
  )
}
