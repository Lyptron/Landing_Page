'use client'
import { useRef, useCallback, useState, useEffect } from 'react'
import { m } from 'framer-motion'
import { TeamMember } from '@/types'
import { useCursor } from '../providers/CursorProvider'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01'
const EASE = [0.22, 1, 0.36, 1] as const

function useScramble(text: string, active: boolean) {
  const [display, setDisplay] = useState(text)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef  = useRef(0)

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (!active) { setDisplay(text); tickRef.current = 0; return }
    const TICKS = 18
    timerRef.current = setInterval(() => {
      tickRef.current++
      const revealed = Math.floor((tickRef.current / TICKS) * text.length)
      setDisplay(
        text.split('').map((ch, i) =>
          ch === ' ' ? ' ' : i < revealed ? text[i] : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        ).join('')
      )
      if (tickRef.current >= TICKS) { clearInterval(timerRef.current!); setDisplay(text); tickRef.current = 0 }
    }, 38)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [active, text])

  return display
}

interface TeamCardProps {
  member: TeamMember
  index: number
  dimmed: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
  onClick: () => void
}

export default function TeamCard({ member, index, dimmed, onHoverStart, onHoverEnd, onClick }: TeamCardProps) {
  const { setCursorState } = useCursor()
  const [hovered, setHovered] = useState(false)
  const scrambledName = useScramble(member.name, hovered)

  const handleEnter = useCallback(() => {
    setHovered(true); onHoverStart(); setCursorState('hover')
  }, [onHoverStart, setCursorState])

  const handleLeave = useCallback(() => {
    setHovered(false); onHoverEnd(); setCursorState('default')
  }, [onHoverEnd, setCursorState])

  return (
    /* Outer m.div — staggered entry animation, fires once on scroll into view */
    <m.div
      className="w-full"
      initial={{ opacity: 0, y: 52, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.11, duration: 0.85, ease: EASE }}
    >
      {/* Inner wrapper — handles spotlight dim + hover lift via CSS transitions */}
      <div
        className="team-card relative w-full rounded-xl overflow-hidden cursor-none select-none"
        style={{
          aspectRatio: '3 / 4',
          border: '1px solid rgba(255,255,255,0.07)',
          opacity:    dimmed ? 0.28 : 1,
          transform:  hovered ? 'scale(1.04)' : dimmed ? 'scale(0.97)' : 'scale(1)',
          filter:     dimmed ? 'blur(1.5px)' : 'none',
          boxShadow:  hovered ? '0 0 0 1px rgba(255,255,255,0.16), 0 28px 70px rgba(0,0,0,0.75)' : 'none',
          zIndex:     hovered ? 10 : 1,
          transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1), filter 0.4s ease, box-shadow 0.4s ease',
        }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={onClick}
      >
        {/* Portrait photo */}
        <div className="absolute inset-0 bg-[#0a0a0c]">
          {member.image && (
            <Image
              src={member.image}
              alt={member.name}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              className="object-cover object-[center_10%]"
              style={{
                opacity:    hovered ? 1 : 0.5,
                filter:     hovered ? 'none' : 'grayscale(100%)',
                transform:  hovered ? 'scale(1.08)' : 'scale(1)',
                transition: 'opacity 0.65s ease, filter 0.65s ease, transform 0.9s cubic-bezier(0.16,1,0.3,1)',
              }}
            />
          )}
        </div>

        {/* Bottom gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, #0a0a0c 0%, rgba(10,10,12,0.5) 45%, transparent 100%)',
            opacity: hovered ? 0.85 : 0.95,
            transition: 'opacity 0.5s ease',
          }}
        />

        {/* Top glint on hover */}
        <div
          className="absolute top-0 left-0 right-0 h-px bg-white pointer-events-none"
          style={{ opacity: hovered ? 0.1 : 0, transition: 'opacity 0.4s ease' }}
        />

        {/* Text */}
        <div
          className="absolute bottom-0 left-0 right-0 p-5 flex flex-col"
          style={{
            transform:  hovered ? 'translateY(0)' : 'translateY(6px)',
            transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-white/38 mb-2">
            {member.role}
          </span>

          <h3
            className="font-mono font-bold leading-tight"
            style={{
              fontSize: 'clamp(14px, 1.4vw, 18px)',
              letterSpacing: '-0.02em',
              color:      hovered ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.82)',
              transition: 'color 0.3s ease',
            }}
          >
            {scrambledName}
          </h3>

          <div
            className="flex items-center gap-1.5 mt-2"
            style={{
              opacity:    hovered ? 1 : 0,
              transform:  hovered ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.35s ease 0.08s, transform 0.4s cubic-bezier(0.16,1,0.3,1) 0.08s',
            }}
          >
            <span className="font-mono text-[9px] tracking-widest uppercase text-white/45">View Profile</span>
            <ArrowUpRight className="w-3 h-3 text-white/38" />
          </div>
        </div>
      </div>
    </m.div>
  )
}
