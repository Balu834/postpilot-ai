import Link from "next/link"
import { Zap } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F7BE4D] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-[#050816]" fill="currentColor" />
          </div>
          <span className="font-bold text-white">PostPilot</span>
          <span className="text-[#F7BE4D] font-bold">AI</span>
        </Link>

        <div className="flex items-center gap-6 text-sm text-slate-500">
          {["Privacy", "Terms", "Blog", "Twitter"].map((link) => (
            <a key={link} href="#" className="hover:text-white transition-colors">
              {link}
            </a>
          ))}
        </div>

        <p className="text-xs text-slate-600">© 2026 PostPilot AI. All rights reserved.</p>
      </div>
    </footer>
  )
}
