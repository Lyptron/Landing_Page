'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import { useCursor } from '../providers/CursorProvider'
import { usePathname } from 'next/navigation'
import { toLogicalPathname } from '@/lib/portalPath'
import Image from 'next/image'

/* ── Per-letter spin config — each letter has a unique character pool & timing ── */
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%&*+=?'
const KATAKANA = 'アイウエオカキクケコサシスセソ'
const BINARY = '01010110100101'
const BLOCKS = '░▒▓█▄▀■□'

interface LetterStyle {
  target: string
  pool: string
  inSpeed: number     // ms per tick while scrambling in
  inTicks: number     // how many ticks before landing
  outSpeed: number    // ms per tick while spinning back
  outTicks: number    // how many ticks before disappearing
}

const STYLES: LetterStyle[] = [
  { target: 'L', pool: ALPHA,             inSpeed: 55, inTicks: 10, outSpeed: 40, outTicks: 8  },
  { target: 'Y', pool: KATAKANA,          inSpeed: 70, inTicks: 14, outSpeed: 55, outTicks: 10 },
  { target: 'P', pool: DIGITS + ALPHA,    inSpeed: 45, inTicks: 12, outSpeed: 35, outTicks: 7  },
  { target: 'T', pool: BLOCKS,            inSpeed: 80, inTicks: 8,  outSpeed: 60, outTicks: 6  },
  { target: 'R', pool: SYMBOLS + ALPHA,   inSpeed: 50, inTicks: 16, outSpeed: 45, outTicks: 9  },
  { target: 'O', pool: BINARY + DIGITS,   inSpeed: 35, inTicks: 18, outSpeed: 30, outTicks: 12 },
  { target: 'N', pool: ALPHA + KATAKANA,  inSpeed: 65, inTicks: 11, outSpeed: 50, outTicks: 8  },
]

function SlotLetter({ s, idx, trigger, className }: { s: LetterStyle; idx: number; trigger: number; className?: string }) {
  const [char, setChar] = useState(' ')
  const [phase, setPhase] = useState<'idle' | 'in' | 'settled' | 'out'>('idle')

  const pick = useCallback(() => s.pool[Math.floor(Math.random() * s.pool.length)], [s.pool])

  useEffect(() => {
    let activeInterval: NodeJS.Timeout | null = null
    let activeInInterval: NodeJS.Timeout | null = null

    const timer = setTimeout(() => {
      setPhase('out')
      let t = 0
      activeInterval = setInterval(() => {
        t++
        if (t >= s.outTicks) {
          clearInterval(activeInterval!)
          setChar(' ')
          setPhase('idle')

          // Start scramble-in
          setPhase('in')
          let t2 = 0
          activeInInterval = setInterval(() => {
            t2++
            if (t2 >= s.inTicks) {
              clearInterval(activeInInterval!)
              setChar(s.target)
              setPhase('settled')
            } else {
              setChar(pick())
            }
          }, s.inSpeed)

        } else {
          setChar(pick())
        }
      }, s.outSpeed)
    }, idx * 60)

    return () => {
      clearTimeout(timer)
      if (activeInterval) clearInterval(activeInterval)
      if (activeInInterval) clearInterval(activeInInterval)
    }
  }, [trigger, idx, pick, s.outTicks, s.outSpeed, s.inTicks, s.inSpeed, s.target])

  return (
    <span
      className={`inline-block w-[0.68em] text-center font-display font-black transition-all duration-150 ${className || ''}`}
      style={{
        color:
          phase === 'settled' ? 'rgba(240,240,245,0.95)' :
          phase === 'out'     ? 'rgba(240,240,245,0.2)' :
          phase === 'in'      ? 'rgba(240,240,245,0.45)' :
          'rgba(240,240,245,0)',
        transform:
          phase === 'in'  ? 'translateY(0.5px)' :
          phase === 'out' ? 'translateY(-1px)' : 'none',
      }}
    >
      {char === ' ' ? ' ' : char}
    </span>
  )
}

function LyptronLogo({ trigger }: { trigger: number }) {
  return (
    <span className="flex items-center text-[18px] sm:text-[26px] tracking-[0.2em] sm:tracking-[0.35em] select-none overflow-hidden">
      {STYLES.map((s, i) => (
        <SlotLetter key={i} s={s} idx={i} trigger={trigger} className={i === 5 ? 'mr-0.75' : ''} />
      ))}
      <span className="text-blue font-display font-black ml-0.75">.</span>
    </span>
  )
}

export default function Nav() {
  const pathname = usePathname()
  const logicalPathname = toLogicalPathname(pathname)
  const isPortalRoute = logicalPathname.startsWith('/admin') || logicalPathname.startsWith('/client')
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logoScrambleTrigger, setLogoScrambleTrigger] = useState(0)
  const { setCursorState } = useCursor()

  useEffect(() => {
    if (isPortalRoute) return
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isPortalRoute])

  if (isPortalRoute) {
    return null
  }

  const navItems = [
    { name: 'Who We Are', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Work', href: '#work' },
    { name: 'Team', href: '#team' },
    { name: 'Process', href: '#process' },
  ]

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, id: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const target = document.querySelector(id)
    if (target) {
      if ((window as unknown as { lenis?: { scrollTo: (t: Element, o: object) => void } }).lenis) {
        (window as unknown as { lenis: { scrollTo: (t: Element, o: object) => void } }).lenis.scrollTo(target, { offset: -80, duration: 1.5 })
      } else {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-100 transition-all duration-500 ${
          scrolled
            ? 'h-16 bg-[rgba(5,5,5,0.85)] border-b border-white/5 backdrop-blur-sm'
            : 'h-18 bg-transparent border-b border-transparent'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="w-full h-full px-6 lg:px-10 flex items-center justify-between">

          {/* Logo — GIF + animated text */}
          <button
            onClick={(e) => handleScrollTo(e, '#hero')}
            className="flex items-center gap-4 bg-transparent border-none p-0 cursor-none"
            onMouseEnter={() => {
              setCursorState('hover')
              setLogoScrambleTrigger(prev => prev + 1)
            }}
            onMouseLeave={() => setCursorState('default')}
          >
            <Image
              src="/images/logo.gif"
              alt="Lyptron"
              width={38}
              height={38}
              unoptimized
              className="rounded-lg"
            />
            <LyptronLogo trigger={logoScrambleTrigger} />
          </button>

          {/* Desktop nav — centered */}
          <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleScrollTo(e, item.href)}
                className="relative px-4 py-2 font-body text-[13px] text-white/40 hover:text-white/80 uppercase tracking-wider transition-colors duration-300 select-none cursor-none rounded-lg hover:bg-white/4"
                onMouseEnter={() => setCursorState('hover')}
                onMouseLeave={() => setCursorState('default')}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={(e) => handleScrollTo(e, '#cta')}
              className="group relative overflow-hidden inline-flex items-center justify-center font-body font-medium text-[13px] text-bg bg-white hover:bg-white/90 rounded-full py-2.5 px-6 transition-all duration-300 cursor-none"
              onMouseEnter={() => setCursorState('hover')}
              onMouseLeave={() => setCursorState('default')}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Get in touch
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/60 hover:text-white cursor-none transition-colors"
            aria-label="Toggle menu"
            onMouseEnter={() => setCursorState('hover')}
            onMouseLeave={() => setCursorState('default')}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="fixed inset-0 z-101 bg-bg flex flex-col justify-center px-8 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="absolute top-0 left-0 right-0 h-18 flex items-center justify-end px-6">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-white/60 hover:text-white"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {navItems.map((item, idx) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleScrollTo(e, item.href)}
                  className="font-display font-bold text-[clamp(28px,7vw,42px)] text-white/80 hover:text-white tracking-tight py-2 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  {item.name}
                </motion.a>
              ))}
            </div>

            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={(e) => handleScrollTo(e, '#cta')}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white text-bg font-display font-bold text-lg"
              >
                Start a Project
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
