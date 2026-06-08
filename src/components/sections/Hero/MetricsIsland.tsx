'use client'
import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface MetricsIslandProps {
  variant?: 'default' | 'strong' | 'blue-tint' | 'hero-float'
  className?: string
}

const CARD_BG = 'linear-gradient(145deg, rgba(8,8,20,0.96) 0%, rgba(6,6,18,0.98) 100%)'
const BASE_SHADOW = '0 0 0 0.5px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 16px rgba(0,0,0,0.3), 0 16px 48px rgba(0,0,0,0.22), 0 32px 80px rgba(0,0,0,0.15)'
const COLOR = '#818cf8'

// Circular arc gauge: r=24, circumference = 2π×24 = 150.8
// 99.99% = 150.78
const CIRC = 150.8

// Bar chart data (8 weeks performance)
const BARS = [62, 74, 68, 85, 76, 92, 88, 100]

function HeroMetricsIsland({ className }: MetricsIslandProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.transform = `perspective(1000px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-2px)`
    ref.current.style.borderColor = 'rgba(129,140,248,0.2)'
    ref.current.style.boxShadow = `0 0 0 0.5px rgba(129,140,248,0.15), 0 8px 32px rgba(0,0,0,0.35), 0 24px 64px rgba(0,0,0,0.2), 0 0 40px rgba(129,140,248,0.05)`
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
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent 5%, rgba(129,140,248,0.55) 40%, rgba(196,181,253,0.3) 70%, transparent 95%)` }} />
      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-[120px] h-[80px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(129,140,248,0.06) 0%, transparent 70%)' }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[8px] uppercase tracking-[0.14em]" style={{ color: 'rgba(240,240,245,0.22)' }}>Performance</span>
          <div className="flex items-center gap-1.5">
            <span className="relative flex w-[5px] h-[5px]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-60" />
              <span className="relative w-[5px] h-[5px] rounded-full bg-[#22c55e]" style={{ boxShadow: '0 0 5px rgba(34,197,94,0.7)' }} />
            </span>
            <span className="font-mono text-[8px]" style={{ color: 'rgba(34,197,94,0.7)' }}>Live</span>
          </div>
        </div>

        {/* Circular gauge + number */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative shrink-0" style={{ width: '64px', height: '64px' }}>
            <svg width="64" height="64" viewBox="0 0 64 64">
              {/* Track */}
              <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
              {/* Value arc — 99.99% */}
              <circle cx="32" cy="32" r="24" fill="none" stroke={COLOR} strokeWidth="4"
                strokeDasharray={`${0.9999 * CIRC} ${CIRC}`}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
                style={{ filter: 'drop-shadow(0 0 6px rgba(129,140,248,0.6))' }}
              />
              {/* Inner dot at end */}
              <circle cx="32" cy="8" r="2" fill={COLOR} transform="rotate(359.6 32 32)"
                style={{ filter: 'drop-shadow(0 0 4px rgba(129,140,248,0.8))' }} />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[7px] font-bold" style={{ color: COLOR, lineHeight: 1 }}>99.99</span>
              <span className="font-mono text-[5.5px]" style={{ color: 'rgba(240,240,245,0.25)' }}>%</span>
            </div>
          </div>

          <div>
            <div className="font-display font-bold tabular-nums" style={{ fontSize: '22px', color: 'rgba(240,240,245,0.92)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              99.99<span className="text-[0.55em]" style={{ color: 'rgba(240,240,245,0.3)' }}>%</span>
            </div>
            <div className="font-body text-[10px] mt-0.5" style={{ color: 'rgba(240,240,245,0.3)' }}>Uptime SLA</div>
            <div className="mt-1.5 font-mono text-[8px]" style={{ color: 'rgba(240,240,245,0.18)' }}>Last 12 months</div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="mb-3.5">
          <div className="flex items-end gap-[3px] h-[28px]">
            {BARS.map((h, i) => (
              <div key={`bar-${i}`} className="flex-1 rounded-t-[2px]" style={{
                height: `${h}%`,
                background: i === BARS.length - 1
                  ? `linear-gradient(to top, ${COLOR}90, ${COLOR})`
                  : i === BARS.length - 2
                    ? `rgba(129,140,248,0.25)`
                    : 'rgba(255,255,255,0.06)',
                boxShadow: i >= BARS.length - 1 ? `0 0 8px rgba(129,140,248,0.4)` : 'none',
              }} />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="font-mono text-[7px]" style={{ color: 'rgba(240,240,245,0.14)' }}>8w ago</span>
            <span className="font-mono text-[7px]" style={{ color: 'rgba(240,240,245,0.14)' }}>Now</span>
          </div>
        </div>

        {/* Lighthouse chip */}
        <div className="flex items-center justify-between rounded-[8px] px-3 py-2" style={{ background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.1)' }}>
          <span className="font-body text-[10px]" style={{ color: 'rgba(240,240,245,0.32)' }}>Lighthouse</span>
          <div className="flex items-baseline gap-0.5">
            <span className="font-display font-bold text-[15px] tabular-nums" style={{ color: 'rgba(240,240,245,0.9)', letterSpacing: '-0.02em' }}>100</span>
            <span className="font-mono text-[8px]" style={{ color: `${COLOR}60` }}>/100</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MetricsIsland(props: MetricsIslandProps) {
  if (props.variant === 'hero-float') return <HeroMetricsIsland {...props} />
  return (
    <div className={cn('rounded-[16px] p-4 border border-white/10 bg-white/[0.03]', props.className)}>
      <div className="font-display font-extrabold text-white text-[28px]">99.99%</div>
      <div className="font-body text-[rgba(240,240,245,0.35)] text-[11px] mt-1">Uptime Guarantee</div>
    </div>
  )
}
