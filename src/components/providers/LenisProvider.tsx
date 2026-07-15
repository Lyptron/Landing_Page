'use client'

// Lenis + GSAP ScrollTrigger interpolated every wheel tick into ~80 rAF
// frames, and every one of those frames re-woke every downstream listener
// (ScrollProgress spring, ChapterDots IO, fixed-position blur composites).
// On integrated GPUs the per-frame budget blew past 16ms and scroll rendered
// at ~18fps. Native scroll is compositor-only and can't drop frames the same
// way — this wrapper is now a pass-through, kept only so layout.tsx doesn't
// need to change.
export function LenisProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
