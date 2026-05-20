"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import posthog from "posthog-js"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
    })
  }, [])

  return <>{children}</>
}

export function PostHogPageView() {
  const pathname = usePathname()
  useEffect(() => {
    if (typeof window === "undefined") return
    try { posthog.capture("$pageview", { $current_url: window.location.href }) } catch {}
  }, [pathname])
  return null
}
