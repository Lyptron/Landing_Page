'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const Cursor = dynamic(() => import('./Cursor'), { ssr: false })

/**
 * Cursor + its framer-motion spring dependencies are useless on touch devices
 * and only fire once the user moves the mouse anyway. This mount gate keeps
 * the bundle off the critical path: nothing loads until we've confirmed we're
 * on a desktop with mouse input.
 */
export default function CursorMount() {
  const [shouldMount, setShouldMount] = useState(false)

  useEffect(() => {
    const isDesktop = window.matchMedia('(pointer: fine)').matches && window.innerWidth > 768
    if (!isDesktop) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShouldMount(true)
  }, [])

  if (!shouldMount) return null
  return <Cursor />
}
