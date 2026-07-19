'use client'
import { useState, useRef } from 'react'
import { AnimatePresence, m, useInView } from 'framer-motion'
import { services } from '@/data/services'
import { Service } from '@/types'
import ServiceCard from './ServiceCard'
import ServiceDetail from './ServiceDetail'

const EASE = [0.22, 1, 0.36, 1] as const

export default function Services() {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })

  return (
    <section
      ref={containerRef}
      className="relative w-full select-none z-10"
      style={{ background: '#050505' }}
    >
      {/* Subtle warm spotlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[8%]"
          style={{
            width: '70%',
            maxWidth: '900px',
            height: '400px',
            background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(255,250,235,0.03) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Noise grain */}
      <div className="absolute inset-0 opacity-[0.018] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      {/* Section intro */}
      <div
        ref={headerRef}
        className="relative z-10 w-full px-6 md:px-12 lg:px-30 pt-32 md:pt-40 pb-12 md:pb-16"
      >
        <m.div
          className="h-px w-full mb-10 origin-left"
          style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.06) 50%, transparent)' }}
          initial={{ scaleX: 0 }}
          animate={headerInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.2, ease: EASE }}
        />

        <div className="flex flex-col gap-6">
          <m.span
            className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/50"
            initial={{ opacity: 0, y: 12 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          >
            Capabilities
          </m.span>

          <m.h2
            className="font-display font-bold text-[clamp(28px,5vw,68px)] leading-[0.97] tracking-[-0.04em] max-w-200"
            initial={{ opacity: 0, y: 10 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.4, delay: 0.3, ease: EASE }}
          >
            <span className="text-white/90">What we do</span>
          </m.h2>

          <m.p
            className="font-body text-[15px] md:text-[17px] text-white/30 max-w-130 leading-[1.7]"
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          >
            Six disciplines. One team. Every project draws from the full depth of our engineering and design capabilities — scroll through our story.
          </m.p>
        </div>
      </div>

      {/* Swipe hint — only shown where the layout is a horizontal
          scroller (below md, where it flips to a stacked column). */}
      <div className="md:hidden text-right font-mono text-[9px] text-white/25 uppercase tracking-widest mb-2 pr-6 pointer-events-none">
        Swipe →
      </div>
      {/* Story chapters — stacked sticky cards */}
      <div className="relative z-10 flex flex-row overflow-x-auto snap-x snap-mandatory scrollbar-none pb-6 px-6 md:px-0 md:flex-col md:overflow-visible gap-5 md:gap-0 scroll-hint-x-md">
        {services.map((service, idx) => (
          <ServiceCard
            key={service.id}
            service={service}
            index={idx}
            onDetailClick={() => setSelectedService(service)}
          />
        ))}
      </div>

      {/* Bottom stats bar */}
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-30 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/6">
          <div className="flex flex-wrap justify-center sm:justify-start gap-6 sm:gap-10 md:gap-16">
            {[
              { label: 'Shipped', value: '50+' },
              { label: 'Uptime', value: '99.99%' },
              { label: 'Avg Delivery', value: '4 Weeks' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-1 items-center md:items-start">
                <span className="font-mono text-[10px] text-white/20 tracking-wider uppercase">{s.label}</span>
                <span className="font-display font-bold text-2xl text-white/80">{s.value}</span>
              </div>
            ))}
          </div>
          <p className="font-body text-sm text-white/20 text-center md:text-right max-w-sm">
            Every engagement starts with a free scoping call. We only take projects we can ship with excellence.
          </p>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <ServiceDetail
            service={selectedService}
            onClose={() => setSelectedService(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
