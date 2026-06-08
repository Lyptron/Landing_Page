'use client'
import { useEffect, useState } from 'react'

export default function DashboardScreen() {
  const [revenue, setRevenue] = useState(0)
  const [users, setUsers] = useState(0)
  const [score, setScore] = useState(0)
  const [chartVisible, setChartVisible] = useState(false)

  // Ease Out Expo approximation for count-up
  useEffect(() => {
    const duration = 1800
    const start = performance.now()

    const animate = (time: number) => {
      const elapsed = time - start
      const progress = Math.min(elapsed / duration, 1)
      
      // easeOutExpo formula
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

      setRevenue(Math.floor(easeProgress * 48200))
      setUsers(Math.floor(easeProgress * 2841))
      setScore(Math.floor(easeProgress * 98))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
    
    // Trigger bar chart animation
    const timer = setTimeout(() => {
      setChartVisible(true)
    }, 150)

    return () => clearTimeout(timer)
  }, [])

  const bars = [40, 65, 30, 80, 55, 70, 90, 75]

  return (
    <div className="w-full h-full bg-[#08080f] text-[#f0f0f5] font-sans flex flex-col gap-1.5 p-2 select-none overflow-hidden no-scrollbar box-border pointer-events-none max-w-[240px]">
      {/* Header bar */}
      <div className="h-[28px] bg-[#0d0d14] flex items-center justify-between px-2.5 border-b border-white/5 shrink-0 rounded-t-sm">
        <span className="font-medium text-[6px] text-[rgba(240,240,245,0.5)] tracking-wide uppercase">// ANALYTICS UNIT</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
          <span className="text-[6px] font-semibold text-[#22c55e] tracking-widest uppercase">LIVE</span>
        </div>
      </div>

      {/* Stat cards row (3 cards) */}
      <div className="grid grid-cols-3 gap-1.5 shrink-0">
        {/* Card 1 */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-md p-1.5 flex flex-col justify-between h-[46px] box-border">
          <span className="text-[5px] text-[rgba(240,240,245,0.4)] uppercase tracking-wider font-mono">Revenue</span>
          <div className="flex justify-between items-baseline mt-0.5">
            <span className="text-[8px] font-bold font-mono text-white">
              ${(revenue / 1000).toFixed(1)}k
            </span>
            <span className="text-[5px] font-semibold text-[#22c55e]">+23%</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-md p-1.5 flex flex-col justify-between h-[46px] box-border">
          <span className="text-[5px] text-[rgba(240,240,245,0.4)] uppercase tracking-wider font-mono">Users</span>
          <div className="flex justify-between items-baseline mt-0.5">
            <span className="text-[8px] font-bold font-mono text-white">
              {users.toLocaleString()}
            </span>
            <span className="text-[5px] font-semibold text-[#1d7ef5]">+12%</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-md p-1.5 flex flex-col justify-between h-[46px] box-border">
          <span className="text-[5px] text-[rgba(240,240,245,0.4)] uppercase tracking-wider font-mono">Score</span>
          <div className="flex justify-between items-baseline mt-0.5">
            <span className="text-[8px] font-bold font-mono text-white">
              {score}
            </span>
            <span className="text-[5px] font-semibold text-[rgba(240,240,245,0.5)]">/ 100</span>
          </div>
        </div>
      </div>

      {/* Animated bar chart */}
      <div className="flex-1 min-h-[50px] bg-white/[0.01] border border-white/[0.04] rounded-md p-2 flex flex-col justify-between overflow-hidden box-border">
        <span className="text-[5px] text-[rgba(240,240,245,0.3)] font-mono uppercase tracking-wider">NETWORK LOAD / SEC</span>
        <div className="h-[60px] flex items-end justify-between gap-1.5 px-1 mt-1">
          {bars.map((height, idx) => {
            const delay = idx * 80
            return (
              <div
                key={idx}
                className="w-full rounded-t-[2px] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  height: chartVisible ? `${height}%` : '0%',
                  transitionDelay: `${delay}ms`,
                  backgroundColor: idx % 2 === 0 ? 'rgba(29,126,245,0.3)' : 'rgba(29,126,245,0.7)',
                  boxShadow: idx % 2 === 1 ? '0 0 10px rgba(29,126,245,0.25)' : 'none'
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Bottom row — two mini metric pills */}
      <div className="flex gap-1.5 mt-auto pt-1 border-t border-white/[0.03] shrink-0">
        <div className="flex items-center gap-1.5 border border-white/[0.07] rounded-full px-2.5 py-1 bg-white/[0.01]">
          <div className="w-1 h-1 bg-[#22c55e] rounded-full animate-ping" />
          <span className="text-[5px] font-mono text-[rgba(240,240,245,0.6)] uppercase tracking-wider">99.9% Uptime</span>
        </div>
        <div className="flex items-center gap-1.5 border border-white/[0.07] rounded-full px-2.5 py-1 bg-white/[0.01]">
          <div className="w-1 h-1 bg-[#1d7ef5] rounded-full" />
          <span className="text-[5px] font-mono text-[rgba(240,240,245,0.6)] uppercase tracking-wider">100 Lighthouse</span>
        </div>
      </div>
    </div>
  )
}
