'use client'
import { useEffect, useRef, useState, ReactNode } from 'react'

/**
 * Keeps a section's component tree completely unmounted — no JS chunk
 * fetched, no effects running, no memory held — until it's about to
 * scroll into view. Reserves layout space up front via minHeight so
 * nothing jumps when it mounts.
 */
export default function LazyMount({ children, minHeight, id }: { children: ReactNode; minHeight: number; id?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (visible) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '600px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible])

  // id lives on this wrapper (not the lazy child) so anchor links and
  // useChapterProgress's one-time getElementById/querySelector lookups
  // always find a target, even before the section below has mounted.
  return (
    <div id={id} ref={ref} style={{ contentVisibility: 'auto', containIntrinsicSize: `auto ${minHeight}px` }}>
      {visible ? children : null}
    </div>
  )
}
