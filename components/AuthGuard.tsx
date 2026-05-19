"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Zap } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace("/login")
        return
      }

      const userId = session.user.id

      // 1. Fast path — localStorage already set
      if (localStorage.getItem(`postpilot_onboarded_${userId}`)) {
        setChecking(false)
        return
      }

      // 2. Fallback — check Supabase in case user completed onboarding
      //    on a different device or localStorage was cleared
      const { data: profile } = await supabase
        .from("users")
        .select("niche")
        .eq("id", userId)
        .single()

      if (profile?.niche) {
        // They've completed onboarding — set the flag and proceed
        localStorage.setItem(`postpilot_onboarded_${userId}`, "true")
        setChecking(false)
        return
      }

      // 3. Not onboarded yet — send to onboarding
      if (pathname !== "/onboarding") {
        router.replace("/onboarding")
        return
      }

      setChecking(false)
    }

    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.replace("/login")
    })

    return () => subscription.unsubscribe()
  }, [router, pathname])

  if (checking) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-8 h-8 rounded-lg bg-[#F7BE4D] flex items-center justify-center animate-pulse">
            <Zap className="w-4 h-4 text-[#050816]" fill="currentColor" />
          </div>
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
