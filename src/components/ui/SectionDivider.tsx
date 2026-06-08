'use client'
import { motion } from 'framer-motion'
import { useInView } from '@/hooks/useInView'

export default function SectionDivider() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <div ref={ref as any} className="w-full px-6 md:px-[120px] py-8 relative z-10 pointer-events-none">
      <motion.div
        className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}
