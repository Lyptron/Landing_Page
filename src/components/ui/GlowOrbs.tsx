'use client'
import { usePathname } from 'next/navigation'
import { useLowPerfMode } from '@/hooks/useLowPerfMode'

export default function GlowOrbs() {
  const pathname = usePathname()
  const lowPerf = useLowPerfMode()

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/client')) {
    return null
  }

  // Skip the three blur(75-90px) drifting orbs on phones and reduced-motion —
  // they were already nearly invisible there (opacity 0.08) but every frame
  // still cost a GPU composite pass.
  if (lowPerf) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ contain: 'layout style paint' }}>
      {/* Orb 1 (primary — top right) */}
      <div
        className="opacity-[0.08] md:opacity-60"
        style={{
          width: '520px',
          height: '520px',
          position: 'fixed',
          top: '-100px',
          right: '-80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(29,126,245,0.13) 0%, transparent 65%)',
          filter: 'blur(50px)',
          animation: 'orbDrift1 12s ease-in-out infinite',
          pointerEvents: 'none',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
      {/* Orb 2 (secondary — bottom left) */}
      <div
        className="opacity-[0.08] md:opacity-60"
        style={{
          width: '400px',
          height: '400px',
          position: 'fixed',
          bottom: '-80px',
          left: '-60px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,60,200,0.09) 0%, transparent 65%)',
          filter: 'blur(42px)',
          animation: 'orbDrift2 15s ease-in-out infinite',
          pointerEvents: 'none',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
      {/* Orb 3 (small — center) — dropped on desktop too; smallest visual
          contribution for the most simultaneous blur layers on screen. */}
      <div
        className="opacity-[0.08] md:hidden"
        style={{
          width: '250px',
          height: '250px',
          position: 'fixed',
          top: '35%',
          left: '35%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(29,126,245,0.06) 0%, transparent 65%)',
          filter: 'blur(30px)',
          animation: 'orbDrift3 9s ease-in-out infinite',
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      />
    </div>
  )
}
