import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import dns from "dns/promises"
import net from "net"

export const dynamic = "force-dynamic"

// Unwraps IPv4-mapped IPv6 notation (::ffff:a.b.c.d or the pure-hex
// equivalent ::ffff:XXXX:XXXX) to the underlying IPv4 address. Without this,
// a domain can publish an AAAA record for ::ffff:169.254.169.254 and sail
// straight past the IPv6 checks below while the OS routes it to the mapped
// IPv4 address.
function unwrapIPv4MappedIPv6(ip: string): string | null {
  const lower = ip.toLowerCase()
  const dotted = lower.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/)
  if (dotted) return dotted[1]
  const hex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
  if (hex) {
    const hi = parseInt(hex[1], 16)
    const lo = parseInt(hex[2], 16)
    return [(hi >> 8) & 0xff, hi & 0xff, (lo >> 8) & 0xff, lo & 0xff].join(".")
  }
  return null
}

// Blocks SSRF against internal services / cloud metadata endpoints by
// resolving the hostname and checking the actual IP(s) it points to —
// checking the hostname string alone doesn't stop DNS rebinding.
function isDisallowedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number)
    if (a === 127) return true                      // loopback
    if (a === 10) return true                        // private
    if (a === 172 && b >= 16 && b <= 31) return true  // private
    if (a === 192 && b === 168) return true           // private
    if (a === 169 && b === 254) return true           // link-local / cloud metadata
    if (a === 0) return true                          // "this" network
    return false
  }
  if (net.isIPv6(ip)) {
    const mapped = unwrapIPv4MappedIPv6(ip)
    if (mapped) return isDisallowedIp(mapped)
    const lower = ip.toLowerCase()
    if (lower === "::1") return true                          // loopback
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true // unique local
    if (lower.startsWith("fe80")) return true                 // link-local
    return false
  }
  return true // unrecognized format — fail closed
}

async function assertPublicHost(hostname: string) {
  const records = await dns.lookup(hostname, { all: true })
  for (const { address } of records) {
    if (isDisallowedIp(address)) {
      throw new Error("This URL points to a private or internal address, which isn't allowed")
    }
  }
}

// Fetches with redirects followed manually so each hop's target is
// re-validated — a server that passes the initial check could otherwise
// 30x-redirect the request to an internal address and bypass it entirely.
async function fetchFeedSafely(startUrl: string, maxRedirects = 5): Promise<Response> {
  let currentUrl = startUrl
  for (let i = 0; i <= maxRedirects; i++) {
    const url = new URL(currentUrl)
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Only http/https URLs are allowed")
    }
    await assertPublicHost(url.hostname)

    const res = await fetch(currentUrl, {
      headers: { "User-Agent": "PostPilot-RSS-Reader/1.0", Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" },
      signal:  AbortSignal.timeout(8000),
      redirect: "manual",
    })

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location")
      if (!location) throw new Error("Redirect response had no location header")
      currentUrl = new URL(location, currentUrl).toString()
      continue
    }
    return res
  }
  throw new Error("Too many redirects")
}

function extractTag(xml: string, tag: string): string {
  const re = new RegExp(
    `<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`,
    "i"
  )
  const m = xml.match(re)
  if (!m) return ""
  return m[1]
    .trim()
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#\d+;/g, "")
    .replace(/<[^>]+>/g, "")
    .trim()
}

function extractAttrHref(xml: string): string {
  const m = xml.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i)
  return m ? m[1] : ""
}

export interface RSSArticle {
  title:       string
  link:        string
  description: string
  pubDate:     string
}

function parseXML(xml: string): RSSArticle[] {
  const articles: RSSArticle[] = []

  // RSS <item> or Atom <entry>
  const isAtom = xml.includes("<entry")
  const tag    = isAtom ? "entry" : "item"
  const re     = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi")

  let match: RegExpExecArray | null
  while ((match = re.exec(xml)) !== null) {
    const chunk = match[1]

    const title = extractTag(chunk, "title")
    const link  = extractTag(chunk, "link") || extractAttrHref(chunk)
    const description = extractTag(chunk, "description")
      || extractTag(chunk, "summary")
      || extractTag(chunk, "content")
    const pubDate = extractTag(chunk, "pubDate")
      || extractTag(chunk, "published")
      || extractTag(chunk, "updated")
      || extractTag(chunk, "dc:date")

    if (title || link) {
      articles.push({
        title:       title.slice(0, 200),
        link:        link.slice(0, 500),
        description: description.slice(0, 600),
        pubDate,
      })
    }
  }

  return articles
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { feedUrl } = await req.json()
  if (!feedUrl) return NextResponse.json({ error: "feedUrl required" }, { status: 400 })

  let url: URL
  try { url = new URL(feedUrl) }
  catch { return NextResponse.json({ error: "Invalid URL" }, { status: 400 }) }

  if (!["http:", "https:"].includes(url.protocol)) {
    return NextResponse.json({ error: "Only http/https URLs are allowed" }, { status: 400 })
  }

  try {
    const res = await fetchFeedSafely(feedUrl)
    if (!res.ok) throw new Error(`Feed returned ${res.status}`)
    const xml = await res.text()
    const articles = parseXML(xml).slice(0, 20)
    if (articles.length === 0) throw new Error("No articles found — make sure the URL is an RSS or Atom feed")

    // Try to get feed title
    const feedTitle = extractTag(xml, "title")

    return NextResponse.json({ articles, feedTitle })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch feed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
