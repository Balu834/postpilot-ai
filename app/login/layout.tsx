export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#ffffff" }}>
      {children}
    </div>
  )
}
