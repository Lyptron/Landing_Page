'use client'
import { CHAPTER_IDS } from '@/lib/constants'
import { useChapterProgress } from '@/hooks/useChapterProgress'
import Hero from '@/components/sections/Hero'
import WhoWeAre from '@/components/sections/WhoWeAre'
import Services from '@/components/sections/Services'
import Work from '@/components/sections/Work'
import Team from '@/components/sections/Team'
import Process from '@/components/sections/Process'
import Pricing from '@/components/sections/Pricing'
import CTA from '@/components/sections/CTA'
import SectionDivider from '@/components/ui/SectionDivider'
import ChapterDots from '@/components/layout/ChapterDots'
import Footer from '@/components/layout/Footer'

export default function Home() {
  const chapterIds = CHAPTER_IDS.map((c) => c.id)
  const activeChapter = useChapterProgress(chapterIds)

  return (
    <main className="relative min-h-screen bg-bg text-[--text-primary] overflow-x-hidden">
      {/* Chapter Vertical Dots */}
      <ChapterDots activeChapter={activeChapter} chapterIds={CHAPTER_IDS} />

      {/* Chapter 1: Hero */}
      <Hero />

      {/* Divider */}
      <SectionDivider />

      {/* Chapter 2: Who We Are */}
      <WhoWeAre />

      {/* Divider */}
      <SectionDivider />

      {/* Chapter 3: Services */}
      <Services />

      {/* Divider */}
      <SectionDivider />

      {/* Chapter 4: Work */}
      <Work />

      {/* Divider */}
      <SectionDivider />

      {/* Chapter 5: Team */}
      <Team />

      {/* Divider */}
      <SectionDivider />

      {/* Chapter 6: Process */}
      <Process />

      {/* Divider */}
      <SectionDivider />

      {/* Chapter 7: Pricing */}
      <Pricing />

      {/* Divider */}
      <SectionDivider />

      {/* Chapter 8: CTA */}
      <CTA />

      {/* Footer */}
      <Footer />
    </main>
  )
}
