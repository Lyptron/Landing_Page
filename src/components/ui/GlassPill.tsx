'use client'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassPillProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function GlassPill({ children, className, style }: GlassPillProps) {
  return (
    <div
      style={style}
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-[20px] font-mono text-[10px] text-[--text-secondary] tracking-wider uppercase select-none relative overflow-hidden',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
        'after:absolute after:inset-0 after:pointer-events-none after:opacity-[0.02] after:z-[-1]',
        'after:bg-[url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")]',
        className
      )}
    >
      {children}
    </div>
  )
}
