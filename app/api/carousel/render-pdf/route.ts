import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { buildCarouselPdf, type CarouselSlide } from "@/lib/carouselPdf"

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { slides, theme = "gold" } = await req.json() as { slides: CarouselSlide[]; theme?: string }
  if (!Array.isArray(slides) || slides.length === 0) {
    return NextResponse.json({ error: "slides required" }, { status: 400 })
  }

  try {
    const pdf = await buildCarouselPdf(slides, theme)
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": 'attachment; filename="carousel.pdf"',
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to render PDF"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
