'use client'
import { useEffect, useRef, useState } from 'react'

interface LivePreviewFrameProps {
  url: string
  title: string
  // The real viewport size to render the live site at, before scaling down
  // to fit the mockup frame. Rendering at a genuine viewport width (rather
  // than the mockup's own — often much narrower — pixel width) means the
  // site's own responsive breakpoints kick in correctly instead of its
  // layout overflowing a viewport far smaller than any real device.
  baseWidth: number
  baseHeight: number
  className?: string
}

// Scales a full-size iframe down (via ResizeObserver + CSS transform) to
// exactly fill whatever container it's dropped into, so live embeds work
// inside both desktop browser-chrome mockups and narrow phone frames.
//
// The iframe is only mounted once the frame scrolls near the viewport
// (IntersectionObserver). Embedding live external sites is expensive, so
// deferring keeps them off the critical first paint — this is what makes
// the hero feel smooth instead of chunky while several previews exist.
export default function LivePreviewFrame({ url, title, baseWidth, baseHeight, className = '' }: LivePreviewFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => setScale(el.clientWidth / baseWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [baseWidth])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      // Start loading a bit before the frame is actually on screen so the
      // preview is ready by the time the user reaches it.
      { rootMargin: '400px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      {visible && scale > 0 && (
        <iframe
          src={url}
          title={title}
          loading="lazy"
          className="pointer-events-none"
          style={{
            width: baseWidth,
            height: baseHeight,
            border: 'none',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      )}
    </div>
  )
}
