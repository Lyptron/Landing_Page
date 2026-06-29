'use client'
import { useRef, useCallback } from 'react'
import { TeamMember } from '@/types'
import { useCursor } from '../providers/CursorProvider'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'

interface TeamCardProps {
  member: TeamMember
  // Kept for caller compatibility (animation stagger) even when this
  // component doesn't read it internally.
  index?: number
  onClick: () => void
}

export default function TeamCard({ member, onClick }: TeamCardProps) {
  const { setCursorState } = useCursor()
  const cardRef = useRef<HTMLDivElement>(null)
  const rectRef = useRef<DOMRect | null>(null)
  const rafRef = useRef<number | null>(null)
  const pendingRef = useRef<{ x: number; y: number } | null>(null)

  // Batch mousemove writes into a single rAF tick instead of mutating style
  // on every raw event (which can fire 100+/sec) — keeps the tilt off the
  // main thread's critical path while the carousel's GSAP ticker is running.
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!rectRef.current) return
    const rect = rectRef.current
    pendingRef.current = {
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    }
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const pending = pendingRef.current
      if (!pending || !cardRef.current) return
      cardRef.current.style.transform = `perspective(1000px) rotateX(${-pending.y * 5}deg) rotateY(${pending.x * 5}deg) scale3d(1.02, 1.02, 1.02)`
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    rectRef.current = null
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    cardRef.current.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
    setCursorState('default')
  }, [setCursorState])

  const handleMouseEnter = useCallback(() => {
    if (!cardRef.current) return
    rectRef.current = cardRef.current.getBoundingClientRect()
    cardRef.current.style.transition = 'none'
    setCursorState('hover')
  }, [setCursorState])

  return (
    <div
      ref={cardRef}
      className="team-card shrink-0 w-75 sm:w-85 h-120 cursor-none select-none relative rounded-xl overflow-hidden group"
      style={{
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d',
        background: 'linear-gradient(160deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
    >
      {/* Portrait area */}
      <div className="absolute inset-0 bg-[#0a0a0c] z-0">
        {member.image ? (
          <Image 
            src={member.image} 
            alt={member.name} 
            fill 
            sizes="(max-width: 640px) 300px, 340px"
            className="object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display font-bold text-[80px] text-white/4 tracking-tight select-none">{member.initials}</span>
          </div>
        )}
        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-[#0a0a0c] via-[#0a0a0c]/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none z-1" />

      {/* Subtle top edge highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white opacity-0 group-hover:opacity-[0.06] transition-opacity duration-700 z-10" />

      {/* Card Contents */}
      <div className="relative h-full p-8 flex flex-col items-start justify-end z-10 w-full">
        <div className="flex flex-col w-full transform translate-y-3 group-hover:translate-y-0 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-white/35 mb-3">
            {member.role}
          </span>
          <h3 className="font-display font-semibold text-[28px] text-white/80 tracking-tight leading-none group-hover:text-white/90 transition-colors duration-300">
            {member.name}
          </h3>
        </div>

        {/* Hover reveal action */}
        <div className="w-full overflow-hidden h-6 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center">
          <div className="flex items-center gap-2 text-white/50 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-600 delay-100 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <span className="font-mono text-[10px] tracking-widest uppercase">View Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  )
}
