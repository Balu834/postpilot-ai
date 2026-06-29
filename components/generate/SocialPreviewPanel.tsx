"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Monitor } from "lucide-react"

type PreviewPlatform = "instagram" | "linkedin" | "twitter" | "threads" | "bluesky" | "pinterest" | "hashtags" | "carousel"

const PLATFORMS: { key: PreviewPlatform; label: string; color: string }[] = [
  { key: "linkedin",  label: "LinkedIn",    color: "#0A66C2" },
  { key: "twitter",   label: "X (Twitter)", color: "#1a1a2e" },
  { key: "instagram", label: "Instagram",   color: "#E1306C" },
  { key: "threads",   label: "Threads",     color: "#1a1a1a" },
]

/* ─── LinkedIn ─────────────────────────────────────────────────────── */
function LinkedInPreview({ text }: { text: string }) {
  const lines = text.split("\n")
  const preview = lines.slice(0, 6).join("\n")
  const truncated = lines.length > 6
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* LinkedIn blue topbar */}
      <div className="h-8 bg-[#0A66C2] flex items-center px-3 gap-2">
        <span className="text-white text-[11px] font-bold tracking-tight">in</span>
        <div className="flex-1 h-5 bg-white/20 rounded-sm flex items-center px-2">
          <span className="text-white/60 text-[10px]">Search</span>
        </div>
      </div>
      <div className="p-4">
        {/* Profile row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 leading-tight">Alex Johnson</p>
                <p className="text-[10px] text-slate-500 leading-tight">Founder & CEO · 1st</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-slate-400">Just now</span>
                  <span className="text-[10px] text-slate-300">·</span>
                  <span className="text-[10px]">🌐</span>
                </div>
              </div>
              <button className="text-[#0A66C2] text-[10px] font-semibold border border-[#0A66C2] px-2.5 py-0.5 rounded-full flex-shrink-0">
                + Follow
              </button>
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap mb-3 max-h-48 overflow-hidden relative">
          {preview}
          {truncated && (
            <>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
              <span className="text-[#0A66C2] text-[11px] font-medium cursor-pointer absolute bottom-0 right-0 bg-white pl-1">…more</span>
            </>
          )}
        </div>
        {/* Reactions */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1">
            <span className="text-sm">👍❤️💡</span>
            <span>847</span>
          </div>
          <div className="flex items-center gap-2">
            <span>123 comments</span>
            <span>·</span>
            <span>48 reposts</span>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex items-center justify-around pt-2">
          {[["👍", "Like"], ["💬", "Comment"], ["🔁", "Repost"], ["📤", "Send"]].map(([icon, label]) => (
            <button key={label} className="flex items-center gap-1 text-[10px] text-slate-500 px-2 py-1.5 rounded hover:bg-slate-50 transition-colors font-medium">
              <span className="text-sm">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Twitter/X ────────────────────────────────────────────────────── */
function TwitterPreview({ text }: { text: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            𝕏
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-xs font-bold text-slate-900">Your Name</span>
              <span className="text-[10px] text-slate-400">@yourhandle</span>
              <span className="text-[10px] text-slate-300">·</span>
              <span className="text-[10px] text-slate-400">just now</span>
            </div>
            <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap mb-3 max-h-40 overflow-hidden">
              {text}
            </div>
            {/* Engagement row */}
            <div className="flex items-center gap-4 text-[10px] text-slate-400">
              <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                14
              </span>
              <span className="flex items-center gap-1 hover:text-green-500 cursor-pointer transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                82
              </span>
              <span className="flex items-center gap-1 hover:text-red-500 cursor-pointer transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                847
              </span>
              <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                12.4K
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Instagram ────────────────────────────────────────────────────── */
function InstagramPreview({ text }: { text: string }) {
  const [hashtags, mainText] = (() => {
    const parts = text.split("\n\n")
    const last = parts[parts.length - 1]
    const isHashtags = last && last.includes("#")
    return isHashtags ? [last, parts.slice(0, -1).join("\n\n")] : ["", text]
  })()
  const preview = mainText.slice(0, 120)
  const truncated = mainText.length > 120

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full p-0.5" style={{ background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <span className="text-[10px] font-bold text-slate-900">A</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900 leading-tight">your_name</p>
            <p className="text-[10px] text-slate-400">Just now</p>
          </div>
        </div>
        <span className="text-slate-400 text-sm">⋯</span>
      </div>
      {/* Image placeholder */}
      <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-2" style={{ maxHeight: 160 }}>
        <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
          <span className="text-lg">📷</span>
        </div>
        <span className="text-[10px] text-slate-400">Your photo here</span>
      </div>
      {/* Actions */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-base cursor-pointer hover:scale-110 transition-transform">🤍</span>
            <span className="text-base cursor-pointer hover:scale-110 transition-transform">💬</span>
            <span className="text-base cursor-pointer hover:scale-110 transition-transform">📤</span>
          </div>
          <span className="text-base cursor-pointer">🔖</span>
        </div>
        <p className="text-[11px] font-semibold text-slate-900 mb-1">847 likes</p>
        <div className="text-[11px] text-slate-700 leading-relaxed">
          <span className="font-semibold">your_name</span>{" "}
          <span className="whitespace-pre-wrap">{preview}</span>
          {truncated && <span className="text-slate-400 cursor-pointer"> more</span>}
        </div>
        {hashtags && (
          <p className="text-[11px] text-blue-500 mt-1 leading-relaxed line-clamp-2">{hashtags}</p>
        )}
        <p className="text-[10px] text-slate-400 mt-1">View all 23 comments</p>
      </div>
    </div>
  )
}

/* ─── Threads ──────────────────────────────────────────────────────── */
function ThreadsPreview({ text }: { text: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              A
            </div>
            <div className="w-px flex-1 bg-slate-200 mt-2 min-h-[20px]" />
          </div>
          <div className="flex-1 min-w-0 pb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-900">your_name</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">just now</span>
                <span className="text-slate-300">⋯</span>
              </div>
            </div>
            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap max-h-32 overflow-hidden">
              {text}
            </div>
            <div className="flex items-center gap-4 mt-3 text-slate-400">
              {["🤍", "💬", "🔁", "✈️"].map((icon, i) => (
                <span key={i} className="text-sm cursor-pointer hover:scale-110 transition-transform">{icon}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 pl-12">14 replies · 82 reposts · 847 likes</div>
      </div>
    </div>
  )
}

/* ─── Main component ───────────────────────────────────────────────── */
export default function SocialPreviewPanel({
  platform,
  content,
}: {
  platform: PreviewPlatform
  content: string
}) {
  const [activePlatform, setActivePlatform] = useState<PreviewPlatform>(
    PLATFORMS.find(p => p.key === platform)?.key ?? "linkedin"
  )

  const currentPlatform = activePlatform

  const empty = !content || content.trim().length < 5

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Platform selector */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100">
        {PLATFORMS.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePlatform(p.key)}
            className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-all duration-150"
            style={{
              background: currentPlatform === p.key ? "#fff" : "transparent",
              color: currentPlatform === p.key ? p.color : "#64748b",
              boxShadow: currentPlatform === p.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Preview label */}
      <div className="flex items-center gap-2">
        <Monitor className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[11px] text-slate-500 font-medium">Live Preview</span>
        <div className="flex-1 h-px bg-slate-100" />
        <div className="flex items-center gap-1">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
          />
          <span className="text-[10px] text-emerald-600 font-medium">Live</span>
        </div>
      </div>

      {/* Preview card */}
      <div className="flex-1 overflow-y-auto">
        {empty ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-400">Generate content to see the live preview</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPlatform}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {currentPlatform === "linkedin"  && <LinkedInPreview  text={content} />}
              {currentPlatform === "twitter"   && <TwitterPreview   text={content} />}
              {currentPlatform === "instagram" && <InstagramPreview text={content} />}
              {currentPlatform === "threads"   && <ThreadsPreview   text={content} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
        Preview is for reference only. Actual appearance may vary by platform.
      </p>
    </div>
  )
}
