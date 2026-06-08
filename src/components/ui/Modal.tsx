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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${width} mx-4 z-[101] overflow-hidden`}
            style={{
              background: 'rgba(12,12,14,0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
            }}
          >
            {/* Accent line */}
            <div className="absolute top-0 left-[20%] right-[20%] h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(29,126,245,0.3), rgba(129,140,248,0.15), transparent)' }} />

            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-white/[0.06]">
              <div>
                <h2 className="font-display text-xl font-bold text-white/90">{title}</h2>
                {subtitle && <p className="text-[13px] text-white/30 mt-1">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all">
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
      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-4 py-3 rounded-xl text-[13px] text-white/80 outline-none transition-all"
        style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)' }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
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
      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-3 rounded-xl text-[13px] text-white/80 outline-none transition-all appearance-none cursor-pointer [&>option]:bg-[#111] [&>option]:text-white/90"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', colorScheme: 'dark' }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
