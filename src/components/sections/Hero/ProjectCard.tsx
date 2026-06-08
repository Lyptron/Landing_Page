'use client'
import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  name?: string
  badge?: string
  desc?: string
  result?: string
  variant?: 'default' | 'strong' | 'blue-tint' | 'hero-float'
  className?: string
}

// Color themes per badge type (Monochrome Silver/Obsidian)
const THEMES: Record<string, { color: string; glow: string; bg: string; topLine: string; previewA: string; previewB: string }> = {
  SaaS:  { color: '#ffffff', glow: 'rgba(255,255,255,0.25)', bg: 'rgba(255,255,255,0.04)', topLine: 'rgba(255,255,255,0.6)', previewA: 'rgba(255,255,255,0.15)', previewB: 'rgba(255,255,255,0.08)' },
  Brand: { color: '#d1d5db', glow: 'rgba(209,213,219,0.25)', bg: 'rgba(209,213,219,0.04)',  topLine: 'rgba(209,213,219,0.6)', previewA: 'rgba(209,213,219,0.15)', previewB: 'rgba(209,213,219,0.08)' },
}

function HeroProjectCard({ name = 'NexusFlow', badge = 'SaaS', desc = 'Full stack portal and Stripe billing integration.', result = '+62% signups', className }: ProjectCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const theme = THEMES[badge] ?? THEMES.SaaS

  // Static sparkline points
  const spark = badge === 'Brand'
    ? [20, 28, 22, 38, 30, 46, 40, 55, 50, 68]
    : [18, 32, 24, 45, 36, 55, 48, 68, 60, 82]
  const maxV = 100
  const W = 56, H = 22
  const pts = spark.map((v, i) => `${(i / (spark.length - 1)) * W},${H - (v / maxV) * H}`).join(' ')

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.transform = `perspective(1000px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-2px)`
    ref.current.style.borderColor = theme.glow
    ref.current.style.boxShadow = `0 0 0 0.5px ${theme.glow}, 0 8px 32px rgba(0,0,0,0.35), 0 24px 64px rgba(0,0,0,0.2), 0 0 40px ${theme.bg}`
  }, [theme])

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
      style={{ borderRadius: '16px', background: CARD_BG, border: '1px solid rgba(255,255,255,0.15)', boxShadow: BASE_SHADOW, backdropFilter: 'blur(32px)', transition: 'transform 0.18s ease, border-color 0.3s ease, box-shadow 0.3s ease' }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent 5%, ${theme.topLine} 40%, ${theme.color}60 70%, transparent 95%)` }} />
      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-[120px] h-[80px] pointer-events-none" style={{ background: `radial-gradient(ellipse at top right, ${theme.bg} 0%, transparent 70%)` }} />

      {/* Mini app preview */}
      <div className="mx-4 mt-4 mb-3 rounded-[10px] overflow-hidden" style={{ height: '56px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Browser bar */}
        <div className="flex items-center gap-1.5 px-2.5 h-[16px]" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="w-[4px] h-[4px] rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
          <span className="w-[4px] h-[4px] rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
          <span className="w-[4px] h-[4px] rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
          <span className="ml-auto font-mono text-[6.5px]" style={{ color: 'rgba(255,255,255,0.14)' }}>{name.toLowerCase()}.io</span>
        </div>
        {/* UI preview area */}
        <div className="relative" style={{ height: '40px', background: `linear-gradient(135deg, ${theme.previewA} 0%, ${theme.previewB} 100%)` }}>
          <div className="absolute left-2.5 top-2 right-2.5 flex flex-col gap-[3.5px]">
            <div className="h-[3px] rounded-full" style={{ width: '65%', background: 'rgba(255,255,255,0.15)' }} />
            <div className="h-[3px] rounded-full" style={{ width: '40%', background: theme.color + '40' }} />
            <div className="flex gap-1.5 mt-0.5">
              <div className="h-[6px] rounded-[2px]" style={{ width: '28px', background: theme.color + '30', border: `0.5px solid ${theme.color}30` }} />
              <div className="h-[6px] rounded-[2px]" style={{ width: '20px', background: 'rgba(255,255,255,0.08)' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.14em]" style={{ color: 'rgba(240,240,245,0.2)' }}>Case Study</span>
          <span className="font-mono text-[8px] px-[7px] py-[2.5px] rounded-[4px]"
                style={{ background: theme.bg, color: theme.color, border: `1px solid ${theme.color}40` }}>
            {badge}
          </span>
        </div>

        <h4 className="font-display font-bold text-[14px] mb-1.5 leading-tight" style={{ color: 'rgba(240,240,245,0.92)', letterSpacing: '-0.02em' }}>{name}</h4>
        <p className="font-body text-[11px] leading-relaxed mb-3.5" style={{ color: 'rgba(240,240,245,0.4)' }}>{desc}</p>

        <div className="flex items-end justify-between">
          <div className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 8V2M5 2L3 4M5 2L7 4" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-mono font-semibold text-[11px]" style={{ color: '#ffffff' }}>{result}</span>
          </div>
          {/* Sparkline */}
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
            <polyline points={pts} stroke={theme.color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
            <circle cx={W} cy={H - (spark[spark.length - 1] / maxV) * H} r="2" fill={theme.color} style={{ filter: `drop-shadow(0 0 3px ${theme.color})` }} />
          </svg>
        </div>
      </div>
    </div>
  )
}

const CARD_BG = 'linear-gradient(145deg, rgba(9,9,18,0.95) 0%, rgba(7,7,15,0.98) 100%)'
const BASE_SHADOW = '0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 16px rgba(0,0,0,0.3), 0 16px 48px rgba(0,0,0,0.22), 0 32px 80px rgba(0,0,0,0.15)'

export default function ProjectCard(props: ProjectCardProps) {
  if (props.variant === 'hero-float') return <HeroProjectCard {...props} />
  return (
    <div className={cn('rounded-[16px] p-4 border border-white/10 bg-white/[0.03]', props.className)}>
      <h4 className="font-display font-bold text-sm text-white mb-1">{props.name}</h4>
      <p className="font-body text-[10px] text-[rgba(240,240,245,0.4)] mb-2">{props.desc}</p>
      <span className="font-mono text-[10px] text-[#22c55e]">{props.result}</span>
    </div>
  )
}
