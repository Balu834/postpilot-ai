"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Users, CheckCircle2, XCircle, Loader2, Zap } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function JoinTeamPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const inviteToken  = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "joining" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [workspace, setWorkspace] = useState<{ name: string } | null>(null)

  useEffect(() => {
    if (!inviteToken) { setStatus("error"); setMessage("Invalid invite link."); return }
    setStatus("joining")
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Redirect to login, come back here after
        router.push(`/login?redirect=${encodeURIComponent(`/team/join?token=${inviteToken}`)}`)
        return
      }
      const res = await fetch("/api/team/join", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body:    JSON.stringify({ inviteToken }),
      })
      const data = await res.json()
      if (!res.ok) { setStatus("error"); setMessage(data.error || "Failed to join team"); return }
      setWorkspace(data.workspace)
      setStatus("success")
    })()
  }, [inviteToken, router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="w-full max-w-sm rounded-2xl p-8 text-center"
        style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 32px 80px rgba(0,0,0,0.12)" }}
      >
        <div className="w-14 h-14 rounded-2xl bg-[#818cf8]/15 flex items-center justify-center mx-auto mb-5">
          {status === "loading" || status === "joining" ? (
            <Loader2 className="w-7 h-7 text-[#818cf8] animate-spin" />
          ) : status === "success" ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          ) : (
            <XCircle className="w-7 h-7 text-red-400" />
          )}
        </div>

        {(status === "loading" || status === "joining") && (
          <>
            <h1 className="text-lg font-black text-white mb-2">Joining workspace…</h1>
            <p className="text-sm text-slate-500">Verifying your invite</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-lg font-black text-white mb-2">You&apos;re in! 🎉</h1>
            <p className="text-sm text-slate-400 mb-6">
              You joined <span className="text-white font-semibold">{workspace?.name}</span>. You can now collaborate on content.
            </p>
            <motion.button
              onClick={() => router.push("/dashboard")}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #F7BE4D, #ffd166)", color: "#050816" }}
            >
              <Zap className="w-4 h-4" fill="currentColor" strokeWidth={0} />
              Go to Dashboard
            </motion.button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-lg font-black text-white mb-2">Invalid invite</h1>
            <p className="text-sm text-slate-400 mb-6">{message}</p>
            <button
              onClick={() => router.push("/")}
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              Go to homepage →
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
