import { notFound } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLATFORM_META: Record<string, { icon: string; color: string; label: string; baseUrl: string }> = {
  twitter:   { icon: "𝕏",  color: "#94a3b8", label: "Twitter / X", baseUrl: "https://twitter.com/" },
  linkedin:  { icon: "💼", color: "#0077B5", label: "LinkedIn",    baseUrl: "https://linkedin.com/in/" },
  instagram: { icon: "📸", color: "#E1306C", label: "Instagram",   baseUrl: "https://instagram.com/" },
  facebook:  { icon: "f",  color: "#1877F2", label: "Facebook",    baseUrl: "https://facebook.com/" },
  threads:   { icon: "🧵", color: "#e2e8f0", label: "Threads",     baseUrl: "https://threads.net/@" },
  bluesky:   { icon: "🦋", color: "#0085ff", label: "Bluesky",     baseUrl: "https://bsky.app/profile/" },
  pinterest: { icon: "📌", color: "#E60023", label: "Pinterest",   baseUrl: "https://pinterest.com/" },
  youtube:   { icon: "▶",  color: "#FF0000", label: "YouTube",     baseUrl: "https://youtube.com/@" },
}

type Theme = "dark" | "purple" | "gold" | "minimal"

const THEME_STYLES: Record<Theme, {
  bg: string; text: string; sub: string; card: string
  border: string; accent: string; button: string; buttonText: string
}> = {
  dark: {
    bg: "linear-gradient(180deg, #050816 0%, #0a0f2e 100%)",
    text: "#ffffff", sub: "#94a3b8",
    card: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.08)",
    accent: "#F7BE4D", button: "rgba(255,255,255,0.06)", buttonText: "#ffffff",
  },
  purple: {
    bg: "linear-gradient(180deg, #1e1b4b 0%, #0f0a2e 100%)",
    text: "#ffffff", sub: "#a5b4fc",
    card: "rgba(129,140,248,0.10)", border: "rgba(129,140,248,0.18)",
    accent: "#818cf8", button: "rgba(129,140,248,0.12)", buttonText: "#c7d2fe",
  },
  gold: {
    bg: "linear-gradient(180deg, #050800 0%, #0a0900 100%)",
    text: "#ffffff", sub: "#d4a800",
    card: "rgba(247,190,77,0.07)", border: "rgba(247,190,77,0.14)",
    accent: "#F7BE4D", button: "rgba(247,190,77,0.10)", buttonText: "#F7BE4D",
  },
  minimal: {
    bg: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
    text: "#0f172a", sub: "#64748b",
    card: "rgba(0,0,0,0.04)", border: "rgba(0,0,0,0.08)",
    accent: "#6366f1", button: "rgba(0,0,0,0.05)", buttonText: "#0f172a",
  },
}

export default async function UserBioPage({ params }: { params: { username: string } }) {
  const { data: bio } = await supabaseAdmin
    .from("link_in_bio")
    .select("*")
    .eq("username", params.username.toLowerCase())
    .single()

  if (!bio) notFound()

  const { data: accounts } = await supabaseAdmin
    .from("social_accounts")
    .select("platform, username")
    .eq("user_id", bio.user_id)

  const theme = (bio.theme ?? "dark") as Theme
  const t = THEME_STYLES[theme]
  const customLinks: { id: string; label: string; url: string; emoji: string }[] = bio.custom_links ?? []
  const socialAccounts: { platform: string; username: string | null }[] = accounts ?? []

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{bio.display_name ?? bio.username} | PostPilot</title>
        <meta name="description" content={bio.bio ?? `${bio.display_name ?? bio.username} on PostPilot`} />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-height: 100vh; }
          a { text-decoration: none; }
          .link-btn:hover { opacity: 0.85; transform: translateY(-1px); }
          .link-btn { transition: opacity 0.15s, transform 0.15s; }
          .social-btn:hover { opacity: 0.8; }
          .social-btn { transition: opacity 0.15s; }
        `}</style>
      </head>
      <body style={{ background: t.bg, color: t.text, minHeight: "100vh" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px 80px" }}>

          {/* Avatar + Profile */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%", margin: "0 auto 16px",
              background: t.card, border: `2px solid ${t.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 900, color: t.accent,
            }}>
              {bio.display_name?.[0]?.toUpperCase() ?? bio.username[0].toUpperCase()}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: t.text }}>
              {bio.display_name ?? bio.username}
            </h1>
            {bio.bio && (
              <p style={{ fontSize: 14, lineHeight: 1.6, color: t.sub, maxWidth: 340, margin: "0 auto" }}>
                {bio.bio}
              </p>
            )}
          </div>

          {/* Social platform pills */}
          {bio.show_platforms && socialAccounts.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32 }}>
              {socialAccounts.map(acc => {
                const m = PLATFORM_META[acc.platform]
                if (!m) return null
                const handle = acc.username ?? m.label
                const href = acc.username ? `${m.baseUrl}${acc.username.replace(/^@/, "")}` : "#"
                return (
                  <a key={acc.platform} href={href} target="_blank" rel="noreferrer" className="social-btn"
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 14px", borderRadius: 24,
                      background: `${m.color}18`, border: `1px solid ${m.color}35`,
                      color: m.color, fontSize: 13, fontWeight: 600,
                    }}>
                    <span style={{ fontSize: 15 }}>{m.icon}</span>
                    <span>{handle}</span>
                  </a>
                )
              })}
            </div>
          )}

          {/* Custom links */}
          {customLinks.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {customLinks.map(link => {
                if (!link.url && !link.label) return null
                return (
                  <a key={link.id} href={link.url || "#"} target="_blank" rel="noreferrer" className="link-btn"
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "16px 20px", borderRadius: 16,
                      background: t.button, border: `1px solid ${t.border}`,
                      color: t.buttonText, fontSize: 14, fontWeight: 600,
                    }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{link.emoji}</span>
                    <span style={{ flex: 1 }}>{link.label || link.url}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4, flexShrink: 0 }}>
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )
              })}
            </div>
          )}

          {/* Branding */}
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <a href="/" style={{ fontSize: 11, color: t.sub, opacity: 0.4 }}>
              Made with PostPilot AI ⚡
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
