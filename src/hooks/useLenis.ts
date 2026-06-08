'use client'
import { useEffect, useState } from 'react'

export function useLenis(callback?: (lenis: any) => void, deps: any[] = []) {
  const [lenisInstance, setLenisInstance] = useState<any>(null)

  useEffect(() => {
    let active = true
    const checkLenis = () => {
      if (typeof window !== 'undefined' && (window as any).lenis) {
        if (!active) return
        const instance = (window as any).lenis
        setLenisInstance(instance)
        if (callback) {
          instance.on('scroll', callback)
        }
      } else {
        setTimeout(checkLenis, 50)
      }
    }
    checkLenis()

    return () => {
      active = false
      if (typeof window !== 'undefined' && (window as any).lenis && callback) {
        (window as any).lenis.off('scroll', callback)
      }
    }
  }, deps)

  return lenisInstance
}
