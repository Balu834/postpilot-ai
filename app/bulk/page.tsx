"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Trash2, CalendarClock, Download } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

const VALID_PLATFORMS = ["instagram","linkedin","twitter","facebook","threads","bluesky","pinterest","youtube"]

interface ParsedRow {
  content:        string
  platform:       string
  scheduled_time: string
  _valid:         boolean
  _error?:        string
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  // Skip header
  return lines.slice(1).map((line, i) => {
    // Simple CSV split that handles quoted fields
    const cols: string[] = []
    let cur = ""
    let inQuote = false
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote }
      else if (ch === "," && !inQuote) { cols.push(cur.trim()); cur = "" }
      else { cur += ch }
    }
    cols.push(cur.trim())

    const [content = "", platform = "", scheduled_time = ""] = cols
    const rowNum = i + 2

    if (!content) return { content, platform, scheduled_time, _valid: false, _error: `Row ${rowNum}: content empty` }
    if (!VALID_PLATFORMS.includes(platform.toLowerCase())) {
      return { content, platform, scheduled_time, _valid: false, _error: `Row ${rowNum}: unknown platform "${platform}"` }
    }
    const date = new Date(scheduled_time)
    if (isNaN(date.getTime())) {
      return { content, platform, scheduled_time, _valid: false, _error: `Row ${rowNum}: invalid date "${scheduled_time}"` }
    }
    return { content, platform: platform.toLowerCase(), scheduled_time, _valid: true }
  }).filter(r => r.content || r.platform || r.scheduled_time)
}

const TEMPLATE_CSV = `content,platform,scheduled_time
"Excited to share our latest product update! Check out what's new. 🚀",linkedin,2026-06-01T09:00:00
"Behind the scenes of our team brainstorm session 💡 #startup #buildinpublic",instagram,2026-06-01T12:00:00
"Hot take: most productivity hacks are just procrastination in disguise.",twitter,2026-06-02T08:00:00`

export default function BulkPage() {
  const fileRef       = useRef<HTMLInputElement>(null)
  const [rows,        setRows]        = useState<ParsedRow[]>([])
  const [fileName,    setFileName]    = useState("")
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState("")
  const [scheduled,   setScheduled]   = useState<number | null>(null)
  const [dragOver,    setDragOver]    = useState(false)

  const validRows   = rows.filter(r => r._valid)
  const invalidRows = rows.filter(r => !r._valid)

  const processFile = (file: File) => {
    setScheduled(null)
    setError("")
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      setRows(parseCSV(text))
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith(".csv")) processFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleSchedule = async () => {
    if (!validRows.length) return
    setLoading(true)
    setError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch("/api/bulk/schedule", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ rows: validRows.map(r => ({
          content:        r.content,
          platform:       r.platform,
          scheduled_time: r.scheduled_time,
        })) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Scheduling failed")
      setScheduled(data.scheduled)
      setRows([])
      setFileName("")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = "postpilot-bulk-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const PLATFORM_ICONS: Record<string, string> = {
    instagram: "📸", linkedin: "💼", twitter: "𝕏", facebook: "📘",
    threads: "🧵", bluesky: "🦋", pinterest: "📌", youtube: "▶",
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20
              flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-[#F7BE4D]" />
            </div>
            <h1 className="text-xl font-bold text-white">Bulk CSV Scheduler</h1>
          </div>
          <p className="text-slate-500 text-sm ml-10.5">
            Upload a CSV to schedule up to 200 posts at once. Perfect for agencies.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
            border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white
            hover:border-white/20 transition-all flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5" /> Template
        </button>
      </div>

      {/* Format guide */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
          CSV Format (3 columns required)
        </p>
        <div className="font-mono text-[11px] text-slate-400 space-y-0.5">
          <p><span className="text-[#F7BE4D]">content</span>, <span className="text-[#F7BE4D]">platform</span>, <span className="text-[#F7BE4D]">scheduled_time</span></p>
          <p className="text-slate-600">&quot;Your post text&quot;, linkedin, 2026-06-01T09:00:00</p>
        </div>
        <p className="text-[10px] text-slate-700 mt-2">
          Platforms: {VALID_PLATFORMS.join(", ")}
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-[#F7BE4D]/50 bg-[#F7BE4D]/05"
            : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <Upload className={`w-8 h-8 mx-auto mb-3 ${dragOver ? "text-[#F7BE4D]" : "text-slate-600"}`} />
        {fileName ? (
          <div>
            <p className="text-sm font-semibold text-white">{fileName}</p>
            <p className="text-[11px] text-slate-500 mt-1">{rows.length} rows parsed</p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-slate-400">Drop your CSV here</p>
            <p className="text-[11px] text-slate-600 mt-1">or click to browse · .csv files only</p>
          </div>
        )}
      </div>

      {/* Success */}
      <AnimatePresence>
        {scheduled !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between rounded-xl border border-emerald-500/20
              bg-emerald-500/08 px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">{scheduled} posts scheduled!</p>
                <p className="text-[11px] text-slate-500">All posts added to your content calendar.</p>
              </div>
            </div>
            <Link
              href="/schedule"
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400
                hover:underline flex-shrink-0"
            >
              <CalendarClock className="w-3.5 h-3.5" /> View calendar →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Errors */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10
          border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Preview table */}
      {rows.length > 0 && (
        <div className="space-y-3">
          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-emerald-400 font-semibold">{validRows.length} valid</span>
              {invalidRows.length > 0 && (
                <span className="text-red-400 font-semibold">{invalidRows.length} errors</span>
              )}
            </div>
            <button
              onClick={() => { setRows([]); setFileName("") }}
              className="text-[11px] text-slate-600 hover:text-slate-400 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>

          {/* Invalid rows */}
          {invalidRows.length > 0 && (
            <div className="rounded-xl border border-red-500/15 bg-red-500/[0.04] px-4 py-3 space-y-1">
              <p className="text-[11px] font-semibold text-red-400 mb-2">Rows with errors (will be skipped)</p>
              {invalidRows.map((r, i) => (
                <p key={i} className="text-[11px] text-red-400/70">{r._error}</p>
              ))}
            </div>
          )}

          {/* Valid rows preview */}
          <div className="rounded-xl border border-white/8 overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_160px] bg-white/[0.03] px-4 py-2 border-b border-white/8">
              {["Content", "Platform", "Scheduled"].map(h => (
                <span key={h} className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{h}</span>
              ))}
            </div>
            <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
              {validRows.slice(0, 50).map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_100px_160px] px-4 py-2.5 items-center hover:bg-white/[0.02]">
                  <p className="text-xs text-slate-300 truncate pr-4">{row.content}</p>
                  <span className="text-xs text-slate-400">
                    {PLATFORM_ICONS[row.platform] ?? "📣"} {row.platform}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(row.scheduled_time).toLocaleDateString("en-IN", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </span>
                </div>
              ))}
            </div>
            {validRows.length > 50 && (
              <div className="px-4 py-2 bg-white/[0.02] border-t border-white/8">
                <p className="text-[11px] text-slate-600">+{validRows.length - 50} more rows</p>
              </div>
            )}
          </div>

          {/* Schedule button */}
          <button
            onClick={handleSchedule}
            disabled={loading || validRows.length === 0}
            className="btn-primary w-full py-3 text-sm font-semibold flex items-center
              justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Scheduling…</>
              : <><CalendarClock className="w-4 h-4" /> Schedule {validRows.length} Posts</>}
          </button>
        </div>
      )}
    </div>
  )
}
