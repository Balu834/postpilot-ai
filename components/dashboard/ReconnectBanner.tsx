"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AlertTriangle, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

const PLATFORM_LABELS: Record<string, string> = {
  twitter:   "Twitter / X",
  bluesky:   "Bluesky",
  threads:   "Threads",
  linkedin:  "LinkedIn",
  instagram: "Instagram",
  facebook:  "Facebook",
  pinterest: "Pinterest",
  youtube:   "YouTube",
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() < Date.now()
}

export default function ReconnectBanner() {
  const pathname = usePathname()
  const [expiredPlatforms, setExpiredPlatforms] = useState<string[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return

      const { data } = await supabase
        .from("social_accounts")
        .select("platform, expires_at")
        .eq("user_id", user.id)

      if (cancelled) return

      const expired = (data ?? [])
        .filter(a => isExpired(a.expires_at))
        .map(a => a.platform)
        .sort()

      setExpiredPlatforms(expired)

      if (expired.length > 0) {
        const dismissedKey = sessionStorage.getItem("reconnect_banner_dismissed")
        setDismissed(dismissedKey === expired.join(","))
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  if (pathname === "/settings" || expiredPlatforms.length === 0 || dismissed) return null

  const labels = expiredPlatforms.map(p => PLATFORM_LABELS[p] ?? p).join(", ")

  return (
    <div
      className="flex items-center gap-3 px-4 md:px-6 py-2.5 text-xs md:text-sm"
      style={{ background: "rgba(239,68,68,0.08)", borderBottom: "1px solid rgba(239,68,68,0.2)" }}
    >
      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
      <p className="flex-1 text-red-700 font-medium">
        {labels} needs reconnecting — scheduled posts to {expiredPlatforms.length > 1 ? "them" : "it"} won&apos;t publish until you do.{" "}
        <a href="/settings" className="underline hover:no-underline">Reconnect →</a>
      </p>
      <button
        onClick={() => {
          sessionStorage.setItem("reconnect_banner_dismissed", expiredPlatforms.join(","))
          setDismissed(true)
        }}
        className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
