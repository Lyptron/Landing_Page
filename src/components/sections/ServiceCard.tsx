'use client'
import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { m, useInView, useScroll, useTransform } from 'framer-motion'
import { Service } from '@/types'
import { useCursor } from '../providers/CursorProvider'
import { ArrowRight } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

const CARD_ACCENTS = [
  'radial-gradient(ellipse 60% 60% at 100% 100%, rgba(29,126,245,0.04) 0%, transparent 70%)',
  'radial-gradient(ellipse 60% 60% at 0% 100%, rgba(139,92,246,0.04) 0%, transparent 70%)',
  'radial-gradient(ellipse 60% 60% at 100% 0%, rgba(34,197,94,0.035) 0%, transparent 70%)',
  'radial-gradient(ellipse 60% 60% at 0% 0%, rgba(236,72,153,0.035) 0%, transparent 70%)',
  'radial-gradient(ellipse 60% 60% at 100% 100%, rgba(249,115,22,0.035) 0%, transparent 70%)',
  'radial-gradient(ellipse 60% 60% at 0% 100%, rgba(192,160,96,0.04) 0%, transparent 70%)',
]

interface ServiceCardProps {
  service: Service
  index: number
  onDetailClick: () => void
}

function CapabilityBullet({ text, delay }: { text: string; delay: number }) {
  const ref = useRef<HTMLLIElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <m.li
      ref={ref}
      className="flex gap-4 items-start group/item"
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      <m.div
        className="w-1 h-1 rounded-full mt-2.5 shrink-0 bg-white/30 group-hover/item:bg-white/70 transition-all duration-300"
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ duration: 0.3, delay: delay - 0.05, ease: EASE }}
      />
      <span className="font-body text-[15px] text-white/62 leading-relaxed group-hover/item:text-white/85 transition-colors duration-300">
        {text}
      </span>
    </m.li>
  )
}

function OutcomeCard({ work, delay, setCursorState }: { work: Service['works'][0]; delay: number; setCursorState: any }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <m.div
      ref={ref}
      className="group/work relative flex flex-col gap-2 py-5 pl-4 border-b border-white/8 last:border-0 cursor-none transition-all duration-300"
      style={{ borderLeft: '2px solid rgba(96,165,250,0.18)' }}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: EASE }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderLeftColor = 'rgba(96,165,250,0.55)'
        setCursorState('hover')
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderLeftColor = 'rgba(96,165,250,0.18)'
        setCursorState('default')
      }}
    >
      {/* Project name + badge */}
      <div className="flex items-center gap-3">
        <h4 className="font-display font-bold text-[17px] text-white/90 group-hover/work:text-white transition-colors duration-200 tracking-[-0.01em]">
          {work.name}
        </h4>
        <span className="font-mono text-[9px] text-white/45 uppercase tracking-widest">
          {work.badge}
        </span>
      </div>

      {/* Description */}
      <p className="font-body text-[13px] text-white/52 leading-relaxed">{work.desc}</p>

      {/* Result — blue-tinted stat */}
      <p
        className="font-display font-bold text-[15px] tracking-[-0.01em] mt-1 transition-colors duration-200"
        style={{ color: 'rgba(147,197,253,0.85)' }}
      >
        {work.result}
      </p>
    </m.div>
  )
}

export default function ServiceCard({ service, index, onDetailClick }: ServiceCardProps) {
  const { setCursorState } = useCursor()

  const wrapperRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const titleInView = useInView(titleRef, { once: true, margin: '-80px' })

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end start']
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, isMobile ? 1 : 0.92])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, isMobile ? 1 : 0.3])
  const yOffset = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 0 : -30])
  const bgNumberY = useTransform(scrollYProgress, [0, 1], ['0%', isMobile ? '0%' : '-20%'])

  return (
    <div
      ref={wrapperRef}
      className="relative md:sticky md:top-0 w-[85vw] sm:w-90 md:w-full shrink-0 snap-center min-h-fit md:min-h-[70vh] flex items-center justify-center overflow-hidden py-8 md:py-16"
      style={{
        backgroundColor: '#050505',
        borderTop: isMobile ? 'none' : '1px solid rgba(255,255,255,0.04)',
        zIndex: index
      }}
    >
      {/* Spotlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[15%]"
          style={{
            width: '60%',
            maxWidth: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(255,250,235,0.025) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Color accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: CARD_ACCENTS[index % CARD_ACCENTS.length] }}
      />

      {/* Background Phase Number — centered, counter-scrolls for depth */}
      <m.div
        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-display font-bold pointer-events-none select-none text-[22vw] md:text-[30vw] text-center"
        style={{ lineHeight: 0.8, y: bgNumberY, willChange: 'transform' }}
      >
        {/* 00 — barely visible */}
        <span style={{ color: 'rgba(255,255,255,0.06)' }}>0{service.number.slice(0, -1)}</span>
        {/* 1–6 — semi-transparent white with soft outer glow only */}
        <span style={{
          color: 'rgba(255,255,255,0.28)',
          textShadow: '0 0 70px rgba(255,255,255,0.22), 0 0 150px rgba(255,255,255,0.12), 0 0 280px rgba(255,255,255,0.06)',
        }}>{service.number.slice(-1)}</span>
      </m.div>

      <m.div
        style={{ scale, opacity, y: yOffset, willChange: 'transform, opacity' }}
        className="w-full h-full flex flex-col justify-center"
      >
        <div
          ref={titleRef}
          className="w-full px-6 md:px-12 lg:px-30 relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 relative">

            {/* Left Column: Title & Intro */}
            <div className="lg:col-span-4 flex flex-col z-10">
              <m.div
                className="flex items-center gap-4 mb-6"
                initial={{ opacity: 0, x: -30 }}
                animate={titleInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              >
                <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/55">
                  Phase {service.number}
                </span>
                <m.div
                  className="h-px w-12 origin-left bg-white/15"
                  initial={{ scaleX: 0 }}
                  animate={titleInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
                />
              </m.div>

              <m.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={titleInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
              >
                <h3 className="font-display font-bold text-[clamp(28px,3.5vw,48px)] text-white/95 tracking-[-0.03em] leading-none">
                  {service.name}
                </h3>
              </m.div>

              <m.p
                className="font-body text-[15px] md:text-[16px] text-white/45 leading-[1.7] mb-10 max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={titleInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
              >
                {service.tagline} {service.desc}
              </m.p>

              {service.url && (
                <m.div
                  className="mt-auto"
                  initial={{ opacity: 0, y: 16 }}
                  animate={titleInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
                >
                  <Link
                    href={service.url}
                    className="relative group/btn overflow-hidden rounded-full inline-block cursor-none"
                    onMouseEnter={() => setCursorState('cta')}
                    onMouseLeave={() => setCursorState('default')}
                  >
                    <div className="absolute inset-0 border border-white/12 rounded-full transition-all duration-300 group-hover/btn:bg-white group-hover/btn:border-white" />
                    <div className="relative flex items-center gap-2 px-7 py-3 font-semibold text-[13px] text-white/60 group-hover/btn:text-bg tracking-[0.02em] transition-colors duration-300">
                      View how we develop this
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                    </div>
                  </Link>
                </m.div>
              )}
            </div>

            {/* Middle Column: Capabilities */}
            <div className="lg:col-span-4 flex flex-col mt-10 lg:mt-0 lg:pl-8 relative z-10">
              <m.div
                className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-white/6 origin-top"
                initial={{ scaleY: 0 }}
                animate={titleInView ? { scaleY: 1 } : {}}
                transition={{ duration: 1, delay: 0.3, ease: EASE }}
              />
              <m.span
                className="font-mono text-[10px] text-white/50 tracking-wider uppercase mb-8 block border-b border-white/10 pb-3"
                initial={{ opacity: 0 }}
                animate={titleInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
              >
                Core Capabilities
              </m.span>
              <ul className="flex flex-col gap-6">
                {service.helps.map((help, i) => (
                  <CapabilityBullet key={i} text={help} delay={0.5 + i * 0.15} />
                ))}
              </ul>
            </div>

            {/* Right Column: Outcomes */}
            <div className="lg:col-span-4 flex flex-col mt-10 lg:mt-0 lg:pl-10 relative z-10">

              {/* Blue ambient glow behind this column */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 100% 70% at 60% 40%, rgba(59,130,246,0.07) 0%, transparent 70%)' }}
              />

              <m.div
                className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-white/6 origin-top"
                initial={{ scaleY: 0 }}
                animate={titleInView ? { scaleY: 1 } : {}}
                transition={{ duration: 1, delay: 0.5, ease: EASE }}
              />
              <m.span
                className="font-mono text-[10px] text-white/50 tracking-[0.2em] uppercase mb-8 block border-b border-white/10 pb-4"
                initial={{ opacity: 0 }}
                animate={titleInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
              >
                Proven Outcomes
              </m.span>
              <div className="flex flex-col gap-6">
                {service.works.map((work, i) => (
                  <OutcomeCard key={i} work={work} delay={0.7 + i * 0.2} setCursorState={setCursorState} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </m.div>
    </div>
  )
}
