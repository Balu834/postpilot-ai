"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Eye, Heart, MessageCircle, Repeat2, Share2, Bookmark,
  ThumbsUp, Send, Globe, MoreHorizontal, Image as ImageIcon,
} from "lucide-react"

const PLATFORMS = [
  { key: "linkedin",  label: "LinkedIn",    icon: "💼" },
  { key: "twitter",   label: "Twitter / X", icon: "𝕏"  },
  { key: "instagram", label: "Instagram",   icon: "📸" },
  { key: "facebook",  label: "Facebook",    icon: "🤝" },
  { key: "threads",   label: "Threads",     icon: "🧵" },
]

// ── LinkedIn mockup ────────────────────────────────────────────────
function LinkedInPreview({ content, name }: { content: string; name: string }) {
  const [expanded, setExpanded] = useState(false)
  const limit = 180
  const long  = content.length > limit
  const shown = expanded || !long ? content : content.slice(0, limit) + "…"

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: "#1b2a3b", border: "1px solid rgba(255,255,255,0.08)", maxWidth: 520 }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#1e3a5f" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0A66C2]" />
          <span className="text-[10px] font-bold text-[#0A66C2] tracking-wider">LinkedIn</span>
        </div>
        <Globe className="w-3 h-3 text-slate-500" />
      </div>

      <div className="p-4">
        {/* Author row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#004182]
            flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {name[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{name || "Your Name"}</p>
            <p className="text-[11px] text-slate-400">Founder · 2nd</p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <Globe className="w-2.5 h-2.5" /> Just now
            </p>
          </div>
          <MoreHorizontal className="w-4 h-4 text-slate-600" />
        </div>

        {/* Content */}
        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap mb-1">{shown}</p>
        {long && (
          <button onClick={() => setExpanded(!expanded)}
            className="text-[#0A66C2] text-xs font-semibold hover:underline">
            {expanded ? "…show less" : "…see more"}
          </button>
        )}

        {/* Image placeholder */}
        <div className="mt-3 rounded-lg overflow-hidden aspect-video flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.1)" }}>
          <ImageIcon className="w-6 h-6 text-slate-700" />
        </div>

        {/* Reactions bar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex gap-1 text-slate-500">
            <span className="text-base">👍</span>
            <span className="text-base">❤️</span>
            <span className="text-base">💡</span>
            <span className="text-xs ml-1 mt-0.5">247</span>
          </div>
          <span className="text-[11px] text-slate-600">38 comments</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-around mt-2 pt-2 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {[
            [ThumbsUp, "Like"],
            [MessageCircle, "Comment"],
            [Repeat2, "Repost"],
            [Send, "Send"],
          ].map(([Icon, label]) => (
            <button key={String(label)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-[11px] font-medium py-1.5 px-2 rounded-lg hover:bg-white/[0.04]">
              <Icon className="w-4 h-4" />
              {label as string}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Twitter/X mockup ───────────────────────────────────────────────
function TwitterPreview({ content, name }: { content: string; name: string }) {
  const handle = (name || "yourhandle").toLowerCase().replace(/\s+/g, "")
  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: "#15202b", border: "1px solid rgba(255,255,255,0.08)", maxWidth: 520 }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#192734" }}>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-white">𝕏</span>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider">Twitter / X</span>
        </div>
      </div>

      <div className="p-4 flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800
          flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {name[0]?.toUpperCase() ?? "U"}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm font-bold text-white">{name || "Your Name"}</span>
            <span className="text-[11px] text-slate-500">@{handle}</span>
            <span className="text-[11px] text-slate-600">· now</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap mb-3">{content}</p>

          <div className="flex items-center justify-between text-slate-600 max-w-[280px]">
            <button className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition-colors text-xs">
              <MessageCircle className="w-4 h-4" /> 12
            </button>
            <button className="flex items-center gap-1.5 hover:text-[#00ba7c] transition-colors text-xs">
              <Repeat2 className="w-4 h-4" /> 34
            </button>
            <button className="flex items-center gap-1.5 hover:text-pink-400 transition-colors text-xs">
              <Heart className="w-4 h-4" /> 198
            </button>
            <button className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition-colors text-xs">
              <Bookmark className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition-colors text-xs">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Instagram mockup ───────────────────────────────────────────────
function InstagramPreview({ content, name }: { content: string; name: string }) {
  const handle = (name || "yourhandle").toLowerCase().replace(/\s+/g, ".")
  const [expanded, setExpanded] = useState(false)
  const limit = 120
  const long  = content.length > limit
  const shown = expanded || !long ? content : content.slice(0, limit) + "…"

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: "#121212", border: "1px solid rgba(255,255,255,0.08)", maxWidth: 400 }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#1a1a1a" }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black bg-gradient-to-r from-[#E1306C] to-[#833ab4] bg-clip-text text-transparent tracking-wider">Instagram</span>
        </div>
        <MoreHorizontal className="w-4 h-4 text-slate-500" />
      </div>

      {/* Author row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 rounded-full flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #E1306C, #833ab4, #fcaf45)", padding: 2 }}>
          <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center text-xs font-bold text-white">
            {name[0]?.toUpperCase() ?? "U"}
          </div>
        </div>
        <span className="text-sm font-bold text-white">{handle}</span>
        <span className="ml-auto text-[11px] font-semibold text-[#0095f6]">Follow</span>
      </div>

      {/* Image placeholder */}
      <div className="w-full aspect-square flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
        <ImageIcon className="w-12 h-12 text-slate-700" />
      </div>

      {/* Action bar */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-4 mb-2">
          <Heart className="w-6 h-6 text-slate-300 hover:text-red-500 transition-colors cursor-pointer" />
          <MessageCircle className="w-6 h-6 text-slate-300 cursor-pointer" />
          <Send className="w-6 h-6 text-slate-300 cursor-pointer" />
          <Bookmark className="w-6 h-6 text-slate-300 ml-auto cursor-pointer" />
        </div>
        <p className="text-xs font-semibold text-white mb-1">1,247 likes</p>
        <p className="text-xs text-slate-200">
          <span className="font-semibold">{handle}</span>{" "}
          {shown}
          {long && (
            <button onClick={() => setExpanded(!expanded)} className="text-slate-500 ml-1">
              {expanded ? "less" : "more"}
            </button>
          )}
        </p>
      </div>
    </div>
  )
}

// ── Facebook mockup ────────────────────────────────────────────────
function FacebookPreview({ content, name }: { content: string; name: string }) {
  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: "#242526", border: "1px solid rgba(255,255,255,0.08)", maxWidth: 520 }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#18191a" }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#1877F2]" />
          <span className="text-[10px] font-bold text-[#1877F2] tracking-wider">Facebook</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {name[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{name || "Your Name"}</p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              Just now · <Globe className="w-2.5 h-2.5" />
            </p>
          </div>
          <MoreHorizontal className="w-4 h-4 text-slate-600 ml-auto" />
        </div>
        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap mb-3">{content}</p>
        <div className="h-px bg-white/[0.06] mb-2" />
        <div className="flex items-center justify-around">
          {[[ThumbsUp, "Like"], [MessageCircle, "Comment"], [Share2, "Share"]].map(([Icon, label]) => (
            <button key={String(label)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-xs font-medium py-1.5 px-3 rounded-lg hover:bg-white/[0.06]">
              <Icon className="w-4 h-4" />
              {label as string}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Threads mockup ─────────────────────────────────────────────────
function ThreadsPreview({ content, name }: { content: string; name: string }) {
  const handle = (name || "yourhandle").toLowerCase().replace(/\s+/g, "_")
  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: "#101010", border: "1px solid rgba(255,255,255,0.08)", maxWidth: 520 }}>
      <div className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0a0a0a" }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-white tracking-wider">🧵 Threads</span>
        </div>
      </div>
      <div className="p-4 flex gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-500 to-slate-700
            flex items-center justify-center text-white font-bold text-sm">
            {name[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="w-0.5 h-full bg-white/[0.08] rounded-full min-h-[40px]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm font-bold text-white">{handle}</span>
            <span className="text-[11px] text-slate-500">now</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap mb-3">{content}</p>
          <div className="flex items-center gap-4 text-slate-600">
            <button className="hover:text-white transition-colors">
              <Heart className="w-4 h-4" />
            </button>
            <button className="hover:text-white transition-colors">
              <MessageCircle className="w-4 h-4" />
            </button>
            <button className="hover:text-white transition-colors">
              <Repeat2 className="w-4 h-4" />
            </button>
            <button className="hover:text-white transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-600 mt-2">Reply · 47 likes</p>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────
export default function PreviewPage() {
  const [platform, setPlatform] = useState("linkedin")
  const [content,  setContent]  = useState("")
  const [name,     setName]     = useState("")

  const charCount = content.length
  const charLimit: Record<string, number> = {
    linkedin: 3000, twitter: 280, instagram: 2200, facebook: 63206, threads: 500,
  }
  const limit = charLimit[platform] ?? 3000
  const over  = charCount > limit

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center">
          <Eye className="w-4 h-4 text-[#F7BE4D]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Post Preview</h1>
          <p className="text-slate-500 text-xs">See exactly how your post looks before publishing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — editor */}
        <div className="space-y-4">
          {/* Platform picker */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 space-y-4">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Platform</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => (
                  <button key={p.key} onClick={() => setPlatform(p.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                      border transition-all ${
                      platform === p.key
                        ? "bg-[#F7BE4D]/15 border-[#F7BE4D]/30 text-[#F7BE4D]"
                        : "border-white/8 text-slate-500 hover:text-slate-300"
                    }`}>
                    <span>{p.icon}</span>{p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display name */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Your Name / Handle</p>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="input-premium w-full text-sm py-2.5 px-3 rounded-xl"
              />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Post Content</p>
                <span className={`text-[10px] font-mono ${over ? "text-red-400" : "text-slate-600"}`}>
                  {charCount} / {limit}
                </span>
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={`Write your ${PLATFORMS.find(p => p.key === platform)?.label} post here…`}
                rows={8}
                className="input-premium w-full text-sm py-3 px-3 rounded-xl resize-none leading-relaxed"
              />
              {over && (
                <p className="text-red-400 text-[11px] mt-1">
                  {charCount - limit} characters over the limit
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right — preview */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Live Preview</p>
          <AnimatePresence mode="wait">
            <motion.div key={platform}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}>
              {content.trim() === "" ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] py-16 text-center">
                  <Eye className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Start typing to see a live preview</p>
                </div>
              ) : platform === "linkedin" ? (
                <LinkedInPreview content={content} name={name} />
              ) : platform === "twitter" ? (
                <TwitterPreview content={content} name={name} />
              ) : platform === "instagram" ? (
                <InstagramPreview content={content} name={name} />
              ) : platform === "facebook" ? (
                <FacebookPreview content={content} name={name} />
              ) : (
                <ThreadsPreview content={content} name={name} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
