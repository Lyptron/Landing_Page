'use client'
import Link from 'next/link'
import { CheckCircle2, AlertTriangle, OctagonAlert, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { LyptronMark } from '@/components/ui/LyptronLogo'

export type PortalTone = 'cyan' | 'emerald' | 'amber' | 'violet' | 'red' | 'neutral'

export const TONE_TEXT: Record<PortalTone, string> = {
  cyan: 'var(--cp-cyan)',
  emerald: 'var(--cp-emerald)',
  amber: 'var(--cp-amber)',
  violet: 'var(--cp-violet)',
  red: 'var(--cp-red)',
  neutral: 'var(--cp-text-muted)',
}

/** Page title + short, plain-language description used at the top of every portal page. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[26px] sm:text-[30px] font-bold tracking-tight" style={{ color: 'var(--cp-text)' }}>
          {title}
        </h1>
        {description && (
          <p className="text-[14px] mt-1.5 leading-relaxed" style={{ color: 'var(--cp-text-secondary)' }}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/** Friendly empty state — replaces bare icons + jargon with reassuring copy. */
export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-6">
      <Icon className="w-7 h-7 mb-4" style={{ color: 'var(--cp-text-faint)' }} />
      <h3 className="text-[15px] font-semibold mb-1.5" style={{ color: 'var(--cp-text-secondary)' }}>
        {title}
      </h3>
      <p className="text-[13px] leading-relaxed max-w-sm" style={{ color: 'var(--cp-text-muted)' }}>
        {description}
      </p>
    </div>
  )
}

/** Small uppercase eyebrow / section label. */
export function SectionLabel({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: PortalTone }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: TONE_TEXT[tone] }}>
      {children}
    </span>
  )
}

/** Status / category label — flat dot + uppercase text, no pill background. */
export function Badge({
  tone = 'neutral',
  icon: Icon,
  children,
  className = '',
}: {
  tone?: PortalTone
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={`cp-pill text-[11px] ${className}`} style={{ color: TONE_TEXT[tone] }}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  )
}

/** Consistent loading spinner for the client and admin portals. */
export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] py-12 gap-4 select-none">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-[60px] h-[60px] rounded-full border border-dashed border-[var(--cp-cyan)] animate-spin [animation-duration:3s]" />
        <div className="absolute w-12 h-12 rounded-full border border-[var(--cp-cyan-border)] animate-ping opacity-40 [animation-duration:1.5s]" />
        <LyptronMark size={44} className="relative z-10 shadow-sm" />
      </div>
      <span className="text-[10px] font-mono tracking-[0.16em] uppercase text-[var(--cp-text-faint)] animate-pulse">
        Updating workspace...
      </span>
    </div>
  )
}

/** Quick-action tile linking to another portal section. */
export function QuickAction({
  icon: Icon,
  label,
  href,
  tone = 'cyan',
}: {
  icon: LucideIcon
  label: string
  href: string
  tone?: PortalTone
}) {
  return (
    <Link href={href} className="block h-full">
      <div className="group cp-card cp-card-hover h-full flex flex-col gap-5 p-4 cursor-pointer">
        <div className="flex items-center justify-between">
          <Icon
            className="w-[18px] h-[18px] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
            style={{ color: TONE_TEXT[tone] }}
          />
          <ArrowUpRight
            className="w-4 h-4 shrink-0 opacity-0 -translate-x-1 translate-y-1 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
            style={{ color: 'var(--cp-text-faint)' }}
          />
        </div>
        <span className="text-[13.5px] font-semibold" style={{ color: 'var(--cp-text-secondary)' }}>
          {label}
        </span>
      </div>
    </Link>
  )
}

/** Maps a project's "health" field to plain-language status info.
    "On track" is the default/good state — kept neutral (gray) so color
    is reserved for genuine alerts (at-risk, delayed). */
export function getHealthInfo(health?: string): { tone: PortalTone; label: string; icon: LucideIcon; description: string; tagline: string } {
  switch (health) {
    case 'at-risk':
      return {
        tone: 'amber',
        label: 'Needs Attention',
        icon: AlertTriangle,
        description: 'A few things need your input to keep things moving.',
        tagline: 'Your project needs your attention',
      }
    case 'delayed':
      return {
        tone: 'red',
        label: 'Delayed',
        icon: OctagonAlert,
        description: 'This project is behind schedule. Your team will share an updated plan soon.',
        tagline: 'Your project is currently delayed',
      }
    default:
      return {
        tone: 'neutral',
        label: 'On Track',
        icon: CheckCircle2,
        description: 'Everything is progressing as planned.',
        tagline: 'Your project is on track',
      }
  }
}
