"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, UserPlus, Trash2, Mail, Loader2, Crown,
  CheckCircle2, Clock, AlertCircle, Zap,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import UpgradeModal from "@/components/UpgradeModal"

interface Member {
  id: string
  email: string
  role: string
  status: string
  invited_at: string
  joined_at: string | null
}

const ROLE_COLORS: Record<string, string> = {
  editor: "#F7BE4D",
  viewer: "#818cf8",
}

function timeAgo(iso: string) {
  const diff  = Date.now() - new Date(iso).getTime()
  const days  = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  if (days > 0)  return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return "just now"
}

export default function TeamPage() {
  const [members,       setMembers]       = useState<Member[]>([])
  const [workspace,     setWorkspace]     = useState<{ id: string; name: string } | null>(null)
  const [planName,      setPlanName]      = useState("free")
  const [loading,       setLoading]       = useState(true)
  const [inviteEmail,   setInviteEmail]   = useState("")
  const [inviteRole,    setInviteRole]    = useState<"editor" | "viewer">("editor")
  const [inviting,      setInviting]      = useState(false)
  const [inviteMsg,     setInviteMsg]     = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [removing,      setRemoving]      = useState<string | null>(null)
  const [upgradeOpen,   setUpgradeOpen]   = useState(false)

  const isAgency = planName === "agency"

  const loadTeam = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }

    const [planRes, teamRes] = await Promise.all([
      supabase.from("users").select("plan_name").eq("id", session.user.id).single(),
      fetch("/api/team/invite", { headers: { Authorization: `Bearer ${session.access_token}` } }),
    ])

    setPlanName(planRes.data?.plan_name ?? "free")

    if (teamRes.ok) {
      const data = await teamRes.json()
      setMembers(data.members ?? [])
      setWorkspace(data.workspace ?? null)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadTeam() }, [loadTeam])

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    setInviteMsg(null)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch("/api/team/invite", {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body:    JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
    })
    const data = await res.json()
    if (!res.ok) {
      setInviteMsg({ type: "error", text: data.error || "Failed to invite" })
    } else {
      setInviteMsg({ type: "success", text: `Invite sent to ${inviteEmail}` })
      setInviteEmail("")
      await loadTeam()
    }
    setInviting(false)
  }

  const handleRemove = async (memberId: string) => {
    setRemoving(memberId)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch("/api/team/invite", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body:    JSON.stringify({ memberId }),
    })
    setMembers(m => m.filter(x => x.id !== memberId))
    setRemoving(null)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#818cf8]/10 border border-[#818cf8]/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-[#818cf8]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {workspace?.name ?? "Team Workspace"}
            </h1>
            <p className="text-slate-500 text-xs">Invite collaborators and manage access</p>
          </div>
        </div>
        {!isAgency && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setUpgradeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
              border border-[#818cf8]/30 bg-[#818cf8]/10 text-[#818cf8] hover:bg-[#818cf8]/20 transition-all">
            <Crown className="w-3.5 h-3.5" />
            Agency Plan
          </motion.button>
        )}
      </div>

      {/* Agency gate */}
      {!isAgency && !loading ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#818cf8]/20 bg-[#818cf8]/[0.04] p-8 text-center"
        >
          <Crown className="w-10 h-10 text-[#818cf8] mx-auto mb-4" />
          <h2 className="text-base font-bold text-white mb-2">Team features require Agency plan</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
            Invite up to 10 collaborators, manage roles, and approve content before publishing.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setUpgradeOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa)", color: "#fff" }}>
            <Zap className="w-4 h-4" />
            Upgrade to Agency
          </motion.button>
        </motion.div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#818cf8] animate-spin" />
        </div>
      ) : (
        <>
          {/* Invite form */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-4">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Invite Member</p>

            <div className="flex gap-2">
              <input
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleInvite()}
                placeholder="colleague@company.com"
                type="email"
                className="input-premium flex-1 text-sm py-2.5 px-3 rounded-xl"
              />
              {/* Role picker */}
              <div className="flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]">
                {(["editor", "viewer"] as const).map(r => (
                  <button key={r} onClick={() => setInviteRole(r)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                    style={inviteRole === r
                      ? { background: ROLE_COLORS[r] + "25", color: ROLE_COLORS[r], border: `1px solid ${ROLE_COLORS[r]}40` }
                      : { color: "#64748b" }}>
                    {r}
                  </button>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold
                  disabled:opacity-40 transition-all"
                style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa)", color: "#fff" }}>
                {inviting
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <><UserPlus className="w-3.5 h-3.5" />Send Invite</>}
              </motion.button>
            </div>

            <AnimatePresence>
              {inviteMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                    inviteMsg.type === "success"
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                      : "text-red-400 bg-red-500/10 border border-red-500/20"
                  }`}>
                  {inviteMsg.type === "success"
                    ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                  {inviteMsg.text}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-[11px] text-slate-600">
              <strong className="text-slate-500">Editor</strong> — can create, schedule, and draft posts.{" "}
              <strong className="text-slate-500">Viewer</strong> — read-only access.
            </p>
          </div>

          {/* Members list */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              {members.length} Member{members.length !== 1 ? "s" : ""}
            </p>

            {members.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] py-12 text-center">
                <Mail className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No members yet — send your first invite above.</p>
              </div>
            ) : (
              <AnimatePresence>
                {members.map((m, i) => (
                  <motion.div key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16, height: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-white/8 bg-white/[0.02]
                      hover:border-white/15 transition-all">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                      style={{ background: `${ROLE_COLORS[m.role]}20`, color: ROLE_COLORS[m.role] }}>
                      {m.email[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{m.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold capitalize px-1.5 py-0.5 rounded-full"
                          style={{ background: `${ROLE_COLORS[m.role]}18`, color: ROLE_COLORS[m.role] }}>
                          {m.role}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-600">
                          {m.status === "active"
                            ? <><CheckCircle2 className="w-3 h-3 text-emerald-500" />Joined {m.joined_at ? timeAgo(m.joined_at) : ""}</>
                            : <><Clock className="w-3 h-3 text-[#F7BE4D]" />Invited {timeAgo(m.invited_at)}</>}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleRemove(m.id)}
                      disabled={removing === m.id}
                      className="p-1.5 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40">
                      {removing === m.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </>
      )}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        onSuccess={plan => setPlanName(plan)}
      />
    </div>
  )
}
