'use client'
import { Project } from '@/types'
import { use3DTilt } from '@/hooks/use3DTilt'
import GlassPill from '../ui/GlassPill'
import { ArrowUpRight, X } from 'lucide-react'
import { useCursor } from '../providers/CursorProvider'

interface WorkCardProps {
  project: Project
  variant?: 'featured' | 'standard' | 'wide'
  isExpanded?: boolean
  onClick?: () => void
}

export default function WorkCard({ project, variant = 'standard', isExpanded = false, onClick }: WorkCardProps) {
  const { setCursorState } = useCursor()
  const { ref, style, onMouseMove, onMouseLeave } = use3DTilt(variant === 'featured' ? 6 : 8)

  const isFeatured = variant === 'featured'

  return (
    <div
      ref={ref as any}
      onMouseMove={onMouseMove}
      onMouseLeave={() => {
        onMouseLeave()
        setCursorState('default')
      }}
      onMouseEnter={() => setCursorState('cta')}
      style={style}
      className="h-full cursor-none group"
      onClick={onClick}
    >
      <div
        className="relative h-full rounded-[16px] border border-white/[0.07] bg-white/[0.02] backdrop-blur-[20px] overflow-hidden transition-all duration-500 hover:border-white/[0.14] hover:bg-white/[0.035]"
        style={{
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 48px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-60 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(90deg, transparent 10%, ${project.accent} 50%, transparent 90%)`,
          }}
        />

        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${project.accentGlow}, transparent)`,
          }}
        />

        {/* Noise texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')]" />

        {isFeatured ? (
          /* ===== FEATURED LAYOUT ===== */
          <div className="relative h-full flex flex-col">
            {/* Preview mockup area */}
            <div className="relative flex-1 min-h-[180px] md:min-h-[220px] overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    linear-gradient(135deg, ${project.accent}15 0%, transparent 50%),
                    linear-gradient(225deg, ${project.accent}08 0%, transparent 40%),
                    radial-gradient(ellipse 80% 60% at 70% 30%, ${project.accent}12, transparent)
                  `,
                }}
              />
              <div className="absolute inset-6 md:inset-8">
                <div className="flex gap-1.5 mb-6">
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                </div>
                <div className="space-y-3">
                  <div className="h-2 rounded-full bg-white/[0.06] w-3/4" />
                  <div className="h-2 rounded-full bg-white/[0.04] w-1/2" />
                  <div className="h-2 rounded-full bg-white/[0.03] w-2/3" />
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  <div className="h-12 rounded-lg bg-white/[0.04]" />
                  <div className="h-12 rounded-lg bg-white/[0.03]" />
                  <div className="h-12 rounded-lg bg-white/[0.02]" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-1.5 rounded-full w-full" style={{ background: `linear-gradient(90deg, ${project.accent}30, ${project.accent}08)` }} />
                  <div className="h-1.5 rounded-full w-4/5" style={{ background: `linear-gradient(90deg, ${project.accent}20, transparent)` }} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0d0d0f]/90 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative p-6 md:p-8 pt-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tracking-widest" style={{ color: project.accent }}>{project.number}</span>
                  <span className="font-mono text-[11px] text-[--text-muted] uppercase tracking-wider">{project.year} — {project.type}</span>
                </div>
                {isExpanded ? (
                  <div className="w-9 h-9 rounded-full border border-white/[0.15] flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-300">
                    <X className="w-4 h-4 text-[--text-muted]" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/20 group-hover:bg-white/[0.04] transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4 text-[--text-muted] group-hover:text-white group-hover:translate-x-[1px] group-hover:-translate-y-[1px] transition-all duration-300" />
                  </div>
                )}
              </div>

              <h3 className="font-display font-extrabold text-[28px] md:text-[32px] text-white uppercase tracking-tight leading-none">
                {project.name}
              </h3>

              <p className="font-body text-[14px] text-[--text-secondary] leading-relaxed max-w-md">
                {project.desc}
              </p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.06]">
                <span className="font-mono text-[12px] font-medium text-white/60 tracking-wide uppercase">{project.result}</span>
                <div className="flex gap-1.5">
                  {project.tags.slice(0, 3).map((tag) => (
                    <GlassPill key={tag} className="text-[10px] px-2.5 py-1">{tag}</GlassPill>
                  ))}
                  {project.tags.length > 3 && (
                    <GlassPill className="text-[10px] px-2.5 py-1">+{project.tags.length - 3}</GlassPill>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ===== STANDARD LAYOUT ===== */
          <div className="relative h-full p-5 md:p-6 flex flex-col justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold tracking-widest" style={{ color: project.accent }}>{project.number}</span>
                  <span className="font-mono text-[11px] text-[--text-muted] uppercase tracking-wider">{project.type}</span>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center group-hover:border-white/20 group-hover:bg-white/[0.04] transition-all duration-300">
                  <ArrowUpRight className="w-3.5 h-3.5 text-[--text-muted] group-hover:text-white group-hover:translate-x-[1px] group-hover:-translate-y-[1px] transition-all duration-300" />
                </div>
              </div>

              <h3 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight leading-none">
                {project.name}
              </h3>

              <p className="font-body text-sm text-[--text-secondary] leading-relaxed line-clamp-2">
                {project.desc}
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-auto pt-4">
              <span className="font-mono text-[12px] font-medium text-white/60 tracking-wide uppercase">{project.result}</span>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <GlassPill key={tag} className="text-[9px] px-2 py-0.5">{tag}</GlassPill>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Shimmer sweep on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-[1200ms] ease-in-out bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
        </div>
      </div>
    </div>
  )
}
