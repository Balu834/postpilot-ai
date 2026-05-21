"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Menu, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string; avatar?: string } | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser({
        email: session.user.email ?? undefined,
        avatar: session.user.user_metadata?.avatar_url,
      })
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) setUser({
        email: session.user.email ?? undefined,
        avatar: session.user.user_metadata?.avatar_url,
      })
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
        scrolled ? "glass border-b border-white/5 py-3" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#F7BE4D] flex items-center justify-center glow-yellow-sm">
            <Zap className="w-4 h-4 text-[#050816]" fill="currentColor" />
          </div>
          <span className="font-bold text-lg text-white">PostPilot</span>
          <span className="text-[#F7BE4D] font-bold text-lg">AI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Demo", "Pricing", "FAQ"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Dashboard</span>
              <div className="w-8 h-8 rounded-full bg-[#F7BE4D] flex items-center justify-center glow-yellow-sm overflow-hidden flex-shrink-0">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#050816] font-bold text-sm">
                    {(user.email?.[0] ?? "U").toUpperCase()}
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium bg-[#F7BE4D] text-[#050816] px-4 py-2 rounded-lg hover:bg-[#ffd166] transition-all glow-yellow-sm"
              >
                Start free →
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-slate-300 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
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
            className="md:hidden glass border-t border-white/5"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {["Features", "Demo", "Pricing", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm text-slate-400"
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <Link
                href={user ? "/dashboard" : "/login"}
                className="text-sm font-medium bg-[#F7BE4D] text-[#050816] px-4 py-2 rounded-lg text-center flex items-center justify-center gap-2"
              >
                {user ? (
                  <>
                    <span>Dashboard →</span>
                    <div className="w-6 h-6 rounded-full bg-[#050816]/20 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#050816] font-bold text-xs">{(user.email?.[0] ?? "U").toUpperCase()}</span>
                      )}
                    </div>
                  </>
                ) : "Start free →"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
