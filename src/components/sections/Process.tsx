'use client'
import { useRef } from 'react'
import { m, useInView, useScroll, useTransform } from 'framer-motion'
import { processSteps } from '@/data/process'

const EASE = [0.22, 1, 0.36, 1] as const

const META = [
  {
    color: '#b09858',
    tools: ['User Mapping', 'Data Flows', 'Architecture'],
    outcome: 'Signed scope document, technical blueprint, and delivery timeline.',
    why: 'Scope changes mid-development cost 5–10× more than changes made here.',
  },
  {
    color: '#7a9ab8',
    tools: ['Figma', 'Design System', 'Prototypes'],
    outcome: 'Clickable prototype and component library, ready for stakeholder sign-off.',
    why: 'A prototype lets every stakeholder see the product before a single line of code ships.',
  },
  {
    color: '#7aaa68',
    tools: ['TypeScript', 'API Layer', 'Performance'],
    outcome: 'Fully tested, production-grade codebase deployed to staging.',
    why: 'Clean, typed code means your team can extend it years from now without rewrites.',
  },
  {
    color: '#b08870',
    tools: ['CI/CD', 'Monitoring', 'Analytics'],
    outcome: 'Live product with zero-downtime pipeline, monitoring, docs, and 30-day support.',
    why: 'We hand over ownership — not just code. You run it confidently from day one.',
  },
]

// Narrative bridge sentences between phases — the "story spine"
const STORY_BEATS = [
  { text: 'Then, with a clear blueprint in hand, we design.', fromColor: '#b09858', toColor: '#7a9ab8' },
  { text: 'Designs approved. The build begins.', fromColor: '#7a9ab8', toColor: '#7aaa68' },
  { text: 'The code is clean, tested, battle-hardened.', fromColor: '#7aaa68', toColor: '#b08870' },
]

const STATS = [
  { value: '4', label: 'Phases' },
  { value: '4–8', label: 'Weeks avg.' },
  { value: '20+', label: 'Deliverables' },
  { value: '100%', label: 'Transparent' },
]

// ── Narrative connector between phases ──────────────────────────────
function StoryBeat({ beat }: { beat: typeof STORY_BEATS[0] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })

  return (
    <div ref={ref} className="flex flex-col items-center py-12 md:py-16">
      {/* Vertical drop from above */}
      <m.div
        className="w-px origin-top"
        style={{ height: 40, background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(249,115,22,0.55))' }}
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 0.55, ease: EASE }}
      />

      {/* Row: left arm ── blue dot ── right arm */}
      <div className="relative flex items-center w-full my-1">
        <m.div
          className="flex-1 h-px origin-right"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.35))' }}
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
        />
        {/* Blue node */}
        <m.div
          className="relative z-10 mx-3 shrink-0"
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: 'rgba(249,115,22,1)',
              boxShadow: '0 0 0 4px rgba(249,115,22,0.18), 0 0 20px rgba(249,115,22,0.65), 0 0 48px rgba(249,115,22,0.28)',
            }}
          />
        </m.div>
        <m.div
          className="flex-1 h-px origin-left"
          style={{ background: 'linear-gradient(90deg, rgba(249,115,22,0.35), transparent)' }}
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
        />
      </div>

      {/* Vertical drop to below */}
      <m.div
        className="w-px origin-top"
        style={{ height: 40, background: 'linear-gradient(180deg, rgba(249,115,22,0.55), rgba(255,255,255,0.04))' }}
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 0.55, delay: 0.55, ease: EASE }}
      />

      {/* Narrative text */}
      <m.p
        className="font-body text-[14px] md:text-[15px] italic text-center mt-5 leading-relaxed"
        style={{ color: 'rgba(251,146,60,0.72)' }}
        initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
        animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
        transition={{ duration: 1.0, delay: 0.65, ease: EASE }}
      >
        {beat.text}
      </m.p>
    </div>
  )
}

// ── Individual phase row ─────────────────────────────────────────────
function PhaseRow({ step, meta, index }: {
  step: typeof processSteps[0]
  meta: typeof META[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <div ref={ref} className="relative">
      {/* Top divider — draws in when row enters */}
      <m.div
        className="h-px w-full origin-left"
        style={{ background: `linear-gradient(90deg, ${meta.color}35, rgba(255,255,255,0.06) 40%, transparent)` }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, ease: EASE }}
      />

      {/* Ghost chapter number — far right, behind content */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 font-display font-bold pointer-events-none select-none leading-none"
        style={{
          fontSize: 'clamp(120px, 16vw, 220px)',
          color: 'rgba(255,255,255,0.022)',
          letterSpacing: '-0.04em',
          opacity: inView ? 1 : 0,
          transition: 'opacity 1.2s ease 0.4s',
        }}
      >
        {step.number}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-10 py-14 md:py-20 relative">

        {/* ── Left column ── */}
        <div className="lg:col-span-4 flex flex-col pb-10 lg:pb-0 lg:pr-10 lg:border-r lg:border-white/5">

          {/* Phase label */}
          <m.span
            className="font-mono text-[10px] tracking-[0.24em] uppercase text-white/25 block mb-7"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          >
            Phase {step.number}
          </m.span>

          {/* Phase title — cinematic blur reveal */}
          <m.h3
            className="font-display font-bold tracking-[-0.035em] leading-[1.02] text-white/92 mb-8"
            style={{ fontSize: 'clamp(28px, 3vw, 44px)' }}
            initial={{ opacity: 0, y: 28, filter: 'blur(14px)', scale: 0.97 }}
            animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 } : {}}
            transition={{ duration: 1.0, delay: 0.2, ease: EASE }}
          >
            {step.title}
          </m.h3>

          {/* Output box — left color accent */}
          <m.div
            className="mb-8 pl-4"
            style={{ borderLeft: `2px solid ${meta.color}40` }}
            initial={{ opacity: 0, x: -14 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.38, ease: EASE }}
          >
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: `${meta.color}75` }}>
              Output
            </p>
            <p className="font-body text-[13px] text-white/52 leading-[1.75]">
              {meta.outcome}
            </p>
          </m.div>

          {/* Tool tags */}
          <m.div
            className="flex flex-wrap gap-x-5 gap-y-2 mt-auto"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.55, ease: EASE }}
          >
            {meta.tools.map((tool) => (
              <span
                key={tool}
                className="font-mono text-[9px] tracking-[0.16em] uppercase"
                style={{ color: `${meta.color}50` }}
              >
                {tool}
              </span>
            ))}
          </m.div>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-8 lg:pl-4 flex flex-col gap-10">

          {/* Description — written-on feel */}
          <m.p
            className="font-body text-[16px] md:text-[17px] text-white/55 leading-[1.9] max-w-2xl"
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          >
            {step.desc}
          </m.p>

          {/* Deliverables — cascade in */}
          <m.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.48, ease: EASE }}
          >
            <span className="font-mono text-[9px] text-white/20 tracking-[0.24em] uppercase block mb-5">
              Deliverables
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
              {step.details.map((detail, i) => (
                <m.div
                  key={i}
                  className="flex items-start gap-3 py-3 border-b border-white/[0.04]"
                  style={{ borderBottomColor: i >= step.details.length - 2 ? 'transparent' : undefined }}
                  initial={{ opacity: 0, x: 16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.55, delay: 0.58 + i * 0.08, ease: EASE }}
                >
                  <div
                    className="w-1 h-1 rounded-full mt-[10px] shrink-0"
                    style={{ backgroundColor: `${meta.color}70` }}
                  />
                  <span className="font-body text-[13.5px] text-white/50 leading-snug">
                    {detail}
                  </span>
                </m.div>
              ))}
            </div>
          </m.div>

          {/* Why it matters — final beat, delayed for drama */}
          <m.div
            className="flex items-start gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 1.1, ease: EASE }}
          >
            <div
              className="w-5 h-px shrink-0 mt-[11px]"
              style={{ backgroundColor: `${meta.color}45` }}
            />
            <div>
              <span
                className="font-mono text-[9px] tracking-[0.2em] uppercase block mb-1.5"
                style={{ color: `${meta.color}60` }}
              >
                Why it matters
              </span>
              <p className="font-body text-[13px] text-white/30 leading-[1.8] italic max-w-lg">
                {meta.why}
              </p>
            </div>
          </m.div>
        </div>
      </div>
    </div>
  )
}

// ── Section ──────────────────────────────────────────────────────────
export default function Process() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef  = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 80%', 'end 20%'] })
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  // Tip: small glowing bead that rides the front of the fill line
  const tipY    = useTransform(scrollYProgress, [0, 1], ['-4px', 'calc(100% - 4px)'])
  const tipGlow = useTransform(scrollYProgress, [0, 0.02, 0.97, 1.0], [0, 1, 1, 0])

  // Dot opacity — smoothly brightens as the line arrives, stays bright
  // Window is wide (~0.10) so the transition feels gradual, not a snap
  const dot0Opacity = useTransform(scrollYProgress, [0.00, 0.10], [0.15, 1.0])
  const dot1Opacity = useTransform(scrollYProgress, [0.28, 0.40], [0.15, 1.0])
  const dot2Opacity = useTransform(scrollYProgress, [0.58, 0.70], [0.15, 1.0])
  const dot3Opacity = useTransform(scrollYProgress, [0.86, 0.98], [0.15, 1.0])
  const dotOpacities = [dot0Opacity, dot1Opacity, dot2Opacity, dot3Opacity]


  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 md:py-40 select-none overflow-hidden z-10"
      style={{ background: '#050505' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 65% 50% at 50% 18%, rgba(255,248,230,0.02) 0%, transparent 60%)' }}
      />

      {/* Noise */}
      <div
        className="absolute inset-0 opacity-[0.016] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
      />

      <div className="relative z-10 flex">

        {/* ── Scroll progress spine ── */}
        <div className="hidden lg:flex flex-col items-center w-14 shrink-0 pt-32 pb-20 ml-6 xl:ml-12">
          <div className="relative flex-1 w-px" style={{ background: 'rgba(255,255,255,0.07)' }}>

            {/* Fill — uniform bright white, grows from top */}
            <m.div
              className="absolute top-0 left-0 right-0 origin-top"
              style={{
                height: lineHeight,
                background: 'rgba(255,255,255,0.88)',
                boxShadow: '0 0 6px rgba(255,255,255,0.5)',
              }}
            />

            {/* Travelling bead — rides the tip of the fill */}
            <m.div
              className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full pointer-events-none"
              style={{
                top: tipY,
                opacity: tipGlow,
                background: 'white',
                boxShadow: '0 0 8px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)',
              }}
            />

            {/* Phase dots — smoothly brighten as the fill line reaches them */}
            {[0, 1, 2, 3].map((i) => (
              <m.div
                key={i}
                className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
                style={{
                  top: `calc(${i * 33.3}% - 5px)`,
                  x: '-50%',
                  backgroundColor: 'rgb(59,130,246)',
                  opacity: dotOpacities[i],
                  // glow driven by the same scroll window — interpolated inline
                  boxShadow: `0 0 0 2px rgba(59,130,246,0.15), 0 0 10px rgba(59,130,246,0.6), 0 0 22px rgba(59,130,246,0.3)`,
                  transition: 'box-shadow 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 px-6 md:px-12 lg:px-16 xl:px-20 min-w-0">

          {/* ── Header ── */}
          <div ref={headerRef} className="mb-16 md:mb-24">
            <m.div
              className="h-px w-full origin-left mb-10"
              style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05) 60%, transparent)' }}
              initial={{ scaleX: 0 }}
              animate={headerInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, ease: EASE }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-end mb-14">
              <div>
                <m.span
                  className="font-mono text-[11px] tracking-[0.26em] uppercase text-white/40 block mb-6"
                  initial={{ opacity: 0 }}
                  animate={headerInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
                >
                  Our Process
                </m.span>

                <h2
                  className="font-display font-bold tracking-[-0.04em] leading-[0.95]"
                  style={{ fontSize: 'clamp(32px, 5.5vw, 72px)' }}
                >
                  <m.span
                    className="text-white/90 inline-block"
                    initial={{ opacity: 0, y: 22, filter: 'blur(14px)' }}
                    animate={headerInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
                  >
                    From idea
                  </m.span>{' '}
                  <m.span
                    className="text-white/25 inline-block"
                    initial={{ opacity: 0, y: 22, filter: 'blur(14px)' }}
                    animate={headerInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{ duration: 1.1, delay: 0.4, ease: EASE }}
                  >
                    to production
                  </m.span>
                  <br />
                  <m.span
                    className="text-white/90 inline-block"
                    initial={{ opacity: 0, y: 22, filter: 'blur(14px)' }}
                    animate={headerInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{ duration: 1.1, delay: 0.6, ease: EASE }}
                  >
                    in four phases.
                  </m.span>
                </h2>
              </div>

              <m.p
                className="font-body text-[15px] md:text-[17px] text-white/32 leading-[1.8] max-w-sm lg:ml-auto lg:text-right"
                initial={{ opacity: 0, y: 16 }}
                animate={headerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
              >
                A structured, milestone-driven approach. Every step is scoped, tested, and delivered with full transparency — so you always know where your product stands.
              </m.p>
            </div>

            {/* Stats strip */}
            <m.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-px border border-white/6"
              initial={{ opacity: 0, y: 14 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
            >
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="px-6 py-5 flex flex-col gap-1"
                  style={{ background: 'rgba(255,255,255,0.014)' }}
                >
                  <span className="font-display font-bold text-[28px] md:text-[34px] text-white/80 tracking-[-0.03em] leading-none">
                    {stat.value}
                  </span>
                  <span className="font-mono text-[9px] text-white/26 tracking-[0.2em] uppercase">
                    {stat.label}
                  </span>
                </div>
              ))}
            </m.div>
          </div>

          {/* ── Phases with story beats between them ── */}
          <div>
            {processSteps.map((step, i) => (
              <div key={step.number}>
                <PhaseRow step={step} meta={META[i]} index={i} />
                {i < processSteps.length - 1 && (
                  <StoryBeat beat={STORY_BEATS[i]} />
                )}
              </div>
            ))}
            {/* Closing divider */}
            <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* ── Closing line ── */}
          <m.div
            className="mt-16 md:mt-20 flex justify-end"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <p className="font-body text-[13px] text-white/20">
              Average delivery: 4–8 weeks from kickoff to launch.
            </p>
          </m.div>

        </div>
      </div>
    </section>
  )
}
