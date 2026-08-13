import { ImageResponse } from "next/og"
import { PDFDocument } from "pdf-lib"

export interface CarouselSlide {
  slide: number
  headline?: string
  body: string
}

const SIZE = 1080

const THEMES: Record<string, { bg: string; bgEnd: string; text: string; accent: string; sub: string }> = {
  gold: { bg: "#0a0f2e", bgEnd: "#050816", text: "#ffffff", accent: "#F7BE4D", sub: "#94a3b8" },
  dark: { bg: "#0f172a", bgEnd: "#020617", text: "#ffffff", accent: "#818cf8", sub: "#94a3b8" },
  light: { bg: "#ffffff", bgEnd: "#f8fafc", text: "#0f172a", accent: "#d97706", sub: "#64748b" },
}

async function renderSlidePng(
  slide: CarouselSlide, total: number, theme: string, brandName: string
): Promise<ArrayBuffer> {
  const t = THEMES[theme] ?? THEMES.gold

  const image = new ImageResponse(
    (
      <div
        style={{
          width: SIZE, height: SIZE, display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: 80,
          background: `linear-gradient(135deg, ${t.bg} 0%, ${t.bgEnd} 100%)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: t.accent }}>{brandName}</div>
          <div style={{ display: "flex", fontSize: 24, color: t.sub }}>{slide.slide} / {total}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {slide.headline && (
            <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: t.text, lineHeight: 1.15 }}>
              {slide.headline}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 34, color: slide.headline ? t.sub : t.text, lineHeight: 1.4 }}>
            {slide.body}
          </div>
        </div>

        <div style={{ display: "flex", height: 6, width: "100%", background: `${t.sub}33`, borderRadius: 3 }}>
          <div style={{ display: "flex", height: 6, width: `${(slide.slide / total) * 100}%`, background: t.accent, borderRadius: 3 }} />
        </div>
      </div>
    ),
    { width: SIZE, height: SIZE }
  )

  return image.arrayBuffer()
}

export async function buildCarouselPdf(
  slides: CarouselSlide[], theme = "gold", brandName = "PostPilot AI"
): Promise<Buffer> {
  const pdf = await PDFDocument.create()

  for (const slide of slides) {
    const png = await renderSlidePng(slide, slides.length, theme, brandName)
    const embedded = await pdf.embedPng(png)
    const page = pdf.addPage([SIZE, SIZE])
    page.drawImage(embedded, { x: 0, y: 0, width: SIZE, height: SIZE })
  }

  const bytes = await pdf.save()
  return Buffer.from(bytes)
}
