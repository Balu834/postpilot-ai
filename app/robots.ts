import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://postpilotai.com"
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/generate", "/schedule", "/analytics",
                   "/history", "/settings", "/workspace", "/repurpose", "/templates",
                   "/brand-voice", "/onboarding"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
