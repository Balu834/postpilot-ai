"use client"

import { useEffect } from "react"
import Crisp from "crisp-sdk-web"

const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID ?? ""

export default function CrispChat() {
  useEffect(() => {
    if (!CRISP_WEBSITE_ID) return
    Crisp.configure(CRISP_WEBSITE_ID)
  }, [])

  return null
}
