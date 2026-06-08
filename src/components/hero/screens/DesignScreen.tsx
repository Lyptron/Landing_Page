'use client'
import { useEffect, useState } from 'react'

export default function DesignScreen() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const colors = [
    { hex: '#0a0a0b', label: 'BG' },
    { hex: '#1d7ef5', label: 'Blue' },
    { hex: '#c0c0cc', label: 'Silver' },
    { hex: '#f0f0f5', label: 'White' },
    { hex: '#22c55e', label: 'Green' },
    { hex: '#818cf8', label: 'Indigo' },
  ]

  const typeGauges = [
    { char: 'Aa', size: '20px', weight: 800, label: 'Display / 96px', pct: 85, font: 'var(--font-syne), sans-serif' },
    { char: 'Aa', size: '14px', weight: 700, label: 'Heading / 52px', pct: 60, font: 'var(--font-syne), sans-serif' },
    { char: 'Aa', size: '9px', weight: 300, label: 'Body / 16px', pct: 95, font: 'var(--font-inter), sans-serif' },
  ]

  return (
    <div className="w-full h-full bg-[#080810] text-[#f0f0f5] flex flex-col gap-2 p-2 select-none overflow-hidden no-scrollbar box-border pointer-events-none max-w-[240px]">
      {/* Header */}
      <div className="flex items-center justify-between px-1.5 shrink-0 border-b border-white/[0.04] pb-1.5">
        <span className="font-mono text-[8px] text-[rgba(240,240,245,0.4)] tracking-wide uppercase">
          Design System — Lyptron v1.0
        </span>
        <span className="font-mono text-[7px] text-[#1d7ef5] font-semibold animate-pulse uppercase">
          SYS OK
        </span>
      </div>

      {/* Color Swatches Grid */}
      <div className="shrink-0 flex flex-col gap-1 px-1.5">
        <span className="font-mono text-[7px] text-[rgba(240,240,245,0.3)] tracking-wider uppercase">BRAND PALETTE</span>
        <div className="flex justify-between gap-1.5">
          {colors.map((c, idx) => (
            <div
              key={c.hex}
              className="flex flex-col items-center gap-1 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                opacity: mounted ? 1 : 0,
                transitionDelay: `${idx * 80}ms`
              }}
            >
              <div
                className="w-5 h-5 rounded-[4px] border border-white/[0.06] shadow-sm shrink-0"
                style={{ backgroundColor: c.hex }}
              />
              <span className="font-mono text-[6px] text-[rgba(240,240,245,0.45)] uppercase">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Typography Scale Section */}
      <div className="shrink-0 flex flex-col gap-1 px-1.5">
        <span className="font-mono text-[7px] text-[rgba(240,240,245,0.3)] tracking-wider uppercase">TYPOGRAPHY SCALES</span>
        <div className="flex flex-col gap-1.5 bg-white/[0.02] border border-white/[0.04] p-1.5 rounded-md">
          {typeGauges.map((gauge, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <span 
                className="w-5 text-left text-white leading-none shrink-0"
                style={{ fontSize: gauge.size, fontWeight: gauge.weight, fontFamily: gauge.font }}
              >
                {gauge.char}
              </span>
              <div className="flex-1 flex flex-col gap-0.5 justify-center">
                <div className="flex justify-between font-mono text-[6.5px] text-[rgba(240,240,245,0.5)]">
                  <span>{gauge.label}</span>
                  <span>{gauge.pct}%</span>
                </div>
                <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full bg-[#1d7ef5] rounded-full transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      width: mounted ? `${gauge.pct}%` : '0%',
                      transitionDelay: `${150 + idx * 100}ms`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row: Component cards */}
      <div className="flex-1 min-h-[50px] grid grid-cols-2 gap-2 px-1.5 items-end pb-1">
        {/* Card 1 — Button component preview */}
        <div
          className="bg-white/[0.03] border border-white/[0.06] rounded-md p-1.5 flex flex-col gap-1 h-[45px] box-border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            opacity: mounted ? 1 : 0,
            transitionDelay: '350ms'
          }}
        >
          <span className="font-mono text-[6.5px] text-[rgba(240,240,245,0.3)] tracking-wider uppercase">Buttons</span>
          <div className="flex gap-1.5 items-center mt-auto">
            <button className="flex-1 bg-white text-[#0a0a0b] font-sans font-bold text-[6px] py-1 px-1 rounded-[3px] border border-transparent select-none cursor-none pointer-events-none">
              Start Project
            </button>
            <button className="flex-1 border border-white/10 text-white bg-transparent font-sans font-medium text-[6px] py-1 px-1 rounded-[3px] select-none cursor-none pointer-events-none">
              Learn More
            </button>
          </div>
        </div>

        {/* Card 2 — Status badge preview */}
        <div
          className="bg-white/[0.03] border border-white/[0.06] rounded-md p-1.5 flex flex-col gap-1 h-[45px] box-border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            opacity: mounted ? 1 : 0,
            transitionDelay: '450ms'
          }}
        >
          <span className="font-mono text-[6.5px] text-[rgba(240,240,245,0.3)] tracking-wider uppercase">Badges</span>
          <div className="flex justify-between items-center mt-auto px-0.5">
            <div className="flex items-center gap-0.5 font-mono text-[5.5px] text-[#22c55e]">
              <div className="w-1 h-1 rounded-full bg-[#22c55e] animate-ping" />
              <span>LIVE</span>
            </div>
            <div className="flex items-center gap-0.5 font-mono text-[5.5px] text-[#1d7ef5]">
              <div className="w-1 h-1 rounded-full bg-[#1d7ef5]" />
              <span>DEV</span>
            </div>
            <div className="flex items-center gap-0.5 font-mono text-[5.5px] text-[rgba(240,240,245,0.6)]">
              <div className="w-1 h-1 rounded-full bg-[#c0c0cc]" />
              <span>DONE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blinking cursor */}
      <div className="absolute bottom-1.5 left-2 font-mono text-[9px] text-[#1d7ef5]/70 pointer-events-none flex items-center select-none">
        root$ <span className="animate-pulse ml-0.5 font-sans font-semibold">▋</span>
      </div>
    </div>
  )
}
