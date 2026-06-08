'use client'
import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCursor } from '../providers/CursorProvider'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'strong' | 'blue-tint' | 'hero-float'
  tilt?: boolean
  glow?: boolean
  glowColor?: string
  strength?: number
  onClick?: () => void
}

export default function GlassCard({
  children,
  className,
  variant = 'default',
  tilt = true,
  glow = true,
  glowColor = 'rgba(255,255,255,0.06)',
  strength = 10,
  onClick,
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { setCursorState } = useCursor()
  const isHeroFloat = variant === 'hero-float'

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5

    if (isHeroFloat) {
      // Premium: subtle tilt + blue-tinted border glow
      ref.current.style.transform = `
        perspective(1200px)
        rotateX(${-y * 4}deg)
        rotateY(${x * 4}deg)
        translateY(-2px)
      `
      ref.current.style.borderColor = 'rgba(29,126,245,0.18)'
      ref.current.style.boxShadow = '0 0 0 0.5px rgba(29,126,245,0.1), 0 4px 16px rgba(0,0,0,0.25), 0 20px 48px rgba(0,0,0,0.15), 0 0 24px rgba(29,126,245,0.06)'
    } else {
      ref.current.style.transform = `
        perspective(900px)
        rotateX(${-y * strength}deg)
        rotateY(${x  * strength}deg)
        translateZ(8px)
        scale(1.02)
      `
      if (glow) {
        ref.current.style.background = `
          radial-gradient(
            circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%,
            ${glowColor},
            rgba(255,255,255,0.02)
          )
        `
      }
    }
  }, [tilt, glow, glowColor, strength, isHeroFloat])

  const handleMouseLeave = useCallback(() => {
    setCursorState('default')
    if (!ref.current) return

    if (isHeroFloat) {
      ref.current.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translateY(0)'
      ref.current.style.borderColor = 'rgba(255,255,255,0.08)'
      ref.current.style.boxShadow = '0 0 0 0.5px rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.2), 0 16px 40px rgba(0,0,0,0.12)'
    } else {
      ref.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0) scale(1)'
      if (variant === 'strong') {
        ref.current.style.background = 'var(--glass-fill-md)'
      } else if (variant === 'blue-tint') {
        ref.current.style.background = 'var(--blue-glass)'
      } else {
        ref.current.style.background = 'var(--glass-fill)'
      }
    }

    ref.current.style.transition = 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
    setTimeout(() => { if (ref.current) ref.current.style.transition = '' }, 400)
  }, [variant, isHeroFloat, setCursorState])

  const handleMouseEnter = useCallback(() => {
    setCursorState('hover')
  }, [setCursorState])

  const variantClasses = cn(
    variant === 'default' && 'bg-[var(--glass-fill)] border-[var(--glass-border)] backdrop-blur-glass',
    variant === 'strong' && 'bg-[var(--glass-fill-md)] border-[var(--glass-border)] backdrop-blur-[48px]',
    variant === 'blue-tint' && 'bg-[var(--blue-glass)] border-[rgba(29,126,245,0.25)] backdrop-blur-glass',
    variant === 'hero-float' && 'bg-[rgba(255,255,255,0.035)] border-[rgba(255,255,255,0.08)] backdrop-blur-[20px]'
  )

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden cursor-none border',
        isHeroFloat ? 'rounded-[12px]' : 'rounded-[20px]',
        isHeroFloat
          ? 'shadow-[0_0_0_0.5px_rgba(255,255,255,0.05),_0_4px_16px_rgba(0,0,0,0.2),_0_16px_40px_rgba(0,0,0,0.12)]'
          : 'shadow-[inset_0_1.5px_0_rgba(255,255,255,0.08),_0_32px_64px_rgba(0,0,0,0.4)]',
        variantClasses,
        // Gradient sheen + noise texture — non-hero-float only
        !isHeroFloat && 'before:absolute before:inset-0 before:rounded-[inherit]',
        !isHeroFloat && 'before:bg-gradient-to-br before:from-white/[0.06] before:to-transparent',
        !isHeroFloat && 'before:pointer-events-none',
        !isHeroFloat && 'after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:opacity-[0.025] after:z-[-1]',
        !isHeroFloat && 'after:bg-[url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")]',
        'transition-[border-color,box-shadow,transform] duration-300',
        !isHeroFloat && 'hover:border-white/[0.16] hover:shadow-glass-hover',
        className
      )}
    >
      {/* Hero-float: top accent line + inner gradient sheen */}
      {isHeroFloat && (
        <>
          {/* Top accent line */}
          <div
            className="absolute top-0 left-[18%] right-[18%] h-px pointer-events-none z-[2]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(29,126,245,0.35), rgba(129,140,248,0.2), transparent)',
            }}
          />
          {/* Subtle inner gradient sheen */}
          <div
            className="absolute inset-0 pointer-events-none z-[1] rounded-[inherit]"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%, rgba(29,126,245,0.015) 100%)',
            }}
          />
        </>
      )}
      {children}
    </motion.div>
  )
}
