'use client'
import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
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
    <motion.li
      ref={ref}
      className="flex gap-4 items-start group/item"
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      <motion.div
        className="w-1 h-1 rounded-full mt-2.5 shrink-0 bg-white/20 group-hover/item:bg-white/60 transition-all duration-300"
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ duration: 0.3, delay: delay - 0.05, ease: EASE }}
      />
      <span className="font-body text-[15px] text-white/30 leading-relaxed group-hover/item:text-white/60 transition-colors duration-300">
        {text}
      </span>
    </motion.li>
  )
}

function OutcomeCard({ work, delay, setCursorState }: { work: Service['works'][0]; delay: number; setCursorState: any }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      className="group/work relative flex flex-col gap-3 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] -mx-6 px-6 rounded-lg transition-colors duration-300 cursor-none"
      initial={{ opacity: 0, rotateY: 8, filter: 'blur(4px)' }}
      animate={inView ? { opacity: 1, rotateY: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.8, delay, ease: EASE }}
      style={{ perspective: '800px' }}
      onMouseEnter={() => setCursorState('hover')}
      onMouseLeave={() => setCursorState('default')}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-display font-semibold text-[16px] text-white/70 group-hover/work:text-white/90 transition-colors">{work.name}</h4>
        <span className="font-mono text-[9px] text-white/25 uppercase tracking-widest px-2 py-0.5 border border-white/[0.06] rounded-full group-hover/work:border-white/[0.12] transition-colors">
          {work.badge}
        </span>
      </div>
      <p className="font-body text-[14px] text-white/25 leading-relaxed">{work.desc}</p>
      <div className="flex items-center gap-2 mt-2">
        <div className="h-px w-6 bg-white/[0.08] group-hover/work:w-10 transition-all duration-500" />
        <span className="font-mono text-[10px] font-medium tracking-widest uppercase text-white/50">{work.result}</span>
      </div>
    </motion.div>
  )
}

export default function ServiceCard({ service, index, onDetailClick }: ServiceCardProps) {
  const { setCursorState } = useCursor()

  const wrapperRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const titleInView = useInView(titleRef, { once: true, margin: '-80px' })

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end start']
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.3])
  const yOffset = useTransform(scrollYProgress, [0, 1], [0, -30])
  const bgNumberY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%'])

  return (
    <div
      ref={wrapperRef}
      className="sticky top-0 w-full min-h-[70vh] flex items-center justify-center overflow-hidden py-12"
      style={{
        backgroundColor: '#050505',
        borderTop: '1px solid rgba(255,255,255,0.04)',
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

      {/* Background Phase Number — counter-scrolls for depth */}
      <motion.div
        className="absolute -right-[5%] top-1/2 font-display font-bold pointer-events-none select-none"
        style={{ fontSize: '30vw', opacity: 0.015, color: 'white', lineHeight: 0.8, y: bgNumberY, translateY: '-50%' }}
      >
        0{service.number}
      </motion.div>

      <motion.div
        style={{ scale, opacity, y: yOffset }}
        className="w-full h-full flex flex-col justify-center"
      >
        <div
          ref={titleRef}
          className="w-full px-6 md:px-12 lg:px-[120px] relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 relative">

            {/* Left Column: Title & Intro — slides in from left */}
            <div className="lg:col-span-4 flex flex-col z-10">
              <motion.div
                className="flex items-center gap-4 mb-6"
                initial={{ opacity: 0, x: -30 }}
                animate={titleInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              >
                <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/40">
                  Phase {service.number}
                </span>
                <motion.div
                  className="h-[1px] w-12 origin-left bg-white/10"
                  initial={{ scaleX: 0 }}
                  animate={titleInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
                />
              </motion.div>

              <motion.div
                className="mb-6"
                initial={{ opacity: 0, filter: 'blur(16px)', y: 20 }}
                animate={titleInView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
                transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
              >
                <h3 className="font-display font-bold text-[clamp(28px,3.5vw,48px)] text-white/90 tracking-[-0.03em] leading-[1]">
                  {service.name}
                </h3>
              </motion.div>

              <motion.p
                className="font-body text-[15px] md:text-[16px] text-white/30 leading-[1.7] mb-10 max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={titleInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
              >
                {service.tagline} {service.desc}
              </motion.p>

              <motion.div
                className="mt-auto"
                initial={{ opacity: 0, y: 16 }}
                animate={titleInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
              >
                <button
                  onClick={onDetailClick}
                  className="relative group/btn overflow-hidden rounded-full inline-block cursor-none"
                  onMouseEnter={() => setCursorState('cta')}
                  onMouseLeave={() => setCursorState('default')}
                >
                  <div className="absolute inset-0 border border-white/[0.07] rounded-full transition-all duration-300 group-hover/btn:bg-white group-hover/btn:border-white" />
                  <div className="relative flex items-center gap-2 px-7 py-3 font-semibold text-[13px] text-white/35 group-hover/btn:text-[#050505] tracking-[0.02em] transition-colors duration-300">
                    Explore Capabilities
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                  </div>
                </button>
              </motion.div>
            </div>

            {/* Middle Column: Capabilities — bullets type in one by one */}
            <div className="lg:col-span-4 flex flex-col mt-10 lg:mt-0 lg:pl-8 relative z-10">
              <motion.div
                className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-white/[0.04] origin-top"
                initial={{ scaleY: 0 }}
                animate={titleInView ? { scaleY: 1 } : {}}
                transition={{ duration: 1, delay: 0.3, ease: EASE }}
              />
              <motion.span
                className="font-mono text-[10px] text-white/20 tracking-wider uppercase mb-8 block border-b border-white/[0.04] pb-3"
                initial={{ opacity: 0 }}
                animate={titleInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
              >
                Core Capabilities
              </motion.span>
              <ul className="flex flex-col gap-6">
                {service.helps.map((help, i) => (
                  <CapabilityBullet key={i} text={help} delay={0.5 + i * 0.15} />
                ))}
              </ul>
            </div>

            {/* Right Column: Outcomes — cards flip in */}
            <div className="lg:col-span-4 flex flex-col mt-10 lg:mt-0 lg:pl-10 relative z-10">
              <motion.div
                className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-white/[0.04] origin-top"
                initial={{ scaleY: 0 }}
                animate={titleInView ? { scaleY: 1 } : {}}
                transition={{ duration: 1, delay: 0.5, ease: EASE }}
              />
              <motion.span
                className="font-mono text-[10px] text-white/20 tracking-[0.2em] uppercase mb-8 block border-b border-white/[0.04] pb-4"
                initial={{ opacity: 0 }}
                animate={titleInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
              >
                Proven Outcomes
              </motion.span>
              <div className="flex flex-col gap-6">
                {service.works.map((work, i) => (
                  <OutcomeCard key={i} work={work} delay={0.7 + i * 0.2} setCursorState={setCursorState} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
