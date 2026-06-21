'use client'
import dynamic from 'next/dynamic'
import { CHAPTER_IDS } from '@/lib/constants'
import { useChapterProgress } from '@/hooks/useChapterProgress'
import Hero from '@/components/sections/Hero'
import SectionDivider from '@/components/ui/SectionDivider'
import ChapterDots from '@/components/layout/ChapterDots'

const WhoWeAre = dynamic(() => import('@/components/sections/WhoWeAre'))
const Services = dynamic(() => import('@/components/sections/Services'))
const Work = dynamic(() => import('@/components/sections/Work'))
const Team = dynamic(() => import('@/components/sections/Team'))
const Process = dynamic(() => import('@/components/sections/Process'))
const Pricing = dynamic(() => import('@/components/sections/Pricing'))
const CTA = dynamic(() => import('@/components/sections/CTA'))
const Footer = dynamic(() => import('@/components/layout/Footer'))

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
      <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 800px' }}>
        <WhoWeAre />
      </div>

      <SectionDivider />

      {/* Chapter 3: Services */}
      <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 900px' }}>
        <Services />
      </div>

      <SectionDivider />

      {/* Chapter 4: Work */}
      <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 1000px' }}>
        <Work />
      </div>

      <SectionDivider />

      {/* Chapter 5: Team */}
      <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 800px' }}>
        <Team />
      </div>

      <SectionDivider />

      {/* Chapter 6: Process */}
      <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 900px' }}>
        <Process />
      </div>

      <SectionDivider />

      {/* Chapter 7: Pricing */}
      <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 800px' }}>
        <Pricing />
      </div>

      <SectionDivider />

      {/* Chapter 8: CTA */}
      <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 600px' }}>
        <CTA />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}
