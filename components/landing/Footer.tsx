import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 py-12 px-6" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.svg" alt="PostPilot AI" className="h-7 w-auto" />
          <span className="font-bold text-slate-900">PostPilot</span>
          <span className="text-[#d97706] font-bold">AI</span>
        </Link>

        <div className="flex items-center gap-6 text-sm text-slate-500">
          <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
          <Link href="/terms"   className="hover:text-slate-900 transition-colors">Terms</Link>
          <a href="#"           className="hover:text-slate-900 transition-colors">Blog</a>
          <a href="https://twitter.com" className="hover:text-slate-900 transition-colors">Twitter</a>
        </div>

        <p className="text-xs text-slate-400">© 2026 PostPilot AI. All rights reserved.</p>
      </div>
    </footer>
  )
}
