export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /dashboard",
    "Disallow: /generate",
    "Disallow: /repurpose",
    "Disallow: /templates",
    "Disallow: /workspace",
    "Disallow: /schedule",
    "Disallow: /history",
    "Disallow: /analytics",
    "Disallow: /settings",
    "Disallow: /onboarding",
    "Disallow: /api/",
    "",
    "Sitemap: https://postpilotai.com/sitemap.xml",
  ].join("\n")

  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  })
}
