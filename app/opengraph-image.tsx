import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "PostPilot AI — Your AI Social Media Team"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050816",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Gold glow top-left */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -120,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(247,190,77,0.35) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        {/* Indigo glow bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -160,
            right: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            padding: "0 80px",
          }}
        >
          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "#F7BE4D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 40px rgba(247,190,77,0.6)",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#050816">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: -1 }}>
              PostPilot<span style={{ color: "#F7BE4D" }}>AI</span>
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 68,
              fontWeight: 900,
              color: "#fff",
              textAlign: "center",
              lineHeight: 1.05,
              letterSpacing: -2,
              marginBottom: 24,
            }}
          >
            Turn One Idea Into{" "}
            <span style={{ color: "#F7BE4D" }}>30 Days</span>
            {" "}of Content.
          </div>

          {/* Subheading */}
          <div
            style={{
              fontSize: 24,
              color: "rgba(148,163,184,1)",
              textAlign: "center",
              maxWidth: 700,
              lineHeight: 1.5,
              marginBottom: 48,
            }}
          >
            AI-powered social media posts for Instagram, LinkedIn, Twitter & more — scheduled automatically.
          </div>

          {/* Platform pills */}
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Instagram", color: "#E1306C", bg: "rgba(225,48,108,0.15)" },
              { label: "LinkedIn",  color: "#0077B5", bg: "rgba(0,119,181,0.15)"  },
              { label: "Twitter/X", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
              { label: "Facebook",  color: "#1877F2", bg: "rgba(24,119,242,0.15)" },
            ].map(p => (
              <div
                key={p.label}
                style={{
                  background: p.bg,
                  border: `1px solid ${p.color}40`,
                  borderRadius: 100,
                  padding: "10px 22px",
                  fontSize: 18,
                  fontWeight: 700,
                  color: p.color,
                }}
              >
                {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(247,190,77,0.1)",
            border: "1px solid rgba(247,190,77,0.25)",
            borderRadius: 100,
            padding: "8px 20px",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} />
          <span style={{ fontSize: 16, color: "#F7BE4D", fontWeight: 600 }}>
            Free to start — no credit card needed
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
