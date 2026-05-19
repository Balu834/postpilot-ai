import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"
import AuthGuard from "@/components/AuthGuard"

export default function RepurposeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#050816] flex">
        <Sidebar />
        <div className="flex-1 ml-60 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
