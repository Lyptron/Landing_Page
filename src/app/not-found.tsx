import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you are looking for has moved, been renamed, or never existed.',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main
      role="main"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-6 py-24"
      style={{ background: '#050505', color: 'rgba(255,255,255,0.85)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(192,160,96,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center gap-8">
        <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-white/40">
          Error 404
        </span>

        <h1 className="font-display font-bold text-[clamp(48px,9vw,96px)] leading-[0.95] tracking-[-0.035em] text-white/90">
          Page not found
        </h1>

        <p className="font-body text-[15px] md:text-[16px] leading-[1.7] text-white/40 max-w-md">
          The page you are looking for has moved, been renamed, or never existed. Let&apos;s get you
          back to something real.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-lg font-body font-medium text-[13px] text-bg transition-colors"
            style={{ background: '#c0a060' }}
          >
            Back to home
          </Link>
          <Link
            href="/#cta"
            className="px-6 py-3 rounded-lg font-body font-medium text-[13px] text-white/70 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Start a project
          </Link>
        </div>
      </div>
    </main>
  )
}
