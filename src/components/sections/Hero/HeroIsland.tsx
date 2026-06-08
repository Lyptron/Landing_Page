'use client'
import { motion } from 'framer-motion'
import CountUp from '../../ui/CountUp'

const STAGGER = 0.15
const EASE = [0.16, 1, 0.3, 1] as const

function AnimatedWord({ children, delay, className, style }: {
  children: React.ReactNode
  delay: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span className="inline-block overflow-hidden pb-4 -mb-4">
      <motion.span
        className={`inline-block ${className || ''}`}
        style={style}
        initial={{ y: '120%', opacity: 0, rotateZ: 2 }}
        animate={{ y: '0%', opacity: 1, rotateZ: 0 }}
        transition={{ duration: 1.4, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

const STATS = [
  { end: 50, suffix: '+', label: 'Projects Shipped' },
  { end: 100, suffix: '%', label: 'Lighthouse Score' },
  { end: 24, suffix: 'h', label: 'Support Response' },
]

const VALUE_PROPS = [
  'Ship faster with a dedicated product team',
  'Enterprise-grade code, startup-speed delivery',
  'One partner for design, engineering & growth',
]

export default function HeroIsland() {
  return (
    <div className="flex flex-col select-none relative z-10 w-full text-left px-0 lg:pr-10">

      {/* Badge */}
      <motion.div className="mb-8"
        initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: EASE }}>
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md"
             style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.2)' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" style={{ boxShadow: '0 0 8px rgba(255,255,255,0.4)' }}></span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
            Accepting New Projects
          </span>
        </div>
      </motion.div>

      {/* Headline */}
      <h1 className="font-display font-black flex flex-col uppercase tracking-tight leading-[0.88] mb-6">
        <span className="text-[8vw] sm:text-[6.5vw] md:text-[5.5vw] lg:text-[52px] xl:text-[62px] text-white/85">
          <AnimatedWord delay={0.3}>WE</AnimatedWord>{' '}
          <AnimatedWord delay={0.3 + STAGGER}>BUILD</AnimatedWord>
        </span>

        <span className="text-[10vw] sm:text-[8vw] md:text-[7vw] lg:text-[68px] xl:text-[82px] my-1 md:my-2" style={{ filter: 'drop-shadow(0 0 60px rgba(255,255,255,0.3))' }}>
          <AnimatedWord delay={0.3 + STAGGER * 2} className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-white to-gray-500">
            PRODUCTS
          </AnimatedWord>
        </span>

        <span className="text-[8vw] sm:text-[6.5vw] md:text-[5.5vw] lg:text-[52px] xl:text-[62px] text-white/85">
          <AnimatedWord delay={0.3 + STAGGER * 3}>THAT</AnimatedWord>{' '}
          <AnimatedWord delay={0.3 + STAGGER * 4}>GROW<span className="text-white/25">.</span></AnimatedWord>
        </span>
      </h1>

      {/* Subtitle */}
      <motion.p className="font-body text-[15px] md:text-[17px] text-white/40 max-w-lg mb-8 leading-relaxed tracking-wide"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.0, ease: EASE }}>
        Your next hire isn&apos;t a developer — it&apos;s an entire product studio. We design, engineer, and launch web apps, SaaS platforms, and AI products that drive real revenue.
      </motion.p>

      {/* Value Props */}
      <motion.div className="flex flex-col gap-3 mb-10"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.1, ease: EASE }}>
        {VALUE_PROPS.map((prop, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.2 + i * 0.12, ease: EASE }}
          >
            <div className="w-[5px] h-[5px] rounded-full bg-white/30 shrink-0" />
            <span className="font-body text-[13px] md:text-[14px] text-white/35">{prop}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* CTAs */}
      <motion.div className="flex flex-col sm:flex-row items-start gap-4 mb-12"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4, ease: EASE }}>

        <a href="#cta" className="relative group overflow-hidden rounded-full"
           style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.3)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-200 transition-all duration-500 group-hover:brightness-110" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
               style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: 'ctaShine 3s ease-in-out infinite' }} />
          <div className="relative flex items-center gap-2.5 px-8 py-3.5 font-semibold text-[13px] text-black tracking-[0.05em]">
            START A PROJECT
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
              <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </a>

        <a href="#work" className="group px-8 py-3.5 rounded-full font-medium text-[13px] text-white/45 hover:text-white/80 transition-all duration-300 flex items-center gap-2 border border-white/[0.06] hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] tracking-[0.05em]"
           style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
          VIEW OUR WORK
        </a>
      </motion.div>

      {/* Stats */}
      <motion.div className="grid grid-cols-3 gap-8 md:gap-14 w-full max-w-md"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.6 }}>
        {STATS.map((s, i) => (
          <div key={i} className="flex flex-col gap-2 relative">
            {i > 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-8 bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />
            )}
            <div className="font-display font-bold text-2xl md:text-3xl text-white/90 tracking-tighter tabular-nums">
              <CountUp end={s.end} duration={2000} />
              <span className="text-base md:text-lg ml-0.5 text-white/30">{s.suffix}</span>
            </div>
            <span className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.15em] text-white/25">
              {s.label}
            </span>
          </div>
        ))}
      </motion.div>

    </div>
  )
}
