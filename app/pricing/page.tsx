import Navbar from "@/components/landing/Navbar"
import Pricing from "@/components/landing/Pricing"
import Footer from "@/components/landing/Footer"

export const metadata = {
  title: "Pricing — PostPilot AI",
  description: "Simple, transparent pricing. Start free, upgrade when you're ready.",
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-16">
        <Pricing />
      </div>
      <Footer />
    </main>
  )
}
