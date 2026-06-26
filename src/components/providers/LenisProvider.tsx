'use client'
import { useEffect } from 'react'

/**
 * Lenis + GSAP are ~150KB combined. They have zero impact on first paint
 * (no scroll has happened yet), so we defer their import until the browser
 * is idle — usually a few hundred ms after the page becomes interactive.
 * Visitor doesn't notice because by the time their finger reaches the
 * trackpad, smooth scroll is already initialized.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Native mobile scrolling is GPU-accelerated and consistently smoother
    // than any JS-driven smooth-scroll on low-end phones. Skip Lenis on
    // touch devices and when the user prefers reduced motion.
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || reducedMotion) return

    let cleanup: (() => void) | null = null
    let cancelled = false

    const schedule: (cb: () => void) => number =
      typeof (window as any).requestIdleCallback === 'function'
        ? (cb) => (window as any).requestIdleCallback(cb, { timeout: 1500 })
        : (cb) => window.setTimeout(cb, 500)

    const handle = schedule(async () => {
      if (cancelled) return
      const [{ default: Lenis }, gsapMod, scrollTriggerMod] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return
      const { gsap } = gsapMod
      const { ScrollTrigger } = scrollTriggerMod
      gsap.registerPlugin(ScrollTrigger)

      const lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
      })

      lenis.on('scroll', ScrollTrigger.update)
      ;(window as any).lenis = lenis

      const tick = (time: number) => {
        lenis.raf(time * 1000)
      }
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      // Stop the RAF ticker entirely when this tab isn't visible — otherwise
      // it keeps competing for CPU/GPU even in a background tab.
      const handleVisibility = () => {
        if (document.visibilityState === 'hidden') {
          gsap.ticker.remove(tick)
        } else {
          gsap.ticker.add(tick)
        }
      }
      document.addEventListener('visibilitychange', handleVisibility)

      cleanup = () => {
        lenis.destroy()
        gsap.ticker.remove(tick)
        document.removeEventListener('visibilitychange', handleVisibility)
      }
    })

    return () => {
      cancelled = true
      if (typeof (window as any).cancelIdleCallback === 'function') {
        (window as any).cancelIdleCallback(handle)
      } else {
        window.clearTimeout(handle)
      }
      cleanup?.()
    }
  }, [])

  return <>{children}</>
}
