"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Key, Loader2, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SettingsPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [credits, setCredits] = useState(0)
  const [plan, setPlan] = useState("free")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("users")
      .select("name, email, plan, credits_used")
      .eq("id", user.id)
      .single()

    if (data) {
      setName(data.name || "")
      setEmail(data.email || user.email || "")
      setPlan(data.plan || "free")
      setCredits(data.credits_used || 0)
    } else {
      setEmail(user.email || "")
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from("users")
      .update({ name, email })
      .eq("id", user.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 border border-white/6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#F7BE4D]/15 flex items-center justify-center">
            <User className="w-4 h-4 text-[#F7BE4D]" />
          </div>
          <h2 className="text-sm font-semibold text-white">Profile</h2>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading profile...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Display Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Email</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#F7BE4D]/40 transition-all"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* API Keys */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5 border border-white/6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#818cf8]/15 flex items-center justify-center">
            <Key className="w-4 h-4 text-[#818cf8]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">API Keys</h2>
            <p className="text-[11px] text-slate-500">Keys are stored securely in your environment</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 bg-white/3 rounded-xl px-4 py-3 border border-white/6">
          OpenAI API key is configured in <code className="text-slate-400">.env.local</code> as <code className="text-slate-400">OPENAI_API_KEY</code>
        </p>
      </motion.div>

      {/* Plan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-5 border border-white/6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">Current Plan</h2>
            <p className="text-xs text-slate-500 capitalize">You're on the {plan} plan · 50 credits / month</p>
          </div>
          <button className="text-xs font-semibold bg-[#F7BE4D] text-[#050816] px-4 py-2 rounded-xl hover:bg-[#ffd166] transition-colors glow-yellow-sm">
            Upgrade to Pro →
          </button>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-500">Credits used</span>
            <span className="text-slate-400">{credits} / 50</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((credits / 50) * 100, 100)}%` }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="h-full rounded-full bg-gradient-to-r from-[#F7BE4D] to-[#ffd166]"
            />
          </div>
        </div>
      </motion.div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className={`flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-xl transition-all ${
            saved
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-[#F7BE4D] text-[#050816] hover:bg-[#ffd166] glow-yellow-sm disabled:opacity-60"
          }`}
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saved && <CheckCircle2 className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  )
}
