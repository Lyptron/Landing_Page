'use client'
import { Lock } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useAdminAuth } from '@/lib/AdminAuthContext'

interface RestrictedValueProps {
  /** Raw numeric value (e.g. amount in rupees) */
  value: number | null | undefined
  /** How to format the value for the founder */
  format?: 'currency' | 'number' | 'percent'
  /** Currency symbol, defaults to ₹ */
  currency?: string
  /** Optional className applied to the rendered value/pill */
  className?: string
}

function formatValue(value: number, format: RestrictedValueProps['format'], currency: string) {
  if (format === 'percent') return `${value}%`
  if (format === 'number') return value.toLocaleString('en-IN')
  return `${currency}${value.toLocaleString('en-IN')}`
}

/**
 * Renders a monetary/financial value for the Founder role only.
 * Every other role sees a locked "Restricted" pill instead — used as a
 * belt-and-braces fallback in shared components. Pages built for
 * Admin/CRM and Marketing should avoid fetching/rendering money fields
 * at all rather than relying on this for hiding.
 */
export default function RestrictedValue({ value, format = 'currency', currency = '₹', className = '' }: RestrictedValueProps) {
  const { user } = useAdminAuth()

  if (user?.role === 'founder') {
    return <span className={className}>{formatValue(value ?? 0, format, currency)}</span>
  }

  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.1em] cursor-default ${className}`}
            style={{ background: 'var(--cp-bg-soft, #F4F4F5)', border: '1px solid var(--cp-border-soft, rgba(0,0,0,0.05))', color: 'var(--cp-text-faint, rgba(24,24,27,0.30))' }}
          >
            <Lock className="w-2.5 h-2.5" /> Restricted
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={6}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium z-[200]"
            style={{ background: 'var(--cp-text)', color: 'var(--cp-bg)' }}
          >
            Founder access only
            <Tooltip.Arrow style={{ fill: 'var(--cp-text, #18181B)' }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
