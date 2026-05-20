import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import CrispChat from "@/components/CrispChat"
import { PostHogProvider, PostHogPageView } from "@/components/providers/PostHogProvider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://postpilotai.com"

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "PostPilot AI — Your AI Social Media Team",
    template: "%s | PostPilot AI",
  },
  description:
    "Generate captions, schedule posts, and grow your audience using AI. Turn one idea into 30 days of content for Instagram, LinkedIn, and Twitter.",
  keywords: [
    "AI social media manager",
    "content generator",
    "social media scheduler",
    "AI captions",
    "Instagram captions AI",
    "LinkedIn post generator",
    "Twitter content AI",
  ],
  authors: [{ name: "PostPilot AI" }],
  creator: "PostPilot AI",
  openGraph: {
    title: "PostPilot AI — Your AI Social Media Team",
    description:
      "Generate captions, schedule posts, and grow your audience using AI. Turn one idea into 30 days of content.",
    url: APP_URL,
    siteName: "PostPilot AI",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PostPilot AI — Turn One Idea Into 30 Days of Content",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PostPilot AI — Your AI Social Media Team",
    description: "Turn one idea into 30 days of content using AI.",
    creator: "@postpilotai",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export const viewport: Viewport = {
  themeColor: "#050816",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-[#050816] text-slate-100 antialiased">
        <PostHogProvider>
          <PostHogPageView />
          {children}
          <CrispChat />
        </PostHogProvider>
      </body>
    </html>
  )
}
