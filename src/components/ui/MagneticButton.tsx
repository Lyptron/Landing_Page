'use client'
import { useRef, useCallback } from 'react'
import { m } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCursor } from '../providers/CursorProvider'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'ghost' | 'glass'
  href?: string
  onClick?: () => void
  strength?: number
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export default function MagneticButton({
  children, 
  className, 
  variant = 'primary',
  href, 
  onClick, 
  strength = 0.25,
  type = 'button',
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const rectRef = useRef<DOMRect | null>(null)
  const { setCursorState } = useCursor()

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || !rectRef.current) return
    const rect = rectRef.current
    const dx = e.clientX - (rect.left + rect.width  / 2)
    const dy = e.clientY - (rect.top  + rect.height / 2)
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 120) {
      ref.current.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`
    }
  }, [strength])

  const handleMouseLeave = useCallback(() => {
    setCursorState('default')
    rectRef.current = null
    if (!ref.current) return
    ref.current.style.transform = 'translate(0,0)'
    ref.current.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)'
    setTimeout(() => { if (ref.current) ref.current.style.transition = '' }, 400)
  }, [setCursorState])

  const handleMouseEnter = useCallback(() => {
    setCursorState('cta')
    if (ref.current) {
      rectRef.current = ref.current.getBoundingClientRect()
    }
  }, [setCursorState])

  const baseClass = cn(
    'inline-flex items-center justify-center gap-2',
    'px-7 py-3.5 rounded-full',
    'font-body font-medium text-sm tracking-wide',
    'transition-all duration-200',
    'select-none cursor-none',
    variant === 'primary' && [
      'bg-white text-black',
      'shadow-[0_8px_32px_rgba(240,240,245,0.15)]',
      'hover:shadow-[0_16px_48px_rgba(240,240,245,0.2)]',
      'hover:bg-gray-200',
    ],
    variant === 'ghost' && [
      'border border-(--glass-border)',
      'text-[--text-secondary]',
      'hover:border-white/20 hover:text-[--text-primary]',
      'backdrop-blur-pill',
    ],
    variant === 'glass' && [
      'bg-(--blue-glass) border border-[rgba(29,126,245,0.25)]',
      'text-[--blue]',
      'backdrop-blur-pill',
      'hover:bg-[rgba(29,126,245,0.15)]',
    ],
    className
  )

  const Tag = href ? 'a' : 'button'

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <m.div
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
      >
        <Tag 
          href={href} 
          onClick={onClick} 
          className={baseClass} 
          {...(!href ? { type, disabled } : {})}
        >
          {children}
        </Tag>
      </m.div>
    </div>
  )
}
