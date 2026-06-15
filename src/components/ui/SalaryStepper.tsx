'use client'
import { Plus, Minus } from 'lucide-react'

interface SalaryStepperProps {
  label?: string
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  step?: number
}

export default function SalaryStepper({
  label,
  value,
  onChange,
  placeholder = '0',
  required = false,
  step = 1000,
}: SalaryStepperProps) {
  const numericValue = Number(value) || 0

  const handleStep = (amount: number) => {
    const newVal = Math.max(0, numericValue + amount)
    onChange(newVal.toString())
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-text-muted)]">
          {label} {required && <span className="text-[var(--cp-red)]">*</span>}
        </label>
      )}
      <div className="flex items-center rounded-xl bg-[var(--cp-bg-soft)] border border-[var(--cp-border)] overflow-hidden focus-within:border-[var(--cp-cyan-border)] focus-within:ring-1 focus-within:ring-[var(--cp-cyan-border)] transition-all w-full h-[38px]">
        {/* Currency Prefix */}
        <span className="flex items-center pl-3.5 pr-1.5 text-[14px] font-mono text-[var(--cp-text-muted)] select-none">
          ₹
        </span>

        {/* TextInput (Manual typing allowed) */}
        <input
          type="number"
          value={value === 0 || value === '0' ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[13.5px] pl-0.5 pr-3 text-[var(--cp-text)] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full text-left"
        />

        {/* Grouped controls on the right */}
        <div className="flex items-stretch divide-x divide-[var(--cp-border-soft)] border-l border-[var(--cp-border-soft)] h-full">
          <button
            type="button"
            onClick={() => handleStep(-step)}
            className="px-3 hover:bg-[var(--cp-surface-strong)] transition-colors text-[var(--cp-text-muted)] hover:text-[var(--cp-text)] cursor-pointer flex items-center justify-center"
            title="Decrease"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleStep(step)}
            className="px-3 hover:bg-[var(--cp-surface-strong)] transition-colors text-[var(--cp-text-muted)] hover:text-[var(--cp-text)] cursor-pointer flex items-center justify-center"
            title="Increase"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
