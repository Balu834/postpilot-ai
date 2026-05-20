"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Key, Loader2, CheckCircle2, Zap, Crown, Link2, Unlink, AlertCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import UpgradeModal from "@/components/UpgradeModal"

interface SocialAccount { platform: string; username: string | null; expires_at: string | null }

const SOCIAL_PLATFORMS = [
  { key: "twitter",   label: "Twitter / X",  icon: "𝕏",  color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  { key: "linkedin",  label: "LinkedIn",     icon: "💼", color: "#0077B5", bg: "rgba(0,119,181,0.12)"   },
  { key: "instagram", label: "Instagram",    icon: "📸", color: "#E1306C", bg: "rgba(225,48,108,0.12)",  comingSoon: true },
] as const

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const [name,        setName]        = useState("")
  const [email,       setEmail]       = useState("")
  const [credits,     setCredits]     = useState(0)
  const [planName,    setPlanName]    = useState("free")
  const [expiresAt,   setExpiresAt]   = useState<string | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const [accounts,     setAccounts]     = useState<SocialAccount[]>([])
  const [connecting,   setConnecting]   = useState<string | null>(null)
  const [socialMsg,    setSocialMsg]    = useState<{ type: "success" | "error"; text: string } | null>(null)

  const FREE_LIMIT = 10
  const isPro = planName !== "free"

  const loadAccounts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from("social_accounts").select("platform, username, expires_at").eq("user_id", user.id)
    setAccounts((data as SocialAccount[]) || [])
  }, [])

  useEffect(() => {
    loadProfile()
    loadAccounts()

    const connected = searchParams.get("social_connected")
    const error     = searchParams.get("social_error")
    if (connected) setSocialMsg({ type: "success", text: `${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!` })
    if (error)     setSocialMsg({ type: "error",   text: `Failed to connect ${error.replace("_session", "").replace("_state", "")}. Please try again.` })
    if (connected || error) {
      const url = new URL(window.location.href)
      url.searchParams.delete("social_connected")
      url.searchParams.delete("social_error")
      window.history.replaceState({}, "", url)
    }
  }, [loadAccounts, searchParams])

  const connectPlatform = async (platform: string) => {
    setConnecting(platform)
    setSocialMsg(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/social/${platform}/connect`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      const { url, error } = await res.json()
      if (error || !url) throw new Error(error || "Failed to get auth URL")
      window.location.href = url
    } catch (err: unknown) {
      setSocialMsg({ type: "error", text: err instanceof Error ? err.message : "Connection failed" })
      setConnecting(null)
    }
  }

  const disconnectPlatform = async (platform: string) => {
    setConnecting(platform)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch("/api/social/disconnect", {
        method:  "POST",
        headers: { Authorization: `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ platform }),
      })
      setAccounts(a => a.filter(acc => acc.platform !== platform))
      setSocialMsg({ type: "success", text: `${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected.` })
    } catch {
      setSocialMsg({ type: "error", text: "Disconnect failed" })
    } finally {
      setConnecting(null)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, genRes] = await Promise.all([
      supabase.from("users").select("name, email, plan_name, plan_expires_at").eq("id", user.id).single(),
      supabase.from("generations").select("id", { count: "exact" }).eq("user_id", user.id),
    ])

    if (profileRes.data) {
      setName(profileRes.data.name || "")
      setEmail(profileRes.data.email || user.email || "")
      setPlanName(profileRes.data.plan_name || "free")
      setExpiresAt(profileRes.data.plan_expires_at || null)
    } else {
      setEmail(user.email || "")
    }
    setCredits(genRes.count ?? 0)
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
    <>
    <UpgradeModal
      open={upgradeOpen}
      onClose={() => setUpgradeOpen(false)}
      onSuccess={(plan) => { setPlanName(plan); setCredits(0) }}
    />
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
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: isPro ? "rgba(129,140,248,0.15)" : "rgba(247,190,77,0.15)" }}>
            {isPro
              ? <Crown className="w-4 h-4 text-[#818cf8]" />
              : <Zap className="w-4 h-4 text-[#F7BE4D]" fill="currentColor" strokeWidth={0} />
            }
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Billing & Plan</h2>
            <p className="text-[11px] text-slate-500">
              {isPro
                ? `${planName.charAt(0).toUpperCase()}${planName.slice(1)} Plan${expiresAt ? ` · renews ${new Date(expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}`
                : "Free Plan · 10 generations / month"
              }
            </p>
          </div>
          {!isPro && (
            <button
              onClick={() => setUpgradeOpen(true)}
              className="ml-auto text-xs font-semibold bg-[#F7BE4D] text-[#050816] px-4 py-2 rounded-xl hover:bg-[#ffd166] transition-colors glow-yellow-sm"
            >
              Upgrade to Pro →
            </button>
          )}
        </div>

        {!isPro && (
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-slate-500">Generations used this month</span>
              <span className={`font-semibold tabular-nums ${credits >= FREE_LIMIT ? "text-red-400" : "text-slate-400"}`}>{credits} / {FREE_LIMIT}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((credits / FREE_LIMIT) * 100, 100)}%` }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="h-full rounded-full"
                style={{
                  background: credits >= FREE_LIMIT
                    ? "linear-gradient(90deg, #f87171, #ef4444)"
                    : "linear-gradient(90deg, #F7BE4D, #ffd166)",
                }}
              />
            </div>
            {credits >= FREE_LIMIT && (
              <p className="text-[11px] text-red-400 mt-1.5">Limit reached — upgrade for unlimited generations</p>
            )}
          </div>
        )}

        {isPro && (
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            Unlimited AI generations · All platforms · Priority support
          </div>
        )}
      </motion.div>

      {/* Connected Accounts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-5 border border-white/6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Connected Accounts</h2>
            <p className="text-[11px] text-slate-500">Connect platforms to publish directly from PostPilot</p>
          </div>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {socialMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-xs px-3.5 py-2.5 rounded-xl mb-4"
              style={{
                background: socialMsg.type === "success" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                border:     socialMsg.type === "success" ? "1px solid rgba(52,211,153,0.2)" : "1px solid rgba(248,113,113,0.2)",
                color:      socialMsg.type === "success" ? "#34d399" : "#f87171",
              }}>
              {socialMsg.type === "success"
                ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              }
              {socialMsg.text}
              <button onClick={() => setSocialMsg(null)} className="ml-auto opacity-60 hover:opacity-100">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {SOCIAL_PLATFORMS.map(platform => {
            const account  = accounts.find(a => a.platform === platform.key)
            const isLoading = connecting === platform.key
            return (
              <div key={platform.key}
                className="flex items-center gap-3 p-3.5 rounded-xl border transition-all"
                style={{
                  background:   account ? platform.bg : "rgba(255,255,255,0.02)",
                  borderColor:  account ? `${platform.color}30` : "rgba(255,255,255,0.06)",
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: platform.bg }}>
                  {platform.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{platform.label}</p>
                  <p className="text-[11px] truncate" style={{ color: account ? platform.color : "#475569" }}>
                    {account
                      ? account.username ? `@${account.username}` : "Connected"
                      : (platform as { comingSoon?: boolean }).comingSoon ? "Coming soon" : "Not connected"
                    }
                  </p>
                </div>
                {!(platform as { comingSoon?: boolean }).comingSoon && (
                  account ? (
                    <button
                      onClick={() => disconnectPlatform(platform.key)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50">
                      {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => connectPlatform(platform.key)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                      style={{ background: `${platform.color}20`, color: platform.color, border: `1px solid ${platform.color}30` }}>
                      {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}
                      Connect
                    </button>
                  )
                )}
                {(platform as { comingSoon?: boolean }).comingSoon && (
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-slate-600 border border-white/8">Soon</span>
                )}
              </div>
            )
          })}
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
    </>
  )
}
