"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface SidebarCtx {
  open: boolean
  toggle: () => void
  close: () => void
  collapsed: boolean
  toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarCtx>({
  open: false, toggle: () => {}, close: () => {},
  collapsed: false, toggleCollapsed: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem("sidebar_collapsed") === "1") setCollapsed(true)
    } catch {}
  }, [])

  const toggleCollapsed = () => {
    setCollapsed(v => {
      const next = !v
      try { localStorage.setItem("sidebar_collapsed", next ? "1" : "0") } catch {}
      return next
    })
  }

  return (
    <SidebarContext.Provider value={{
      open, toggle: () => setOpen(v => !v), close: () => setOpen(false),
      collapsed, toggleCollapsed,
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
