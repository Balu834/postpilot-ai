import Navbar from "@/components/landing/Navbar"
import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import HowItWorks from "@/components/landing/HowItWorks"
import ProductShowcase from "@/components/landing/ProductShowcase"
import LiveDemo from "@/components/landing/LiveDemo"
import Testimonials from "@/components/landing/Testimonials"
import Pricing from "@/components/landing/Pricing"
import FAQ from "@/components/landing/FAQ"
import CTA from "@/components/landing/CTA"
import Footer from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: "#ffffff" }}>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <ProductShowcase />
      <LiveDemo />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  )
}
