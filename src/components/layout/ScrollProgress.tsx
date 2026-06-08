'use client'
import { motion, useScroll, useSpring } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function ScrollProgress() {
  const pathname = usePathname()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/client')) {
    return null
  }

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[1.5px] origin-left z-[200] pointer-events-none"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #1d7ef5, #c0c0cc)',
        boxShadow: '0 0 8px rgba(29,126,245,0.6)',
      }}
    />
  )
}
