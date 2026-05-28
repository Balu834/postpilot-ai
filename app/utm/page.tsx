"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Copy, CheckCheck, Trash2, Plus, ExternalLink } from "lucide-react"

const STORAGE_KEY = "postpilot_utm_links"
const MAX_SAVED   = 20

interface SavedLink {
  id:        string
  label:     string
  url:       string
  createdAt: string
}

const SOURCE_PRESETS = [
  { label: "Google",    value: "google"    },
  { label: "Facebook",  value: "facebook"  },
  { label: "Instagram", value: "instagram" },
  { label: "LinkedIn",  value: "linkedin"  },
  { label: "Twitter",   value: "twitter"   },
  { label: "Email",     value: "email"     },
  { label: "Newsletter",value: "newsletter"},
]

const MEDIUM_PRESETS = [
  { label: "CPC",         value: "cpc"         },
  { label: "Paid Social", value: "paid_social"  },
  { label: "Organic",     value: "organic"      },
  { label: "Email",       value: "email"        },
  { label: "Newsletter",  value: "newsletter"   },
  { label: "Social",      value: "social"       },
  { label: "Referral",    value: "referral"     },
]

function buildUTM(base: string, source: string, medium: string, campaign: string, term: string, content: string) {
  if (!base) return ""
  try {
    const url = new URL(base.startsWith("http") ? base : `https://${base}`)
    if (source)   url.searchParams.set("utm_source",   source.trim().replace(/\s+/g, "_"))
    if (medium)   url.searchParams.set("utm_medium",   medium.trim().replace(/\s+/g, "_"))
    if (campaign) url.searchParams.set("utm_campaign", campaign.trim().replace(/\s+/g, "_"))
    if (term)     url.searchParams.set("utm_term",     term.trim().replace(/\s+/g, "_"))
    if (content)  url.searchParams.set("utm_content",  content.trim().replace(/\s+/g, "_"))
    return url.toString()
  } catch { return "" }
}

export default function UTMPage() {
  const [baseUrl,   setBaseUrl]   = useState("")
  const [source,    setSource]    = useState("")
  const [medium,    setMedium]    = useState("")
  const [campaign,  setCampaign]  = useState("")
  const [term,      setTerm]      = useState("")
  const [utmContent, setUtmContent] = useState("")
  const [copied,    setCopied]    = useState(false)
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([])
  const [saveLabel, setSaveLabel] = useState("")

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSavedLinks(JSON.parse(stored))
    } catch {}
  }, [])

  const utmUrl = useMemo(
    () => buildUTM(baseUrl, source, medium, campaign, term, utmContent),
    [baseUrl, source, medium, campaign, term, utmContent]
  )

  const handleCopy = async () => {
    if (!utmUrl) return
    await navigator.clipboard.writeText(utmUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    if (!utmUrl) return
    const newLink: SavedLink = {
      id:        crypto.randomUUID(),
      label:     saveLabel || campaign || source || "Untitled Link",
      url:       utmUrl,
      createdAt: new Date().toISOString(),
    }
    const updated = [newLink, ...savedLinks].slice(0, MAX_SAVED)
    setSavedLinks(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setSaveLabel("")
  }

  const handleDelete = (id: string) => {
    const updated = savedLinks.filter(l => l.id !== id)
    setSavedLinks(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const copyLink = async (url: string) => {
    await navigator.clipboard.writeText(url)
  }

  const InputField = ({ label, value, onChange, placeholder, optional = false }: {
    label: string; value: string; onChange: (v: string) => void
    placeholder: string; optional?: boolean
  }) => (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
        {label} {optional && <span className="text-slate-700 normal-case font-normal">(optional)</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5
          text-sm text-white placeholder-slate-600
          focus:outline-none focus:border-[#F7BE4D]/40 focus:bg-white/[0.05] transition-all"
      />
    </div>
  )

  const PresetRow = ({ presets, value, onChange }: {
    presets: { label: string; value: string }[]
    value: string
    onChange: (v: string) => void
  }) => (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {presets.map(p => (
        <button
          key={p.value}
          onClick={() => onChange(value === p.value ? "" : p.value)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
            value === p.value
              ? "bg-[#F7BE4D]/15 border-[#F7BE4D]/30 text-[#F7BE4D]"
              : "border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/15"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20
            flex items-center justify-center">
            <Globe className="w-4 h-4 text-[#F7BE4D]" />
          </div>
          <h1 className="text-xl font-bold text-white">UTM Link Builder</h1>
        </div>
        <p className="text-slate-500 text-sm ml-10.5">
          Build trackable campaign URLs to measure your social traffic in Google Analytics.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 space-y-4">

        <InputField
          label="Website URL"
          value={baseUrl}
          onChange={setBaseUrl}
          placeholder="https://yourwebsite.com/landing-page"
        />

        <div>
          <InputField
            label="Campaign Source"
            value={source}
            onChange={setSource}
            placeholder="google, facebook, newsletter…"
          />
          <PresetRow presets={SOURCE_PRESETS} value={source} onChange={setSource} />
        </div>

        <div>
          <InputField
            label="Campaign Medium"
            value={medium}
            onChange={setMedium}
            placeholder="cpc, email, social…"
          />
          <PresetRow presets={MEDIUM_PRESETS} value={medium} onChange={setMedium} />
        </div>

        <InputField
          label="Campaign Name"
          value={campaign}
          onChange={setCampaign}
          placeholder="summer_sale, product_launch…"
        />

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Campaign Term"
            value={term}
            onChange={setTerm}
            placeholder="running+shoes"
            optional
          />
          <InputField
            label="Campaign Content"
            value={utmContent}
            onChange={setUtmContent}
            placeholder="banner_ad, text_link"
            optional
          />
        </div>
      </div>

      {/* Preview */}
      <AnimatePresence>
        {utmUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-[#F7BE4D]/15 bg-[#F7BE4D]/[0.03] p-5 space-y-3"
          >
            <p className="text-[11px] font-semibold text-[#F7BE4D] uppercase tracking-widest">
              Generated URL
            </p>
            <p className="text-xs text-slate-400 font-mono break-all leading-relaxed bg-black/30
              rounded-xl px-4 py-3 border border-white/8">
              {utmUrl}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                  bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 text-[#F7BE4D]
                  hover:bg-[#F7BE4D]/15 transition-all"
              >
                {copied
                  ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</>
                  : <><Copy className="w-3.5 h-3.5" /> Copy URL</>}
              </button>

              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={saveLabel}
                  onChange={e => setSaveLabel(e.target.value)}
                  placeholder="Save as… (optional label)"
                  className="flex-1 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2
                    text-xs text-white placeholder-slate-600
                    focus:outline-none focus:border-white/20 transition-all"
                />
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                    bg-white/5 border border-white/10 text-slate-300 hover:text-white
                    hover:bg-white/8 transition-all whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Links */}
      {savedLinks.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Saved Links ({savedLinks.length})
          </p>
          <div className="space-y-2">
            {savedLinks.map(link => (
              <motion.div
                key={link.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-white/[0.02] border border-white/8
                  rounded-xl px-4 py-3 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{link.label}</p>
                  <p className="text-[11px] text-slate-600 font-mono truncate">{link.url}</p>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyLink(link.url)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-[#F7BE4D]
                      hover:bg-[#F7BE4D]/10 transition-all"
                    title="Copy"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-600 hover:text-blue-400
                      hover:bg-blue-500/10 transition-all"
                    title="Open"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400
                      hover:bg-red-500/10 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
