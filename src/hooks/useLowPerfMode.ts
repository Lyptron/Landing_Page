'use client'
import { useEffect, useState } from 'react'

// Returns true when the device is small, touch-only, low on CPU/memory,
// or the user has prefers-reduced-motion enabled. Components use this to
// skip expensive effects (Three.js canvases, heavy blur filters, infinite
// animations) on old phones and slow tablets.
export function useLowPerfMode() {
  const [low, setLow] = useState(false)

  useEffect(() => {
    const evaluate = () => {
      if (typeof window === 'undefined') return false

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const isSmall = window.innerWidth < 768
      const isTouch = window.matchMedia('(pointer: coarse)').matches

      // navigator.deviceMemory / hardwareConcurrency only exist on Chromium —
      // missing values are treated as "fine".
      const nav = navigator as Navigator & { deviceMemory?: number }
      const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2
      const lowCores = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2

      return reducedMotion || isSmall || isTouch || lowMemory || lowCores
    }

    setLow(evaluate())

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setLow(evaluate())
    mql.addEventListener('change', onChange)
    window.addEventListener('resize', onChange)
    return () => {
      mql.removeEventListener('change', onChange)
      window.removeEventListener('resize', onChange)
    }
  }, [])

  return low
}
