'use client'
import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { processSteps } from '@/data/process'

const EASE = [0.22, 1, 0.36, 1] as const

const PHASE_COLORS = [
  { accent: '#c0a060', tint: 'rgba(192,160,96,0.08)', glow: 'rgba(192,160,96,0.03)' },
  { accent: '#8ba4c0', tint: 'rgba(139,164,192,0.08)', glow: 'rgba(139,164,192,0.03)' },
  { accent: '#a0b090', tint: 'rgba(160,176,144,0.08)', glow: 'rgba(160,176,144,0.03)' },
  { accent: '#c09878', tint: 'rgba(192,152,120,0.08)', glow: 'rgba(192,152,120,0.03)' },
]

const TECH_LABELS = [
  ['User Mapping', 'Data Flows', 'Architecture'],
  ['Figma Specs', 'Design System', 'Prototypes'],
  ['TypeScript', 'API Layer', 'Performance'],
  ['CI/CD', 'Monitoring', 'Analytics'],
]

const TIMELINE = ['Week 1', 'Week 2–3', 'Week 3–6', 'Week 6–8']

const ICONS = [
  <svg key="discover" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>,
  <svg key="design" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  <svg key="develop" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  <svg key="launch" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="m12 15-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
]

function ProcessCard({ step, idx }: { step: typeof processSteps[0]; idx: number }) {
  const color = PHASE_COLORS[idx]
  const tech = TECH_LABELS[idx]
  const ref = useRef<HTMLDivElement>(null)
  const borderRef = useRef<SVGRectElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const isLeft = idx % 2 === 0

  const [borderPerimeter, setBorderPerimeter] = useState(0)

  useEffect(() => {
    const el = borderRef.current
    if (!el) return
    const measure = () => {
      try {
        setBorderPerimeter(2 * (el.width.baseVal.value + el.height.baseVal.value))
      } catch {
        // baseVal not available — leave the fallback dasharray in place.
      }
    }
    measure()
    // Recompute on resize so the dash animation stays in sync with the
    // actual SVG bounding box.
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      className={`relative w-[82vw] sm:w-[320px] md:w-[52%] ${isLeft ? 'md:mr-auto' : 'md:ml-auto'}`}
      initial={{ opacity: 0, y: 60, x: isLeft ? -50 : 50 }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 1, ease: EASE }}
    >
      <div className="relative p-8 md:p-10 overflow-hidden group">
        {/* Border trace SVG — draws clockwise on enter, using tint */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <rect
            ref={borderRef}
            x="0.5" y="0.5"
            width="calc(100% - 1px)" height="calc(100% - 1px)"
            fill="none"
            stroke={color.accent}
            strokeWidth="1"
            strokeOpacity={inView ? 0.12 : 0}
            strokeDasharray={borderPerimeter || 2000}
            strokeDashoffset={inView ? 0 : (borderPerimeter || 2000)}
            style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1), stroke-opacity 0.5s ease' }}
            rx="0"
          />
        </svg>

        {/* Background tint fill */}
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: `linear-gradient(160deg, ${color.glow} 0%, transparent 100%)`,
            opacity: inView ? 1 : 0,
          }}
        />

        {/* Top accent line — tinted */}
        <motion.div
          className="absolute top-0 left-0 h-[1px]"
          style={{ background: `linear-gradient(90deg, ${color.tint}, transparent)` }}
          initial={{ width: '0%' }}
          animate={inView ? { width: '100%' } : {}}
          transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Phase number + icon */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <motion.span
                className="font-display font-bold text-[56px] md:text-[64px] leading-none tracking-tighter"
                style={{ color: 'rgba(255,255,255,0.04)' }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
              >
                {step.number}
              </motion.span>
              <motion.div
                style={{ color: color.accent }}
                initial={{ opacity: 0, rotate: -20 }}
                animate={inView ? { opacity: 1, rotate: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
              >
                {ICONS[idx]}
              </motion.div>
            </div>
            <div className="flex flex-col items-end gap-1 mt-2">
              <motion.span
                className="font-mono text-[9px] tracking-[0.2em] uppercase"
                style={{ color: color.accent, opacity: 0.5 }}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 0.5 } : {}}
                transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
              >
                Phase {step.number}
              </motion.span>
              <motion.span
                className="font-mono text-[10px] tracking-wider text-white/20"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.7, ease: EASE }}
              >
                {TIMELINE[idx]}
              </motion.span>
            </div>
          </div>

          {/* Title */}
          <motion.h3
            className="font-display font-bold text-[24px] md:text-[30px] text-white/90 tracking-[-0.02em] leading-tight mb-4 group-hover:text-white transition-colors duration-300"
            initial={{ opacity: 0, filter: 'blur(12px)', y: 12 }}
            animate={inView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
            transition={{ duration: 1, delay: 0.4, ease: EASE }}
          >
            {step.title}
          </motion.h3>

          {/* Description */}
          <motion.p
            className="font-body text-[14px] md:text-[15px] text-white/25 leading-[1.7] mb-8 max-w-[440px] group-hover:text-white/35 transition-colors duration-300"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
          >
            {step.desc}
          </motion.p>

          {/* Tech tags */}
          <motion.div
            className="flex flex-wrap gap-4 mb-8"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.65, ease: EASE }}
          >
            {tech.map((tag) => (
              <span key={tag} className="font-mono text-[10px] tracking-wider uppercase" style={{ color: `${color.accent}70` }}>
                {tag}
              </span>
            ))}
          </motion.div>

          {/* Divider */}
          <motion.div
            className="h-px w-full mb-6 origin-left"
            style={{ background: `${color.accent}15` }}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
          />

          {/* Deliverables — dots appear first, text slides in */}
          <div>
            <motion.span
              className="font-mono text-[9px] block mb-4 uppercase tracking-[0.15em] text-white/15"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.75, ease: EASE }}
            >
              Deliverables
            </motion.span>
            <ul className="flex flex-col gap-3">
              {step.details.map((detail, dIdx) => (
                <li key={dIdx} className="flex gap-3 items-start">
                  <motion.div
                    className="w-1.5 h-1.5 mt-1.5 shrink-0"
                    style={{ backgroundColor: `${color.accent}50` }}
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.8 + dIdx * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                  />
                  <motion.span
                    className="font-body text-[13px] text-white/25 leading-snug"
                    initial={{ opacity: 0, x: 16 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.85 + dIdx * 0.1, ease: EASE }}
                  >
                    {detail}
                  </motion.span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StepConnector({ fromIdx }: { fromIdx: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const fromColor = PHASE_COLORS[fromIdx]
  const toColor = PHASE_COLORS[fromIdx + 1]
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div ref={ref} className="relative w-full py-6 md:py-10 z-20 hidden md:block">
      <div className="relative flex items-center justify-center h-[80px]">
        {/* Vertical dashed line */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-px h-full origin-top"
          style={{
            background: `linear-gradient(180deg, ${fromColor.accent}20, ${toColor.accent}20)`,
          }}
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 0.8, ease: EASE }}
        />

        {/* Center node */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${fromColor.accent}, ${toColor.accent})`,
              opacity: 0.3,
              boxShadow: `0 0 12px ${fromColor.accent}20`,
            }}
          />
        </motion.div>

        {/* Horizontal arms extending to card edges */}
        <motion.div
          className="absolute top-0 left-1/2 h-px"
          style={{
            width: '24%',
            background: `linear-gradient(90deg, transparent, ${fromColor.accent}15)`,
            transformOrigin: 'left center',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={inView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        />
        <motion.div
          className="absolute top-0 right-1/2 h-px"
          style={{
            width: '24%',
            background: `linear-gradient(270deg, transparent, ${fromColor.accent}15)`,
            transformOrigin: 'right center',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={inView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        />

        <motion.div
          className="absolute bottom-0 left-1/2 h-px"
          style={{
            width: '24%',
            background: `linear-gradient(90deg, transparent, ${toColor.accent}15)`,
            transformOrigin: 'left center',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={inView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
        />
        <motion.div
          className="absolute bottom-0 right-1/2 h-px"
          style={{
            width: '24%',
            background: `linear-gradient(270deg, transparent, ${toColor.accent}15)`,
            transformOrigin: 'right center',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={inView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
        />
      </div>
    </div>
  )
}

export default function Process() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const glowY = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 md:py-36 select-none overflow-hidden z-10"
      style={{ background: '#050505' }}
    >
      {/* Background glow */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-[700px] h-[700px] pointer-events-none"
        style={{
          y: glowY,
          background: 'radial-gradient(ellipse at center, rgba(255,250,235,0.02) 0%, transparent 70%)',
          top: '20%',
        }}
      />

      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.018] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      <div className="relative z-10 w-full px-6 md:px-12 lg:px-[120px]">

        {/* Header — word-by-word */}
        <div ref={headerRef} className="mb-20 md:mb-28">
          <motion.div
            className="h-px w-full mb-10 origin-left"
            style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.06) 50%, transparent)' }}
            initial={{ scaleX: 0 }}
            animate={headerInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.4, ease: EASE }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-end">
            <div className="flex flex-col gap-6">
              <motion.span
                className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/50"
                initial={{ opacity: 0, y: 12 }}
                animate={headerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              >
                Our Process
              </motion.span>

              <h2 className="font-display font-bold text-[clamp(28px,5vw,68px)] leading-[0.97] tracking-[-0.04em]">
                <motion.span
                  className="text-white/90 inline-block"
                  initial={{ opacity: 0, filter: 'blur(16px)', y: 16 }}
                  animate={headerInView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
                  transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
                >
                  From idea{' '}
                </motion.span>
                <motion.span
                  className="text-white/35 inline-block"
                  initial={{ opacity: 0, filter: 'blur(16px)', y: 16 }}
                  animate={headerInView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
                  transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
                >
                  to production{' '}
                </motion.span>
                <motion.span
                  className="text-white/90 inline-block"
                  initial={{ opacity: 0, filter: 'blur(16px)', y: 16 }}
                  animate={headerInView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
                  transition={{ duration: 1.2, delay: 0.8, ease: EASE }}
                >
                  in four phases.
                </motion.span>
              </h2>
            </div>

            <motion.p
              className="font-body text-[15px] md:text-[17px] text-white/30 leading-[1.7] max-w-[480px] lg:text-right lg:ml-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
            >
              A structured, milestone-driven approach. Every step is scoped, tested, and delivered with transparency — so you always know where your product stands.
            </motion.p>
          </div>
        </div>

        {/* Zigzag cards with scroll-linked S-connectors */}
        <div className="flex flex-row overflow-x-auto snap-x snap-mandatory scrollbar-none gap-5 pb-6 px-6 md:px-0 md:flex-col">
          {processSteps.map((step, idx) => (
            <div key={step.number} className="shrink-0 snap-center w-auto md:w-full">
              <ProcessCard step={step} idx={idx} />
              {idx < processSteps.length - 1 && (
                <StepConnector fromIdx={idx} />
              )}
            </div>
          ))}
        </div>

        {/* Bottom summary */}
        <motion.div
          className="mt-20 md:mt-28"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="h-px w-full mb-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.06) 85%, transparent)' }} />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex gap-8 md:gap-12">
              {PHASE_COLORS.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5" style={{ backgroundColor: c.accent, opacity: 0.2 }} />
                  <span className="font-mono text-[10px] text-white/20 uppercase tracking-wider">{TIMELINE[i]}</span>
                </div>
              ))}
            </div>
            <p className="font-body text-[13px] text-white/20 text-center sm:text-right">
              Average delivery: 4–8 weeks from kickoff to launch.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
