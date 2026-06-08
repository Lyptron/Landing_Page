'use client'
import { useEffect, useState } from 'react'
import { useInView } from '@/hooks/useInView'

interface ScrambleTextProps {
  text: string
  duration?: number
  delay?: number
}

export default function ScrambleText({ text, duration = 1200, delay = 0 }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState('')
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  useEffect(() => {
    if (!inView) return

    let isCancelled = false
    let timer: NodeJS.Timeout

    const startScramble = () => {
      const startTime = Date.now()

      const update = () => {
        if (isCancelled) return

        const now = Date.now()
        const progress = Math.min((now - startTime) / duration, 1)

        const scrambled = text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' '
            const letterThreshold = index / text.length
            
            // Cycle character states before revealing target char
            if (progress >= letterThreshold) {
              return char
            }
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join('')

        setDisplayText(scrambled)

        if (progress < 1) {
          timer = setTimeout(update, 40) // 40ms cycles
        } else {
          setDisplayText(text)
        }
      }

      update()
    }

    const initialDelay = setTimeout(startScramble, delay)

    return () => {
      isCancelled = true
      clearTimeout(initialDelay)
      clearTimeout(timer)
    }
  }, [inView, text, duration, delay])

  useEffect(() => {
    if (!inView) {
      setDisplayText(
        text
          .split('')
          .map((c) => (c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]))
          .join('')
      )
    }
  }, [inView, text])

  return (
    <span ref={ref as any} className="font-display">
      {displayText}
    </span>
  )
}
