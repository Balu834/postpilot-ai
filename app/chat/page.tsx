"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare, Plus, Send, Sparkles, Copy, CheckCheck,
  Trash2, Pin, PinOff, Search, X, RefreshCw, Loader2,
  ChevronRight, Wand2, TrendingUp, FileText, Target,
  MoreHorizontal, Edit3, Check,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

// ── Types ──────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  pinned: boolean
  createdAt: number
  updatedAt: number
}

// ── Constants ──────────────────────────────────────────────────────────────
const STORAGE_KEY = "postpilot_chat_conversations"

const STARTER_PROMPTS = [
  { icon: Wand2,      color: "#F7BE4D", label: "Write a viral LinkedIn post",       prompt: "Write me a viral LinkedIn post about the importance of building in public as a founder. Make it personal and include a strong hook." },
  { icon: TrendingUp, color: "#818cf8", label: "Content strategy for my niche",     prompt: "Create a 30-day content strategy for a B2B SaaS founder on LinkedIn. Include post types, topics, and posting frequency." },
  { icon: FileText,   color: "#34d399", label: "Turn my blog into 5 social posts",  prompt: "I have a blog post about AI tools for marketers. Help me turn it into 5 platform-specific posts for LinkedIn, Twitter, Instagram, Threads, and Facebook." },
  { icon: Target,     color: "#f472b6", label: "Improve my Instagram bio",          prompt: "Help me write a compelling Instagram bio for a personal finance creator. I help millennials invest smarter and build generational wealth. Keep it under 150 characters." },
  { icon: Sparkles,   color: "#fb923c", label: "Write a Twitter thread",            prompt: "Write a 7-tweet thread about the 5 biggest mistakes founders make when starting a company. Start with a hook that stops the scroll." },
  { icon: MessageSquare, color: "#38bdf8", label: "Brainstorm post ideas",          prompt: "Give me 15 unique post ideas for a tech startup founder who wants to grow on LinkedIn. Mix personal stories, industry insights, and tactical advice." },
]

// ── Helpers ────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveConversations(convs: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs))
  } catch {}
}

function generateTitle(firstMessage: string): string {
  const clean = firstMessage.replace(/[^\w\s]/g, " ").trim()
  const words = clean.split(/\s+/).slice(0, 6).join(" ")
  return words.length > 3 ? words : "New conversation"
}

function parseSSE(raw: string): { event?: string; text?: string; msg?: string } | null {
  const line = raw.trim()
  if (!line.startsWith("data: ")) return null
  try { return JSON.parse(line.slice(6)) } catch { return null }
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── CopyBtn ────────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <motion.button
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
      className="p-1.5 rounded-lg transition-all"
      style={{ color: copied ? "#34d399" : "#94a3b8" }}
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </motion.button>
  )
}

// ── MessageBubble ──────────────────────────────────────────────────────────
function MessageBubble({ message, isStreaming }: { message: Message; isStreaming?: boolean }) {
  const isUser = message.role === "user"

  const formatted = message.content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono">$1</code>')
    .replace(/^#{1,3}\s(.+)$/gm, '<p class="font-bold text-slate-900 mt-3 mb-1">$1</p>')
    .replace(/^\d+\.\s(.+)$/gm, '<div class="flex gap-2 my-0.5"><span class="text-[#F7BE4D] font-bold flex-shrink-0">·</span><span>$1</span></div>')
    .replace(/^[-•]\s(.+)$/gm, '<div class="flex gap-2 my-0.5"><span class="text-[#F7BE4D] flex-shrink-0">→</span><span>$1</span></div>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="flex justify-end"
      >
        <div
          className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
          style={{
            background: "linear-gradient(135deg, #F7BE4D 0%, #ffd97d 100%)",
            color: "#050816",
            boxShadow: "0 2px 12px rgba(247,190,77,0.25)",
          }}
        >
          {message.content}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="flex items-start gap-3 group"
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4 text-[#F7BE4D]" />
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="prose-sm text-sm text-slate-700 leading-relaxed max-w-none"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
        {isStreaming && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.65, repeat: Infinity }}
            className="inline-block w-0.5 h-4 bg-[#F7BE4D] rounded-full ml-0.5 align-middle"
          />
        )}
        {!isStreaming && (
          <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyBtn text={message.content} />
            <span className="text-[10px] text-slate-400">{timeAgo(message.timestamp)}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── ConversationItem ───────────────────────────────────────────────────────
function ConversationItem({
  conv, isActive, onSelect, onPin, onDelete, onRename,
}: {
  conv: Conversation
  isActive: boolean
  onSelect: () => void
  onPin: () => void
  onDelete: () => void
  onRename: (title: string) => void
}) {
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [renaming,   setRenaming]   = useState(false)
  const [titleDraft, setTitleDraft] = useState(conv.title)

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative group"
    >
      <button
        onClick={onSelect}
        className="w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start gap-2.5"
        style={{
          background: isActive ? "rgba(247,190,77,0.08)" : "transparent",
          border: isActive ? "1px solid rgba(247,190,77,0.2)" : "1px solid transparent",
        }}
      >
        {conv.pinned && <Pin className="w-3 h-3 text-[#F7BE4D] flex-shrink-0 mt-0.5" />}
        <div className="flex-1 min-w-0">
          {renaming ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") { onRename(titleDraft); setRenaming(false) }
                if (e.key === "Escape") { setTitleDraft(conv.title); setRenaming(false) }
              }}
              onBlur={() => { onRename(titleDraft); setRenaming(false) }}
              onClick={e => e.stopPropagation()}
              className="w-full text-xs text-slate-900 bg-white border border-[#F7BE4D]/40 rounded-lg px-2 py-1 outline-none"
            />
          ) : (
            <p className={`text-xs truncate font-medium ${isActive ? "text-slate-900" : "text-slate-600"}`}>
              {conv.title}
            </p>
          )}
          <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(conv.updatedAt)}</p>
        </div>
      </button>

      {/* Context menu trigger */}
      <button
        onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
        className="absolute right-2 top-2.5 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
      >
        <MoreHorizontal className="w-3.5 h-3.5 text-slate-500" />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-8 z-20 w-40 rounded-xl bg-white border border-slate-200 shadow-lg overflow-hidden py-1"
            >
              {[
                { icon: Edit3,  label: "Rename",  action: () => { setRenaming(true); setMenuOpen(false) } },
                { icon: conv.pinned ? PinOff : Pin, label: conv.pinned ? "Unpin" : "Pin", action: () => { onPin(); setMenuOpen(false) } },
                { icon: Trash2, label: "Delete",  action: () => { onDelete(); setMenuOpen(false) }, danger: true },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                    item.danger ? "text-red-500 hover:bg-red-50" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId,      setActiveId]      = useState<string | null>(null)
  const [input,         setInput]         = useState("")
  const [isStreaming,   setIsStreaming]    = useState(false)
  const [streamingId,   setStreamingId]   = useState<string | null>(null)
  const [search,        setSearch]        = useState("")
  const [error,         setError]         = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)
  const abortRef       = useRef<AbortController | null>(null)

  const activeConv = conversations.find(c => c.id === activeId) ?? null
  const messages   = activeConv?.messages ?? []

  const filteredConvs = conversations.filter(c =>
    search
      ? c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.messages.some(m => m.content.toLowerCase().includes(search.toLowerCase()))
      : true
  )
  const pinned   = filteredConvs.filter(c => c.pinned)
  const unpinned = filteredConvs.filter(c => !c.pinned)

  useEffect(() => {
    const loaded = loadConversations()
    setConversations(loaded)
    if (loaded.length > 0) setActiveId(loaded[0].id)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isStreaming])

  const updateConvs = (updated: Conversation[]) => {
    setConversations(updated)
    saveConversations(updated)
  }

  const createConversation = (): Conversation => {
    const conv: Conversation = {
      id: uid(), title: "New conversation",
      messages: [], pinned: false,
      createdAt: Date.now(), updatedAt: Date.now(),
    }
    const updated = [conv, ...conversations]
    updateConvs(updated)
    setActiveId(conv.id)
    return conv
  }

  const send = useCallback(async (overrideInput?: string) => {
    const text = (overrideInput ?? input).trim()
    if (!text || isStreaming) return

    setInput("")
    setError("")

    let conv = activeConv
    if (!conv) conv = createConversation()

    const userMsg: Message = { id: uid(), role: "user", content: text, timestamp: Date.now() }
    const assistantId = uid()
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", timestamp: Date.now() }

    const updatedMessages = [...conv.messages, userMsg, assistantMsg]
    const title = conv.messages.length === 0 ? generateTitle(text) : conv.title

    const updatedConv: Conversation = { ...conv, messages: updatedMessages, title, updatedAt: Date.now() }
    const updatedConvs = conversations.map(c => c.id === updatedConv.id ? updatedConv : c)
    const finalConvs = updatedConvs.find(c => c.id === updatedConv.id)
      ? updatedConvs
      : [updatedConv, ...conversations]
    updateConvs(finalConvs)
    setActiveId(updatedConv.id)

    setIsStreaming(true)
    setStreamingId(assistantId)

    abortRef.current?.abort()
    const abort = new AbortController()
    abortRef.current = abort
    const timeout = setTimeout(() => abort.abort(), 90_000)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch("/api/chat", {
        method: "POST",
        signal: abort.signal,
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          messages: updatedMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let   buffer  = ""
      let   full    = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          const evt = parseSSE(line)
          if (!evt) continue
          if (evt.event === "chunk" && evt.text) {
            full += evt.text
            setConversations(prev => {
              const updated = prev.map(c => {
                if (c.id !== updatedConv.id) return c
                return {
                  ...c,
                  updatedAt: Date.now(),
                  messages: c.messages.map(m =>
                    m.id === assistantId ? { ...m, content: full } : m
                  ),
                }
              })
              saveConversations(updated)
              return updated
            })
          }
          if (evt.event === "error") throw new Error(evt.msg)
        }
      }
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") {
        setError(e instanceof Error ? e.message : "Something went wrong")
        setConversations(prev => {
          const updated = prev.map(c => {
            if (c.id !== updatedConv.id) return c
            return { ...c, messages: c.messages.filter(m => m.id !== assistantId) }
          })
          saveConversations(updated)
          return updated
        })
      }
    } finally {
      clearTimeout(timeout)
      setIsStreaming(false)
      setStreamingId(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isStreaming, activeConv, conversations])

  const deleteConversation = (id: string) => {
    const updated = conversations.filter(c => c.id !== id)
    updateConvs(updated)
    if (activeId === id) setActiveId(updated[0]?.id ?? null)
  }

  const pinConversation = (id: string) => {
    updateConvs(conversations.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c))
  }

  const renameConversation = (id: string, title: string) => {
    updateConvs(conversations.map(c => c.id === id ? { ...c, title } : c))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] -mx-6 -my-6 overflow-hidden rounded-xl">

      {/* ── Left sidebar ─────────────────────────────────────────────── */}
      <div className="w-64 flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50">
        {/* Header */}
        <div className="p-3 border-b border-slate-200">
          <motion.button
            onClick={createConversation}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "linear-gradient(135deg, #F7BE4D 0%, #ffd97d 100%)",
              color: "#050816",
              boxShadow: "0 2px 12px rgba(247,190,77,0.25)",
            }}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </motion.button>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chats…"
              className="flex-1 text-xs text-slate-700 bg-transparent outline-none placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No conversations yet</p>
            </div>
          ) : (
            <>
              {pinned.length > 0 && (
                <>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest px-3 pt-2 pb-1">Pinned</p>
                  {pinned.map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === activeId}
                      onSelect={() => setActiveId(conv.id)}
                      onPin={() => pinConversation(conv.id)}
                      onDelete={() => deleteConversation(conv.id)}
                      onRename={t => renameConversation(conv.id, t)}
                    />
                  ))}
                  <div className="h-px bg-slate-200 my-2" />
                </>
              )}
              {unpinned.length > 0 && (
                <>
                  {pinned.length > 0 && (
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest px-3 pb-1">Recent</p>
                  )}
                  {unpinned.map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === activeId}
                      onSelect={() => setActiveId(conv.id)}
                      onPin={() => pinConversation(conv.id)}
                      onDelete={() => deleteConversation(conv.id)}
                      onRename={t => renameConversation(conv.id, t)}
                    />
                  ))}
                </>
              )}
              {filteredConvs.length === 0 && search && (
                <p className="text-xs text-slate-400 text-center py-6">No results for "{search}"</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Main chat area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">

        {/* Chat header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#F7BE4D]" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">
                {activeConv?.title ?? "AI Content Copilot"}
              </h1>
              <div className="flex items-center gap-1.5">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                <span className="text-[11px] text-slate-500">
                  {isStreaming ? "Thinking…" : "GPT-4o mini · Ready"}
                </span>
              </div>
            </div>
          </div>
          {activeConv && (
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => pinConversation(activeConv.id)}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                title={activeConv.pinned ? "Unpin" : "Pin conversation"}
              >
                {activeConv.pinned
                  ? <PinOff className="w-4 h-4 text-[#F7BE4D]" />
                  : <Pin className="w-4 h-4 text-slate-400" />
                }
              </motion.button>
              <motion.button
                onClick={() => deleteConversation(activeConv.id)}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete conversation"
              >
                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500 transition-colors" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {!activeConv || messages.length === 0 ? (
            /* Empty / starter state */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              {/* Hero */}
              <div className="text-center mb-10">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#F7BE4D]/10 border border-[#F7BE4D]/20 flex items-center justify-center"
                    style={{ boxShadow: "0 0 40px rgba(247,190,77,0.08)" }}>
                    <Sparkles className="w-8 h-8 text-[#F7BE4D]" />
                  </div>
                  {[
                    { top: "-10%", right: "-12%", color: "#F7BE4D", delay: 0 },
                    { top: "20%",  right: "-22%", color: "#818cf8", delay: 0.4 },
                    { top: "-8%",  right: "35%",  color: "#34d399", delay: 0.8 },
                  ].map((p, i) => (
                    <motion.div key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{ top: p.top, right: p.right, background: p.color, opacity: 0.5 }}
                      animate={{ y: [0, -8, 0], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: p.delay }}
                    />
                  ))}
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Your AI Social Media Copilot</h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                  Ask me to write posts, build strategies, brainstorm ideas, or improve your content — for any platform.
                </p>
              </div>

              {/* Starter prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STARTER_PROMPTS.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    onClick={() => send(s.prompt)}
                    whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                    whileTap={{ scale: 0.98 }}
                    className="text-left p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                        <s.icon className="w-4 h-4" style={{ color: s.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-snug">{s.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{s.prompt.slice(0, 80)}…</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Messages */
            <div className="max-w-3xl mx-auto space-y-6 w-full">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isStreaming={isStreaming && msg.id === streamingId && msg.role === "assistant"}
                />
              ))}

              {/* Abort button while streaming */}
              {isStreaming && (
                <div className="flex justify-center">
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => abortRef.current?.abort()}
                    className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl border border-slate-200 bg-white transition-all hover:bg-slate-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    Stop generating
                  </motion.button>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-600 max-w-3xl mx-auto"
                >
                  <span className="flex-1">{error}</span>
                  <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-white">
          <div className="max-w-3xl mx-auto">
            <div
              className="flex items-end gap-3 rounded-2xl px-4 py-3 transition-all"
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                boxShadow: input ? "0 0 0 3px rgba(247,190,77,0.1)" : "none",
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value)
                  e.target.style.height = "auto"
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask me to write a post, build a strategy, brainstorm ideas…"
                rows={1}
                className="flex-1 text-sm text-slate-700 bg-transparent outline-none resize-none leading-relaxed placeholder:text-slate-400"
                style={{ maxHeight: 180 }}
                disabled={isStreaming}
              />
              <motion.button
                onClick={() => send()}
                disabled={!input.trim() || isStreaming}
                whileHover={input.trim() && !isStreaming ? { scale: 1.08 } : {}}
                whileTap={input.trim() && !isStreaming ? { scale: 0.92 } : {}}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: input.trim() && !isStreaming
                    ? "linear-gradient(135deg, #F7BE4D 0%, #ffd97d 100%)"
                    : "#e2e8f0",
                  color: input.trim() && !isStreaming ? "#050816" : "#94a3b8",
                  boxShadow: input.trim() && !isStreaming ? "0 2px 12px rgba(247,190,77,0.3)" : "none",
                }}
              >
                {isStreaming
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
              </motion.button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Enter to send · Shift+Enter for new line · Conversations saved locally
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
