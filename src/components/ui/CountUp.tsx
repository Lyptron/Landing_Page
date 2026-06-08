'use client'
import { useEffect, useState } from 'react'
import { useInView } from '@/hooks/useInView'

interface CountUpProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
}

export default function CountUp({ end, duration = 1800, prefix = '', suffix = '' }: CountUpProps) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.6 })

  useEffect(() => {
    if (!inView) return

    let startTime: number | null = null
    const startValue = 0

    const easeOutExpo = (t: number) => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
    }

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const easedProgress = easeOutExpo(progress)
      const currentValue = Math.floor(startValue + easedProgress * (end - startValue))
      
      setCount(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(animate)
  }, [inView, end, duration])

  return (
    <span ref={ref as any}>
      {prefix}
      {count}
      {suffix}
    </span>
  )
}
