'use client'
import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface AvailabilityIslandProps {
  variant?: 'default' | 'strong' | 'blue-tint' | 'hero-float'
  className?: string
}

const CARD_BG = 'linear-gradient(145deg, rgba(5,14,10,0.97) 0%, rgba(4,12,8,0.99) 100%)'
const BASE_SHADOW = '0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 16px rgba(0,0,0,0.3), 0 16px 48px rgba(0,0,0,0.22), 0 32px 80px rgba(0,0,0,0.15)'
const COLOR = '#22c55e'

// Calendar: 5 weeks × 5 days — 1=booked, 0=open
const CAL = [
  [1,1,1,1,1],
  [1,1,0,0,1],
  [0,0,0,1,1],
  [0,0,0,0,0],
  [0,0,0,0,0],
]
const DAYS = [
  { label: 'M', id: 'mon' },
  { label: 'T', id: 'tue' },
  { label: 'W', id: 'wed' },
  { label: 'T', id: 'thu' },
  { label: 'F', id: 'fri' },
]

function HeroAvailabilityIsland({ className }: AvailabilityIslandProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.transform = `perspective(1000px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-2px)`
    ref.current.style.borderColor = `${COLOR}25`
    ref.current.style.boxShadow = `0 0 0 0.5px ${COLOR}15, 0 8px 32px rgba(0,0,0,0.35), 0 24px 64px rgba(0,0,0,0.2), 0 0 40px ${COLOR}06`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = ''
    ref.current.style.borderColor = 'rgba(255,255,255,0.08)'
    ref.current.style.boxShadow = BASE_SHADOW
    ref.current.style.transition = 'all 0.45s cubic-bezier(0.23,1,0.32,1)'
    setTimeout(() => { if (ref.current) ref.current.style.transition = '' }, 450)
  }, [])

  // Count open slots
  const openSlots = CAL.flat().filter(v => v === 0).length

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('relative overflow-hidden select-none cursor-none w-full', className)}
      style={{ borderRadius: '16px', background: CARD_BG, border: '1px solid rgba(255,255,255,0.08)', boxShadow: BASE_SHADOW, backdropFilter: 'blur(32px)', transition: 'transform 0.18s ease, border-color 0.3s ease, box-shadow 0.3s ease' }}
    >
      {/* Top accent — green */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent 5%, ${COLOR}55 40%, ${COLOR}30 70%, transparent 95%)` }} />
      <div className="absolute top-0 right-0 w-[100px] h-[60px] pointer-events-none" style={{ background: `radial-gradient(ellipse at top right, ${COLOR}07 0%, transparent 70%)` }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[8px] uppercase tracking-[0.14em]" style={{ color: 'rgba(240,240,245,0.22)' }}>Status</span>
          <div className="flex items-center gap-1.5">
            <span className="relative flex w-[5px] h-[5px]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-60" />
              <span className="relative w-[5px] h-[5px] rounded-full bg-[#22c55e]" style={{ boxShadow: '0 0 5px rgba(34,197,94,0.8)' }} />
            </span>
            <span className="font-mono text-[8px]" style={{ color: `${COLOR}80` }}>Open</span>
          </div>
        </div>

        {/* Status pill */}
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-3"
             style={{ background: `${COLOR}0d`, border: `1px solid ${COLOR}20` }}>
          <span className="font-body font-medium text-[11px]" style={{ color: 'rgba(240,240,245,0.6)' }}>Available for projects</span>
        </div>

        {/* Calendar */}
        <div className="mb-3">
          <div className="flex justify-between mb-1.5 px-0.5">
            {DAYS.map(d => (
              <span key={d.id} className="font-mono text-[7px] w-[10px] text-center" style={{ color: 'rgba(240,240,245,0.18)' }}>{d.label}</span>
            ))}
          </div>
          <div className="flex flex-col gap-[3px]">
            {CAL.map((week, wi) => (
              <div key={`week-${wi}`} className="flex gap-[3px]">
                {week.map((booked, di) => (
                  <div key={`slot-${wi}-${di}`} className="flex-1 rounded-[2.5px]"
                       style={{ height: '9px', background: booked ? 'rgba(255,255,255,0.06)' : (wi >= 3 ? `${COLOR}35` : `${COLOR}20`),
                                boxShadow: !booked && wi >= 3 ? `0 0 4px ${COLOR}20` : 'none' }} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend + slot count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-[7px] h-[7px] rounded-[2px]" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="font-mono text-[7px]" style={{ color: 'rgba(240,240,245,0.18)' }}>Booked</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-[7px] h-[7px] rounded-[2px]" style={{ background: `${COLOR}35` }} />
              <span className="font-mono text-[7px]" style={{ color: 'rgba(240,240,245,0.18)' }}>Open</span>
            </div>
          </div>
          <span className="font-mono text-[7.5px] px-2 py-0.5 rounded-full" style={{ background: `${COLOR}10`, color: `${COLOR}70` }}>
            {openSlots} slots free
          </span>
        </div>
      </div>
    </div>
  )
}

export default function AvailabilityIsland(props: AvailabilityIslandProps) {
  if (props.variant === 'hero-float') return <HeroAvailabilityIsland {...props} />
  return (
    <div className={cn('rounded-[16px] p-4 border border-white/10 bg-white/[0.03]', props.className)}>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-[6px] h-[6px] rounded-full bg-[#22c55e]" />
        <span className="font-body text-[11px]" style={{ color: 'rgba(240,240,245,0.55)' }}>Available now</span>
      </div>
      <p className="font-body text-[11px]" style={{ color: 'rgba(240,240,245,0.3)' }}>Accepting select projects for 2026.</p>
    </div>
  )
}
