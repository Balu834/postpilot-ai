"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Key, Loader2, CheckCircle2, Zap, Crown, Link2, Unlink, AlertCircle, Bell, Gift, Copy, CheckCheck, X, Eye, EyeOff, Users, UserPlus, Trash2, Mail } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import UpgradeModal from "@/components/UpgradeModal"
import { analytics } from "@/lib/analytics"

interface SocialAccount { platform: string; username: string | null; expires_at: string | null }

function isExpiringSoon(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
}

const SOCIAL_PLATFORMS = [
  { key: "twitter",   label: "Twitter / X",  icon: "𝕏",  color: "#94a3b8", bg: "rgba(148,163,184,0.12)", manual: false },
  { key: "bluesky",   label: "Bluesky",      icon: "🦋", color: "#0085ff", bg: "rgba(0,133,255,0.12)",   manual: true  },
  { key: "threads",   label: "Threads",      icon: "🧵", color: "#ffffff", bg: "rgba(255,255,255,0.08)", manual: false },
  { key: "linkedin",  label: "LinkedIn",     icon: "in", color: "#0077B5", bg: "rgba(0,119,181,0.12)",   manual: false },
  { key: "instagram", label: "Instagram",    icon: "IG", color: "#E1306C", bg: "rgba(225,48,108,0.12)",  manual: false },
  { key: "facebook",  label: "Facebook",     icon: "f",  color: "#1877F2", bg: "rgba(24,119,242,0.12)",  manual: false },
  { key: "pinterest", label: "Pinterest",    icon: "📌", color: "#E60023", bg: "rgba(230,0,35,0.10)",    manual: false, comingSoon: true },
  { key: "youtube",   label: "YouTube",      icon: "▶",  color: "#FF0000", bg: "rgba(255,0,0,0.10)",     manual: false },
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
  const [notifyPublished, setNotifyPublished] = useState(false)
  const [notifyDigest,    setNotifyDigest]    = useState(false)
  const [savingNotif,     setSavingNotif]     = useState(false)
  const [notifSaved,      setNotifSaved]      = useState(false)
  const [referralCode,    setReferralCode]    = useState("")
  const [referralCount,   setReferralCount]   = useState(0)
  const [referralCredits, setReferralCredits] = useState(0)
  const [copiedRef,         setCopiedRef]         = useState(false)
  const [paymentId,         setPaymentId]         = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput,       setDeleteInput]       = useState("")
  const [deleting,          setDeleting]          = useState(false)

  // Team
  const [teamMembers,     setTeamMembers]     = useState<{ id: string; email: string; role: string; status: string; joined_at: string | null }[]>([])
  const [teamWorkspace,   setTeamWorkspace]   = useState<{ id: string; name: string } | null>(null)
  const [inviteEmail,     setInviteEmail]     = useState("")
  const [inviteRole,      setInviteRole]      = useState<"editor" | "viewer">("editor")
  const [inviting,        setInviting]        = useState(false)
  const [inviteMsg,       setInviteMsg]       = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [removingMember,  setRemovingMember]  = useState<string | null>(null)

  // Bluesky manual connect
  const [blueskyOpen,       setBlueskyOpen]       = useState(false)
  const [blueskyHandle,     setBlueskyHandle]     = useState("")
  const [blueskyPassword,   setBlueskyPassword]   = useState("")
  const [blueskyShowPw,     setBlueskyShowPw]     = useState(false)
  const [blueskyConnecting, setBlueskyConnecting] = useState(false)
  const [blueskyError,      setBlueskyError]      = useState("")

  const FREE_LIMIT = 30
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
    if (searchParams.get("upgrade") === "1") setUpgradeOpen(true)
    if (connected || error) {
      const url = new URL(window.location.href)
      url.searchParams.delete("social_connected")
      url.searchParams.delete("social_error")
      window.history.replaceState({}, "", url)
    }
  }, [loadAccounts, searchParams])

  const connectPlatform = async (platform: string) => {
    if (platform === "bluesky") { setBlueskyOpen(true); setBlueskyError(""); return }
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

  const loadTeam = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch("/api/team/invite", { headers: { Authorization: `Bearer ${session.access_token}` } })
    if (!res.ok) return
    const data = await res.json()
    setTeamMembers(data.members ?? [])
    setTeamWorkspace(data.workspace ?? null)
  }

  useEffect(() => {
    if (isPro) loadTeam()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro])

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true); setInviteMsg(null)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch("/api/team/invite", {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body:    JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
    })
    const data = await res.json()
    if (!res.ok) { setInviteMsg({ type: "error", text: data.error || "Failed to invite" }) }
    else { setInviteMsg({ type: "success", text: `Invite sent to ${inviteEmail}` }); setInviteEmail(""); await loadTeam() }
    setInviting(false)
  }

  const handleRemoveMember = async (memberId: string) => {
    setRemovingMember(memberId)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch("/api/team/invite", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body:    JSON.stringify({ memberId }),
    })
    setTeamMembers(m => m.filter(x => x.id !== memberId))
    setRemovingMember(null)
  }

  const saveBluesky = async () => {
    if (!blueskyHandle.trim() || !blueskyPassword.trim()) {
      setBlueskyError("Handle and App Password are required")
      return
    }
    setBlueskyConnecting(true)
    setBlueskyError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/social/bluesky/connect", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body:    JSON.stringify({ handle: blueskyHandle.trim(), appPassword: blueskyPassword.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Connection failed")
      setBlueskyOpen(false)
      setBlueskyHandle("")
      setBlueskyPassword("")
      await loadAccounts()
      setSocialMsg({ type: "success", text: "Bluesky connected successfully!" })
    } catch (err: unknown) {
      setBlueskyError(err instanceof Error ? err.message : "Connection failed")
    } finally {
      setBlueskyConnecting(false)
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

    const [profileRes, genRes, refRes] = await Promise.all([
      supabase.from("users").select("name, email, plan_name, plan_expires_at, email_notify_published, email_notify_digest, referral_code, referral_credits, razorpay_payment_id").eq("id", user.id).single(),
      supabase.from("generations").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("referrals").select("id", { count: "exact" }).eq("referrer_id", user.id),
    ])

    if (profileRes.data) {
      setName(profileRes.data.name || "")
      setEmail(profileRes.data.email || user.email || "")
      setPlanName(profileRes.data.plan_name || "free")
      setExpiresAt(profileRes.data.plan_expires_at || null)
      setNotifyPublished(profileRes.data.email_notify_published ?? false)
      setNotifyDigest(profileRes.data.email_notify_digest ?? false)
      setReferralCode(profileRes.data.referral_code ?? "")
      setReferralCredits(profileRes.data.referral_credits ?? 0)
      setReferralCount(refRes.count ?? 0)
      setPaymentId(profileRes.data.razorpay_payment_id ?? null)
    } else {
      setEmail(user.email || "")
    }
    setCredits(genRes.count ?? 0)
    setLoading(false)
  }

  const handleSaveNotifications = async () => {
    setSavingNotif(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from("users")
      .update({ email_notify_published: notifyPublished, email_notify_digest: notifyDigest })
      .eq("id", user.id)
    setSavingNotif(false)
    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 2500)
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    try {
      await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      await supabase.auth.signOut()
      window.location.href = "/"
    } catch {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
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
    {/* Bluesky connect modal */}
    <AnimatePresence>
      {blueskyOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(12px)" }}
          onClick={e => e.target === e.currentTarget && setBlueskyOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-sm rounded-2xl p-6 space-y-4"
            style={{ background: "#ffffff", border: "1px solid rgba(0,133,255,0.35)", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "rgba(0,133,255,0.15)" }}>🦋</div>
                <div>
                  <p className="text-sm font-bold text-white">Connect Bluesky</p>
                  <p className="text-[11px] text-slate-500">Uses an App Password — not your main password</p>
                </div>
              </div>
              <button onClick={() => setBlueskyOpen(false)} className="text-slate-600 hover:text-slate-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium mb-1.5 block">Bluesky Handle</label>
              <input
                value={blueskyHandle}
                onChange={e => setBlueskyHandle(e.target.value)}
                placeholder="yourname.bsky.social"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#0085ff]/50 transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium mb-1.5 block">App Password</label>
              <div className="relative">
                <input
                  type={blueskyShowPw ? "text" : "password"}
                  value={blueskyPassword}
                  onChange={e => setBlueskyPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveBluesky()}
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#0085ff]/50 transition-all pr-10"
                />
                <button
                  onClick={() => setBlueskyShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {blueskyShowPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-600 mt-1.5">
                Generate one at: Bluesky → Settings → Privacy and Security → App Passwords
              </p>
            </div>

            {blueskyError && <p className="text-xs text-red-400">{blueskyError}</p>}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setBlueskyOpen(false)}
                className="flex-1 text-xs font-medium py-2.5 rounded-xl text-slate-500 hover:text-slate-300 transition-all"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                Cancel
              </button>
              <motion.button
                onClick={saveBluesky}
                disabled={blueskyConnecting}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #0085ff, #338fff)", color: "#fff" }}
              >
                {blueskyConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                {blueskyConnecting ? "Connecting…" : "Connect"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

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
                ? `${planName.charAt(0).toUpperCase()}${planName.slice(1)} Plan`
                : "Free Plan · 30 generations / month"
              }
            </p>
          </div>
          {!isPro && (
            <button
              onClick={() => { analytics.upgradeClicked("settings"); setUpgradeOpen(true) }}
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

        {isPro && (() => {
          const expiry     = expiresAt ? new Date(expiresAt) : null
          const daysLeft   = expiry ? Math.ceil((expiry.getTime() - Date.now()) / 86400000) : null
          const isExpiring = daysLeft !== null && daysLeft <= 7
          const isExpired  = daysLeft !== null && daysLeft <= 0
          return (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                Unlimited AI generations · All platforms · Priority support
              </div>

              {/* Expiry row */}
              {expiry && (
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl border text-[11px] ${
                  isExpired  ? "bg-red-500/8 border-red-500/20 text-red-400" :
                  isExpiring ? "bg-amber-500/8 border-amber-500/20 text-amber-400" :
                               "bg-white/[0.02] border-white/[0.06] text-slate-500"
                }`}>
                  <span>
                    {isExpired  ? "Plan expired" :
                     isExpiring ? `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}` :
                                  `Active until ${expiry.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                  </span>
                  {(isExpiring || isExpired) && (
                    <button
                      onClick={() => { analytics.upgradeClicked("settings_renew"); setUpgradeOpen(true) }}
                      className="font-semibold text-[#F7BE4D] hover:text-[#ffd166] transition-colors">
                      Renew now →
                    </button>
                  )}
                </div>
              )}

              {/* Payment reference */}
              {paymentId && (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-[11px]">
                  <span className="text-slate-500">Payment ID</span>
                  <span className="font-mono text-slate-400 text-[10px]">{paymentId}</span>
                </div>
              )}
            </div>
          )
        })()}
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
            const account    = accounts.find(a => a.platform === platform.key)
            const isLoading  = connecting === platform.key
            const expiring   = account ? isExpiringSoon(account.expires_at) : false
            const comingSoon = 'comingSoon' in platform && platform.comingSoon
            return (
              <div key={platform.key}
                className="flex items-center gap-3 p-3.5 rounded-xl border transition-all"
                style={{
                  background:   account ? platform.bg : "rgba(255,255,255,0.02)",
                  borderColor:  expiring ? "rgba(251,146,60,0.35)" : account ? `${platform.color}30` : "rgba(255,255,255,0.06)",
                  opacity:      comingSoon && !account ? 0.55 : 1,
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                  style={{ background: platform.bg, color: platform.color }}>
                  {platform.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{platform.label}</p>
                    {expiring && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.3)" }}>
                        Expiring soon
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] truncate" style={{ color: expiring ? "#fb923c" : account ? platform.color : "#475569" }}>
                    {account
                      ? account.username ? `@${account.username}` : "Connected"
                      : "Not connected"
                    }
                  </p>
                </div>
                {account ? (
                  <div className="flex items-center gap-2">
                    {expiring && (
                      <button
                        onClick={() => connectPlatform(platform.key)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                        style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.3)" }}>
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}
                        Reconnect
                      </button>
                    )}
                    <button
                      onClick={() => disconnectPlatform(platform.key)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50">
                      {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
                      Disconnect
                    </button>
                  </div>
                ) : comingSoon ? (
                  <span className="text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#475569", border: "1px solid rgba(255,255,255,0.08)" }}>
                    Coming Soon
                  </span>
                ) : (
                  <button
                    onClick={() => connectPlatform(platform.key)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    style={{ background: `${platform.color}20`, color: platform.color, border: `1px solid ${platform.color}30` }}>
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}
                    Connect
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Email Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-5 border border-white/6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#F7BE4D]/15 flex items-center justify-center">
            <Bell className="w-4 h-4 text-[#F7BE4D]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Email Notifications</h2>
            <p className="text-[11px] text-slate-500">Control which emails PostPilot sends you</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              key: "published" as const,
              label: "Post published",
              desc: "Get an email every time a scheduled post goes live",
              value: notifyPublished,
              set: setNotifyPublished,
            },
            {
              key: "digest" as const,
              label: "Weekly digest",
              desc: "A Monday morning summary of your content performance",
              value: notifyDigest,
              set: setNotifyDigest,
            },
          ].map(({ key, label, desc, value, set }) => (
            <div key={key}
              className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-white/6"
              style={{ background: value ? "rgba(247,190,77,0.04)" : "rgba(255,255,255,0.02)" }}>
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
              </div>
              {/* Toggle */}
              <button
                onClick={() => set(!value)}
                className="relative flex-shrink-0 w-10 h-5.5 rounded-full transition-all duration-200"
                style={{
                  background: value ? "#F7BE4D" : "rgba(255,255,255,0.1)",
                  boxShadow: value ? "0 0 12px rgba(247,190,77,0.4)" : "none",
                  height: "22px",
                  width: "40px",
                }}>
                <motion.span
                  animate={{ x: value ? 18 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm"
                  style={{ display: "block" }}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSaveNotifications}
            disabled={savingNotif}
            className={`flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-xl transition-all ${
              notifSaved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-[#F7BE4D] text-[#050816] hover:bg-[#ffd166] glow-yellow-sm disabled:opacity-60"
            }`}>
            {savingNotif && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {notifSaved && <CheckCircle2 className="w-3.5 h-3.5" />}
            {notifSaved ? "Saved!" : "Save Preferences"}
          </button>
        </div>
      </motion.div>

      {/* Referral Program */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="rounded-2xl p-5 border relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(247,190,77,0.07) 0%, rgba(247,190,77,0.02) 100%)", borderColor: "rgba(247,190,77,0.18)" }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, #F7BE4D 0%, transparent 70%)" }} />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#F7BE4D]/20 flex items-center justify-center">
              <Gift className="w-4 h-4 text-[#F7BE4D]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Refer & Earn</h2>
              <p className="text-[11px] text-slate-500">Get +5 free credits for every friend who signs up</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Friends referred", value: referralCount },
              { label: "Credits earned",   value: referralCredits },
            ].map(s => (
              <div key={s.label} className="rounded-xl px-4 py-3 border border-white/6"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-xl font-black text-[#F7BE4D]">{s.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Referral link */}
          <div>
            <p className="text-xs text-slate-400 font-medium mb-2">Your referral link</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/8 min-w-0"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className="text-xs text-slate-400 truncate">
                  {typeof window !== "undefined" ? `${window.location.origin}/ref/` : ""}
                  <span className="text-white font-mono">{referralCode || "loading..."}</span>
                </span>
              </div>
              <button
                onClick={() => {
                  if (!referralCode) return
                  const url = `${window.location.origin}/ref/${referralCode}`
                  navigator.clipboard.writeText(url)
                  setCopiedRef(true)
                  setTimeout(() => setCopiedRef(false), 2000)
                }}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-xl
                  border transition-all flex-shrink-0 ${
                  copiedRef
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                    : "bg-[#F7BE4D]/15 text-[#F7BE4D] border-[#F7BE4D]/25 hover:bg-[#F7BE4D]/25"
                }`}>
                {copiedRef ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedRef ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Team — Agency only */}
      {planName.includes("agency") ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass rounded-2xl p-5 border border-white/6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#818cf8]/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#818cf8]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Team</h2>
              <p className="text-[11px] text-slate-500">{teamWorkspace?.name ?? "Your workspace"} · invite editors &amp; viewers</p>
            </div>
          </div>

          {/* Invite form */}
          <div className="flex gap-2 mb-4">
            <input
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleInvite()}
              placeholder="teammate@email.com"
              type="email"
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#818cf8]/50 transition-all"
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as "editor" | "viewer")}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-[#818cf8]/50 transition-all"
              style={{ colorScheme: "dark" }}
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <motion.button
              onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              style={{ background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)", color: "#818cf8" }}
            >
              {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              Invite
            </motion.button>
          </div>

          {inviteMsg && (
            <p className={`text-xs mb-3 ${inviteMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
              {inviteMsg.text}
            </p>
          )}

          {/* Members list */}
          {teamMembers.length > 0 ? (
            <div className="space-y-2">
              {teamMembers.map(member => (
                <div key={member.id}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-white/[0.06]"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: "rgba(129,140,248,0.15)", color: "#818cf8" }}>
                    {member.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{member.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: "rgba(129,140,248,0.12)", color: "#818cf8" }}>
                        {member.role}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        member.status === "active"
                          ? "bg-emerald-500/12 text-emerald-400"
                          : "bg-amber-500/12 text-amber-400"
                      }`}>
                        {member.status === "active" ? "Active" : "Invite sent"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={removingMember === member.id}
                    className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-40 p-1"
                  >
                    {removingMember === member.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-4 rounded-xl border border-dashed border-white/[0.08] text-center">
              <Mail className="w-4 h-4 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-600">No team members yet — invite your first collaborator above.</p>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-2xl p-5 border border-[#818cf8]/15 flex items-center gap-4"
          style={{ background: "rgba(129,140,248,0.05)" }}>
          <div className="w-9 h-9 rounded-xl bg-[#818cf8]/15 flex items-center justify-center flex-shrink-0">
            <Users className="w-4.5 h-4.5 text-[#818cf8]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Team Collaboration</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Invite editors, manage approvals — Agency plan only</p>
          </div>
          <button
            onClick={() => { analytics.upgradeClicked("settings_team"); setUpgradeOpen(true) }}
            className="text-xs font-bold px-4 py-2 rounded-xl flex-shrink-0 transition-all"
            style={{ background: "rgba(129,140,248,0.15)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.25)" }}>
            Upgrade →
          </button>
        </motion.div>
      )}

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

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="rounded-2xl p-5 border border-red-500/20"
        style={{ background: "rgba(239,68,68,0.04)" }}>
        <h2 className="text-sm font-semibold text-red-400 mb-1">Danger Zone</h2>
        <p className="text-xs text-slate-500 mb-4">These actions are permanent and cannot be undone.</p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs font-semibold text-red-400 border border-red-500/25 px-4 py-2 rounded-xl hover:bg-red-500/10 transition-all">
            Delete my account
          </button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <p className="text-xs text-red-300 font-medium">
                This will permanently delete your account, all generated content, and cancel any active subscription.
              </p>
              <p className="text-xs text-slate-400">
                Type <span className="font-mono text-red-400 select-none">DELETE</span> to confirm:
              </p>
              <input
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full bg-white/5 border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500/60 transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput("") }}
                  className="text-xs px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== "DELETE" || deleting}
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                  {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
                  Delete my account permanently
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
    </>
  )
}
