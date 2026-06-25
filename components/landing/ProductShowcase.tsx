"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ThumbsUp, MessageSquare, Share2, Repeat2, Heart, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"

// ── Demo content ──────────────────────────────────────────────────
const LINKEDIN_POST = {
  name: "Rahul Verma",
  title: "Founder & CEO at TechFlow · SaaS Builder",
  time: "2h",
  content: `I spent 4 hours a week writing LinkedIn posts.

Now I spend 4 minutes.

Here's what changed:

→ I stopped treating every post as a masterpiece
→ I started batching content with AI
→ I focused on ideas, not writing

The result? My engagement went up 3× and I saved 200+ hours last year.

The best content creators aren't writing more — they're thinking more strategically.

What's your content creation process?

#ContentMarketing #LinkedIn #AITools #Productivity`,
  likes: "2.4K",
  comments: "183",
  reposts: "312",
}

const TWITTER_THREAD = [
  {
    handle: "@rahulbuilds",
    time: "just now",
    text: "hot take: most creators fail not because they lack ideas — but because they can't ship fast enough 🧵",
    likes: "1.2K",
    retweets: "487",
    views: "24K",
  },
  {
    handle: "@rahulbuilds",
    time: "just now",
    text: "1/ The problem isn't inspiration.\n\nIt's the 3-hour gap between \"I have an idea\" and \"it's published.\"\n\nEvery friction point kills momentum.",
    likes: "843",
    retweets: "291",
    views: "18K",
  },
  {
    handle: "@rahulbuilds",
    time: "just now",
    text: "2/ The fix? Eliminate the blank page.\n\nPaste your idea → get a full thread draft in 60 seconds → edit → ship.\n\nThat's it. That's the system.",
    likes: "1.1K",
    retweets: "376",
    views: "21K",
  },
]

const INSTAGRAM_POST = {
  username: "rahulbuilds",
  time: "2 hours ago",
  caption: "✨ This is your sign to stop overthinking content and just post.\n\nI used to agonize over every caption. Now I batch 30 posts in 30 minutes using AI.\n\nThe secret? Stop trying to be perfect. Start being consistent.\n\nYour audience would rather have 5 good posts a week than 1 perfect post a month. 📱\n\n#ContentCreator #SocialMediaTips #AITools #BuildInPublic #Consistency",
  likes: "3,847",
  comments: "214",
}

const CAROUSEL_SLIDES = [
  { number: "01", title: "5 AI Tools That Save Founders 10hrs/Week", subtitle: "A Thread" },
  { number: "02", title: "Content Creation", subtitle: "PostPilot AI → Full month of posts in 30 min" },
  { number: "03", title: "Email Automation", subtitle: "Instantly personalize outreach at scale" },
  { number: "04", title: "Analytics & Reporting", subtitle: "Auto-generate weekly reports with insights" },
  { number: "05", title: "Which tool saves YOU the most time?", subtitle: "Comment below 👇" },
]

// ── Tab config ────────────────────────────────────────────────────
const TABS = [
  { key: "linkedin",  label: "LinkedIn",   emoji: "💼", color: "#0077B5" },
  { key: "twitter",   label: "Twitter / X", emoji: "𝕏",  color: "#1e293b" },
  { key: "instagram", label: "Instagram",  emoji: "📸", color: "#E1306C" },
  { key: "carousel",  label: "Carousel",   emoji: "📊", color: "#818cf8" },
] as const

type TabKey = (typeof TABS)[number]["key"]

// ── Sub-components ────────────────────────────────────────────────
function LinkedInPreview() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(0,77,181,0.08)" }}>
      {/* LinkedIn top bar */}
      <div className="h-1 w-full" style={{ background: "#0077B5" }} />
      <div className="p-5">
        {/* Author */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#0077B5,#00a0dc)", color: "#fff" }}>
            R
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900">{LINKEDIN_POST.name}</p>
            <p className="text-[11px] text-slate-500 leading-tight">{LINKEDIN_POST.title}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{LINKEDIN_POST.time} · 🌐</p>
          </div>
          <button className="text-[10px] font-bold px-3 py-1 rounded-full border border-[#0077B5] text-[#0077B5] hover:bg-blue-50 transition-colors">
            + Follow
          </button>
        </div>

        {/* Content */}
        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-4 line-clamp-6">
          {LINKEDIN_POST.content}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pb-3 border-b border-slate-100 mb-3">
          <span className="flex items-center gap-1">
            <span>👍❤️🎉</span>
            <span>{LINKEDIN_POST.likes}</span>
          </span>
          <span>{LINKEDIN_POST.comments} comments · {LINKEDIN_POST.reposts} reposts</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {[
            { icon: ThumbsUp, label: "Like" },
            { icon: MessageSquare, label: "Comment" },
            { icon: Repeat2, label: "Repost" },
            { icon: Share2, label: "Send" },
          ].map(a => (
            <button key={a.label}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-slate-50 text-[10px] font-semibold text-slate-500 transition-colors">
              <a.icon className="w-3.5 h-3.5" />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function TwitterPreview() {
  const [slide, setSlide] = useState(0)
  const tweet = TWITTER_THREAD[slide]
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
      <div className="p-5">
        {/* Author */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "#1e293b", color: "#fff" }}>
            R
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-bold text-slate-900">Rahul Verma</p>
              <span className="text-[10px] text-[#1d9bf0]">✓</span>
            </div>
            <p className="text-[11px] text-slate-400">{tweet.handle} · {tweet.time}</p>
          </div>
          <span className="text-slate-900 font-black text-sm">𝕏</span>
        </div>

        {/* Tweet content */}
        <AnimatePresence mode="wait">
          <motion.p key={slide}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="text-sm text-slate-800 leading-relaxed whitespace-pre-line mb-4">
            {tweet.text}
          </motion.p>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-5">
            <button className="flex items-center gap-1.5 text-[11px] hover:text-blue-500 transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{tweet.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 text-[11px] hover:text-green-500 transition-colors">
              <Repeat2 className="w-3.5 h-3.5" />
              <span>{tweet.retweets}</span>
            </button>
            <button className="flex items-center gap-1.5 text-[11px] hover:text-pink-500 transition-colors">
              <Heart className="w-3.5 h-3.5" />
              <span>{tweet.likes}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-[10px] text-slate-400">
              📊 {tweet.views}
            </button>
            <Bookmark className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Thread navigation */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <span className="text-[10px] text-slate-400">{slide + 1} of {TWITTER_THREAD.length} tweets</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0}
              className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-all">
              <ChevronLeft className="w-3 h-3 text-slate-500" />
            </button>
            <button onClick={() => setSlide(s => Math.min(TWITTER_THREAD.length - 1, s + 1))}
              disabled={slide === TWITTER_THREAD.length - 1}
              className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-all">
              <ChevronRight className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InstagramPreview() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 4px 20px rgba(225,48,108,0.08)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", color: "#fff" }}>
          R
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-900">{INSTAGRAM_POST.username}</p>
          <p className="text-[10px] text-slate-400">{INSTAGRAM_POST.time}</p>
        </div>
        <MoreHorizontal className="w-4 h-4 text-slate-400" />
      </div>

      {/* Image placeholder */}
      <div className="w-full aspect-square flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#667eea,#764ba2)" }}>
        <div className="text-center">
          <p className="text-5xl mb-3">✨</p>
          <p className="font-bold text-lg" style={{ color: "#fff" }}>PostPilot AI</p>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>Content that converts</p>
        </div>
        {/* Instagram gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: "linear-gradient(to top,rgba(0,0,0,0.3),transparent)" }} />
      </div>

      {/* Actions */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button className="hover:opacity-70 transition-opacity"><Heart className="w-5 h-5 text-rose-500" fill="#f43f5e" /></button>
            <button className="hover:opacity-70 transition-opacity"><MessageSquare className="w-5 h-5 text-slate-700" /></button>
            <button className="hover:opacity-70 transition-opacity"><Share2 className="w-5 h-5 text-slate-700" /></button>
          </div>
          <button className="hover:opacity-70 transition-opacity"><Bookmark className="w-5 h-5 text-slate-700" /></button>
        </div>
        <p className="text-xs font-bold text-slate-900 mb-1">{INSTAGRAM_POST.likes} likes</p>
        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
          <span className="font-bold">{INSTAGRAM_POST.username}</span> {INSTAGRAM_POST.caption}
        </p>
        <p className="text-[10px] text-slate-400 mt-1">View all {INSTAGRAM_POST.comments} comments</p>
      </div>
    </div>
  )
}

function CarouselPreview() {
  const [active, setActive] = useState(0)
  const slide = CAROUSEL_SLIDES[active]
  const colors = ["#6366f1", "#d97706", "#059669", "#E1306C", "#0077B5"]

  return (
    <div className="space-y-4">
      {/* Main slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl overflow-hidden aspect-square flex flex-col items-center justify-center relative"
          style={{ background: `linear-gradient(135deg,${colors[active]}15 0%,${colors[active]}05 100%)`, border: `1px solid ${colors[active]}25` }}
        >
          <div className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: colors[active], color: "#fff" }}>
            {slide.number} / 05
          </div>
          <div className="text-center px-8">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: colors[active], color: "#fff" }}>
              <span className="text-xl font-black">{slide.number}</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">{slide.title}</h3>
            <p className="text-sm text-slate-500">{slide.subtitle}</p>
          </div>
          {/* Navigation arrows */}
          <button
            onClick={() => setActive(a => Math.max(0, a - 1))}
            disabled={active === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <button
            onClick={() => setActive(a => Math.min(CAROUSEL_SLIDES.length - 1, a + 1))}
            disabled={active === CAROUSEL_SLIDES.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Dot navigation */}
      <div className="flex items-center justify-center gap-2">
        {CAROUSEL_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className="transition-all duration-200 rounded-full"
            style={{
              width: active === i ? 20 : 8,
              height: 8,
              background: active === i ? colors[active] : "#e2e8f0",
            }} />
        ))}
      </div>

      {/* Slide thumbnails */}
      <div className="grid grid-cols-5 gap-2">
        {CAROUSEL_SLIDES.map((s, i) => (
          <button key={i} onClick={() => setActive(i)}
            className="rounded-lg aspect-square flex items-center justify-center text-[9px] font-bold transition-all"
            style={{
              background: active === i ? `${colors[i]}15` : "#f8fafc",
              border: `1.5px solid ${active === i ? colors[i] + "50" : "#e2e8f0"}`,
              color: colors[i],
            }}>
            {s.number}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────
export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<TabKey>("linkedin")

  return (
    <section className="py-24 px-6 relative" style={{ backgroundColor: "#fafafa" }}>
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg,transparent,rgba(247,190,77,0.4),transparent)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg,transparent,rgba(129,140,248,0.2),transparent)" }} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border border-amber-200 bg-amber-50">
            <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#b45309" }}>
              Real product · Real output
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            See what{" "}
            <span className="gradient-text">PostPilot AI creates</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            Platform-perfect content for every channel. One click. Zero blank pages.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* ── Left: Tab switcher + preview ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
              {TABS.map(tab => (
                <button
                  suppressHydrationWarning
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={activeTab === tab.key ? {
                    background: `${tab.color}12`,
                    border: `1.5px solid ${tab.color}35`,
                    color: tab.color,
                    boxShadow: `0 4px 12px ${tab.color}12`,
                  } : {
                    background: "#ffffff",
                    border: "1.5px solid #e2e8f0",
                    color: "#64748b",
                  }}
                >
                  <span className="text-base leading-none">{tab.emoji}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Preview */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "linkedin"  && <LinkedInPreview />}
                {activeTab === "twitter"   && <TwitterPreview />}
                {activeTab === "instagram" && <InstagramPreview />}
                {activeTab === "carousel"  && <CarouselPreview />}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* ── Right: Selling points ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <div className="space-y-6">
              {[
                {
                  emoji: "⚡",
                  title: "Under 60 seconds",
                  desc: "From blank to published-ready across all platforms. The fastest content workflow you've ever used.",
                  color: "#d97706",
                },
                {
                  emoji: "🎯",
                  title: "Platform-perfect formatting",
                  desc: "Character limits, hashtag density, emoji use, CTA placement — every post is optimized for its platform.",
                  color: "#6366f1",
                },
                {
                  emoji: "🧠",
                  title: "Learns your brand voice",
                  desc: "Train the AI on your tone, style, and topics. Every piece of content sounds like you — not a robot.",
                  color: "#059669",
                },
                {
                  emoji: "📅",
                  title: "Schedule and auto-publish",
                  desc: "Pick dates on your content calendar and let PostPilot publish at the optimal time automatically.",
                  color: "#E1306C",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors"
                  style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.03)" }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
                    {item.emoji}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1 text-sm">{item.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-8 p-5 rounded-2xl border border-amber-200"
              style={{ background: "linear-gradient(135deg,#fffbeb,#fef9c3)" }}
            >
              <p className="font-bold text-slate-900 mb-1">Ready to see it work on YOUR ideas?</p>
              <p className="text-sm text-slate-600 mb-4">Try the live demo above — no sign-up needed.</p>
              <a href="#demo"
                className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
                style={{ background: "linear-gradient(135deg,#F7BE4D,#ffd166)", color: "#050816", boxShadow: "0 4px 12px rgba(247,190,77,0.35)" }}>
                Try live demo ↓
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
