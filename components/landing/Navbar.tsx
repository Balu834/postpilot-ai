"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [user, setUser] = useState<{ email?: string; avatar?: string } | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser({ email: session.user.email ?? undefined, avatar: session.user.user_metadata?.avatar_url })
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) setUser({ email: session.user.email ?? undefined, avatar: session.user.user_metadata?.avatar_url })
      else setUser(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm py-3"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.svg" alt="PostPilot AI" className="h-9 w-auto" />
          <span className="font-extrabold text-lg text-slate-900 tracking-tight">PostPilot</span>
          <span className="font-extrabold text-lg text-[#d97706] tracking-tight">AI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Demo", "Pricing", "FAQ"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}
              className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Dashboard</span>
              <div className="w-8 h-8 rounded-full bg-[#F7BE4D] flex items-center justify-center glow-yellow-sm overflow-hidden flex-shrink-0">
                {user.avatar
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-[#050816] font-bold text-sm">{(user.email?.[0] ?? "U").toUpperCase()}</span>
                }
              </div>
            </Link>
          ) : (
            <>
              <Link href="/login"
                className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all font-medium">
                Sign in
              </Link>
              <Link href="/login"
                className="text-sm font-bold bg-[#F7BE4D] text-[#050816] px-4 py-2 rounded-lg hover:bg-[#ffd166] transition-all glow-yellow-sm">
                Start free →
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button suppressHydrationWarning
          className="md:hidden text-slate-700 hover:text-slate-900"
          onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {["Features", "Demo", "Pricing", "FAQ"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`}
                  className="text-sm text-slate-700 font-medium"
                  onClick={() => setMenuOpen(false)}>
                  {item}
                </a>
              ))}
              <Link href={user ? "/dashboard" : "/login"}
                className="text-sm font-bold bg-[#F7BE4D] text-[#050816] px-4 py-2.5 rounded-lg text-center">
                {user ? "Dashboard →" : "Start free →"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
