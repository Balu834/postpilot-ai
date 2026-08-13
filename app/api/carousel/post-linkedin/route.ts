import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { buildCarouselPdf, type CarouselSlide } from "@/lib/carouselPdf"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// LinkedIn's versioned REST API requires a YYYYMM version header.
const LINKEDIN_API_VERSION = "202508"

interface InitUploadResponse {
  value: { uploadUrl: string; document: string; uploadUrlExpiresAt: number }
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

  const { slides, theme = "gold", title = "Carousel.pdf", commentary = "" } =
    await req.json() as { slides: CarouselSlide[]; theme?: string; title?: string; commentary?: string }

  if (!Array.isArray(slides) || slides.length === 0) {
    return NextResponse.json({ error: "slides required" }, { status: 400 })
  }

  const { data: account } = await supabaseAdmin
    .from("social_accounts")
    .select("access_token")
    .eq("user_id", user.id)
    .eq("platform", "linkedin")
    .single()

  if (!account?.access_token) {
    return NextResponse.json({ error: "LinkedIn not connected. Go to Settings → Connected Accounts." }, { status: 400 })
  }
  const accessToken = account.access_token

  try {
    // 1. Resolve the member's person URN (mirrors the existing text-post flow)
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!profileRes.ok) throw new Error("LinkedIn auth failed — please reconnect LinkedIn in Settings.")
    const profile = await profileRes.json()
    if (!profile?.sub) throw new Error("Failed to get LinkedIn profile — please reconnect LinkedIn in Settings.")
    const authorUrn = `urn:li:person:${profile.sub}`

    // 2. Render the slides into a single PDF
    const pdf = await buildCarouselPdf(slides, theme)

    // 3. Register the document upload
    const initRes = await fetch("https://api.linkedin.com/rest/documents?action=initializeUpload", {
      method:  "POST",
      headers: {
        Authorization:               `Bearer ${accessToken}`,
        "Content-Type":              "application/json",
        "Linkedin-Version":          LINKEDIN_API_VERSION,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({ initializeUploadRequest: { owner: authorUrn } }),
    })
    if (!initRes.ok) {
      const err = await initRes.json().catch(() => ({}))
      throw new Error(err.message || "Failed to initialize LinkedIn document upload")
    }
    const initData = await initRes.json() as InitUploadResponse
    const { uploadUrl, document: documentUrn } = initData.value

    // 4. Upload the PDF bytes
    const uploadRes = await fetch(uploadUrl, {
      method:  "PUT",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/pdf" },
      body:    new Uint8Array(pdf),
    })
    if (!uploadRes.ok) throw new Error("Failed to upload document to LinkedIn")

    // 5. Create the post referencing the uploaded document
    const postRes = await fetch("https://api.linkedin.com/rest/posts", {
      method:  "POST",
      headers: {
        Authorization:               `Bearer ${accessToken}`,
        "Content-Type":              "application/json",
        "Linkedin-Version":          LINKEDIN_API_VERSION,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author:      authorUrn,
        commentary:  commentary || title,
        visibility:  "PUBLIC",
        distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
        content:     { media: { title, id: documentUrn } },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      }),
    })
    if (!postRes.ok) {
      const err = await postRes.json().catch(() => ({}))
      throw new Error(err.message || "Failed to publish LinkedIn document post")
    }
    const postId = postRes.headers.get("x-restli-id")

    void supabaseAdmin.from("activity_log").insert({
      user_id: user.id, action: "Published LinkedIn document carousel", platform: "linkedin",
    })

    return NextResponse.json({ success: true, postId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to post to LinkedIn"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
