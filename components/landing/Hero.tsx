"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Sparkles, ArrowRight, Play, Check, Star,
  CheckCircle2, TrendingUp, Zap, ChevronDown,
} from "lucide-react"
import { analytics } from "@/lib/analytics"

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────
const TOPIC = "How to grow a SaaS startup"

const AVATARS = [
  { letter: "P", color: "#E1306C" },
  { letter: "R", color: "#0077B5" },
  { letter: "A", color: "#818cf8" },
  { letter: "S", color: "#34d399" },
  { letter: "M", color: "#F7BE4D" },
]

const PROCESSING_STEPS = [
  { label: "Understanding your topic…",   color: "#d97706" },
  { label: "Writing engaging content…",   color: "#6366f1" },
  { label: "Optimizing for each platform…", color: "#059669" },
  { label: "Creating viral hashtags…",    color: "#E1306C" },
  { label: "Designing carousel slides…",  color: "#818cf8" },
]

const PUBLISH_PLATFORMS = [
  { emoji: "💼", name: "LinkedIn",  color: "#0077B5" },
  { emoji: "𝕏",  name: "Twitter",   color: "#1e293b" },
  { emoji: "📸", name: "Instagram", color: "#E1306C" },
  { emoji: "📊", name: "Carousel",  color: "#818cf8" },
]

// ─────────────────────────────────────────────────────────────────
// Shared micro-components
// ─────────────────────────────────────────────────────────────────
function StepLabel({ emoji, label, color }: { emoji: string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 px-0.5">
      <span className="text-sm leading-none flex-shrink-0">{emoji}</span>
      <span
        className="text-[11px] font-black tracking-wide uppercase"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  )
}

function StepArrow() {
  return (
    <div className="flex flex-col items-center py-0.5">
      <div className="w-px h-3 bg-gradient-to-b from-transparent to-slate-200" />
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="w-4 h-4 text-slate-300" />
      </motion.div>
      <div className="w-px h-3 bg-gradient-to-b from-slate-200 to-transparent" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Step 1 — Input card (interactive + auto-play modes)
// ─────────────────────────────────────────────────────────────────
function InputCard({
  value, typed, isInteractive, isTyping, isDone,
  onFocus, onChange, onGenerate,
}: {
  value: string
  typed: string
  isInteractive: boolean
  isTyping: boolean
  isDone: boolean
  onFocus: () => void
  onChange: (v: string) => void
  onGenerate: () => void
}) {
  const btnStyle: React.CSSProperties = isDone
    ? { background: "linear-gradient(135deg,#10b981,#34d399)", color: "#050816", boxShadow: "0 2px 10px rgba(16,185,129,0.25)" }
    : { background: "linear-gradient(135deg,#F7BE4D,#fbbf24)", color: "#050816", boxShadow: "0 2px 10px rgba(247,190,77,0.3)" }

  const btnContent = isDone ? (
    <>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        className="w-3 h-3 rounded-full"
        style={{ border: "1.5px solid #050816", borderTopColor: "transparent" }}
      />
      Generating content…
    </>
  ) : (
    <>
      <Sparkles className="w-3 h-3" />
      Generate Content
      <ArrowRight className="w-3 h-3" />
    </>
  )

  return (
    <div
      className="rounded-2xl bg-white border border-slate-200 p-3.5"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
    >
      {/* Label row */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-sm leading-none">💡</span>
        <span className="text-[11px] font-bold text-slate-700">Your Idea or URL</span>
        <span
          className="ml-auto text-[8px] font-semibold px-2 py-0.5 rounded-md"
          style={{ background: "#f8fafc", color: "#94a3b8", border: "1px solid #e2e8f0" }}
        >
          idea / blog / youtube / site
        </span>
      </div>

      {/* Input area — switches between animated display and real <input> */}
      <div
        className="rounded-xl px-3 py-2.5 mb-3 border min-h-[40px] cursor-text transition-all duration-200"
        style={{
          background: "linear-gradient(135deg,#fffbeb,#fef9c3)",
          borderColor: isInteractive ? "#F7BE4D" : "#fde68a",
          boxShadow: isInteractive
            ? "0 0 0 2px rgba(247,190,77,0.2), inset 0 1px 3px rgba(0,0,0,0.03)"
            : "inset 0 1px 3px rgba(0,0,0,0.03)",
        }}
        onClick={!isInteractive ? onFocus : undefined}
      >
        {isInteractive ? (
          <input
            suppressHydrationWarning
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={onFocus}
            placeholder="Paste any idea, blog URL, YouTube link…"
            disabled={isDone}
            autoFocus
            className="w-full bg-transparent text-[11px] font-semibold text-slate-800 placeholder:text-slate-300 placeholder:font-normal placeholder:italic outline-none disabled:opacity-60"
          />
        ) : (
          <span className="text-[11px] font-semibold text-slate-800 leading-snug">
            {typed || (
              <span className="text-slate-300 italic font-normal text-[10px]">
                Paste any idea, blog URL, YouTube link…
              </span>
            )}
            {isTyping && typed.length < TOPIC.length && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.55, repeat: Infinity }}
                className="inline-block w-0.5 h-3.5 align-middle ml-0.5"
                style={{ background: "#F7BE4D" }}
              />
            )}
          </span>
        )}
      </div>

      {/* CTA — real <button> when interactive, presentational <div> during auto-play */}
      {isInteractive ? (
        <button
          suppressHydrationWarning
          onClick={onGenerate}
          disabled={isDone}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold cursor-pointer select-none transition-all duration-500 disabled:cursor-not-allowed"
          style={btnStyle}
        >
          {btnContent}
        </button>
      ) : (
        <div
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold cursor-default select-none transition-all duration-500"
          style={btnStyle}
        >
          {btnContent}
        </div>
      )}

      {/* "Try your own idea" nudge — visible only during auto-play idle/typing */}
      {!isInteractive && !isDone && (
        <p
          className="text-center text-[9px] text-slate-400 mt-2 cursor-pointer hover:text-amber-600 transition-colors select-none"
          onClick={onFocus}
        >
          ⌨️ Click to try with your own idea
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Step 2 — AI Processing card
// ─────────────────────────────────────────────────────────────────
function ProcessingCard({
  done, progress, isComplete, isActive,
}: { done: number[]; progress: number; isComplete: boolean; isActive: boolean }) {
  return (
    <div
      className="rounded-2xl bg-white border border-slate-200 p-3.5"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm leading-none">🤖</span>
        <span className="text-[11px] font-bold text-slate-700">AI Processing</span>
        {isActive && !isComplete && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            className="ml-auto w-3.5 h-3.5 rounded-full flex-shrink-0"
            style={{ border: "2px solid #F7BE4D", borderTopColor: "transparent" }}
          />
        )}
        <AnimatePresence>
          {isComplete && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 600 }}
              className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}
            >
              ✓ Done
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Checklist — single column, narrative */}
      <div className="space-y-1.5 mb-3">
        {PROCESSING_STEPS.map((step, i) => {
          const isDone    = done.includes(i)
          const isRunning = isActive && done.length === i && !isComplete
          return (
            <motion.div
              key={step.label}
              className="flex items-center gap-2.5"
              animate={{ opacity: isDone ? 1 : isRunning ? 1 : 0.25 }}
              transition={{ duration: 0.2 }}
            >
              {/* Indicator */}
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: isDone ? step.color + "14" : "#f1f5f9",
                  border: `1px solid ${isDone ? step.color + "45" : "#e2e8f0"}`,
                }}
              >
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 700, damping: 14 }}
                  >
                    <Check className="w-2 h-2" style={{ color: step.color }} />
                  </motion.div>
                ) : isRunning ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ border: `1.5px solid ${step.color}`, borderTopColor: "transparent" }}
                  />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                )}
              </div>

              {/* Label + running shimmer */}
              <div className="flex-1 min-w-0">
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: isDone ? "#334155" : isRunning ? step.color : "#94a3b8" }}
                >
                  {step.label}
                </span>
                {isRunning && (
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    className="ml-1 inline-block w-1 h-1 rounded-full align-middle"
                    style={{ background: step.color }}
                  />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[8px] font-medium text-slate-400">Progress</span>
          <span
            className="text-[8px] font-bold tabular-nums"
            style={{ color: progress === 100 ? "#059669" : "#d97706" }}
          >
            {progress}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg,#d97706,#F7BE4D,#fbbf24)",
              boxShadow: progress > 0 ? "0 0 6px rgba(247,190,77,0.45)" : "none",
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <AnimatePresence>
          {isComplete && (
            <motion.p
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-[9px] font-bold mt-1.5"
              style={{ color: "#059669" }}
            >
              🎉 6 pieces of content ready
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Step 3 — Platform-specific output cards (real content)
// ─────────────────────────────────────────────────────────────────
function OutputCards({ visible }: { visible: number }) {
  // card(index, jsx, colSpan, bg/border style, platform glow color)
  const card = (
    i: number,
    children: React.ReactNode,
    cls: string,
    style: React.CSSProperties,
    glowColor: string,
  ) => (
    <AnimatePresence key={i}>
      {visible > i && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.26, ease: "easeOut" }}
          whileHover={{
            y: -5,
            scale: 1.025,
            boxShadow: `0 12px 28px ${glowColor}1e, 0 0 0 1.5px ${glowColor}50`,
            transition: { duration: 0.15 },
          }}
          className={`rounded-xl p-2.5 border cursor-default ${cls}`}
          style={{ ...style, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="grid grid-cols-3 gap-1.5" style={{ minHeight: 198 }}>

      {/* ── 1. LinkedIn Post (2/3 width) ───────── */}
      {card(0,
        <>
          {/* Author */}
          <div className="flex items-center gap-1.5 mb-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#0077B5,#0a90d4)", color: "#fff" }}
            >
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-slate-800 leading-none">John Doe</p>
              <p className="text-[7px] text-slate-400 mt-0.5">Founder · 1st · 3h ago</p>
            </div>
            <span
              className="text-[7px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ background: "#0077B5", color: "#fff" }}
            >
              💼 LinkedIn
            </span>
          </div>

          {/* Post — short punchy sentences, real LinkedIn style */}
          <div className="space-y-1 mb-2">
            <p className="text-[9px] font-semibold text-slate-800 leading-snug">
              The biggest mistake founders make is trying to grow on every platform at once.
            </p>
            <div className="space-y-0.5 pl-2 border-l-2 border-blue-200">
              {["Focus on one channel.", "Master it.", "Then expand."].map(line => (
                <p key={line} className="text-[9px] text-slate-600 leading-none">{line}</p>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 italic leading-none">Here&apos;s why this works…</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 pt-1.5 border-t border-blue-100">
            {["👍 46", "💬 12", "🔄 8"].map(a => (
              <span key={a} className="text-[7px] text-slate-400 font-medium">{a}</span>
            ))}
            <span className="text-[8px] font-semibold ml-auto" style={{ color: "#0077B5" }}>
              Read more →
            </span>
          </div>
        </>,
        "col-span-2",
        { background: "#eff8ff", borderColor: "#bfdbfe" },
        "#0077B5",
      )}

      {/* ── 2. Twitter Thread (1/3 width) ──────── */}
      {card(1,
        <>
          {/* Header */}
          <div className="flex items-center gap-1 mb-2">
            <span className="text-[11px] font-black text-slate-900 leading-none">𝕏</span>
            <span className="text-[7px] text-slate-500 font-semibold flex-1 truncate">@johndoe_saas</span>
            <span
              className="text-[7px] font-bold px-1 py-0.5 rounded flex-shrink-0"
              style={{ background: "#1e293b", color: "#f8fafc" }}
            >
              🧵 5
            </span>
          </div>

          {/* Thread items with connector lines */}
          <div className="space-y-1 mb-2">
            {[
              { n: "1/", text: "99% of startups fail because they build before validating." },
              { n: "2/", text: "Find one painful problem people already pay to solve…" },
              { n: "3/", text: "Talk to real customers before writing a single line of code." },
            ].map((item, idx) => (
              <div key={item.n} className="flex gap-1.5">
                {/* Thread line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <span className="text-[8px] font-black text-slate-900 leading-none w-3 text-center">{item.n}</span>
                  {idx < 2 && <div className="w-px flex-1 mt-0.5 bg-slate-200" style={{ minHeight: 6 }} />}
                </div>
                <p
                  className="text-[8px] text-slate-700 leading-snug flex-1 min-w-0"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Counts */}
          <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100">
            <span className="text-[7px] text-slate-400">❤️ 94</span>
            <span className="text-[7px] text-slate-400">🔁 23</span>
            <span className="text-[7px] text-slate-400">💬 15</span>
          </div>
        </>,
        "col-span-1",
        { background: "#f8fafc", borderColor: "#e2e8f0" },
        "#1e293b",
      )}

      {/* ── 3. Instagram Caption (1/3 width) ───── */}
      {card(2,
        <>
          {/* Photo placeholder */}
          <div
            className="h-8 rounded-lg mb-1.5 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#f43f5e,#E1306C,#a855f7)" }}
          >
            <span className="text-base leading-none">📸</span>
          </div>

          {/* Caption — short punchy lines */}
          <div className="space-y-0.5 mb-1.5">
            <p className="text-[9px] font-semibold text-slate-800 leading-tight">
              Success isn&apos;t about posting more.
            </p>
            <p className="text-[9px] text-slate-600 leading-tight">
              It&apos;s about posting smarter. 👇
            </p>
            <p className="text-[8px] text-slate-500 leading-tight">Save this checklist.</p>
          </div>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
            {["#startup", "#AI", "#growth"].map(h => (
              <span key={h} className="text-[7px] font-semibold" style={{ color: "#E1306C" }}>{h}</span>
            ))}
          </div>
        </>,
        "col-span-1",
        { background: "#fdf2f8", borderColor: "#fbcfe8" },
        "#E1306C",
      )}

      {/* ── 4. Viral Hashtags (1/3 width) ──────── */}
      {card(3,
        <>
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs leading-none">🏷️</span>
            <span className="text-[9px] font-bold text-slate-700 flex-1">Hashtags</span>
            <span
              className="text-[7px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "#fde68a", color: "#d97706" }}
            >
              15
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {["#Startup", "#SaaS", "#AI", "#Marketing", "#Growth", "#Founders"].map(h => (
              <span
                key={h}
                className="text-[7px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: "#d97706" + "14",
                  color: "#d97706",
                  border: "1px solid #d97706" + "35",
                }}
              >
                {h}
              </span>
            ))}
          </div>
        </>,
        "col-span-1",
        { background: "#fffbeb", borderColor: "#fde68a" },
        "#d97706",
      )}

      {/* ── 5. Carousel Slides (1/3 width) ──────── */}
      {card(4,
        <>
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-xs leading-none">🎠</span>
            <span className="text-[9px] font-bold text-slate-700 flex-1">Carousel</span>
            <span className="text-[7px] text-slate-400">5 slides</span>
          </div>
          <div className="grid grid-cols-3 gap-0.5">
            {[
              ["1", "5 Startup Growth Mistakes"],
              ["2", "Ignoring Customer Feedback"],
              ["3", "Building Too Many Features"],
            ].map(([n, title]) => (
              <div
                key={n}
                className="rounded-lg flex flex-col items-center justify-center px-1 py-1.5 text-center"
                style={{
                  background: "#818cf8" + "16",
                  border: "1px solid #818cf8" + "30",
                }}
              >
                <span className="text-[7px] font-black" style={{ color: "#818cf8" + "90" }}>{n}</span>
                <p
                  className="text-[7px] font-semibold text-slate-700 leading-tight mt-0.5"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {title}
                </p>
              </div>
            ))}
          </div>
        </>,
        "col-span-1",
        { background: "#eef2ff", borderColor: "#c7d2fe" },
        "#818cf8",
      )}

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Step 4 — Ready to Publish bar
// ─────────────────────────────────────────────────────────────────
function PublishBar({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-2xl border border-emerald-200 px-3.5 py-3 flex items-center gap-3"
          style={{
            background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)",
            boxShadow: "0 2px 12px rgba(5,150,105,0.1)",
          }}
        >
          <span className="text-base leading-none flex-shrink-0">🚀</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-emerald-800 leading-none mb-1">Ready to Publish</p>
            <div className="flex items-center flex-wrap gap-1">
              {PUBLISH_PLATFORMS.map(p => (
                <div
                  key={p.name}
                  className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5"
                  style={{ background: p.color + "12", border: `1px solid ${p.color}30` }}
                >
                  <span className="text-[9px] leading-none">{p.emoji}</span>
                  <span className="text-[8px] font-semibold" style={{ color: p.color }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold flex-shrink-0 cursor-default"
            style={{
              background: "linear-gradient(135deg,#F7BE4D,#fbbf24)",
              color: "#050816",
              boxShadow: "0 2px 8px rgba(247,190,77,0.35)",
            }}
          >
            📅 Schedule All
            <ArrowRight className="w-2.5 h-2.5" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────
// Workflow — animation state machine (interactive + auto-play)
// ─────────────────────────────────────────────────────────────────
type Phase = "idle" | "typing" | "processing" | "complete"
type Mode  = "auto" | "interactive"

function WorkflowDemo() {
  const [phase,        setPhase]        = useState<Phase>("idle")
  const [mode,         setMode]         = useState<Mode>("auto")
  const [userInput,    setUserInput]    = useState(TOPIC)
  const [typedChars,   setTypedChars]   = useState(0)
  const [doneSteps,    setDoneSteps]    = useState<number[]>([])
  const [progress,     setProgress]     = useState(0)
  const [visibleCards, setVisibleCards] = useState(0)
  const [publishReady, setPublishReady] = useState(false)

  const loopRef  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const modeRef  = useRef<Mode>("auto")
  useEffect(() => { modeRef.current = mode }, [mode])

  // Start a fresh generation run (both modes)
  const startProcessing = useCallback(() => {
    if (loopRef.current) clearTimeout(loopRef.current)
    setTypedChars(0)
    setDoneSteps([])
    setProgress(0)
    setVisibleCards(0)
    setPublishReady(false)
    setPhase("processing")
  }, [])

  // Auto-play reset → re-enter typing phase
  const reset = useCallback(() => {
    if (loopRef.current) clearTimeout(loopRef.current)
    setTypedChars(0)
    setDoneSteps([])
    setProgress(0)
    setVisibleCards(0)
    setPublishReady(false)
    setPhase("typing")
  }, [])

  // User clicked the input area while auto-play is running
  const handleFocus = useCallback(() => {
    if (modeRef.current === "interactive") return
    setMode("interactive")
    if (loopRef.current) clearTimeout(loopRef.current)
    if (phase === "typing") {
      // Abort the typing animation; let user take over
      setPhase("idle")
      setTypedChars(0)
    }
    // If processing/complete, let it finish — user can generate again after
  }, [phase])

  // User clicked "Generate Content"
  const handleGenerate = useCallback(() => {
    setMode("interactive")
    startProcessing()
  }, [startProcessing])

  // Boot — kick off auto-play after a short delay
  useEffect(() => {
    const t = setTimeout(reset, 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Typing phase (auto-play only)
  useEffect(() => {
    if (phase !== "typing") return
    let chars = 0
    let followUp: ReturnType<typeof setTimeout> | undefined
    const iv = setInterval(() => {
      chars++
      setTypedChars(chars)
      if (chars >= TOPIC.length) {
        clearInterval(iv)
        followUp = setTimeout(() => setPhase("processing"), 500)
      }
    }, 50)
    return () => { clearInterval(iv); if (followUp) clearTimeout(followUp) }
  }, [phase])

  // Processing (both modes)
  useEffect(() => {
    if (phase !== "processing") return
    const timers: ReturnType<typeof setTimeout>[] = []
    PROCESSING_STEPS.forEach((_, i) => {
      const t = setTimeout(() => {
        setDoneSteps(prev => [...prev, i])
        setProgress(Math.round(((i + 1) / PROCESSING_STEPS.length) * 100))
        if (i === PROCESSING_STEPS.length - 1) {
          timers.push(setTimeout(() => setPhase("complete"), 350))
        }
      }, 280 + i * 360)
      timers.push(t)
    })
    return () => timers.forEach(clearTimeout)
  }, [phase])

  // Complete — reveal cards one by one, publish bar, then loop (auto-play only)
  useEffect(() => {
    if (phase !== "complete") return
    let count = 0
    let publishTimer: ReturnType<typeof setTimeout> | undefined
    const iv = setInterval(() => {
      count++
      setVisibleCards(count)
      if (count >= 5) {
        clearInterval(iv)
        publishTimer = setTimeout(() => setPublishReady(true), 450)
        if (modeRef.current === "auto") {
          loopRef.current = setTimeout(reset, 8200)
        }
      }
    }, 160)
    return () => {
      clearInterval(iv)
      if (publishTimer) clearTimeout(publishTimer)
      if (loopRef.current) clearTimeout(loopRef.current)
    }
  }, [phase, reset])

  const isTyping     = phase === "typing"
  const isProcessing = phase === "processing"
  const isComplete   = phase === "complete"

  return (
    <div className="space-y-1.5">
      {/* Step 1 */}
      <StepLabel emoji="💡" label="Your Input" color="#d97706" />
      <InputCard
        value={userInput}
        typed={TOPIC.slice(0, typedChars)}
        isInteractive={mode === "interactive"}
        isTyping={isTyping}
        isDone={isProcessing}
        onFocus={handleFocus}
        onChange={setUserInput}
        onGenerate={handleGenerate}
      />

      <StepArrow />

      {/* Step 2 */}
      <StepLabel emoji="🤖" label="AI Processing" color="#6366f1" />
      <ProcessingCard
        done={doneSteps}
        progress={progress}
        isComplete={isComplete}
        isActive={isProcessing || isComplete}
      />

      <StepArrow />

      {/* Step 3 */}
      <StepLabel emoji="✨" label="Results" color="#059669" />
      <OutputCards visible={visibleCards} />

      {/* Step 4 — slides in after cards reveal */}
      <AnimatePresence>
        {publishReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-1.5"
          >
            <StepArrow />
            <StepLabel emoji="🚀" label="Ready to Publish" color="#059669" />
            <PublishBar visible />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Hero section
// ─────────────────────────────────────────────────────────────────
export default function Hero() {
  return (
    <section
      className="relative flex flex-col justify-center min-h-screen px-6 pt-20 pb-12 overflow-hidden"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Top gradient strip */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 pointer-events-none"
        style={{
          background: "linear-gradient(90deg,#F7BE4D,#f472b6,#818cf8,#34d399,#38bdf8,#F7BE4D)",
        }}
      />

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle,rgba(247,190,77,0.07) 0%,transparent 65%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-0 right-10 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle,rgba(129,140,248,0.06) 0%,transparent 65%)",
            filter: "blur(70px)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 lg:gap-14 items-start">

          {/* ──────────────────────────────────────────
               LEFT — headline + CTAs + social proof
          ────────────────────────────────────────── */}
          <div className="text-center lg:text-left pt-4">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-5 border border-amber-200 bg-amber-50"
            >
              <motion.span
                animate={{ scale: [1, 1.7, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"
              />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#b45309" }}>
                AI-Powered Content Engine
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="font-black leading-[1.04] tracking-tight mb-5"
            >
              <span className="block text-[38px] md:text-[50px] lg:text-[46px] xl:text-[56px] text-slate-900">
                Turn One Idea Into
              </span>
              <span className="block text-[38px] md:text-[50px] lg:text-[46px] xl:text-[56px]">
                <span
                  style={{
                    background: "linear-gradient(135deg,#d97706 0%,#F7BE4D 50%,#f0a800 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  30 Days
                </span>
                <span className="text-slate-900"> Of </span>
                <motion.span
                  animate={{
                    filter: [
                      "drop-shadow(0 0 0px rgba(247,190,77,0))",
                      "drop-shadow(0 0 18px rgba(247,190,77,0.5))",
                      "drop-shadow(0 0 0px rgba(247,190,77,0))",
                    ],
                  }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                  style={{
                    background: "linear-gradient(135deg,#1e293b 0%,#d97706 60%,#F7BE4D 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    display: "inline-block",
                  }}
                >
                  Viral Content.
                </motion.span>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22 }}
              className="text-base md:text-lg text-slate-500 mb-7 leading-relaxed max-w-md mx-auto lg:mx-0"
            >
              Paste one idea, blog post, YouTube video, or website. PostPilot AI instantly
              transforms it into platform-optimized content for every major social network.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.34 }}
              className="flex flex-col sm:flex-row gap-3 mb-8 justify-center lg:justify-start"
            >
              <Link
                href="/login"
                onClick={() => analytics.upgradeClicked?.("hero_cta", "signup")}
              >
                <motion.div
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 font-bold px-7 py-3.5 rounded-xl text-base cursor-pointer select-none"
                  style={{
                    background: "linear-gradient(135deg,#F7BE4D 0%,#ffd166 50%,#f0a800 100%)",
                    color: "#050816",
                    boxShadow: "0 0 28px rgba(247,190,77,0.4), 0 6px 18px rgba(0,0,0,0.1)",
                  }}
                >
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  Start Generating Free
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  >
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  </motion.span>
                </motion.div>
              </Link>

              <a href="#demo">
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 font-semibold px-7 py-3.5 rounded-xl text-base cursor-pointer select-none border border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50/50 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(247,190,77,0.15)" }}
                  >
                    <Play className="w-3 h-3 flex-shrink-0" style={{ color: "#d97706" }} fill="#d97706" />
                  </div>
                  Watch Demo
                </motion.div>
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.5 }}
              className="space-y-3"
            >
              {/* Stars + rating */}
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4" fill="#F7BE4D" style={{ color: "#F7BE4D" }} />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-900">4.9 / 5</span>
                <span className="text-slate-300">·</span>
                <span className="text-sm text-slate-500">500+ reviews</span>
              </div>

              {/* Avatars + count */}
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {AVATARS.map(a => (
                    <div
                      key={a.letter}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                      style={{ background: a.color, color: "#fff" }}
                    >
                      {a.letter}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-900">10,000+</span> Posts Generated
                </p>
              </div>

              {/* Metric pills */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {[
                  { icon: CheckCircle2, text: "500+ Creators",  color: "#059669" },
                  { icon: Zap,          text: "60s Generation", color: "#d97706" },
                  { icon: TrendingUp,   text: "3× Engagement",  color: "#6366f1" },
                  { icon: CheckCircle2, text: "No Credit Card", color: "#059669" },
                ].map(item => (
                  <div
                    key={item.text}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-600 font-medium"
                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                  >
                    <item.icon className="w-3 h-3 flex-shrink-0" style={{ color: item.color }} />
                    {item.text}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ──────────────────────────────────────────
               RIGHT — live product workflow
          ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            {/* Floating badge — top right */}
            <motion.div
              animate={{ y: [-4, 5, -4] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-3 -right-2 z-20 flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-200"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-900 leading-none">6 posts ready</p>
                <p className="text-[9px] text-slate-400 leading-none mt-0.5">in 3.8 seconds</p>
              </div>
            </motion.div>

            {/* Floating badge — bottom left */}
            <motion.div
              animate={{ y: [5, -4, 5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="absolute -bottom-2 -left-3 z-20 flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-200"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
            >
              <span className="text-base leading-none">📈</span>
              <div>
                <p className="text-[10px] font-bold text-slate-900 leading-none">3× Engagement</p>
                <p className="text-[9px] text-slate-400 leading-none mt-0.5">avg. creator lift</p>
              </div>
            </motion.div>

            {/* Workflow container */}
            <div
              className="rounded-3xl p-5 border border-slate-200/80"
              style={{
                background: "linear-gradient(145deg,#f8fafc 0%,#f1f5f9 55%,#f8fafc 100%)",
                boxShadow:
                  "0 0 0 1px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <WorkflowDemo />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
