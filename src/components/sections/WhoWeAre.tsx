'use client'
import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { m, useScroll, useTransform, useInView } from 'framer-motion'
import { useLowPerfMode } from '@/hooks/useLowPerfMode'

// Three.js + R3F are ~600KB minified — only fetched and rendered on
// desktops that can actually handle the wireframe globe. Skipped entirely
// on phones, touch devices, and prefers-reduced-m.
const WhoWeAreCanvas = dynamic(() => import('../canvas/WhoWeAreCanvas'), {
  ssr: false,
  loading: () => null,
})

const EASE = [0.22, 1, 0.36, 1] as const

const STATS = [
  { value: '50+', label: 'Projects Shipped' },
  { value: '99.9%', label: 'Average SLA Uptime' },
  { value: '4+', label: 'Core Engineers' },
  { value: '100', label: 'Lighthouse Score' },
]

const PRINCIPLES = [
  {
    number: '01',
    title: 'No Outsourcing',
    desc: 'Your product is built entirely by our in-house team. Every line of code, every pixel — engineered by specialists who own the outcome.',
  },
  {
    number: '02',
    title: 'Ship Fast, Ship Right',
    desc: 'We move at startup speed without cutting corners. Production-ready code with 99.9% uptime SLAs from day one.',
  },
  {
    number: '03',
    title: 'Full-Stack Ownership',
    desc: 'Design, engineering, infrastructure, and growth — one team handles it all. No handoff gaps, no lost context.',
  },
]

function StatBlock({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <m.div
      ref={ref}
      className="relative md:text-center"
      initial={{ opacity: 0, scale: 1.4 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.9, delay: 0.1 + index * 0.12, ease: EASE }}
    >
      {index > 0 && <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-10 bg-white/4" />}
      <span className="font-display font-bold text-[28px] md:text-[34px] text-white/80 tracking-tight leading-none block">{stat.value}</span>
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/20 mt-1.5 block">{stat.label}</span>
    </m.div>
  )
}

function PrincipleCard({ principle, index }: { principle: typeof PRINCIPLES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const origins = [{ x: -60, rotate: -3 }, { x: 0, y: 40, rotate: 0 }, { x: 60, rotate: 3 }]
  const origin = origins[index]

  return (
    <m.div
      ref={ref}
      className="group rounded-2xl p-6 md:p-8 transition-all duration-500 hover:bg-gold/3"
      style={{
        background: 'linear-gradient(160deg, rgba(214,179,112,0.04) 0%, rgba(214,179,112,0.01) 100%)',
        border: '1px solid rgba(214,179,112,0.1)',
      }}
      initial={{ opacity: 0, x: origin.x, y: origin.y || 0, rotate: origin.rotate, scale: 0.92 }}
      animate={inView ? { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 } : {}}
      transition={{ duration: 1, delay: 0.1 + index * 0.15, ease: EASE }}
    >
      <m.span
        className="font-mono text-[10px] text-white/20 tracking-[0.2em] uppercase block mb-4"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.4 + index * 0.15, ease: EASE }}
      >
        {principle.number}
      </m.span>
      <m.h3
        className="font-display font-semibold text-[18px] text-white/80 tracking-tight mb-3 group-hover:text-white/90 transition-colors duration-300"
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.5 + index * 0.15, ease: EASE }}
      >
        {principle.title}
      </m.h3>
      <m.p
        className="font-body text-[14px] text-white/25 leading-relaxed group-hover:text-white/35 transition-colors duration-300"
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.6 + index * 0.15, ease: EASE }}
      >
        {principle.desc}
      </m.p>
    </m.div>
  )
}

export default function WhoWeAre() {
  const lowPerf = useLowPerfMode()
  const sectionRef = useRef<HTMLDivElement>(null)
  const sectionInView = useInView(sectionRef, { margin: '300px' })
  const principlesRef = useRef<HTMLDivElement>(null)
  const principlesDividerInView = useInView(principlesRef, { once: true, margin: '-60px' })
  const statsRef = useRef<HTMLDivElement>(null)
  const statsDividerInView = useInView(statsRef, { once: true, margin: '-60px' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // const globeScale = useTransform(scrollYProgress, [0, 0.3, 0.7], [0.5, 1.1, 1.3])

  const headlineRef = useRef<HTMLDivElement>(null)
  const headlineInView = useInView(headlineRef, { once: true, margin: '-80px' })

  const paraLeftRef = useRef<HTMLParagraphElement>(null)
  const paraLeftInView = useInView(paraLeftRef, { once: true, margin: '-60px' })
  const paraRightRef = useRef<HTMLParagraphElement>(null)
  const paraRightInView = useInView(paraRightRef, { once: true, margin: '-60px' })

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden py-16 md:py-40 select-none z-10"
      style={{ background: '#050505' }}
    >
      {/* 3D Globe — static scale, no scroll-linked zoom */}
      <m.div
        className="absolute top-0 right-0 translate-x-[30%] translate-y-[-20%] w-200 h-200 md:translate-x-[25%] md:translate-y-[-15%] md:w-275 md:h-275 pointer-events-none z-0"
        style={{ 
          scale: 1.1, 
          opacity: useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.05, 0.15, 0.15, 0.05])
        }}
      >
        {sectionInView && !lowPerf && <WhoWeAreCanvas />}
      </m.div>

      {/* Warm spotlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[5%]"
          style={{
            width: '80%',
            maxWidth: '1000px',
            height: '500px',
            background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(255,250,235,0.035) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Noise grain */}
      <div className="absolute inset-0 opacity-[0.018] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      <div className="relative z-10 w-full px-6 md:px-12 lg:px-30">

        {/* Divider line — draws on scroll */}
        <m.div
          className="h-px w-full mb-16 origin-left"
          style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.06) 50%, transparent)' }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: EASE }}
        />

        <div className="flex flex-col gap-16 md:gap-20">

          {/* Label + Headline — word-by-word build */}
          <div ref={headlineRef} className="flex flex-col gap-8">
            <m.span
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/50"
              initial={{ opacity: 0, y: 12 }}
              animate={headlineInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            >
              Who We Are
            </m.span>

            <h2 className="font-display font-bold text-[clamp(28px,5vw,68px)] leading-[0.97] tracking-[-0.04em] max-w-225">
              <m.span
                className="text-white/90 inline-block"
                initial={{ opacity: 0, y: 16 }}
                animate={headlineInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
              >
                A product studio
              </m.span>{' '}
              <m.span
                className="text-white/35 inline-block"
                initial={{ opacity: 0, y: 16 }}
                animate={headlineInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
              >
                for founders who need design, engineering &amp; strategy
              </m.span>{' '}
              <m.span
                className="text-white/90 inline-block"
                initial={{ opacity: 0, y: 16 }}
                animate={headlineInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1.2, delay: 0.85, ease: EASE }}
              >
                under one roof.
              </m.span>
            </h2>
          </div>

          {/* Two-column description — left slides from left, right from right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <m.p
              ref={paraLeftRef}
              className="font-body text-[15px] md:text-[17px] text-white/30 leading-[1.7] max-w-130"
              initial={{ opacity: 0, x: -40 }}
              animate={paraLeftInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1, delay: 0.1, ease: EASE }}
            >
              We are a specialized group of engineers and designers committed to delivering robust, reliable systems. We don&apos;t take shortcuts. We build codebases that scale, designs that engage, and AI pipelines that automate core operations.
            </m.p>
            <m.p
              ref={paraRightRef}
              className="font-body text-[15px] md:text-[17px] text-white/30 leading-[1.7] max-w-130 hidden md:block"
              initial={{ opacity: 0, x: 40 }}
              animate={paraRightInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1, delay: 0.2, ease: EASE }}
            >
              Every project we ship is production-ready, performance-audited, and built to last. From full-stack web platforms to native mobile apps to intelligent automation — we handle the hard engineering so you can focus on growth.
            </m.p>
          </div>

          {/* Principles — cards fan out from stacked */}
          <div ref={principlesRef} className="hidden md:block">
            <m.div
              className="h-px w-full mb-12"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.06) 85%, transparent)' }}
              initial={{ scaleX: 0 }}
              animate={principlesDividerInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, ease: EASE }}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {PRINCIPLES.map((p, i) => (
                <PrincipleCard key={p.number} principle={p} index={i} />
              ))}
            </div>
          </div>

          {/* Stats — camera focus effect */}
          <div ref={statsRef}>
            <m.div
              className="h-px w-full mb-12"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.06) 85%, transparent)' }}
              initial={{ scaleX: 0 }}
              animate={statsDividerInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, ease: EASE }}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
              {STATS.map((stat, i) => (
                <StatBlock key={stat.label} stat={stat} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
