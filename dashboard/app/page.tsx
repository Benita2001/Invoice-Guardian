import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import HowItWorks from '@/components/landing/HowItWorks'
import TrustScore from '@/components/landing/TrustScore'
import FreeAudit from '@/components/landing/FreeAudit'
import Testimonials from '@/components/landing/Testimonials'
import Pricing from '@/components/landing/Pricing'
import CTABanner from '@/components/landing/CTABanner'
import SiteFooter from '@/components/landing/SiteFooter'

export default function LandingPage() {
  return (
    <div className="bg-[#0a0a0a] text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <HowItWorks />
      <TrustScore />
      <FreeAudit />
      <Testimonials />
      <Pricing />
      <CTABanner />
      <SiteFooter />
    </div>
  )
}
