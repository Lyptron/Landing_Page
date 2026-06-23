'use client'
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Native mobile scrolling is GPU-accelerated and consistently smoother
    // than any JS-driven smooth-scroll on low-end phones. Skip Lenis on
    // touch devices and when the user prefers reduced motion.
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || reducedMotion) return

    lenisRef.current = new Lenis({
      duration:   1.4,
      easing:     (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    })

    // Connect Lenis to GSAP ScrollTrigger
    lenisRef.current.on('scroll', ScrollTrigger.update)

    if (typeof window !== 'undefined') {
      (window as any).lenis = lenisRef.current
    }

    const tick = (time: number) => {
      lenisRef.current?.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Stop the RAF ticker entirely when this tab isn't visible — otherwise
    // it keeps competing for CPU/GPU even in a background tab, which is
    // what causes lag when many tabs are open at once.
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        gsap.ticker.remove(tick)
      } else {
        gsap.ticker.add(tick)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      lenisRef.current?.destroy()
      gsap.ticker.remove(tick)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return <>{children}</>
}
