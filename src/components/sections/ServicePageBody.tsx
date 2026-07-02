'use client'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { m, useInView } from 'framer-motion'
import { ArrowRight, Plus } from 'lucide-react'
import { Service } from '@/types'
import Footer from '../layout/Footer'

const EASE = [0.22, 1, 0.36, 1] as const

interface FAQ { q: string; a: string }
interface ServicePageBodyProps { service: Service; faqs: FAQ[] }

function FaqItem({ faq, index }: { faq: FAQ; index: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })

  return (
    <m.div
      ref={ref}
      className="border-b border-white/[0.07]"
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06, ease: EASE }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between py-6 text-left gap-10 group"
        aria-expanded={open}
      >
        <span className="font-display font-semibold text-[15px] md:text-[16px] leading-snug text-white/60 group-hover:text-white/85 transition-colors duration-200">
          {faq.q}
        </span>
        <Plus
          className="w-[15px] h-[15px] text-white/22 shrink-0 mt-0.5 transition-transform duration-300"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '260px' : '0px', opacity: open ? 1 : 0 }}
      >
        <p className="font-body text-[14px] text-white/38 leading-[1.85] pb-6 pr-14 max-w-2xl">{faq.a}</p>
      </div>
    </m.div>
  )
}

export default function ServicePageBody({ service, faqs }: ServicePageBodyProps) {
  const approachRef  = useRef<HTMLElement>(null)
  const approachInView = useInView(approachRef,  { once: true, margin: '-60px' })
  const impactRef    = useRef<HTMLElement>(null)
  const impactInView   = useInView(impactRef,    { once: true, margin: '-60px' })
  const forYouRef    = useRef<HTMLElement>(null)
  const forYouInView   = useInView(forYouRef,    { once: true, margin: '-60px' })
  const stackRef     = useRef<HTMLElement>(null)
  const stackInView    = useInView(stackRef,     { once: true, margin: '-60px' })
  const faqRef       = useRef<HTMLElement>(null)
  const faqInView      = useInView(faqRef,       { once: true, margin: '-60px' })
  const ctaRef       = useRef<HTMLElement>(null)
  const ctaInView      = useInView(ctaRef,       { once: true, margin: '-40px' })

  return (
    <>
      <main className="relative w-full bg-bg text-white">

        {/* Subtle grain */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none select-none"
          style={{
            zIndex: 52,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            opacity: 0.028,
          }}
        />

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-32 md:pt-44 pb-20 md:pb-28 px-6 md:px-12 lg:px-20 xl:px-28">

          {/* Ambient top light */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 80% 50% at 35% -10%, rgba(255,252,245,0.042) 0%, transparent 58%)' }}
          />

          {/* Ghost phase number — far right, large */}
          <div
            aria-hidden="true"
            className="absolute right-0 top-1/2 -translate-y-1/2 font-display font-bold select-none pointer-events-none"
            style={{ fontSize: 'clamp(220px, 34vw, 500px)', lineHeight: 0.85 }}
          >
            {/* 00 — barely visible */}
            <span style={{ color: 'rgba(255,255,255,0.05)' }}>0{service.number.slice(0, -1)}</span>
            {/* 1–6 — semi-transparent white with soft outer glow only */}
            <span style={{
              color: 'rgba(255,255,255,0.26)',
              textShadow: '0 0 80px rgba(255,255,255,0.20), 0 0 180px rgba(255,255,255,0.10), 0 0 340px rgba(255,255,255,0.05)',
            }}>{service.number.slice(-1)}</span>
          </div>

          <div className="relative">

            {/* Breadcrumb + phase */}
            <m.div
              className="flex items-center gap-6 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-2 font-mono text-[10px] text-white/22 uppercase tracking-[0.16em]">
                  <li><Link href="/" className="hover:text-white/48 transition-colors duration-200">Home</Link></li>
                  <li aria-hidden="true" className="text-white/14">/</li>
                  <li><Link href="/#services" className="hover:text-white/48 transition-colors duration-200">Services</Link></li>
                  <li aria-hidden="true" className="text-white/14">/</li>
                  <li className="text-white/38">{service.name}</li>
                </ol>
              </nav>

              <div className="h-px flex-1 max-w-[80px] bg-white/8" />

              <span className="font-mono text-[10px] text-white/28 uppercase tracking-[0.2em]">Phase {service.number}</span>
            </m.div>

            {/* H1 — editorial, large */}
            <m.h1
              className="font-display font-bold text-white/95 tracking-[-0.04em] leading-[0.92] mb-10"
              style={{ fontSize: 'clamp(52px, 8vw, 112px)' }}
              initial={{ opacity: 0, y: 40, filter: 'blur(14px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
            >
              {service.name}
            </m.h1>

            {/* Desc + CTAs — side by side on desktop */}
            <m.div
              className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
            >
              <p className="font-body text-[16px] md:text-[18px] text-white/38 leading-[1.8] max-w-[500px] lg:max-w-[540px]">
                {service.desc}
              </p>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/#cta"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-bg font-semibold text-[13px] tracking-[0.02em] hover:bg-white/88 active:scale-[0.97] transition-all duration-200"
                >
                  Start a Project <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/#services"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/12 text-white/42 font-medium text-[13px] tracking-[0.02em] hover:border-white/22 hover:text-white/68 active:scale-[0.97] transition-all duration-200"
                >
                  All Services
                </Link>
              </div>
            </m.div>
          </div>
        </section>

        {/* ── HOW WE DO IT ─────────────────────────────────────────────── */}
        <section
          ref={approachRef}
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28 border-t border-white/6"
        >
          {/* Section header */}
          <m.div
            className="mb-14"
            initial={{ opacity: 0, y: 14 }}
            animate={approachInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h2
              className="font-display font-bold text-white/88 tracking-[-0.03em] leading-[1.05]"
              style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}
            >
              How we do it
            </h2>
            <p className="font-body text-[15px] text-white/32 mt-4 max-w-md leading-[1.8]">
              {service.tagline} Here is the breakdown.
            </p>
          </m.div>

          {/* 3-column grid — desktop, stacked on mobile. No circles, no boxes. */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-white/6">
            {service.helps.map((help, i) => (
              <m.div
                key={i}
                className="group py-10 md:pr-10 border-b md:border-b-0 border-white/6 md:border-r last:border-0 hover:opacity-90 transition-opacity"
                style={{ paddingLeft: i > 0 ? undefined : undefined }}
                initial={{ opacity: 0, y: 22 }}
                animate={approachInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.08 + i * 0.12, ease: EASE }}
              >
                <span className="font-mono text-[10px] text-white/20 tracking-[0.2em] block mb-6 pl-0 md:pl-8">
                  0{i + 1}
                </span>
                <p className="font-display font-semibold text-[17px] md:text-[19px] text-white/70 leading-[1.45] tracking-[-0.01em] group-hover:text-white/85 transition-colors duration-300 md:pl-8">
                  {help}
                </p>
              </m.div>
            ))}
          </div>
        </section>

        {/* ── IMPACT WE HAVE CREATED ───────────────────────────────────── */}
        <section
          ref={impactRef}
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28 border-t border-white/6"
        >
          <m.div
            className="mb-14"
            initial={{ opacity: 0, y: 14 }}
            animate={impactInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h2
              className="font-display font-bold text-white/88 tracking-[-0.03em] leading-[1.05]"
              style={{ fontSize: 'clamp(28px, 4vw, 52px)' }}
            >
              Impact we have created
            </h2>
            <p className="font-body text-[15px] text-white/32 mt-4 max-w-md leading-[1.8]">
              Real projects. Real numbers. No vanity metrics.
            </p>
          </m.div>

          <div className="flex flex-col">
            {service.works.map((work, i) => (
              <m.div
                key={work.name}
                className="group grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 py-12 md:py-14 border-t border-white/6 hover:border-white/12 transition-colors duration-300"
                initial={{ opacity: 0, y: 28 }}
                animate={impactInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: i * 0.15, ease: EASE }}
              >
                {/* Left: project details */}
                <div className="flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-4 mb-3">
                      <h3
                        className="font-display font-bold text-white/80 tracking-[-0.025em] group-hover:text-white/92 transition-colors duration-200"
                        style={{ fontSize: 'clamp(22px, 2.8vw, 36px)' }}
                      >
                        {work.name}
                      </h3>
                      <span className="font-mono text-[10px] text-white/22 uppercase tracking-widest shrink-0">{work.badge}</span>
                    </div>
                    <p className="font-body text-[14px] text-white/32 leading-[1.75] max-w-sm">{work.desc}</p>
                  </div>
                </div>

                {/* Right: outcome — the big number */}
                <div className="lg:border-l border-white/6 lg:pl-16 flex flex-col justify-center">
                  <p className="font-mono text-[10px] text-white/20 uppercase tracking-[0.2em] mb-4">Outcome</p>
                  <p
                    className="font-display font-bold text-white/75 tracking-[-0.035em] leading-[1.0] group-hover:text-white/88 transition-colors duration-300"
                    style={{ fontSize: 'clamp(26px, 4.5vw, 58px)' }}
                  >
                    {work.result}
                  </p>
                </div>
              </m.div>
            ))}
            <div className="border-t border-white/6" />
          </div>
        </section>

        {/* ── WHAT THIS MEANS FOR YOU ───────────────────────────────────── */}
        <section
          ref={forYouRef}
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28 border-t border-white/6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20">

            {/* Sticky label column */}
            <m.div
              className="lg:col-span-4"
              initial={{ opacity: 0, y: 14 }}
              animate={forYouInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <h2
                className="font-display font-bold text-white/88 tracking-[-0.03em] leading-[1.05] mb-5"
                style={{ fontSize: 'clamp(26px, 3.5vw, 48px)' }}
              >
                What this means for your business
              </h2>
              <p className="font-body text-[15px] text-white/30 leading-[1.8]">
                This service is built for companies in exactly these situations.
              </p>
            </m.div>

            {/* Items column — no circles, just clean rows */}
            <div className="lg:col-span-8">
              {service.forYou.map((item, i) => (
                <m.div
                  key={item}
                  className="group flex gap-8 py-7 border-t border-white/6 hover:border-white/12 transition-colors duration-300"
                  initial={{ opacity: 0, x: 14 }}
                  animate={forYouInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.65, delay: 0.1 + i * 0.1, ease: EASE }}
                >
                  <span className="font-mono text-[10px] text-white/18 tracking-[0.15em] mt-1 shrink-0 w-6 group-hover:text-white/35 transition-colors duration-200">
                    0{i + 1}
                  </span>
                  <p className="font-display font-medium text-[17px] md:text-[20px] text-white/55 leading-[1.45] tracking-[-0.01em] group-hover:text-white/78 transition-colors duration-300">
                    {item}
                  </p>
                </m.div>
              ))}
              <div className="border-t border-white/6" />
            </div>
          </div>
        </section>

        {/* ── TECH STACK ───────────────────────────────────────────────── */}
        <section
          ref={stackRef}
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-12 border-t border-white/6"
        >
          <m.div
            className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-10"
            initial={{ opacity: 0, y: 10 }}
            animate={stackInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="font-mono text-[10px] text-white/25 uppercase tracking-[0.2em] shrink-0">Stack</span>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {service.stack.map((item) => (
                <span
                  key={item}
                  className="font-mono text-[12px] text-white/40 uppercase tracking-[0.12em] hover:text-white/62 transition-colors duration-200 cursor-default"
                >
                  {item}
                </span>
              ))}
            </div>
          </m.div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section
          ref={faqRef}
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28 border-t border-white/6"
        >
          <m.h2
            className="font-display font-bold text-white/88 tracking-[-0.03em] leading-[1.05] mb-14"
            style={{ fontSize: 'clamp(26px, 3.5vw, 48px)' }}
            initial={{ opacity: 0, y: 14 }}
            animate={faqInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            Frequently asked questions
          </m.h2>

          <div className="max-w-3xl border-t border-white/[0.07]">
            {faqs.map((faq, i) => (
              <FaqItem key={faq.q} faq={faq} index={i} />
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section
          ref={ctaRef}
          className="px-6 md:px-12 lg:px-20 xl:px-28 py-20 pb-32 border-t border-white/6"
        >
          <m.div
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div>
              <h2
                className="font-display font-bold text-white/90 tracking-[-0.035em] leading-[1.0] mb-5"
                style={{ fontSize: 'clamp(32px, 5vw, 68px)' }}
              >
                Ready to build<br />with us?
              </h2>
              <p className="font-body text-[15px] text-white/35 max-w-sm leading-[1.8]">
                Book a free 30-minute call. No pitch deck, no pressure. Just an honest conversation about what you need.
              </p>
            </div>

            <Link
              href="/#cta"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-bg font-semibold text-[14px] tracking-[0.02em] hover:bg-white/88 active:scale-[0.97] transition-all duration-200 shrink-0 whitespace-nowrap self-start lg:self-end"
            >
              Book a Free Call <ArrowRight className="w-4 h-4" />
            </Link>
          </m.div>
        </section>

      </main>
      <Footer />
    </>
  )
}
