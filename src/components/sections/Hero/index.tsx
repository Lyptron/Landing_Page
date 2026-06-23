'use client'
import { useRef, useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'

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
    svg: (
      <svg width="76" height="17" viewBox="0 0 76 17" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.9818 16.2952H0L6.49088 5.04018L12.9818 16.2952Z" />
        <path d="M22.0628 12.019H25.8647C27.1738 12.019 28.2618 11.1166 28.2618 9.80854C28.2618 8.49842 27.1738 7.59814 25.8647 7.59814H22.0628V12.019ZM20.0387 16.2952V5.55621H25.8647C28.3248 5.55621 30.2849 7.4566 30.2849 9.80854C30.2849 11.6664 28.9329 13.2384 27.1708 13.8407L30.7301 16.2952H28.2917L24.8943 13.9317H22.0628V16.2952H20.0387Z" />
        <path d="M37.3629 16.5161C33.8299 16.5161 31.0669 13.8266 31.0669 10.4285C31.0669 7.0305 33.8299 4.34094 37.3629 4.34094C40.6724 4.34094 43.3283 6.7454 43.6194 9.9405H41.5654C41.2583 7.8427 39.5293 6.22304 37.3629 6.22304C35.034 6.22304 33.149 8.1136 33.149 10.4285C33.149 12.7435 35.034 14.634 37.3629 14.634C39.5293 14.634 41.2583 13.0144 41.5654 10.9166H43.6194C43.3283 14.1117 40.6724 16.5161 37.3629 16.5161Z" />
        <path d="M50.4578 16.2952H44.1353V5.55621H50.3648V7.48154H46.1593V9.89744H50.1417V11.8228H46.1593V14.3699H50.4578V16.2952Z" />
        <path d="M53.1113 16.2952H51.0873V5.55621H53.1113V16.2952Z" />
      </svg>
    )
  },
  {
    name: 'Stripe',
    svg: (
      <svg width="49" height="20" viewBox="0 0 49 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M24.12 19.34C21.84 19.34 20.08 17.58 20.08 15.34C20.08 13.1 21.84 11.34 24.12 11.34C26.4 11.34 28.16 13.1 28.16 15.34C28.16 17.58 26.4 19.34 24.12 19.34ZM24.12 13.34C23.016 13.34 22.12 14.236 22.12 15.34C22.12 16.444 23.016 17.34 24.12 17.34C25.224 17.34 26.12 16.444 26.12 15.34C26.12 14.236 25.224 13.34 24.12 13.34Z" />
        <path d="M3.76 19.34C1.64 19.34 0 17.7 0 15.58C0 14.02 0.88 12.78 2.24 12.18L3.6 11.58C4.36 11.26 4.76 10.94 4.76 10.42C4.76 9.82 4.24 9.42 3.52 9.42C2.72 9.42 2.2 9.94 2.12 10.66H0.12C0.2 9.02 1.56 7.66 3.6 7.66C5.64 7.66 7.08 8.9 7.08 10.66C7.08 12.02 6.16 13.14 4.96 13.66L3.6 14.26C2.8 14.58 2.48 14.94 2.48 15.46C2.48 16.14 3.04 16.58 3.84 16.58C4.72 16.58 5.32 15.98 5.48 15.06H7.48C7.32 16.86 5.84 19.34 3.76 19.34Z" />
        <path d="M12.92 19.14C11.52 19.14 10.56 18.3 10.56 16.9V9.7H9.28V7.86H10.56V5.42L12.6 4.9V7.86H14.88V9.7H12.6V16.22C12.6 16.82 12.92 17.14 13.52 17.14H14.88V19.14H12.92Z" />
        <path d="M34.8 19.34C33.68 19.34 32.72 18.86 32.2 18V25H30.16V11.54H32.08V12.66C32.6 11.82 33.56 11.34 34.68 11.34C36.96 11.34 38.72 13.1 38.72 15.34C38.72 17.58 36.96 19.34 34.8 19.34ZM34.44 13.34C33.336 13.34 32.44 14.236 32.44 15.34C32.44 16.444 33.336 17.34 34.44 17.34C35.544 17.34 36.44 16.444 36.44 15.34C36.44 14.236 35.544 13.34 34.44 13.34Z" />
        <path d="M44.4 19.34C42.08 19.34 40.16 17.42 40.16 15.1C40.16 12.78 42.08 10.86 44.4 10.86C46.68 10.86 48.48 12.66 48.48 14.94V15.74H42.24C42.44 16.74 43.32 17.46 44.4 17.46C45.32 17.46 46 16.94 46.36 16.14H48.28C47.88 18 46.32 19.34 44.4 19.34ZM44.4 12.62C43.4 12.62 42.6 13.26 42.36 14.18H46.48C46.28 13.26 45.44 12.62 44.4 12.62Z" />
        <path d="M16.5195 19.14V11.54H18.4395V12.7C18.8795 11.78 19.7995 11.34 20.8795 11.34C21.1995 11.34 21.4395 11.38 21.5595 11.42V13.34C21.3995 13.3 21.1195 13.26 20.7595 13.26C19.5195 13.26 18.5595 14.18 18.5595 15.62V19.14H16.5195Z" />
      </svg>
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
  {
    name: 'Figma',
    svg: (
      <svg width="14" height="20" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 28.5C24.2467 28.5 28.5 24.2467 28.5 19C28.5 13.7533 24.2467 9.5 19 9.5H9.5V28.5H19Z" fill="#F24E1E"/>
        <path d="M9.5 28.5C4.25329 28.5 0 24.2467 0 19C0 13.7533 4.25329 9.5 9.5 9.5H19V28.5H9.5Z" fill="#A259FF"/>
        <path d="M19 47.5C24.2467 47.5 28.5 43.2467 28.5 38C28.5 32.7533 24.2467 28.5 19 28.5H9.5V47.5H19Z" fill="#1ABCFE"/>
        <path d="M9.5 47.5C4.25329 47.5 0 43.2467 0 38C0 32.7533 4.25329 28.5 9.5 28.5H19V47.5H9.5Z" fill="#0ACF83"/>
        <path d="M19 57C13.7533 57 9.5 52.7467 9.5 47.5V38H19C24.2467 38 28.5 42.2533 28.5 47.5C28.5 52.7467 24.2467 57 19 57Z" fill="#FF7262"/>
      </svg>
    )
  }
]

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [storyStep, setStoryStep] = useState(0)

  useEffect(() => {
    const timer1 = setTimeout(() => setStoryStep(1), 2400)
    const timer2 = setTimeout(() => setStoryStep(2), 4800)
    return () => { clearTimeout(timer1); clearTimeout(timer2) }
  }, [])

  // Throttle mousemove with rAF so we only repaint once per frame instead
  // of on every pointer event.
  const rafRef = useRef<number | null>(null)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)

  const onMove = useCallback((e: MouseEvent) => {
    if (!sectionRef.current) return
    const r = sectionRef.current.getBoundingClientRect()
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
    // reduced-motion. Tap events fire synthetic mousemoves and would
    // otherwise trigger an expensive repaint on every interaction.
    if (typeof window !== 'undefined') {
      if (
        window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) return
    }
    el.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      el.removeEventListener('mousemove', onMove)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [onMove])

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
          className="absolute left-1/2 -translate-x-1/2 -top-[10%]"
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
          className="absolute left-1/2 -translate-x-1/2 -top-[5%]"
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
        <motion.div 
          className="absolute inset-0 md:hidden z-0 pointer-events-none"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.06) 0%, transparent 70%)' }}
        />

        {/* Animated SVG Timeline Thread — synced to story steps */}
        <svg aria-hidden="true" focusable="false" className="hidden md:block absolute inset-x-0 top-0 w-full pointer-events-none z-10" style={{ height: '800px' }} preserveAspectRatio="none" viewBox="0 0 1440 800">
          <motion.path
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
          <motion.path
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
      <div ref={glowRef} className="absolute inset-0 z-[1] pointer-events-none" />

      {/* Top accent line */}
      <motion.div className="absolute top-0 left-0 right-0 h-px z-30"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)' }}
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ duration: 2, delay: 0.1, ease: EASE }} />

      {/* ====== CONTENT ====== */}
      <div className="relative z-10">

        {/* ── HERO TEXT BLOCK ── */}
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pt-28 md:pt-44">

          {/* Storytelling Headline — smooth crossfade transitions */}
          <div className="relative min-h-[120px] md:min-h-[180px] lg:min-h-[200px] mb-7 w-full">
            {/* Step 2 — main headline. Always present in the DOM so crawlers
                and no-JS readers see the real H1 immediately; the animated
                teasers below sit visually in front via z-index but are
                aria-hidden so they never replace the H1 semantically. */}
            <motion.h1
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
            </motion.h1>

            {/* Step 0 — tease line (visual only, not a heading) */}
            <motion.span
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
            </motion.span>

            {/* Step 1 — problem line (visual only, not a heading) */}
            <motion.span
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
            </motion.span>
          </div>

          {/* Sub + CTAs — full width row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: storyStep === 2 ? 1 : 0, y: storyStep === 2 ? 0 : 12 }}
            transition={{ duration: 1.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10 w-full pb-10 md:pb-20"
          >
            <p className="font-body text-[15px] md:text-[17px] text-white/30 leading-[1.7] max-w-[520px]">
              A product studio for founders who need design, engineering and strategy under one roof — shipped on time, built to last.
            </p>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a href="#cta" className="relative group overflow-hidden rounded-full">
                <div className="absolute inset-0 bg-white group-hover:bg-white/90 transition-colors duration-300" />
                <div className="relative flex items-center gap-2 px-7 py-3 font-semibold text-[13px] text-[#050505] tracking-[0.02em]">
                  Start a Project
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="transition-transform duration-300 group-hover:translate-x-0.5"><path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </a>
              <a href="#work" className="px-7 py-3 rounded-full font-medium text-[13px] text-white/35 hover:text-white/60 border border-white/[0.07] hover:border-white/12 transition-all duration-300 tracking-[0.02em]">
                Our Work
              </a>
            </div>
          </motion.div>
        </div>

        {/* ── SHOWCASE STRIP ── full bleed */}
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
          <motion.div className="h-px w-full mb-0"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.06) 85%, transparent)' }}
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                      transition={{ duration: 1.4, delay: 0.6, ease: EASE }} />
        </div>

        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-6 md:py-14">
          <div className="flex overflow-x-auto lg:grid lg:grid-cols-3 gap-5 pb-8 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {PROJECTS.map((p, i) => (
              <motion.div
                key={p.title}
                className="group rounded-2xl overflow-hidden cursor-default shrink-0 w-[85vw] sm:w-[400px] lg:w-auto snap-center"
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
                    <div className="w-[6px] h-[6px] rounded-full bg-white/12" />
                    <div className="w-[6px] h-[6px] rounded-full bg-white/8" />
                    <div className="w-[6px] h-[6px] rounded-full bg-white/6" />
                  </div>
                  <div className="ml-3 h-[18px] flex-1 max-w-[120px] rounded bg-white/[0.03] flex items-center px-2">
                    <span className="font-mono text-[7px] text-white/12">{p.url}</span>
                  </div>
                </div>

                {/* Preview area */}
                <div className="aspect-[16/10] relative" style={{ background: 'linear-gradient(135deg, #0e0e10 0%, #08080A 100%)' }}>
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
                        <div className="flex items-end gap-[3px] h-full">
                          {p.bars.map((h, j) => (
                            <div key={j} className="flex-1 rounded-t-[2px] transition-all duration-300"
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
                            <div className="flex-1 rounded bg-white/[0.02] border border-white/4 flex items-center justify-center">
                              <div className="w-10 h-12 rounded border border-white/8 bg-white/[0.02]" />
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
                              <div key={k} className="rounded bg-white/[0.02] border border-white/4" />
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
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── TRUST BAR ── */}
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pb-12 md:pb-24">
          <motion.div className="h-px w-full mb-10"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.06) 85%, transparent)' }}
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                      transition={{ duration: 1.2, delay: 1.0, ease: EASE }} />

          {/* Tech stack / social proof */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
                      className="flex flex-wrap items-center justify-start gap-4 sm:gap-8 mb-12">
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/15 shrink-0">Built with</span>
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 md:gap-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
              {LOGOS.map(logo => (
                <div
                  key={logo.name}
                  role="img"
                  aria-label={`${logo.name} logo`}
                  title={logo.name}
                  className="text-white hover:text-white transition-colors duration-300"
                >
                  {logo.svg}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1.15, ease: EASE }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {TRUST.map((t, i) => (
                <div key={i} className="relative text-left">
                  {i > 0 && <div className="hidden md:block absolute -left-6 top-1/2 -translate-y-1/2 w-px h-10 bg-white/[0.04]" />}
                  <span className="font-display font-bold text-[28px] md:text-[34px] text-white/80 tracking-tight leading-none block">{t.value}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/20 mt-1.5 block">{t.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-[120px] z-20 pointer-events-none"
           style={{ background: 'linear-gradient(to top, #050505 0%, transparent 100%)' }} />
    </section>
  )
}
