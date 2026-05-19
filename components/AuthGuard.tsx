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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login")
        return
      }

      const userId   = session.user.id
      const onboarded = localStorage.getItem(`postpilot_onboarded_${userId}`)

      if (!onboarded && pathname !== "/onboarding") {
        router.replace("/onboarding")
        return
      }

      setChecking(false)
    })

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
