"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Zap } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Upsert user record in case it doesn't exist yet (Google sign-up)
        await supabase.from("users").upsert({
          id: session.user.id,
          email: session.user.email,
        }, { onConflict: "id", ignoreDuplicates: true })

        const onboarded = localStorage.getItem(`postpilot_onboarded_${session.user.id}`)
        router.replace(onboarded ? "/dashboard" : "/onboarding")
      } else {
        router.replace("/login")
      }
    })
  }, [router])

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500">
        <div className="w-8 h-8 rounded-lg bg-[#F7BE4D] flex items-center justify-center animate-pulse">
          <Zap className="w-4 h-4 text-[#050816]" fill="currentColor" />
        </div>
        <span className="text-sm">Signing you in...</span>
      </div>
    </div>
  )
}
