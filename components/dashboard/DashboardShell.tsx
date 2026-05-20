"use client"

import { SidebarProvider } from "@/lib/sidebar-context"
import Sidebar from "./Sidebar"
import Header from "./Header"

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#050816] flex">
        <Sidebar />
        <div className="flex-1 min-w-0 md:ml-60 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
