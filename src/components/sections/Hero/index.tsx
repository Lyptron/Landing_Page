'use client'
import { useRef, useEffect, useCallback, useState } from 'react'
import { m } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const

// Showcase tiles. Numbers here are kept in sync with `projectStats`
// in Work.tsx — if you change one, update the other.
const PROJECTS = [
  {
    title: 'NexusFlow',
    tag: 'SaaS Platform',
    result: '$0 → $12k MRR',
    url: 'lyptron.com/work/nexusflow',
    metrics: [
      { label: 'MRR', value: '$12k' },
      { label: 'Uptime', value: '99.99%' },
      { label: 'Load', value: '8.4ms' },
    ],
    bars: [35, 52, 44, 68, 58, 78, 72, 92, 85, 100],
  },
  {
    title: 'Stratum',
    tag: 'Brand & Marketing',
    result: 'Lighthouse 100',
    url: 'lyptron.com/work/stratum',
    preview: 'brand',
  },
  {
    title: 'VoxAI',
    tag: 'AI Product',
    result: '42% token savings',
    url: 'lyptron.com/work/voxai',
    preview: 'ai',
  },
]

const TRUST = [
  { value: '50+', label: 'Projects Shipped' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '100', label: 'Lighthouse Score' },
  { value: '<24h', label: 'Response Time' },
]

const LOGOS = [
  {
    name: 'Vercel',
    // Letterform paths are easy to get subtly wrong and render as garbled
    // text — render the wordmark as real text next to the (simple,
    // easy-to-verify) triangle glyph instead of hand-drawn letter paths.
    svg: (
      <span className="flex items-center gap-1.5">
        <svg width="13" height="12" viewBox="0 0 13 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.5 0L13 12H0L6.5 0Z" />
        </svg>
        <span className="font-sans font-semibold text-[15px] tracking-tight leading-none">Vercel</span>
      </span>
    )
  },
  {
    name: 'Stripe',
    svg: (
      <span className="font-sans font-bold text-[15px] tracking-tight leading-none">Stripe</span>
    )
  },
  {
    name: 'Supabase',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.1386 2.3838C12.3392 2.1158 12.7663 2.22272 12.8093 2.55171L14.2818 13.8213C14.3312 14.1998 13.9877 14.4984 13.6231 14.3941L4.85199 11.8841C4.52488 11.7905 4.41775 11.3636 4.68536 11.1629L12.1386 2.3838Z" fill="#3ECF8E"/>
        <path d="M11.8614 21.6162C11.6608 21.8842 11.2337 21.7773 11.1907 21.4483L9.71822 10.1787C9.66879 9.80016 10.0123 9.50156 10.3769 9.60589L19.148 12.1159C19.4751 12.2095 19.5822 12.6364 19.3146 12.8371L11.8614 21.6162Z" fill="#3ECF8E"/>
      </svg>
    )
  },
]

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const sectionRectRef = useRef<DOMRect | null>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [storyStep, setStoryStep] = useState(0)

  // Timeline compressed from 2400/4800ms — the real H1 (LCP element) was
  // staying invisible for ~4.8s while these timers ran, which tanked LCP.
  useEffect(() => {
    const timer1 = setTimeout(() => setStoryStep(1), 500)
    const timer2 = setTimeout(() => setStoryStep(2), 1100)
    return () => { clearTimeout(timer1); clearTimeout(timer2) }
  }, [])

  // Throttle mousemove with rAF so we only repaint once per frame instead
  // of on every pointer event.
  const rafRef = useRef<number | null>(null)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)

  const updateSectionRect = useCallback(() => {
    if (sectionRef.current) {
      sectionRectRef.current = sectionRef.current.getBoundingClientRect()
    }
  }, [])

  const onMove = useCallback((e: MouseEvent) => {
    if (!sectionRef.current) return
    if (!sectionRectRef.current) {
      sectionRectRef.current = sectionRef.current.getBoundingClientRect()
    }
    const r = sectionRectRef.current
    lastPosRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    if (rafRef.current != null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const pos = lastPosRef.current
      if (!pos || !glowRef.current) return
      glowRef.current.style.background = `radial-gradient(500px circle at ${pos.x}px ${pos.y}px, rgba(255,250,240,0.02) 0%, transparent 50%)`
    })
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    // Skip the radial-gradient mouse-follow on touch devices and
    // reduced-m. Tap events fire synthetic mousemoves and would
    // otherwise trigger an expensive repaint on every interaction.
    if (typeof window !== 'undefined') {
      if (
        window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) return
    }
    updateSectionRect()
    window.addEventListener('resize', updateSectionRect, { passive: true })
    el.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('resize', updateSectionRect)
      el.removeEventListener('mousemove', onMove)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [onMove, updateSectionRect])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full min-h-screen overflow-hidden flex flex-col justify-center"
      style={{ background: '#050505' }}
    >
      {/* Cinematic studio spotlight — single dramatic overhead cone */}
      <div className="absolute inset-0 z-0 pointer-events-none">

        {/* Primary spotlight — warm white cone from above */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[-10%]"
          style={{
            width: '140%',
            height: '85%',
            background: 'conic-gradient(from 180deg at 50% 0%, transparent 35%, rgba(255,248,230,0.07) 45%, rgba(255,250,240,0.11) 50%, rgba(255,248,230,0.07) 55%, transparent 65%)',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 95%)',
          }}
        />

        {/* Spotlight pool — soft ellipse where light "lands" */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[18%]"
          style={{
            width: '70%',
            maxWidth: '1100px',
            height: '600px',
            background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(255,250,235,0.06) 0%, rgba(255,248,225,0.02) 40%, transparent 70%)',
          }}
        />

        {/* Ultra-subtle warm edge glow at top center */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[-5%]"
          style={{
            width: '30%',
            height: '200px',
            background: 'radial-gradient(ellipse at 50% 100%, rgba(255,230,180,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Noise grain for cinematic texture */}
        <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

        {/* Mobile Ambient Glow */}
        <m.div 
          className="absolute inset-0 md:hidden z-0 pointer-events-none"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.06) 0%, transparent 70%)' }}
        />

        {/* Animated SVG Timeline Thread — synced to story steps */}
        <svg aria-hidden="true" focusable="false" className="hidden md:block absolute inset-x-0 top-0 w-full pointer-events-none z-10" style={{ height: '800px' }} preserveAspectRatio="none" viewBox="0 0 1440 800">
          <m.path
            d="M -100,200 C 300,200 400,100 720,100 C 1000,100 1200,400 1500,400"
            fill="none"
            stroke="url(#glowGradient)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: storyStep === 0 ? 0.33 : storyStep === 1 ? 0.66 : 1,
              opacity: storyStep === 0 ? 0.5 : storyStep === 1 ? 0.7 : 0.9,
            }}
            transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <m.path
            d="M -100,200 C 300,200 400,100 720,100 C 1000,100 1200,400 1500,400"
            fill="none"
            stroke="url(#glowGradientBright)"
            strokeWidth="4"
            style={{ filter: 'blur(6px)' }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: storyStep === 0 ? 0.33 : storyStep === 1 ? 0.66 : 1,
              opacity: storyStep === 0 ? 0.15 : storyStep === 1 ? 0.25 : 0.4,
            }}
            transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          <defs>
            <linearGradient id="glowGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,252,245,0)" />
              <stop offset="30%" stopColor="rgba(255,252,245,0.9)" />
              <stop offset="70%" stopColor="rgba(255,252,245,0.9)" />
              <stop offset="100%" stopColor="rgba(255,252,245,0)" />
            </linearGradient>
            <linearGradient id="glowGradientBright" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,250,230,0)" />
              <stop offset="40%" stopColor="rgba(255,250,230,0.8)" />
              <stop offset="60%" stopColor="rgba(255,250,230,0.8)" />
              <stop offset="100%" stopColor="rgba(255,250,230,0)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Mouse follow glow — softer to match minimal aesthetic */}
      <div ref={glowRef} className="absolute inset-0 z-1 pointer-events-none" />

      {/* Top accent line */}
      <m.div className="absolute top-0 left-0 right-0 h-px z-30"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)' }}
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ duration: 2, delay: 0.1, ease: EASE }} />

      {/* ====== CONTENT ====== */}
      <div className="relative z-10">

        {/* ── HERO TEXT BLOCK ── */}
        <div className="w-full max-w-360 mx-auto px-6 md:px-12 lg:px-20 pt-28 md:pt-44">

          {/* Storytelling Headline — smooth crossfade transitions */}
          <div className="relative min-h-30 md:min-h-45 lg:min-h-50 mb-7 w-full">
            {/* Step 2 — main headline. Always present in the DOM so crawlers
                and no-JS readers see the real H1 immediately; the animated
                teasers below sit visually in front via z-index but are
                aria-hidden so they never replace the H1 semantically. */}
            <m.h1
              initial={{ opacity: 0, filter: 'blur(14px)', scale: 0.98 }}
              animate={{
                // After 6s storyStep flips to 2 and the H1 fades in. Before
                // that the H1 is still in the DOM but visually masked by the
                // teaser spans, so a crawler that doesn't execute the
                // timeout still picks it up.
                opacity: storyStep === 2 ? 1 : 0,
                filter: storyStep === 2 ? 'blur(0px)' : 'blur(14px)',
                scale: storyStep === 2 ? 1 : 0.98,
              }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              className="relative font-display font-bold text-[clamp(28px,6.5vw,88px)] md:text-[88px] leading-[0.97] tracking-[-0.04em] z-10"
            >
              <span className="text-white/90">We design & build </span>
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)' }}>
                digital products
              </span>
              <span className="text-white/30"> that grow your business.</span>
            </m.h1>

            {/* Step 0 — tease line (visual only, not a heading) */}
            <m.span
              aria-hidden="true"
              initial={{ opacity: 0, filter: 'blur(10px)', y: 8 }}
              animate={{
                opacity: storyStep === 0 ? 1 : 0,
                filter: storyStep === 0 ? 'blur(0px)' : 'blur(10px)',
                y: storyStep === 0 ? 0 : -6,
              }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 font-display font-medium text-[clamp(24px,4.5vw,58px)] md:text-[58px] text-white/50 tracking-[-0.02em] leading-tight flex items-center pointer-events-none z-20"
            >
              You have an ambitious vision.
            </m.span>

            {/* Step 1 — problem line (visual only, not a heading) */}
            <m.span
              aria-hidden="true"
              initial={{ opacity: 0, filter: 'blur(10px)', y: 8 }}
              animate={{
                opacity: storyStep === 1 ? 1 : 0,
                filter: storyStep === 1 ? 'blur(0px)' : 'blur(10px)',
                y: storyStep === 1 ? 0 : storyStep < 1 ? 8 : -6,
              }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 font-display font-medium text-[clamp(24px,4.5vw,58px)] md:text-[58px] text-white/50 tracking-[-0.02em] leading-tight flex items-center pointer-events-none z-20"
            >
              But scaling the right technology is hard.
            </m.span>
          </div>

          {/* Sub + CTAs — full width row */}
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: storyStep === 2 ? 1 : 0, y: storyStep === 2 ? 0 : 12 }}
            transition={{ duration: 1.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10 w-full pb-10 md:pb-20"
          >
            <p className="font-body text-[15px] md:text-[17px] text-white/30 leading-[1.7] max-w-130">
              A product studio for founders who need design, engineering and strategy under one roof — shipped on time, built to last.
            </p>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a href="#cta" className="relative group overflow-hidden rounded-full">
                <div className="absolute inset-0 bg-white group-hover:bg-white/90 transition-colors duration-300" />
                <div className="relative flex items-center gap-2 px-7 py-3 font-semibold text-[13px] text-bg tracking-[0.02em]">
                  Start a Project
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="transition-transform duration-300 group-hover:translate-x-0.5"><path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </a>
              <a href="#work" className="px-7 py-3 rounded-full font-medium text-[13px] text-white/35 hover:text-white/60 border border-white/[0.07] hover:border-white/12 transition-all duration-300 tracking-[0.02em]">
                Our Work
              </a>
            </div>
          </m.div>
        </div>

        {/* ── SHOWCASE STRIP ── full bleed */}
        <div className="w-full max-w-360 mx-auto px-6 md:px-12 lg:px-20">
          <m.div className="h-px w-full mb-0"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.06) 85%, transparent)' }}
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                      transition={{ duration: 1.4, delay: 0.6, ease: EASE }} />
        </div>

        <div className="w-full max-w-360 mx-auto px-6 md:px-12 lg:px-20 py-6 md:py-14">
          <div className="flex overflow-x-auto lg:grid lg:grid-cols-3 gap-5 pb-8 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {PROJECTS.map((p, i) => (
              <m.div
                key={p.title}
                className="group rounded-2xl overflow-hidden cursor-default shrink-0 w-[85vw] sm:w-100 lg:w-auto snap-center"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 2px 20px rgba(0,0,0,0.2)',
                  transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
                }}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.7 + i * 0.12, ease: EASE }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.2)'
                }}
              >
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 px-4 h-9" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/12" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/8" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/6" />
                  </div>
                  <div className="ml-3 h-4.5 flex-1 max-w-30 rounded bg-white/3 flex items-center px-2">
                    <span className="font-mono text-[7px] text-white/12">{p.url}</span>
                  </div>
                </div>

                {/* Preview area */}
                <div className="aspect-16/10 relative" style={{ background: 'linear-gradient(135deg, #0e0e10 0%, #08080A 100%)' }}>
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                       style={{ background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.02) 0%, transparent 50%)' }} />

                  {i === 0 && p.metrics && p.bars && (
                    /* Dashboard mockup */
                    <div className="absolute inset-3 flex flex-col gap-2">
                      <div className="flex gap-2">
                        {p.metrics.map((m, j) => (
                          <div key={j} className="flex-1 rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <span className="font-mono text-[6px] text-white/18 uppercase tracking-wider block">{m.label}</span>
                            <span className="font-display font-bold text-[13px] text-white/70 tracking-tight leading-none">{m.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.035)' }}>
                        <div className="flex items-end gap-0.75 h-full">
                          {p.bars.map((h, j) => (
                            <div key={j} className="flex-1 rounded-t-xs transition-all duration-300"
                                 style={{ height: `${h}%`, background: j >= 8 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)' }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {i === 1 && (
                    /* Brand / marketing mockup */
                    <div className="absolute inset-3 flex gap-2">
                      <div className="w-[38%] flex flex-col gap-2">
                        <div className="flex-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div className="p-2.5 flex flex-col h-full">
                            <div className="h-2 w-16 rounded bg-white/8 mb-2" />
                            <div className="h-1.5 w-12 rounded bg-white/4 mb-3" />
                            <div className="flex-1 rounded bg-white/2 border border-white/4 flex items-center justify-center">
                              <div className="w-10 h-12 rounded border border-white/8 bg-white/2" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-8 rounded-lg flex items-center px-3 gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div className="h-1.5 w-10 rounded bg-white/6" />
                          <div className="h-1.5 w-8 rounded bg-white/4" />
                          <div className="h-1.5 w-12 rounded bg-white/4" />
                        </div>
                        <div className="flex-1 rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div className="grid grid-cols-2 gap-2 h-full">
                            {[...Array(4)].map((_, k) => (
                              <div key={k} className="rounded bg-white/2 border border-white/4" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {i === 2 && (
                    /* AI chat mockup */
                    <div className="absolute inset-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-white/5 border border-white/8" />
                        <div className="h-1.5 w-16 rounded bg-white/6" />
                        <div className="ml-auto h-1.5 w-8 rounded bg-white/4" />
                      </div>
                      <div className="flex-1 flex flex-col gap-2 justify-end">
                        <div className="flex justify-end"><div className="w-[65%] rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}><div className="h-1.5 w-full rounded bg-white/8 mb-1" /><div className="h-1.5 w-2/3 rounded bg-white/5" /></div></div>
                        <div className="flex justify-start"><div className="w-[55%] rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}><div className="h-1.5 w-full rounded bg-white/6 mb-1" /><div className="h-1.5 w-3/4 rounded bg-white/4" /></div></div>
                        <div className="flex justify-end"><div className="w-[50%] rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}><div className="h-1.5 w-full rounded bg-white/7" /></div></div>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <div className="flex-1 h-8 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} />
                        <div className="w-8 h-8 rounded-lg bg-white/5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-4 py-3.5 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <h4 className="font-display font-semibold text-[14px] text-white/80 tracking-tight leading-tight group-hover:text-white/90 transition-colors duration-300">{p.title}</h4>
                    <span className="font-mono text-[10px] text-white/35 tracking-wider uppercase">{p.tag}</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/50">{p.result}</span>
                </div>
              </m.div>
            ))}
          </div>
        </div>

        {/* ── TRUST BAR ── */}
        <div className="w-full max-w-360 mx-auto px-6 md:px-12 lg:px-20 pb-12 md:pb-24">
          <m.div className="h-px w-full mb-10"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.06) 85%, transparent)' }}
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                      transition={{ duration: 1.2, delay: 1.0, ease: EASE }} />

          {/* Tech stack / social proof */}
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
                      className="flex flex-wrap items-center justify-start gap-4 sm:gap-8 mb-12">
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/15 shrink-0">Built with</span>
            <div className="flex flex-wrap items-center gap-7 sm:gap-10 md:gap-12">
              {LOGOS.map(logo => (
                <div
                  key={logo.name}
                  role="img"
                  aria-label={`${logo.name} logo`}
                  title={logo.name}
                  className="text-white/70 hover:text-white opacity-80 hover:opacity-100 transition-all duration-300 [&_svg]:w-auto [&_svg]:h-5 sm:[&_svg]:h-6"
                >
                  {logo.svg}
                </div>
              ))}
            </div>
          </m.div>

          {/* Stats */}
          <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1.15, ease: EASE }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {TRUST.map((t, i) => (
                <div key={i} className="relative text-left">
                  {i > 0 && <div className="hidden md:block absolute -left-6 top-1/2 -translate-y-1/2 w-px h-10 bg-white/4" />}
                  <span className="font-display font-bold text-[28px] md:text-[34px] text-white/80 tracking-tight leading-none block">{t.value}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/20 mt-1.5 block">{t.label}</span>
                </div>
              ))}
            </div>
          </m.div>
        </div>

      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-30 z-20 pointer-events-none"
           style={{ background: 'linear-gradient(to top, #050505 0%, transparent 100%)' }} />
    </section>
  )
}
