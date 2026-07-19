'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { m } from 'framer-motion'
import Link from 'next/link'
import { X, CheckCircle2 } from 'lucide-react'
import { Service } from '@/types'
import { useCursor } from '../providers/CursorProvider'

const SERVICE_PAGE_SLUGS: Record<string, string> = {
  'web-dev': '/web-development',
  'ai-automation': '/ai-automation',
  'ui-ux-design': '/ui-ux-design',
  'brand-strategy': '/seo-services',
}

interface ServiceDetailProps {
  service: Service | null
  onClose: () => void
}

type LenisLike = { stop: () => void; start: () => void }

export default function ServiceDetail({ service, onClose }: ServiceDetailProps) {
  const { setCursorState } = useCursor()
  const [mounted, setMounted] = useState(false)
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Defer portal mount until after hydration so createPortal targets
    // the real DOM, not the SSR shadow tree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!service) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const lenis = (window as unknown as { lenis?: LenisLike }).lenis
    if (lenis) lenis.stop()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    // Move focus into the dialog so screen reader and keyboard users land here.
    requestAnimationFrame(() => dialogRef.current?.focus())
    return () => {
      document.body.style.overflow = ''
      if (lenis) lenis.start()
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocused.current?.focus?.()
    }
  }, [service, onClose])

  if (!service || !mounted) return null

  const pageHref = SERVICE_PAGE_SLUGS[service.id]

  return createPortal(
    <>
      {/* Backdrop */}
      <m.div
        className="fixed inset-0 z-100 bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-101 flex items-center justify-center p-4 md:p-6 overflow-hidden pointer-events-none">
        <m.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="w-full max-w-230 pointer-events-auto focus:outline-none"
          initial={{ opacity: 0, scale: 0.95, y: 12, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, y: 12, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="w-full max-h-[85vh] p-5 md:p-12 flex flex-col overflow-y-auto no-scrollbar rounded-[20px] relative"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 48px 96px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(48px)',
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <span className="font-mono text-[11px] text-white/30 tracking-[0.2em] uppercase">
                {service.number} &bull; Capability Details
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close service details"
                className="p-2.5 rounded-full border border-white/[0.07] hover:border-white/15 hover:bg-white/3 text-white/60 hover:text-white transition-all duration-300 cursor-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                onMouseEnter={() => setCursorState('hover')}
                onMouseLeave={() => setCursorState('default')}
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Title */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl md:text-5xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" aria-hidden="true">{service.icon}</span>
              <h2 id={titleId} className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-white/90 tracking-[-0.03em]">
                {service.name}
              </h2>
            </div>

            {/* Blank preview window — placeholder for images */}
            <div className="w-full h-50 md:h-65 rounded-xl overflow-hidden relative mb-6"
              style={{ background: 'linear-gradient(135deg, #0e0e10 0%, #08080A 100%)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 h-9" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/12" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/8" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/6" />
                </div>
                <div className="ml-3 h-4.5 flex-1 max-w-40 rounded bg-white/3 flex items-center px-2">
                  <span className="font-mono text-[7px] text-white/12" aria-hidden="true">lyptron.com/services/{service.id}</span>
                </div>
              </div>
              {/* Blank content area */}
              <div className="flex-1 flex items-center justify-center h-[calc(100%-36px)]" aria-hidden="true">
                <span className="font-mono text-[10px] text-white/10 uppercase tracking-widest">Preview</span>
              </div>
            </div>

            <p className="font-body text-[15px] text-white/30 leading-relaxed mb-4 border-b border-white/4 pb-6">
              {service.desc}
            </p>

            {pageHref && (
              <Link
                href={pageHref}
                className="inline-flex items-center gap-1.5 mb-8 font-mono text-[11px] text-white/40 hover:text-white/70 uppercase tracking-wider transition-colors"
              >
                View full {service.name} page &rarr;
              </Link>
            )}

            {/* Two column details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 text-left">

              {/* Left: Stack & Results */}
              <div className="md:col-span-6 flex flex-col gap-8">
                <div>
                  <h4 className="font-mono text-[10px] text-white/20 uppercase tracking-wider block mb-4 border-b border-white/4 pb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {service.stack.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/6 bg-white/2 font-mono text-[10px] text-white/40 tracking-wider uppercase"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-mono text-[10px] text-white/20 uppercase tracking-wider block mb-4 border-b border-white/4 pb-2">Proven Results</h4>
                  <div className="flex flex-col gap-4">
                    {service.works.map((work) => (
                      <div
                        key={work.name}
                        className="p-5 rounded-xl"
                        style={{
                          background: 'linear-gradient(160deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <h5 className="font-display font-semibold text-[15px] text-white/80">{work.name}</h5>
                          <span className="font-mono text-[9px] text-white/25 uppercase tracking-wider">{work.badge}</span>
                        </div>
                        <p className="font-body text-[13px] text-white/25 mb-3 leading-relaxed">{work.desc}</p>
                        <span className="font-mono text-[11px] text-white/50 tracking-wide uppercase">{work.result}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Deliverables */}
              <div className="md:col-span-6 flex flex-col gap-8">
                <div>
                  <h4 className="font-mono text-[10px] text-white/20 uppercase tracking-wider block mb-4 border-b border-white/4 pb-2">Deliverables & Benefits</h4>
                  <div className="flex flex-col gap-5">
                    {service.helps.map((help) => (
                      <div key={help} className="flex gap-3 items-start">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-white/25" />
                        <span className="font-body text-[14px] text-white/35 leading-relaxed">{help}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </m.div>
      </div>
    </>,
    document.body
  )
}
