import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

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
  const { feedUrl } = await req.json()
  if (!feedUrl) return NextResponse.json({ error: "feedUrl required" }, { status: 400 })

  let url: URL
  try { url = new URL(feedUrl) }
  catch { return NextResponse.json({ error: "Invalid URL" }, { status: 400 }) }

  if (!["http:", "https:"].includes(url.protocol)) {
    return NextResponse.json({ error: "Only http/https URLs are allowed" }, { status: 400 })
  }

  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "PostPilot-RSS-Reader/1.0", Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" },
      signal:  AbortSignal.timeout(8000),
    })
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
