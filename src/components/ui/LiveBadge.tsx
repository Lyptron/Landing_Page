'use client'
import { cn } from '@/lib/utils'

interface LiveBadgeProps {
  label?: string
  size?: 'sm' | 'md'
  className?: string
}

export default function LiveBadge({ label = 'Available now', size = 'md', className }: LiveBadgeProps) {
  const dotSize = size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-[14px] py-[6px] bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.25)] rounded-full backdrop-blur-[12px] select-none',
        className
      )}
    >
      <span className={cn('relative flex rounded-full', dotSize)}>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75"></span>
        <span className={cn('relative inline-flex rounded-full bg-green', dotSize)}></span>
      </span>
      <span className="font-body font-medium text-[11px] text-[rgba(240,240,245,0.55)] tracking-[0.04em]">
        {label}
      </span>
    </div>
  )
}
