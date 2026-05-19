import Link from "next/link"
import { Zap } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center text-center px-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(247,190,77,0.06) 0%, transparent 100%)",
        }}
      />

      <div className="relative">
        <div
          className="w-14 h-14 rounded-2xl bg-[#F7BE4D] flex items-center justify-center mx-auto mb-6"
          style={{ boxShadow: "0 0 32px rgba(247,190,77,0.35)" }}
        >
          <Zap className="w-7 h-7 text-[#050816]" fill="currentColor" strokeWidth={0} />
        </div>

        <p className="text-7xl font-black text-white mb-2" style={{ letterSpacing: "-2px" }}>
          404
        </p>
        <h1 className="text-xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-sm text-slate-500 mb-8 max-w-xs">
          This page doesn&apos;t exist. Let&apos;s get you back to generating content.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: "linear-gradient(135deg, #F7BE4D, #ffd166)",
              color: "#050816",
              boxShadow: "0 4px 16px rgba(247,190,77,0.3)",
            }}
          >
            Go to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
