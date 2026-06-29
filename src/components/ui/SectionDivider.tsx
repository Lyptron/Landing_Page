'use client'
import { useRef } from 'react'
import { m, useInView } from 'framer-motion'

export default function SectionDivider() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <div ref={ref} className="w-full px-6 md:px-30 py-8 relative z-10 pointer-events-none">
      <m.div
        className="h-px w-full bg-linear-to-r from-transparent via-white/8 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}
