'use client'
import { TextareaHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'

/** Card-input styled text/number/date field, matching the "Unified List Box" form pattern. */
export function Input({
  label,
  required,
  className = '',
  ...props
}: { label?: string; required?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>
          {label} {required && <span style={{ color: 'var(--cp-red)' }}>*</span>}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-2.5 rounded-xl text-[13.5px] outline-none transition-colors ${className}`}
        style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)', color: 'var(--cp-text)' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cp-cyan)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--cp-border-soft)' }}
      />
    </div>
  )
}

/** Card-input styled textarea. */
export function Textarea({
  label,
  required,
  className = '',
  ...props
}: { label?: string; required?: boolean } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>
          {label} {required && <span style={{ color: 'var(--cp-red)' }}>*</span>}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full px-4 py-3 rounded-xl text-[13.5px] outline-none transition-colors resize-none ${className}`}
        style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)', color: 'var(--cp-text)' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cp-cyan)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--cp-border-soft)' }}
      />
    </div>
  )
}

/** Card-input styled select, light color-scheme. */
export function Select({
  label,
  required,
  className = '',
  children,
  ...props
}: { label?: string; required?: boolean } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cp-text-muted)' }}>
          {label} {required && <span style={{ color: 'var(--cp-red)' }}>*</span>}
        </label>
      )}
      <select
        {...props}
        className={`w-full px-4 py-2.5 rounded-xl text-[13.5px] outline-none transition-colors appearance-none cursor-pointer [&>option]:bg-(--cp-bg-elevated) [&>option]:text-(--cp-text) ${className}`}
        style={{ background: 'var(--cp-bg-soft)', border: '1px solid var(--cp-border-soft)', color: 'var(--cp-text)' }}
      >
        {children}
      </select>
    </div>
  )
}

/** Small icon-only action button for list rows (edit / delete / etc). */
export function IconButton({
  icon: Icon,
  onClick,
  label,
  variant = 'default',
  className = '',
}: {
  icon: LucideIcon
  onClick?: () => void
  label: string
  variant?: 'default' | 'danger'
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`p-1.5 rounded-lg transition-colors ${className}`}
      style={{ color: 'var(--cp-text-faint)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = variant === 'danger' ? 'var(--cp-red)' : 'var(--cp-cyan)'
        e.currentTarget.style.background = variant === 'danger' ? 'var(--cp-red-soft)' : 'var(--cp-cyan-soft)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--cp-text-faint)'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  )
}

/** "Unified List Box" container — a .cp-card with divided rows. */
export function ListBox({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`cp-card cp-list overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

/** A single row inside a ListBox — left content + right-aligned actions/value. */
export function ListRow({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 transition-colors group ${className}`}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--cp-bg-soft)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </div>
  )
}
