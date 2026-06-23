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
        <label className="text-[11px] font-semibold uppercase tracking-wider text-(--cp-text-muted)">
          {label} {required && <span className="text-(--cp-red)">*</span>}
        </label>
      )}
      <div className="flex items-center rounded-xl bg-(--cp-bg-soft) border border-(--cp-border) overflow-hidden focus-within:border-(--cp-cyan-border) focus-within:ring-1 focus-within:ring-(--cp-cyan-border) transition-all w-full h-9.5">
        {/* Currency Prefix */}
        <span className="flex items-center pl-3.5 pr-1.5 text-[14px] font-mono text-(--cp-text-muted) select-none">
          ₹
        </span>

        {/* TextInput (Manual typing allowed) */}
        <input
          type="number"
          value={value === 0 || value === '0' ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[13.5px] pl-0.5 pr-3 text-(--cp-text) outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full text-left"
        />

        {/* Grouped controls on the right */}
        <div className="flex items-stretch divide-x divide-(--cp-border-soft) border-l border-(--cp-border-soft) h-full">
          <button
            type="button"
            onClick={() => handleStep(-step)}
            className="px-3 hover:bg-(--cp-surface-strong) transition-colors text-(--cp-text-muted) hover:text-(--cp-text) cursor-pointer flex items-center justify-center"
            title="Decrease"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleStep(step)}
            className="px-3 hover:bg-(--cp-surface-strong) transition-colors text-(--cp-text-muted) hover:text-(--cp-text) cursor-pointer flex items-center justify-center"
            title="Increase"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
