'use client'
import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  width?: string
}

export default function Modal({ open, onClose, title, subtitle, children, width = 'max-w-lg' }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${width} mx-4 z-[101] overflow-hidden`}
            style={{
              background: 'var(--cp-surface, #FFFFFF)',
              border: '1px solid var(--cp-border, rgba(0,0,0,0.08))',
              borderRadius: '20px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.02)',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: 'var(--cp-border-soft, rgba(0,0,0,0.05))' }}>
              <div>
                <h2 className="font-display text-xl font-bold" style={{ color: 'var(--cp-text, #18181B)' }}>{title}</h2>
                {subtitle && <p className="text-[13px] mt-1" style={{ color: 'var(--cp-text-muted, rgba(24,24,27,0.45))' }}>{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: 'var(--cp-text-muted, rgba(24,24,27,0.45))' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--cp-text, #18181B)'; e.currentTarget.style.background = 'var(--cp-surface-strong, #F4F4F5)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--cp-text-muted, rgba(24,24,27,0.45))'; e.currentTarget.style.background = 'transparent' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* Reusable form field */
export function ModalInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cp-text-muted, rgba(24,24,27,0.45))' }}>
        {label} {required && <span style={{ color: 'var(--cp-red, #DC2626)' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-4 py-3 rounded-xl text-[13px] outline-none transition-all"
        style={{ background: 'var(--cp-bg-soft, #F4F4F5)', border: '1px solid var(--cp-border-soft, rgba(0,0,0,0.05))', color: 'var(--cp-text, #18181B)' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--cp-cyan, #4F46E5)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--cp-border-soft, rgba(0,0,0,0.05))' }}
      />
    </div>
  )
}

export function ModalSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cp-text-muted, rgba(24,24,27,0.45))' }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-3 rounded-xl text-[13px] outline-none transition-all appearance-none cursor-pointer [&>option]:bg-[var(--cp-bg-elevated)] [&>option]:text-[var(--cp-text)]"
        style={{ background: 'var(--cp-bg-soft, #F4F4F5)', border: '1px solid var(--cp-border-soft, rgba(0,0,0,0.05))', color: 'var(--cp-text, #18181B)' }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
