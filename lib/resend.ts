import { Resend } from "resend"

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set — emails will not be sent")
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder")

const FROM = process.env.RESEND_FROM_EMAIL ?? "PostPilot AI <onboarding@resend.dev>"

export async function sendWelcomeEmail(to: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to PostPilot AI — let's create your first post 🚀",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050816;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050816;padding:40px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#0d1526;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:580px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,rgba(247,190,77,0.12),rgba(247,190,77,0.04));padding:32px 40px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
            <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px;">
              <div style="width:36px;height:36px;background:#F7BE4D;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="font-size:18px;">⚡</span>
              </div>
              <span style="font-size:20px;font-weight:800;color:#fff;">PostPilot<span style="color:#F7BE4D;">AI</span></span>
            </div>
            <p style="margin:0;color:rgba(255,255,255,0.5);font-size:13px;">Your AI Social Media Team</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#fff;line-height:1.2;">
              Welcome aboard! 🎉
            </h1>
            <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.7;">
              You're in. PostPilot AI is your AI-powered content team — ready to turn one idea into a full month of viral posts across every platform.
            </p>

            <!-- What you get -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:24px;margin-bottom:28px;">
              <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#F7BE4D;text-transform:uppercase;letter-spacing:0.08em;">What you get for free</p>
              ${["30 AI content generations / month", "Instagram, Facebook, LinkedIn & Twitter / X posts", "Hashtag generator + Carousel ideas", "Content calendar & scheduler", "AI Brand Voice training"].map(item =>
                `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                  <span style="color:#34d399;font-size:16px;">✓</span>
                  <span style="color:#cbd5e1;font-size:14px;">${item}</span>
                </div>`
              ).join("")}
            </div>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/generate"
                style="display:inline-block;background:linear-gradient(135deg,#F7BE4D,#ffd166);color:#050816;font-weight:800;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;box-shadow:0 0 24px rgba(247,190,77,0.35);">
                ⚡ Generate your first post →
              </a>
            </div>

            <p style="margin:0;color:#475569;font-size:13px;line-height:1.6;text-align:center;">
              Need help? Just reply to this email — we're here.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;color:#334155;font-size:12px;">
              © 2026 PostPilot AI · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#475569;text-decoration:none;">getpostpilot.vercel.app</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}

export async function sendPublishedEmail(to: string, platform: string, content: string) {
  const platformLabel = platform === "twitter" ? "Twitter / X" : platform.charAt(0).toUpperCase() + platform.slice(1)
  const platformColor = platform === "twitter" ? "#94a3b8" : platform === "linkedin" ? "#0077B5" : "#E1306C"

  return resend.emails.send({
    from: FROM,
    to,
    subject: `✅ Your ${platformLabel} post is live — PostPilot AI`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050816;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050816;padding:40px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#0d1526;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:580px;width:100%;">

        <tr>
          <td style="background:linear-gradient(135deg,rgba(52,211,153,0.1),rgba(52,211,153,0.03));padding:28px 40px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:center;">
            <span style="font-size:36px;">✅</span>
            <h2 style="margin:8px 0 4px;color:#fff;font-size:20px;font-weight:800;">Post Published!</h2>
            <p style="margin:0;color:#94a3b8;font-size:13px;">Your content is live on ${platformLabel}</p>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 40px;">
            <div style="background:rgba(255,255,255,0.03);border-left:3px solid ${platformColor};border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:28px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:${platformColor};text-transform:uppercase;letter-spacing:0.08em;">${platformLabel}</p>
              <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6;">${content.slice(0, 200)}${content.length > 200 ? "…" : ""}</p>
            </div>

            <div style="text-align:center;margin-bottom:24px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/schedule"
                style="display:inline-block;background:linear-gradient(135deg,#F7BE4D,#ffd166);color:#050816;font-weight:800;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
                View Content Calendar →
              </a>
            </div>

            <p style="margin:0;color:#475569;font-size:13px;text-align:center;">
              Keep the momentum going — generate your next post now.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;color:#334155;font-size:12px;">© 2026 PostPilot AI</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}

export async function sendTeamInviteEmail(to: string, inviterName: string, workspaceName: string, role: string, token: string) {
  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/team/join?token=${token}`
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${inviterName} invited you to join ${workspaceName} on PostPilot AI`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050816;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050816;padding:40px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#0d1526;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:580px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,rgba(129,140,248,0.12),rgba(129,140,248,0.04));padding:32px 40px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
            <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px;">
              <div style="width:36px;height:36px;background:#F7BE4D;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="font-size:18px;">⚡</span>
              </div>
              <span style="font-size:20px;font-weight:800;color:#fff;">PostPilot<span style="color:#F7BE4D;">AI</span></span>
            </div>
            <p style="margin:0;color:rgba(255,255,255,0.5);font-size:13px;">Team Invitation</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#fff;">You're invited! 🎉</h1>
            <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.7;">
              <strong style="color:#fff;">${inviterName}</strong> has invited you to join the
              <strong style="color:#F7BE4D;">${workspaceName}</strong> workspace on PostPilot AI as an
              <strong style="color:#818cf8;">${role.charAt(0).toUpperCase() + role.slice(1)}</strong>.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${joinUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#818cf8,#a78bfa);color:#fff;font-weight:800;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;box-shadow:0 0 24px rgba(129,140,248,0.35);">
                Accept Invitation →
              </a>
            </div>
            <p style="margin:0;color:#475569;font-size:12px;text-align:center;line-height:1.6;">
              This invite expires in 7 days. If you didn't expect this email, you can ignore it.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;color:#334155;font-size:12px;">© 2026 PostPilot AI</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}

export async function sendWeeklyDigestEmail(to: string, stats: {
  generated: number
  scheduled: number
  published: number
  topPlatform: string
}) {
  const tips = [
    "Post consistently at the same time each day — audiences expect routine.",
    "LinkedIn posts with 3–5 hashtags outperform those with 10+.",
    "Start your Twitter threads with a bold claim, not a preamble.",
    "Instagram captions under 125 characters get 56% more engagement.",
    "The best time to post on LinkedIn is Tuesday–Thursday, 9–11 AM.",
  ]
  const tip = tips[Math.floor(Math.random() * tips.length)]

  return resend.emails.send({
    from: FROM,
    to,
    subject: "📊 Your PostPilot AI Weekly — Content Performance Digest",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050816;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050816;padding:40px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#0d1526;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:580px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,rgba(247,190,77,0.12),rgba(247,190,77,0.04));padding:28px 40px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:4px;">
              <div style="width:32px;height:32px;background:#F7BE4D;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;">
                <span style="font-size:16px;">⚡</span>
              </div>
              <span style="font-size:18px;font-weight:800;color:#fff;">PostPilot<span style="color:#F7BE4D;">AI</span></span>
            </div>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.5);font-size:13px;">Your Weekly Content Digest</p>
          </td>
        </tr>

        <!-- Stats row -->
        <tr>
          <td style="padding:28px 40px 20px;">
            <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#F7BE4D;text-transform:uppercase;letter-spacing:0.08em;">This week's performance</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${[
                  { label: "Generated", value: stats.generated, color: "#818cf8" },
                  { label: "Scheduled", value: stats.scheduled, color: "#F7BE4D" },
                  { label: "Published",  value: stats.published,  color: "#34d399" },
                ].map(s => `
                <td style="width:33%;text-align:center;padding:16px 8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;margin:0 4px;">
                  <div style="font-size:28px;font-weight:800;color:${s.color};line-height:1;">${s.value}</div>
                  <div style="font-size:11px;color:#64748b;margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">${s.label}</div>
                </td>`).join('<td style="width:8px;"></td>')}
              </tr>
            </table>

            ${stats.topPlatform ? `
            <div style="margin-top:16px;padding:12px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;display:flex;align-items:center;gap:8px;">
              <span style="font-size:16px;">${stats.topPlatform === "twitter" ? "𝕏" : stats.topPlatform === "linkedin" ? "💼" : stats.topPlatform === "instagram" ? "📸" : "📣"}</span>
              <span style="font-size:13px;color:#cbd5e1;">Most active platform: <strong style="color:#fff;">${stats.topPlatform.charAt(0).toUpperCase() + stats.topPlatform.slice(1)}</strong></span>
            </div>` : ""}
          </td>
        </tr>

        <!-- Tip -->
        <tr>
          <td style="padding:0 40px 24px;">
            <div style="padding:16px 20px;background:rgba(247,190,77,0.06);border:1px solid rgba(247,190,77,0.15);border-radius:12px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#F7BE4D;text-transform:uppercase;letter-spacing:0.08em;">💡 Pro tip of the week</p>
              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">${tip}</p>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 28px;text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/generate"
              style="display:inline-block;background:linear-gradient(135deg,#F7BE4D,#ffd166);color:#050816;font-weight:800;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
              ⚡ Create this week's content →
            </a>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;color:#334155;font-size:12px;">
              © 2026 PostPilot AI ·
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color:#475569;text-decoration:none;">Manage email preferences</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}

export async function sendDay2TipsEmail(to: string) {
  const tips = [
    { icon: "🎨", title: "Use the Carousel Builder", desc: "Turn one idea into a 5-slide carousel that gets 3x more reach on Instagram." },
    { icon: "📅", title: "Schedule a full week", desc: "Batch content in one session. Use the Content Calendar to spot gaps." },
    { icon: "🔥", title: "Check Trending Topics", desc: "Get AI-curated viral topic ideas for your niche — updated daily." },
    { icon: "🎯", title: "Train your Brand Voice", desc: "Paste 3 past posts and PostPilot writes in your exact style forever." },
  ]
  const rows = tips.map(t =>
    `<div style="margin-bottom:16px;padding:16px 20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">` +
    `<strong style="display:block;color:#fff;font-size:14px;margin-bottom:4px;">${t.icon} ${t.title}</strong>` +
    `<span style="color:#94a3b8;font-size:13px;line-height:1.6;">${t.desc}</span></div>`
  ).join("")
  return resend.emails.send({
    from: FROM, to,
    subject: "4 PostPilot features most creators never discover 🔍",
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#050816;font-family:-apple-system,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#050816;padding:40px 20px;"><tr><td align="center"><table width="580" cellpadding="0" cellspacing="0" style="background:#0d1526;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:580px;width:100%;"><tr><td style="padding:28px 40px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);background:linear-gradient(135deg,rgba(247,190,77,0.12),rgba(247,190,77,0.04));"><span style="font-size:18px;font-weight:800;color:#fff;">PostPilot<span style="color:#F7BE4D;">AI</span></span><p style="margin:6px 0 0;color:rgba(255,255,255,0.5);font-size:13px;">Tips from your AI content team</p></td></tr><tr><td style="padding:36px 40px;"><h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#fff;">You're just getting started 🚀</h1><p style="margin:0 0 28px;color:#94a3b8;font-size:14px;line-height:1.7;">4 features most creators discover too late.</p>${rows}<div style="text-align:center;margin-top:28px;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/generate" style="display:inline-block;background:linear-gradient(135deg,#F7BE4D,#ffd166);color:#050816;font-weight:800;font-size:14px;padding:13px 28px;border-radius:11px;text-decoration:none;">⚡ Open PostPilot AI →</a></div></td></tr><tr><td style="padding:16px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;"><p style="margin:0;color:#334155;font-size:12px;">© 2026 PostPilot AI</p></td></tr></table></td></tr></table></body></html>`,
  })
}

const FREE_LIMIT = 10

export async function sendDay7UpgradeEmail(to: string, generationsUsed: number) {
  const remaining = Math.max(FREE_LIMIT - generationsUsed, 0)
  const nearLimit = remaining <= 2
  const features = ["Unlimited AI generations — no monthly cap", "Auto-publish to LinkedIn, Twitter, Instagram & more", "Full analytics dashboard", "Client report exports (PDF)", "Priority AI — faster responses"]
  const featureRows = features.map(f =>
    `<div style="display:flex;gap:10px;margin-bottom:10px;"><span style="color:#F7BE4D;">✓</span><span style="color:#cbd5e1;font-size:13px;">${f}</span></div>`
  ).join("")
  return resend.emails.send({
    from: FROM, to,
    subject: nearLimit ? `⚠️ Only ${remaining} free generations left` : "Ready to go unlimited? Here's why creators upgrade 🚀",
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#050816;font-family:-apple-system,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#050816;padding:40px 20px;"><tr><td align="center"><table width="580" cellpadding="0" cellspacing="0" style="background:#0d1526;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:580px;width:100%;"><tr><td style="padding:28px 40px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);background:linear-gradient(135deg,rgba(247,190,77,0.14),rgba(247,190,77,0.04));"><span style="font-size:18px;font-weight:800;color:#fff;">PostPilot<span style="color:#F7BE4D;">AI</span></span><p style="margin:6px 0 0;color:rgba(255,255,255,0.5);font-size:13px;">Your 7-day check-in</p></td></tr><tr><td style="padding:36px 40px;"><h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#fff;">${nearLimit ? `Only ${remaining} left ⚠️` : "One week in 🎉"}</h1><p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.7;">${nearLimit ? "Upgrade to Pro for unlimited content." : "Here's what Pro unlocks."}</p><div style="background:rgba(247,190,77,0.06);border:1px solid rgba(247,190,77,0.18);border-radius:14px;padding:20px 24px;margin-bottom:24px;"><p style="margin:0 0 14px;font-size:12px;font-weight:700;color:#F7BE4D;text-transform:uppercase;">Pro Plan — ₹799/month</p>${featureRows}</div><div style="text-align:center;margin-bottom:12px;"><a href="${process.env.NEXT_PUBLIC_APP_URL}/settings?upgrade=1" style="display:inline-block;background:linear-gradient(135deg,#F7BE4D,#ffd166);color:#050816;font-weight:800;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">Upgrade to Pro →</a></div><p style="margin:0;color:#475569;font-size:12px;text-align:center;">Cancel anytime.</p></td></tr><tr><td style="padding:16px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;"><p style="margin:0;color:#334155;font-size:12px;">© 2026 PostPilot AI</p></td></tr></table></td></tr></table></body></html>`,
  })
}
