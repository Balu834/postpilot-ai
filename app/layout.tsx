import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import CrispChat from "@/components/CrispChat"
import { PostHogProvider, PostHogPageView } from "@/components/providers/PostHogProvider"
import FeedbackWidget from "@/components/FeedbackWidget"

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
  verification: {
    google: "5UXfJDF98klFpIZyWT2ypsN6t8VLUfVLd4wI3CJMPFY",
  },
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PostPilot AI",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg",    sizes: "any",  type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
}

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} style={{ background: "#ffffff", colorScheme: "light" }}>
      <head>
        <meta name="color-scheme" content="light" />
        <style>{`
          html, body { background: #ffffff !important; color: #0f172a !important; color-scheme: light !important; }
          * { -webkit-font-smoothing: antialiased; }
        `}</style>
        {/* Immediate JS sets bg before any CSS — prevents flash of dark */}
        <Script id="force-white" strategy="beforeInteractive">{`
          document.documentElement.style.background='#fff';
          document.documentElement.style.colorScheme='light';
        `}</Script>
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">{`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}</Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img height="1" width="1" style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </head>
      <body className="min-h-screen text-slate-900 antialiased" style={{ background: "#ffffff" }}>
        <PostHogProvider>
          <PostHogPageView />
          {children}
          <FeedbackWidget />
          <CrispChat />
        </PostHogProvider>
      </body>
    </html>
  )
}
