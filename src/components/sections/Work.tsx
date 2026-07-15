'use client'
import { useRef, useState, useEffect } from 'react'
import { m, useScroll, useTransform, useInView, type Variants } from 'framer-motion'
import { projects } from '@/data/projects'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { useCursor } from '../providers/CursorProvider'
import LivePreviewFrame from '../ui/LivePreviewFrame'

const scrollToCTA = () => {
  const target = document.querySelector('#cta')
  if (!target) return
  const lenis = (window as unknown as { lenis?: { scrollTo: (t: Element, o: object) => void } }).lenis
  if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.5 })
  else target.scrollIntoView({ behavior: 'smooth' })
}

const EASE = [0.22, 1, 0.36, 1] as const

const projectStats: Record<string, { label: string; value: string }[]> = {
  nexusflow: [
    { label: 'MRR Growth', value: '$0 → $12k' },
    { label: 'Uptime', value: '99.99%' },
    { label: 'Load Time', value: '8.4ms' },
  ],
  voxai: [
    { label: 'Resolution Rate', value: '94%' },
    { label: 'Token Savings', value: '42%' },
    { label: 'Hours Saved', value: '40/wk' },
  ],
  pulsetrack: [
    { label: 'Launch Downloads', value: '10k+' },
    { label: 'Frame Rate', value: '120fps' },
    { label: 'Battery Impact', value: '0.02%/h' },
  ],
  stratum: [
    { label: 'Lighthouse', value: '100/100' },
    { label: 'LCP', value: '420ms' },
    { label: 'Google Rank', value: '#1' },
  ],
  novaportal: [
    { label: 'Encryption', value: '256-bit' },
    { label: 'Admin Overhead', value: '-35%' },
    { label: 'Data Stream', value: '45MB/s' },
  ],
}

// Opacity + scale only — tweening filter:blur() during scroll-triggered
// reveals repaints large areas every frame and stutters on weak GPUs.
const statChild: Variants = {
  hidden: { opacity: 0, scale: 1.3 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.8, ease: EASE },
  },
}

const stagger = (delayChildren: number, staggerChildren: number): Variants => ({
  hidden: {},
  visible: { transition: { delayChildren, staggerChildren } },
})

function DeviceMockup({ project }: { project: typeof projects[0] }) {
  const isMobile = project.id === 'pulsetrack'

  if (isMobile) {
    return (
      <div className="relative flex items-center justify-center py-8 md:py-0">
        <div
          className="relative w-50 sm:w-55 aspect-9/19.5 rounded-[30px] border-[3px] border-white/8 overflow-hidden"
          style={{
            background: '#0c0c0e',
            boxShadow: '0 40px 80px -20px rgba(255,255,255,0.03), 0 20px 40px rgba(0,0,0,0.6)',
          }}
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4.5 bg-black rounded-full z-30 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white/4 ring-1 ring-white/6" />
          </div>
          <div className="w-full h-full rounded-[27px] bg-[#111114] overflow-hidden relative">
            {project.url ? (
              <>
                <LivePreviewFrame
                  url={project.url}
                  title={`${project.name} live preview`}
                  baseWidth={390}
                  baseHeight={844}
                />
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${project.name} live site`}
                  className="absolute top-8 right-2 z-30 flex items-center justify-center w-6 h-6 rounded-full bg-black/60 border border-white/10 hover:bg-black/80 hover:border-white/25 transition-colors"
                >
                  <ArrowUpRight className="w-3 h-3 text-white/60" />
                </a>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[8px] text-white/8 uppercase tracking-widest">Preview</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const displayUrl = project.url ? project.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : `lyptron.com/${project.id}`

  return (
    <div className="relative w-full">
      <div
        className="group/browser relative w-full aspect-16/10 overflow-hidden flex flex-col rounded-xl"
        style={{
          background: '#0a0a0c',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 40px 80px -20px rgba(255,255,255,0.02), 0 24px 48px rgba(0,0,0,0.5)',
        }}
      >
        <div className="h-9 w-full bg-white/1 border-b border-white/4 flex items-center px-4 select-none shrink-0">
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white/12" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/8" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/6" />
          </div>
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 h-4.5 flex-1 max-w-35 rounded bg-white/3 flex items-center px-2 cursor-pointer hover:bg-white/6 transition-colors"
            >
              <span className="font-mono text-[7px] text-white/25 truncate">{displayUrl}</span>
            </a>
          ) : (
            <div className="ml-3 h-4.5 flex-1 max-w-35 rounded bg-white/3 flex items-center px-2">
              <span className="font-mono text-[7px] text-white/12" aria-hidden="true">{displayUrl}</span>
            </div>
          )}
        </div>
        <div className="flex-1 w-full bg-[#0f0f11] relative overflow-hidden">
          {project.url ? (
            <LivePreviewFrame
              url={project.url}
              title={`${project.name} live preview`}
              baseWidth={1440}
              baseHeight={900}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-[10px] text-white/8 uppercase tracking-widest">Preview</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TimelineDivider({ number }: { number: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div ref={ref} className="flex items-center gap-4 my-16 md:my-24">
      <m.div
        className="h-px flex-1 origin-left"
        style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent)' }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, ease: EASE }}
      />
      <m.span
        className="font-mono text-[10px] text-white/15 tracking-widest"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.8, ease: EASE }}
      >
        {number}
      </m.span>
      <m.div
        className="h-px flex-1 origin-right"
        style={{ background: 'linear-gradient(270deg, rgba(255,255,255,0.06), transparent)' }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
      />
    </div>
  )
}

function ProjectRow({ project, index }: { project: typeof projects[0]; index: number }) {
  const { setCursorState } = useCursor()
  const stats = projectStats[project.id] || []
  const isReversed = index % 2 !== 0

  const rowRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const infoInView = useInView(infoRef, { once: true, margin: '-60px' })

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ['start end', 'end start'],
  })

  const mockupY = useTransform(scrollYProgress, [0, 1], [isMobile ? 0 : 60, isMobile ? 0 : -40])

  return (
    <div ref={rowRef} className="relative">
      <div className={`relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 items-center ${isReversed ? 'lg:[direction:rtl]' : ''}`}>

        {/* Mockup — rotates in from side */}
        <m.div
          style={{ y: mockupY, willChange: 'transform' }}
          className={isReversed ? 'lg:[direction:ltr]' : ''}
        >
          <m.div
            initial={{
              opacity: 0,
              scale: 0.85,
              rotateY: isReversed ? -8 : 8,
              x: isReversed ? 60 : -60,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
              rotateY: 0,
              x: 0,
            }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1.2, ease: EASE }}
            style={{ perspective: '1000px' }}
          >
            <DeviceMockup project={project} />
          </m.div>
        </m.div>

        {/* Info — typewriter sequence */}
        <div ref={infoRef} className={`flex flex-col ${isReversed ? 'lg:[direction:ltr]' : ''}`}>
          {/* Number */}
          <m.div
            className="flex items-center gap-3 mb-5"
            initial={{ opacity: 0, x: isReversed ? 30 : -30 }}
            animate={infoInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <span className="font-mono text-[11px] font-medium tracking-[0.2em] text-white/40 uppercase">
              {project.number}
            </span>
            <m.div
              className="w-6 h-px bg-white/10"
              initial={{ scaleX: 0 }}
              animate={infoInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/25">
              {project.type}
            </span>
            <span className="font-mono text-[10px] text-white/15 tracking-wider ml-auto hidden sm:block">
              {project.year}
            </span>
          </m.div>

          {/* Name — fade-up reveal */}
          <m.h3
            className="font-display font-bold text-[clamp(28px,4vw,52px)] text-white/90 tracking-[-0.03em] leading-[0.95] mb-4"
            initial={{ opacity: 0, y: 16 }}
            animate={infoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.15, ease: EASE }}
          >
            {project.name}
          </m.h3>

          {/* Description — fade */}
          <m.p
            className="font-body text-[15px] text-white/30 leading-relaxed max-w-120 mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={infoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          >
            {project.desc}
          </m.p>

          {/* Stats — camera focus bounce */}
          <m.div
            className="hidden sm:grid grid-cols-3 gap-3 mb-6"
            initial="hidden"
            animate={infoInView ? 'visible' : 'hidden'}
            variants={stagger(0.4, 0.1)}
          >
            {stats.map((stat) => (
              <m.div
                key={stat.label}
                variants={statChild}
                className="flex flex-col gap-1.5 p-3 lg:p-4 rounded-xl border border-white/4 bg-white/1.5 hover:border-white/8 transition-colors duration-300"
              >
                <span className="font-mono text-[8px] lg:text-[9px] text-white/20 uppercase tracking-widest">
                  {stat.label}
                </span>
                <span className="font-display font-bold text-base lg:text-lg text-white/80 tabular-nums">
                  {stat.value}
                </span>
              </m.div>
            ))}
          </m.div>

          {/* Result */}
          <m.div
            className="mb-5"
            initial={{ opacity: 0, y: 12 }}
            animate={infoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
          >
            <span className="font-mono text-[12px] font-medium text-white/50 tracking-wide uppercase">
              {project.result}
            </span>
          </m.div>

          {/* Tech tags — pop in */}
          <div className="flex items-center gap-5 mb-7">
            {project.tags.map((tag, tIdx) => (
              <m.span
                key={tag}
                className="font-mono text-[11px] text-white/25 tracking-wide hover:text-white/50 transition-colors duration-300"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={infoInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.6 + tIdx * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
              >
                {tag}
              </m.span>
            ))}
          </div>

          {/* CTA */}
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={infoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
          >
            <button
              type="button"
              onClick={scrollToCTA}
              aria-label={`Discuss a project like ${project.name}`}
              onMouseEnter={() => setCursorState('cta')}
              onMouseLeave={() => setCursorState('default')}
              className="group/link self-start cursor-none flex items-center gap-3 text-white/30 hover:text-white/70 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            >
              <span className="font-mono text-xs tracking-wider uppercase">View case study</span>
              <div className="w-8 h-8 rounded-full border border-white/8 flex items-center justify-center group-hover/link:border-white/18 transition-all duration-300">
                <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-px group-hover/link:-translate-y-px transition-transform duration-300" />
              </div>
            </button>
          </m.div>
        </div>
      </div>
    </div>
  )
}

export default function Work() {
  const { setCursorState } = useCursor()
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })

  return (
    <section
      className="relative w-full select-none overflow-hidden z-10 py-16 md:py-36 lg:py-44"
      style={{ background: '#050505' }}
    >
      {/* Spotlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[5%]"
          style={{
            width: '70%',
            maxWidth: '900px',
            height: '400px',
            background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(255,250,235,0.03) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.018] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      {/* Header — word-by-word */}
      <div ref={headerRef} className="w-full px-6 md:px-12 lg:px-30 mb-20 md:mb-28 lg:mb-36">
        <m.div
          className="h-px w-full mb-10 origin-left"
          style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.06) 50%, transparent)' }}
          initial={{ scaleX: 0 }}
          animate={headerInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.4, ease: EASE }}
        />

        <div className="flex flex-col gap-6">
          <m.span
            className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/50"
            initial={{ opacity: 0, y: 12 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          >
            Selected Projects
          </m.span>

          <m.h2
            className="font-display font-bold text-[clamp(32px,5vw,68px)] text-white/90 tracking-[-0.04em] leading-[0.97]"
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
          >
            Our work
          </m.h2>

          <m.p
            className="font-body text-[15px] md:text-[17px] text-white/30 max-w-130 leading-[1.7]"
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
          >
            Engineering-led builds for SaaS, mobile, and AI — shipped to production and scaled to real users.
          </m.p>
        </div>
      </div>

      {/* Projects with timeline dividers */}
      <div className="w-full px-6 md:px-12 lg:px-30">
        {projects.map((project, idx) => (
          <div key={project.id}>
            <ProjectRow project={project} index={idx} />
            {idx < projects.length - 1 && (
              <TimelineDivider number={projects[idx + 1].number} />
            )}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="w-full px-6 md:px-12 lg:px-30 mt-24 md:mt-32 lg:mt-40">
        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/6">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 sm:gap-10 md:gap-16">
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

            <button
              type="button"
              onClick={scrollToCTA}
              onMouseEnter={() => setCursorState('cta')}
              onMouseLeave={() => setCursorState('default')}
              className="group/btn cursor-none flex items-center gap-3 px-7 py-3 rounded-full border border-white/[0.07] hover:border-white/15 hover:bg-white/2 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            >
              <span className="font-mono text-[13px] text-white/35 group-hover/btn:text-white/60 tracking-[0.02em] transition-colors duration-300">
                Discuss your project
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-white/25 group-hover/btn:text-white/50 group-hover/btn:translate-x-0.5 transition-all duration-300" />
            </button>
          </div>
        </m.div>
      </div>
    </section>
  )
}
