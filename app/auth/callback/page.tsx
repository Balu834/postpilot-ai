"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Zap } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { analytics } from "@/lib/analytics"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/login")
        return
      }

      const userId = session.user.id

      // Upsert user record (handles Google first-time sign-up)
      const { error: upsertError } = await supabase.from("users").upsert(
        { id: userId, email: session.user.email, referral_code: userId.slice(0, 8) },
        { onConflict: "id", ignoreDuplicates: true }
      )
      const isNewUser = !upsertError
      analytics.identify(userId, { email: session.user.email ?? undefined })
      if (isNewUser) analytics.signup("google")
      else analytics.login("google")

      // Track referral if cookie is set
      const refCode = document.cookie.match(/postpilot_ref=([^;]+)/)?.[1]
      if (refCode) {
        fetch("/api/referral/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ referralCode: refCode }),
        }).catch(() => {})
        // Clear cookie
        document.cookie = "postpilot_ref=; path=/; max-age=0"
      }

      // Check if already onboarded via localStorage (fast path)
      if (localStorage.getItem(`postpilot_onboarded_${userId}`)) {
        router.replace("/dashboard")
        return
      }

      // Fallback: check Supabase — existing users with niche set skip onboarding
      const { data: profile } = await supabase
        .from("users")
        .select("niche")
        .eq("id", userId)
        .single()

      if (profile?.niche) {
        localStorage.setItem(`postpilot_onboarded_${userId}`, "true")
        router.replace("/dashboard")
      } else {
        router.replace("/onboarding")
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
