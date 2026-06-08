'use client'
import { useRef, useState, useCallback } from 'react'

export function use3DTilt(strength = 10) {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0) scale3d(1, 1, 1)',
    background: 'var(--glass-fill)',
    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
  })

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const xc = rect.width / 2
    const yc = rect.height / 2
    const rotateY = ((x - xc) / xc) * strength
    const rotateX = -((y - yc) / yc) * strength

    setStyle({
      transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px) scale3d(1.02, 1.02, 1.02)`,
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
      transition: 'transform 0.1s ease-out, background 0.1s ease-out',
    })
  }, [strength])

  const onMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0) scale3d(1, 1, 1)',
      background: 'var(--glass-fill)',
      transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    })
  }, [])

  return { ref, style, onMouseMove, onMouseLeave }
}
