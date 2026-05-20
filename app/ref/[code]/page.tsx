"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Zap } from "lucide-react"

export default function ReferralRedirectPage() {
  const router = useRouter()
  const { code } = useParams<{ code: string }>()

  useEffect(() => {
    if (code) {
      // Store referral code for 30 days
      document.cookie = `postpilot_ref=${code}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
    }
    router.replace("/login?ref=" + (code ?? ""))
  }, [code, router])

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#F7BE4D] flex items-center justify-center animate-pulse"
        style={{ boxShadow: "0 0 24px rgba(247,190,77,0.5)" }}>
        <Zap className="w-5 h-5 text-[#050816]" fill="currentColor" strokeWidth={0} />
      </div>
      <p className="text-sm text-slate-500">Taking you to PostPilot AI…</p>
    </div>
  )
}
