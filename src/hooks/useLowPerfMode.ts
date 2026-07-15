'use client'
import { useEffect, useState } from 'react'

// Shared detector so non-hook code (LenisProvider, LivePreviewFrame) can use
// the exact same criteria. A device counts as low-perf when it's small,
// touch-only, short on CPU/memory, or the user prefers reduced motion.
//
// The memory/core thresholds are deliberately generous (≤4 rather than ≤2):
// a 4GB-RAM laptop with a dual/quad-core CPU and integrated graphics cannot
// composite live iframes + JS smooth-scroll + large blur layers at 60fps.
// navigator.deviceMemory / hardwareConcurrency only exist on Chromium —
// missing values are treated as "fine".
export function isLowPerfDevice(): boolean {
  if (typeof window === 'undefined') return false

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isSmall = window.innerWidth < 768
  const isTouch = window.matchMedia('(pointer: coarse)').matches

  const nav = navigator as Navigator & { deviceMemory?: number }
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4
  const lowCores = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4

  return reducedMotion || isSmall || isTouch || lowMemory || lowCores
}

// Hook wrapper — components use this to skip expensive effects (Three.js
// canvases, heavy blur filters, infinite animations, live iframe embeds)
// on old phones, slow tablets, and low-spec laptops.
export function useLowPerfMode() {
  const [low, setLow] = useState(false)

  useEffect(() => {
    // Resolves on the client only — SSR can't measure perf characteristics.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLow(isLowPerfDevice())

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setLow(isLowPerfDevice())
    mql.addEventListener('change', onChange)
    window.addEventListener('resize', onChange)
    return () => {
      mql.removeEventListener('change', onChange)
      window.removeEventListener('resize', onChange)
    }
  }, [])

  return low
}
