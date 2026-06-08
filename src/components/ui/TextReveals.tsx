'use client'
import { useEffect, useState, useRef } from 'react'

interface TextRevealProps {
  text: string
  duration?: number
  delay?: number
}

// ─────────────────────────────────────────────────────────
// CipherReveal
// Block characters (░▒▓█) decode into text left-to-right.
// Feels like data materialising — tech, encrypted, premium.
// ─────────────────────────────────────────────────────────
const BLOCKS = '░▒▓█▌▐'

export function CipherReveal({ text, duration = 1200, delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState('')
  const triggered = useRef(false)

  useEffect(() => {
    if (!triggered.current) {
      setDisplay(
        text
          .split('')
          .map((c) => (c === ' ' ? ' ' : BLOCKS[Math.floor(Math.random() * BLOCKS.length)]))
          .join(''),
      )
    }
  }, [text])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || triggered.current) return
        triggered.current = true
        observer.disconnect()

        const startTime = performance.now() + delay
        let lastFrame = 0

        const animate = (now: number) => {
          if (now - lastFrame < 38) {
            requestAnimationFrame(animate)
            return
          }
          lastFrame = now

          const progress = Math.min(Math.max((now - startTime) / duration, 0), 1)
          if (progress <= 0) {
            requestAnimationFrame(animate)
            return
          }

          const result = text
            .split('')
            .map((target, i) => {
              if (target === ' ') return ' '
              const wave = (progress - (i / text.length) * 0.55) / 0.45
              if (wave >= 1) return target
              if (wave <= 0)
                return BLOCKS[Math.floor(Math.random() * BLOCKS.length)]
              if (wave < 0.3) return '▓'
              if (wave < 0.55) return '▒'
              if (wave < 0.8) return '░'
              return target
            })
            .join('')

          setDisplay(result)
          if (progress < 1) requestAnimationFrame(animate)
          else setDisplay(text)
        }

        requestAnimationFrame(animate)
      },
      { rootMargin: '-60px', threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [text, duration, delay])

  return (
    <span ref={ref} className="font-display">
      {display}
    </span>
  )
}

// ─────────────────────────────────────────────────────────
// TypewriterReveal
// Characters appear one by one with a blinking cursor.
// Clean, editorial, intentional — like a command being typed.
// ─────────────────────────────────────────────────────────
export function TypewriterReveal({ text, duration = 1200, delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'typing' | 'done'>('idle')
  const triggered = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || triggered.current) return
        triggered.current = true
        observer.disconnect()

        let isCancelled = false
        const nonSpaceCount = text.replace(/ /g, '').length
        const charInterval = duration / nonSpaceCount

        const startTyping = () => {
          if (isCancelled) return
          setPhase('typing')
          let current = 0

          const typeNext = () => {
            if (isCancelled || current >= text.length) {
              if (!isCancelled) {
                setCount(text.length)
                setPhase('done')
              }
              return
            }
            current++
            setCount(current)
            const nextDelay =
              text[current] === ' '
                ? 30
                : charInterval * (0.65 + Math.random() * 0.7)
            setTimeout(typeNext, nextDelay)
          }
          typeNext()
        }

        setTimeout(startTyping, delay)
      },
      { rootMargin: '-60px', threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [text, duration, delay])

  return (
    <span ref={ref} className="font-display">
      <span>{text.slice(0, count)}</span>
      {phase === 'typing' && (
        <span
          className="inline-block w-[3px] h-[0.82em] bg-current ml-[2px] align-baseline animate-[cursorBlink_0.55s_steps(1)_infinite]"
        />
      )}
      {phase === 'done' && (
        <span
          className="inline-block w-[3px] h-[0.82em] bg-current ml-[2px] align-baseline animate-[cursorBlink_0.55s_steps(1)_infinite_0.8s_both_cursorFadeOut]"
          style={{ animation: 'cursorBlink 0.55s steps(1) infinite, cursorFadeOut 0.4s 0.8s forwards' }}
        />
      )}
    </span>
  )
}

// ─────────────────────────────────────────────────────────
// FlipReveal
// Split-flap / airport departure board. Each character slot
// cycles rapidly through the alphabet, then decelerates and
// locks onto the target — left chars settle first.
// ─────────────────────────────────────────────────────────
const FLIP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function FlipReveal({ text, duration = 1200, delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState('')
  const triggered = useRef(false)

  useEffect(() => {
    if (!triggered.current) {
      setDisplay(
        text
          .split('')
          .map((c) => (c === ' ' ? ' ' : FLIP[Math.floor(Math.random() * FLIP.length)]))
          .join(''),
      )
    }
  }, [text])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || triggered.current) return
        triggered.current = true
        observer.disconnect()

        const startTime = performance.now() + delay
        let lastFrame = 0

        const animate = (now: number) => {
          if (now - lastFrame < 42) {
            requestAnimationFrame(animate)
            return
          }
          lastFrame = now

          const progress = Math.min(Math.max((now - startTime) / duration, 0), 1)
          if (progress <= 0) {
            requestAnimationFrame(animate)
            return
          }

          const result = text
            .split('')
            .map((target, i) => {
              if (target === ' ') return ' '
              const wave = (progress - (i / text.length) * 0.5) / 0.5
              if (wave >= 1) return target
              if (wave <= 0) {
                const idx = Math.floor(now / 48) % FLIP.length
                return FLIP[(idx + i * 7) % FLIP.length]
              }
              if (wave > 0.85) return target
              if (wave > 0.65 && Math.random() > 0.35) return target
              const speed = 48 + wave * 180
              const idx = Math.floor(now / speed) % FLIP.length
              return FLIP[(idx + i * 7) % FLIP.length]
            })
            .join('')

          setDisplay(result)
          if (progress < 1) requestAnimationFrame(animate)
          else setDisplay(text)
        }

        requestAnimationFrame(animate)
      },
      { rootMargin: '-60px', threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [text, duration, delay])

  return (
    <span ref={ref} className="font-display">
      {display}
    </span>
  )
}
