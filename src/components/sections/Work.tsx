'use client'
import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useInView, type Variants } from 'framer-motion'
import { projects } from '@/data/projects'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { useCursor } from '../providers/CursorProvider'

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

const statChild: Variants = {
  hidden: { opacity: 0, scale: 1.3, filter: 'blur(8px)' },
  visible: {
    opacity: 1, scale: 1, filter: 'blur(0px)',
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
          className="relative w-[200px] sm:w-[220px] aspect-[9/19.5] rounded-[30px] border-[3px] border-white/[0.08] overflow-hidden"
          style={{
            background: '#0c0c0e',
            boxShadow: '0 40px 80px -20px rgba(255,255,255,0.03), 0 20px 40px rgba(0,0,0,0.6)',
          }}
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-[18px] bg-black rounded-full z-30 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white/[0.04] ring-1 ring-white/[0.06]" />
          </div>
          <div className="w-full h-full rounded-[27px] bg-[#111114] flex items-center justify-center">
            <span className="font-mono text-[8px] text-white/8 uppercase tracking-widest">Preview</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <div
        className="group/browser relative w-full aspect-[16/10] overflow-hidden flex flex-col rounded-xl"
        style={{
          background: '#0a0a0c',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 40px 80px -20px rgba(255,255,255,0.02), 0 24px 48px rgba(0,0,0,0.5)',
        }}
      >
        <div className="h-9 w-full bg-white/[0.01] border-b border-white/[0.04] flex items-center px-4 select-none shrink-0">
          <div className="flex gap-1.5">
            <div className="w-[6px] h-[6px] rounded-full bg-white/12" />
            <div className="w-[6px] h-[6px] rounded-full bg-white/8" />
            <div className="w-[6px] h-[6px] rounded-full bg-white/6" />
          </div>
          <div className="ml-3 h-[18px] flex-1 max-w-[140px] rounded bg-white/[0.03] flex items-center px-2">
            <span className="font-mono text-[7px] text-white/12" aria-hidden="true">lyptron.com/{project.id}</span>
          </div>
        </div>
        <div className="flex-1 w-full bg-[#0f0f11] flex items-center justify-center">
          <span className="font-mono text-[10px] text-white/8 uppercase tracking-widest">Preview</span>
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
      <motion.div
        className="h-px flex-1 origin-left"
        style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent)' }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, ease: EASE }}
      />
      <motion.span
        className="font-mono text-[10px] text-white/15 tracking-widest"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.8, ease: EASE }}
      >
        {number}
      </motion.span>
      <motion.div
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
        <motion.div
          style={{ y: mockupY }}
          className={isReversed ? 'lg:[direction:ltr]' : ''}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.85,
              rotateY: isReversed ? -8 : 8,
              filter: 'blur(12px)',
              x: isReversed ? 60 : -60,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
              rotateY: 0,
              filter: 'blur(0px)',
              x: 0,
            }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1.2, ease: EASE }}
            style={{ perspective: '1000px' }}
          >
            <DeviceMockup project={project} />
          </motion.div>
        </motion.div>

        {/* Info — typewriter sequence */}
        <div ref={infoRef} className={`flex flex-col ${isReversed ? 'lg:[direction:ltr]' : ''}`}>
          {/* Number */}
          <motion.div
            className="flex items-center gap-3 mb-5"
            initial={{ opacity: 0, x: isReversed ? 30 : -30 }}
            animate={infoInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <span className="font-mono text-[11px] font-medium tracking-[0.2em] text-white/40 uppercase">
              {project.number}
            </span>
            <motion.div
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
          </motion.div>

          {/* Name — blur reveal */}
          <motion.h3
            className="font-display font-bold text-[clamp(28px,4vw,52px)] text-white/90 tracking-[-0.03em] leading-[0.95] mb-4"
            initial={{ opacity: 0, filter: 'blur(16px)', y: 16 }}
            animate={infoInView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
            transition={{ duration: 1, delay: 0.15, ease: EASE }}
          >
            {project.name}
          </motion.h3>

          {/* Description — fade */}
          <motion.p
            className="font-body text-[15px] text-white/30 leading-relaxed max-w-[480px] mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={infoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          >
            {project.desc}
          </motion.p>

          {/* Stats — camera focus bounce */}
          <motion.div
            className="hidden sm:grid grid-cols-3 gap-3 mb-6"
            initial="hidden"
            animate={infoInView ? 'visible' : 'hidden'}
            variants={stagger(0.4, 0.1)}
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={statChild}
                className="flex flex-col gap-1.5 p-3 lg:p-4 rounded-xl border border-white/[0.04] bg-white/[0.015] hover:border-white/[0.08] transition-colors duration-300"
              >
                <span className="font-mono text-[8px] lg:text-[9px] text-white/20 uppercase tracking-widest">
                  {stat.label}
                </span>
                <span className="font-display font-bold text-base lg:text-lg text-white/80 tabular-nums">
                  {stat.value}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Result */}
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, y: 12 }}
            animate={infoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
          >
            <span className="font-mono text-[12px] font-medium text-white/50 tracking-wide uppercase">
              {project.result}
            </span>
          </motion.div>

          {/* Tech tags — pop in */}
          <div className="flex items-center gap-5 mb-7">
            {project.tags.map((tag, tIdx) => (
              <motion.span
                key={tag}
                className="font-mono text-[11px] text-white/25 tracking-wide hover:text-white/50 transition-colors duration-300"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={infoInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.6 + tIdx * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
              >
                {tag}
              </motion.span>
            ))}
          </div>

          {/* CTA */}
          <motion.div
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
              className="group/link self-start cursor-none flex items-center gap-3 text-white/30 hover:text-white/70 transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            >
              <span className="font-mono text-xs tracking-wider uppercase">View case study</span>
              <div className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center group-hover/link:border-white/[0.18] transition-all duration-300">
                <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-[1px] group-hover/link:-translate-y-[1px] transition-transform duration-300" />
              </div>
            </button>
          </motion.div>
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
      id="work"
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
      <div ref={headerRef} className="w-full px-6 md:px-12 lg:px-[120px] mb-20 md:mb-28 lg:mb-36">
        <motion.div
          className="h-px w-full mb-10 origin-left"
          style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.06) 50%, transparent)' }}
          initial={{ scaleX: 0 }}
          animate={headerInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.4, ease: EASE }}
        />

        <div className="flex flex-col gap-6">
          <motion.span
            className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/50"
            initial={{ opacity: 0, y: 12 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          >
            Selected Projects
          </motion.span>

          <motion.h2
            className="font-display font-bold text-[clamp(32px,5vw,68px)] text-white/90 tracking-[-0.04em] leading-[0.97]"
            initial={{ opacity: 0, filter: 'blur(16px)', y: 16 }}
            animate={headerInView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
          >
            Our work
          </motion.h2>

          <motion.p
            className="font-body text-[15px] md:text-[17px] text-white/30 max-w-[520px] leading-[1.7]"
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
          >
            Engineering-led builds for SaaS, mobile, and AI — shipped to production and scaled to real users.
          </motion.p>
        </div>
      </div>

      {/* Projects with timeline dividers */}
      <div className="w-full px-6 md:px-12 lg:px-[120px]">
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
      <div className="w-full px-6 md:px-12 lg:px-[120px] mt-24 md:mt-32 lg:mt-40">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/[0.06]">
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
              className="group/btn cursor-none flex items-center gap-3 px-7 py-3 rounded-full border border-white/[0.07] hover:border-white/[0.15] hover:bg-white/[0.02] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            >
              <span className="font-mono text-[13px] text-white/35 group-hover/btn:text-white/60 tracking-[0.02em] transition-colors duration-300">
                Discuss your project
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-white/25 group-hover/btn:text-white/50 group-hover/btn:translate-x-0.5 transition-all duration-300" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
