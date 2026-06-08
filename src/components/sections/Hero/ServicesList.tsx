'use client'
import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface ServicesListProps {
  variant?: 'default' | 'strong' | 'blue-tint' | 'hero-float'
  className?: string
}

const CARD_BG = 'linear-gradient(145deg, rgba(10,8,20,0.96) 0%, rgba(8,6,18,0.98) 100%)'
const BASE_SHADOW = '0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 16px rgba(0,0,0,0.3), 0 16px 48px rgba(0,0,0,0.22), 0 32px 80px rgba(0,0,0,0.15)'

const SERVICES = [
  { label: 'Web Engineering', color: '#1d7ef5', tag: 'Next.js' },
  { label: 'Mobile Apps',    color: '#22c55e', tag: 'React Native' },
  { label: 'AI Integrations', color: '#8b5cf6', tag: 'LangChain' },
  { label: 'UI/UX Design',   color: '#f472b6', tag: 'Figma' },
]

function HeroServicesList({ className }: ServicesListProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.transform = `perspective(1000px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-2px)`
    ref.current.style.borderColor = 'rgba(139,92,246,0.22)'
    ref.current.style.boxShadow = `0 0 0 0.5px rgba(139,92,246,0.12), 0 8px 32px rgba(0,0,0,0.35), 0 24px 64px rgba(0,0,0,0.2), 0 0 40px rgba(139,92,246,0.04)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = ''
    ref.current.style.borderColor = 'rgba(255,255,255,0.08)'
    ref.current.style.boxShadow = BASE_SHADOW
    ref.current.style.transition = 'all 0.45s cubic-bezier(0.23,1,0.32,1)'
    setTimeout(() => { if (ref.current) ref.current.style.transition = '' }, 450)
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('relative overflow-hidden select-none cursor-none w-full', className)}
      style={{ borderRadius: '16px', background: CARD_BG, border: '1px solid rgba(255,255,255,0.08)', boxShadow: BASE_SHADOW, backdropFilter: 'blur(32px)', transition: 'transform 0.18s ease, border-color 0.3s ease, box-shadow 0.3s ease' }}
    >
      {/* Top accent — purple */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(139,92,246,0.55) 40%, rgba(196,181,253,0.3) 70%, transparent 95%)' }} />
      <div className="absolute top-0 right-0 w-[100px] h-[70px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />

      <div className="p-4">
        <div className="flex items-center justify-between mb-3.5">
          <span className="font-mono text-[8px] uppercase tracking-[0.14em]" style={{ color: 'rgba(240,240,245,0.22)' }}>Capabilities</span>
          <span className="font-mono text-[8px] px-[7px] py-[2.5px] rounded-[4px]"
                style={{ background: 'rgba(139,92,246,0.08)', color: 'rgba(139,92,246,0.7)', border: '1px solid rgba(139,92,246,0.14)' }}>
            4 active
          </span>
        </div>

        <div className="flex flex-col gap-[6px]">
          {SERVICES.map((svc) => (
            <div key={svc.label} className="flex items-center gap-2.5 rounded-[8px] pl-2.5 pr-2.5 py-[7px] group/row"
                 style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s ease' }}
                 onMouseEnter={e => (e.currentTarget.style.background = `${svc.color}0a`)}
                 onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}>
              {/* Colored left indicator */}
              <div className="w-[3px] h-[3px] rounded-full shrink-0" style={{ background: svc.color, boxShadow: `0 0 6px ${svc.color}80` }} />
              <span className="font-body text-[11.5px] flex-1" style={{ color: 'rgba(240,240,245,0.5)' }}>{svc.label}</span>
              <span className="font-mono text-[7.5px] px-1.5 py-0.5 rounded-[3px]" style={{ background: `${svc.color}12`, color: `${svc.color}80` }}>{svc.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ServicesList(props: ServicesListProps) {
  if (props.variant === 'hero-float') return <HeroServicesList {...props} />
  return (
    <div className={cn('rounded-[16px] p-4 border border-white/10 bg-white/[0.03]', props.className)}>
      {SERVICES.map((s) => (
        <div key={s.label} className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
          <span className="font-body text-[11px]" style={{ color: 'rgba(240,240,245,0.45)' }}>{s.label}</span>
        </div>
      ))}
    </div>
  )
}
