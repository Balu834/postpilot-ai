"use client"

import { useEffect, useState } from "react"
import { SidebarProvider, useSidebar } from "@/lib/sidebar-context"
import Sidebar from "./Sidebar"
import Header from "./Header"

function ContentArea({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <div
      className="flex-1 min-w-0 flex flex-col min-h-screen"
      style={{
        marginLeft: isDesktop ? (collapsed ? 60 : 240) : 0,
        transition: "margin-left 0.22s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <Header />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex" style={{ background: "#f8fafc" }}>
        <Sidebar />
        <ContentArea>{children}</ContentArea>
      </div>
    </SidebarProvider>
  )
}
