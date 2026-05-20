"use client"

import { usePathname, useRouter } from "next/navigation"
import { Bell, Search, Menu, CheckCircle2, AlertCircle, Zap, X } from "lucide-react"
import { useSidebar } from "@/lib/sidebar-context"
import { supabase } from "@/lib/supabase"
import { useState, useEffect, useRef, useCallback } from "react"

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

type Notification = {
  id: string
  type: "published" | "failed" | "generated"
  title: string
  body: string
  time: string
}

type SearchResult = {
  id: string
  type: "generation" | "post"
  title: string
  subtitle: string
  href: string
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)  return "just now"
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function Header() {
  const pathname = usePathname()
  const router   = useRouter()
  const { toggle } = useSidebar()
  const meta = pageMeta[pathname] ?? { title: "PostPilot AI", subtitle: "" }

  // ── Notifications ──────────────────────────────────────────────
  const [notifOpen, setNotifOpen]       = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifLoaded, setNotifLoaded]   = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (res.ok) {
      const json = await res.json()
      setNotifications(json.notifications ?? [])
    }
    setNotifLoaded(true)
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // ── Search ─────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]   = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchOpen, setSearchOpen]     = useState(false)
  const [searching, setSearching]       = useState(false)
  const searchRef  = useRef<HTMLDivElement>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleSearchChange = (q: string) => {
    setSearchQuery(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (q.length < 2) { setSearchResults([]); setSearchOpen(false); return }

    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setSearching(false); return }
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const json = await res.json()
        setSearchResults(json.results ?? [])
        setSearchOpen(true)
      }
      setSearching(false)
    }, 350)
  }

  const hasUnread = notifications.length > 0

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3.5
        border-b border-white/[0.05]"
      style={{ background: "rgba(8, 12, 26, 0.85)", backdropFilter: "blur(20px)" }}
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
        {/* Search */}
        <div ref={searchRef} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
            placeholder="Search posts, generations..."
            className="input-premium pl-9 pr-4 py-2 text-xs w-52 rounded-xl"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#F7BE4D]/40 border-t-[#F7BE4D] rounded-full animate-spin" />
          )}

          {/* Search dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 left-0 w-72 rounded-xl overflow-hidden shadow-2xl z-50"
              style={{ background: "#0d1526", border: "1px solid rgba(255,255,255,0.08)" }}>
              {searchResults.map(r => (
                <button
                  key={r.id}
                  onClick={() => { router.push(r.href); setSearchOpen(false); setSearchQuery("") }}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left border-b border-white/[0.04] last:border-0"
                >
                  <span className="mt-0.5 text-base">{r.type === "generation" ? "⚡" : "📅"}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-white font-medium truncate">{r.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{r.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {searchOpen && searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
            <div className="absolute top-full mt-2 left-0 w-72 rounded-xl px-4 py-5 text-center text-xs text-slate-500 shadow-2xl z-50"
              style={{ background: "#0d1526", border: "1px solid rgba(255,255,255,0.08)" }}>
              No results for "{searchQuery}"
            </div>
          )}
        </div>

        {/* Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative w-8 h-8 rounded-xl flex items-center justify-center
              transition-all hover:bg-white/[0.06]"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <Bell className="w-3.5 h-3.5 text-slate-500" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F7BE4D]" />
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 rounded-xl overflow-hidden shadow-2xl z-50"
              style={{ background: "#0d1526", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <span className="text-xs font-semibold text-white">Notifications</span>
                <button onClick={() => setNotifOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {!notifLoaded ? (
                <div className="px-4 py-8 text-center text-xs text-slate-500">Loading…</div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No notifications yet</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors">
                      <span className="mt-0.5 flex-shrink-0">
                        {n.type === "published" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {n.type === "failed"    && <AlertCircle  className="w-4 h-4 text-red-400" />}
                        {n.type === "generated" && <Zap          className="w-4 h-4 text-[#F7BE4D]" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-white">{n.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{n.body}</p>
                        <p className="text-[10px] text-slate-600 mt-1">{timeAgo(n.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
