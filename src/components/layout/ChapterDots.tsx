'use client'
import { useCursor } from '../providers/CursorProvider'
import { ChapterID } from '@/types'

interface ChapterDotsProps {
  activeChapter: string
  chapterIds: readonly { readonly id: string; readonly name: string }[]
}

export default function ChapterDots({ activeChapter, chapterIds }: ChapterDotsProps) {
  const { setCursorState } = useCursor()

  const handleScrollTo = (id: string) => {
    const target = document.getElementById(id)
    if (target) {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(target, { offset: -80, duration: 1.5 })
      } else {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="fixed right-[8px] top-1/2 -translate-y-1/2 z-[100] hidden md:flex flex-col gap-4 pointer-events-auto">
      {chapterIds.map((chapter) => {
        const isActive = activeChapter === chapter.id
        return (
          <button
            key={chapter.id}
            onClick={() => handleScrollTo(chapter.id)}
            className="group relative flex items-center justify-center bg-transparent border-none p-0 cursor-none h-6 w-6"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
            aria-label={`Scroll to ${chapter.name}`}
          >
            {/* Tooltip on the left of the dot */}
            <span className="absolute right-8 py-1 px-2.5 rounded bg-surface border border-white/10 text-[9px] font-mono text-[--text-secondary] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap uppercase tracking-wider">
              {chapter.name}
            </span>

            {/* State-driven dot visual */}
            <div
              className="rounded-full transition-[height,background-color] duration-300 ease-out"
              style={{
                width: '5px',
                height: isActive ? '20px' : '5px',
                backgroundColor: isActive ? '#f0f0f5' : 'transparent',
                border: isActive ? 'none' : '0.5px solid rgba(255, 255, 255, 0.2)',
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
