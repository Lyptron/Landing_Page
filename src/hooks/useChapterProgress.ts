'use client'
import { useState, useEffect } from 'react'
import { ChapterID } from '@/types'

export function useChapterProgress(chapterIds: readonly string[]) {
  const [activeChapter, setActiveChapter] = useState<string>(chapterIds[0])

  useEffect(() => {
    const observers = chapterIds.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveChapter(id)
            }
          })
        },
        {
          rootMargin: '-45% 0px -45% 0px',
          threshold: 0,
        }
      )

      observer.observe(el)
      return { observer, el }
    })

    return () => {
      observers.forEach((obs) => {
        if (obs) {
          obs.observer.disconnect()
        }
      })
    }
  }, [chapterIds])

  return activeChapter
}
