"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const TESTIMONIALS = [
  { name: "Priya Sharma",   role: "Startup Founder",                platform: "LinkedIn",    platformColor: "#0A66C2", avatar: "P", color: "#E1306C", quote: "I used to spend 3 hours every Sunday writing LinkedIn posts. PostPilot generates a full week of content in under 5 minutes. My engagement went up 40% in month one." },
  { name: "Arjun Mehta",    role: "Fitness Creator · 52K followers", platform: "Instagram",   platformColor: "#E1306C", avatar: "A", color: "#34d399", quote: "The AI nails my voice every time. Instagram captions get 3× more saves than before, and the hashtag suggestions alone save me an hour a week." },
  { name: "Sneha Kapoor",   role: "Food Blogger",                    platform: "Instagram",   platformColor: "#E1306C", avatar: "S", color: "#f472b6", quote: "I post daily across 3 platforms and PostPilot makes it effortless. The repurpose feature turns one recipe into 10 social variations — instantly." },
  { name: "Rahul Verma",    role: "SaaS Founder",                    platform: "Twitter / X", platformColor: "#94a3b8", avatar: "R", color: "#818cf8", quote: "My Twitter growth was stuck at 2K followers for months. After 6 weeks with PostPilot I'm at 8K. The thread generator is genuinely incredible." },
  { name: "Divya Nair",     role: "Personal Brand Coach",            platform: "LinkedIn",    platformColor: "#0A66C2", avatar: "D", color: "#F7BE4D", quote: "I recommend PostPilot to every client who struggles with content. The tone options are spot-on — Professional mode actually sounds professional." },
  { name: "Kiran Patel",    role: "Tech Educator · YouTuber",        platform: "LinkedIn",    platformColor: "#0A66C2", avatar: "K", color: "#38bdf8", quote: "I paste my YouTube script and get 15 social posts across platforms. What took 4 hours now takes 2 minutes. The blog repurposer is insane." },
  { name: "Meera Joshi",    role: "Fashion Creator · 28K followers", platform: "Instagram",   platformColor: "#E1306C", avatar: "M", color: "#e879f9", quote: "Went from posting twice a week to every single day. My reach tripled and I spend less time on content than I ever have. Absolute game-changer." },
  { name: "Vikram Singh",   role: "E-commerce Founder",              platform: "Facebook",    platformColor: "#1877F2", avatar: "V", color: "#fb923c", quote: "We manage content for 3 brands simultaneously. The brand voice feature keeps each brand distinct. It's like having a full content team for ₹2K/month." },
  { name: "Ananya Rao",     role: "Digital Marketing Consultant",    platform: "LinkedIn",    platformColor: "#0A66C2", avatar: "A", color: "#a78bfa", quote: "I've tried every AI writing tool. PostPilot is the only one that understands social context. The scheduling + analytics combo is exactly what I needed." },
  { name: "Rohan Das",      role: "Startup Growth Lead",             platform: "Twitter / X", platformColor: "#94a3b8", avatar: "R", color: "#34d399", quote: "Cut our content team's workload by 70%. We now publish 5× more without hiring anyone. PostPilot pays for itself in the first week, easily." },
]

const ROW_1 = [...TESTIMONIALS.slice(0, 5), ...TESTIMONIALS.slice(0, 5)]
const ROW_2 = [...TESTIMONIALS.slice(5),    ...TESTIMONIALS.slice(5)]

function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-3 h-3 fill-[#F7BE4D] text-[#F7BE4D]" />
      ))}
    </div>
  )
}

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div
      className="flex-shrink-0 w-80 rounded-2xl p-5 mx-3 cursor-default select-none bg-white border border-slate-200 shadow-sm"
    >
      <Stars />
      <p className="text-[13px] text-slate-600 leading-relaxed mt-3 mb-4 line-clamp-4">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: `${t.color}20`, border: `1.5px solid ${t.color}50`, color: t.color }}
        >
          {t.avatar}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-800 truncate">{t.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{t.role}</p>
        </div>
        <span
          className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${t.platformColor}12`, color: t.platformColor, border: `1px solid ${t.platformColor}30` }}
        >
          {t.platform}
        </span>
      </div>
    </div>
  )
}

const AVATARS = [
  { letter: "P", color: "#E1306C" },
  { letter: "A", color: "#34d399" },
  { letter: "R", color: "#818cf8" },
  { letter: "D", color: "#F7BE4D" },
  { letter: "S", color: "#f472b6" },
]

export default function Testimonials() {
  return (
    <section className="relative py-24 overflow-hidden bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border border-amber-200 bg-amber-50"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#F7BE4D] text-[#F7BE4D]" />
              ))}
            </div>
            <span className="text-amber-700 text-xs font-bold">5 / 5</span>
            <span className="text-slate-500 text-xs">· 500+ creators</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Loved by creators &{" "}
            <span className="gradient-text">founders</span>
          </h2>
          <p className="text-slate-500 text-[15px] max-w-xl">
            From solo creators to growing startups — PostPilot is how they stay consistent without burning out.
          </p>

          <div className="flex items-center gap-3 mt-6">
            <div className="flex -space-x-2">
              {AVATARS.map((a, i) => (
                <div key={i}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold"
                  style={{ background: `${a.color}25`, color: a.color, zIndex: 5 - i }}>
                  {a.letter}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              <span className="text-slate-900 font-semibold">500+</span> creators growing with PostPilot
            </p>
          </div>
        </motion.div>
      </div>

      {/* Marquee rows */}
      <div className="space-y-4 relative">
        {/* Fade edges — white to match section */}
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #f8fafc, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #f8fafc, transparent)" }} />

        <div className="overflow-hidden">
          <div className="flex marquee-left">
            {ROW_1.map((t, i) => <TestimonialCard key={i} t={t} />)}
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="flex marquee-right">
            {ROW_2.map((t, i) => <TestimonialCard key={i} t={t} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
