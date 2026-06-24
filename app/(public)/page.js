import HeroSection from '@/components/HeroSection'
import PublicationsGrid from '@/components/PublicationsGrid'
import HowItWorks from '@/components/HowItWorks'
import PricingSection from '@/components/PricingSection'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Mara Media — Digital Publishing Platform',
  description: 'Subscribe to Ireland\'s leading digital magazines — maritime, aviation, business and regional publications.',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PublicationsGrid />
      <HowItWorks />
      <PricingSection />
      <Footer />
    </>
  )
}