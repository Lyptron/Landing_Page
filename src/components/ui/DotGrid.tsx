'use client'

export default function DotGrid({ className = 'absolute' }: { className?: string }) {
  return (
    <div 
      className={`${className} dot-grid inset-0 pointer-events-none z-[1]`}
      style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
      }}
    />
  )
}
