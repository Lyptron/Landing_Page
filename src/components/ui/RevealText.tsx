'use client'
import { motion } from 'framer-motion'
import { useInView } from '@/hooks/useInView'

interface RevealTextProps {
  text: string
  className?: string
  delay?: number
}

export default function RevealText({ text, className, delay = 0 }: RevealTextProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 })
  const words = text.split(' ')

  const containerVariants: any = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: delay,
      },
    },
  }

  const childVariants: any = {
    hidden: {
      opacity: 0,
      y: '100%',
    },
    visible: {
      opacity: 1,
      y: '0%',
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  return (
    <motion.span
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
      style={{ display: 'inline-block' }}
    >
      {words.map((word, idx) => (
        <span key={idx} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.25em', verticalAlign: 'bottom' }}>
          <motion.span variants={childVariants} style={{ display: 'inline-block' }}>
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
