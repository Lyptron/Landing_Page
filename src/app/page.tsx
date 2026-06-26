import dynamic from 'next/dynamic'
import { CHAPTER_IDS } from '@/lib/constants'
import Hero from '@/components/sections/Hero'
import SectionDivider from '@/components/ui/SectionDivider'
import ChapterDots from '@/components/layout/ChapterDots'
import LazyMount from '@/components/ui/LazyMount'

const WhoWeAre = dynamic(() => import('@/components/sections/WhoWeAre'))
const Services = dynamic(() => import('@/components/sections/Services'))
const Work = dynamic(() => import('@/components/sections/Work'))
const Team = dynamic(() => import('@/components/sections/Team'))
const Process = dynamic(() => import('@/components/sections/Process'))
const Pricing = dynamic(() => import('@/components/sections/Pricing'))
const CTA = dynamic(() => import('@/components/sections/CTA'))
const Footer = dynamic(() => import('@/components/layout/Footer'))

export default function Home() {
  return (
    <main className="relative min-h-screen bg-bg text-[--text-primary] overflow-x-hidden">
      {/* Chapter Vertical Dots */}
      <ChapterDots chapterIds={CHAPTER_IDS} />

      {/* Chapter 1: Hero */}
      <Hero />

      {/* Divider */}
      <SectionDivider />

      {/* Chapter 2: Who We Are */}
      <LazyMount id="about" minHeight={800}>
        <WhoWeAre />
      </LazyMount>

      <SectionDivider />

      {/* Chapter 3: Services */}
      <LazyMount id="services" minHeight={900}>
        <Services />
      </LazyMount>

      <SectionDivider />

      {/* Chapter 4: Work */}
      <LazyMount id="work" minHeight={1000}>
        <Work />
      </LazyMount>

      <SectionDivider />

      {/* Chapter 5: Team */}
      <LazyMount id="team" minHeight={800}>
        <Team />
      </LazyMount>

      <SectionDivider />

      {/* Chapter 6: Process */}
      <LazyMount id="process" minHeight={900}>
        <Process />
      </LazyMount>

      <SectionDivider />

      {/* Chapter 7: Pricing */}
      <LazyMount id="pricing" minHeight={800}>
        <Pricing />
      </LazyMount>

      <SectionDivider />

      {/* Chapter 8: CTA */}
      <LazyMount id="cta" minHeight={600}>
        <CTA />
      </LazyMount>

      {/* Footer */}
      <Footer />
    </main>
  )
}
