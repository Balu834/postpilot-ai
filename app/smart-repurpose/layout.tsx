import AuthGuard from "@/components/AuthGuard"
import DashboardShell from "@/components/dashboard/DashboardShell"
export default function SmartRepurposeLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard><DashboardShell>{children}</DashboardShell></AuthGuard>
}
