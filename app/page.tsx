import Navbar from "@/components/landing/Navbar"
import Hero from "@/components/landing/Hero"
import HowItWorks from "@/components/landing/HowItWorks"
import ProductShowcase from "@/components/landing/ProductShowcase"
import Features from "@/components/landing/Features"
import Testimonials from "@/components/landing/Testimonials"
import WhyPostPilot from "@/components/landing/WhyPostPilot"
import Pricing from "@/components/landing/Pricing"
import FAQ from "@/components/landing/FAQ"
import CTA from "@/components/landing/CTA"
import Footer from "@/components/landing/Footer"
import AuthRedirect from "@/components/landing/AuthRedirect"

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: "#ffffff" }}>
      <AuthRedirect />
      <Navbar />
      <Hero />          {/* 1. What do I get? */}
      <HowItWorks />    {/* 2. How does it work? */}
      <ProductShowcase />{/* 3. How good are the results? */}
      <Features />      {/* 4. What can it do beyond the basics? */}
      <Testimonials />  {/* 5. Can I trust this? */}
      <WhyPostPilot />  {/* 6. Why this instead of another tool? */}
      <Pricing />       {/* 7. Is it worth the cost? */}
      <FAQ />           {/* 8. What's stopping me? */}
      <CTA />           {/* 9. Why should I start now? */}
      <Footer />
    </main>
  )
}
