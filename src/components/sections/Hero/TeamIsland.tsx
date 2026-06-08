'use client'
import { useRef, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface TeamIslandProps {
  variant?: 'default' | 'strong' | 'blue-tint' | 'hero-float'
  className?: string
}

const CARD_BG = 'linear-gradient(145deg, rgba(6,12,20,0.96) 0%, rgba(5,10,18,0.98) 100%)'
const BASE_SHADOW = '0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 16px rgba(0,0,0,0.3), 0 16px 48px rgba(0,0,0,0.22), 0 32px 80px rgba(0,0,0,0.15)'
const COLOR = '#06b6d4'

// Static activity heatmap data (5 weeks × 5 days)
const ACTIVITY_SEED = [2,1,2,0,1, 1,2,2,1,2, 2,1,0,2,2, 1,2,2,2,1, 2,2,1,2,0]
const ACT_COLORS = ['rgba(255,255,255,0.04)', `${COLOR}25`, `${COLOR}60`]

function HeroTeamIsland({ className }: TeamIslandProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.transform = `perspective(1000px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-2px)`
    ref.current.style.borderColor = `${COLOR}30`
    ref.current.style.boxShadow = `0 0 0 0.5px ${COLOR}18, 0 8px 32px rgba(0,0,0,0.35), 0 24px 64px rgba(0,0,0,0.2), 0 0 40px ${COLOR}06`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = ''
    ref.current.style.borderColor = 'rgba(255,255,255,0.08)'
    ref.current.style.boxShadow = BASE_SHADOW
    ref.current.style.transition = 'all 0.45s cubic-bezier(0.23,1,0.32,1)'
    setTimeout(() => { if (ref.current) ref.current.style.transition = '' }, 450)
  }, [])

  const stats = [
    { val: '50+', label: 'Projects' },
    { val: '3+',  label: 'Years' },
    { val: '100', label: 'Score' },
  ]

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('relative overflow-hidden select-none cursor-none w-full', className)}
      style={{ borderRadius: '16px', background: CARD_BG, border: '1px solid rgba(255,255,255,0.08)', boxShadow: BASE_SHADOW, backdropFilter: 'blur(32px)', transition: 'transform 0.18s ease, border-color 0.3s ease, box-shadow 0.3s ease' }}
    >
      {/* Top accent — cyan */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent 5%, ${COLOR}55 40%, ${COLOR}30 70%, transparent 95%)` }} />
      <div className="absolute top-0 right-0 w-[100px] h-[70px] pointer-events-none" style={{ background: `radial-gradient(ellipse at top right, ${COLOR}08 0%, transparent 70%)` }} />

      <div className="p-4">
        <span className="font-mono text-[8px] uppercase tracking-[0.14em] block mb-3" style={{ color: 'rgba(240,240,245,0.22)' }}>Leadership</span>

        {/* Profile row */}
        <div className="flex items-center gap-3 mb-3.5">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center font-display font-bold text-[12px]"
                 style={{ background: `linear-gradient(135deg, ${COLOR}18 0%, rgba(6,182,212,0.08) 100%)`, border: `1px solid ${COLOR}25`, color: 'rgba(240,240,245,0.75)', boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07)` }}>
              SB
            </div>
            {/* Online badge */}
            <span className="absolute -bottom-[2px] -right-[2px] w-[8px] h-[8px] rounded-full border-[1.5px]"
                  style={{ background: '#22c55e', borderColor: '#05101a', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
          </div>
          <div className="min-w-0">
            <h5 className="font-display font-semibold text-[13px] leading-tight" style={{ color: 'rgba(240,240,245,0.9)', letterSpacing: '-0.01em' }}>Srivathsa B S</h5>
            <span className="font-body text-[10px] mt-0.5 block" style={{ color: 'rgba(240,240,245,0.28)' }}>Founder & Tech Lead</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-1.5 mb-3.5">
          {stats.map(s => (
            <div key={s.label} className="rounded-[7px] py-2 text-center"
                 style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.045)' }}>
              <div className="font-display font-bold text-[13px] tabular-nums" style={{ color: 'rgba(240,240,245,0.88)', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.val}</div>
              <div className="font-mono text-[7px] mt-0.5" style={{ color: 'rgba(240,240,245,0.2)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Activity heatmap */}
        <div>
          <span className="font-mono text-[7px] uppercase tracking-[0.1em] block mb-1.5" style={{ color: 'rgba(240,240,245,0.15)' }}>Activity</span>
          <div className="grid gap-[2.5px]" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {ACTIVITY_SEED.map((v, i) => (
              <div key={i} className="rounded-[2px]" style={{ height: '7px', background: ACT_COLORS[v], boxShadow: v === 2 ? `0 0 4px ${COLOR}30` : 'none' }} />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[7px]" style={{ color: 'rgba(240,240,245,0.12)' }}>5w ago</span>
            <span className="font-mono text-[7px]" style={{ color: 'rgba(240,240,245,0.12)' }}>Now</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TeamIsland(props: TeamIslandProps) {
  if (props.variant === 'hero-float') return <HeroTeamIsland {...props} />
  return (
    <div className={cn('rounded-[16px] p-4 border border-white/10 bg-white/[0.03]', props.className)}>
      <div className="font-display font-semibold text-white text-[13px]">Srivathsa B S</div>
      <div className="font-body text-[rgba(240,240,245,0.3)] text-[10px] mt-0.5">Founder & Tech Lead</div>
    </div>
  )
}
