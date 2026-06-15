'use client'
import { usePathname } from 'next/navigation'

export default function GlowOrbs() {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/client')) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Orb 1 (primary — top right) */}
      <div 
        className="opacity-[0.08] md:opacity-100"
        style={{
          width: '520px',
          height: '520px',
          position: 'fixed',
          top: '-100px',
          right: '-80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(29,126,245,0.13) 0%, transparent 65%)',
          filter: 'blur(90px)',
          animation: 'orbDrift1 12s ease-in-out infinite',
          pointerEvents: 'none'
        }}
      />
      {/* Orb 2 (secondary — bottom left) */}
      <div 
        className="opacity-[0.08] md:opacity-100"
        style={{
          width: '400px',
          height: '400px',
          position: 'fixed',
          bottom: '-80px',
          left: '-60px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,60,200,0.09) 0%, transparent 65%)',
          filter: 'blur(75px)',
          animation: 'orbDrift2 15s ease-in-out infinite',
          pointerEvents: 'none'
        }}
      />
      {/* Orb 3 (small — center) */}
      <div 
        className="opacity-[0.08] md:opacity-100"
        style={{
          width: '250px',
          height: '250px',
          position: 'fixed',
          top: '35%',
          left: '35%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(29,126,245,0.06) 0%, transparent 65%)',
          filter: 'blur(55px)',
          animation: 'orbDrift3 9s ease-in-out infinite',
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}
