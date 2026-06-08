'use client'
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
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

    return () => {
      lenisRef.current?.destroy()
      gsap.ticker.remove(tick)
    }
  }, [])

  return <>{children}</>
}
