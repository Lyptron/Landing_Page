'use client'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatePresence } from 'framer-motion'
import { team } from '@/data/team'
import { TeamMember } from '@/types'
import TeamCard from './TeamCard'
import TeamModal from './TeamModal'
import { useCursor } from '../providers/CursorProvider'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Team() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const animRef = useRef<gsap.core.Tween | null>(null)
  const clickCooldown = useRef(false)
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { setCursorState } = useCursor()

  // Marquee tripling — frozen reference so React doesn't recreate the
  // array (and thus the DOM nodes) every render.
  const tripled = useMemo(() => [...team, ...team, ...team], [])

  const handleCardClick = useCallback((member: TeamMember) => {
    if (clickCooldown.current) return
    setSelectedMember(member)
  }, [])

  const handleModalClose = useCallback(() => {
    setSelectedMember(null)
    clickCooldown.current = true
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
    cooldownTimer.current = setTimeout(() => {
      clickCooldown.current = false
    }, 1000)
  }, [])

  const handleCarouselLeave = useCallback(() => {
    setIsPaused(false)
    setCursorState('default')
    clickCooldown.current = false
    if (cooldownTimer.current) {
      clearTimeout(cooldownTimer.current)
      cooldownTimer.current = null
    }
  }, [setCursorState])

  const setupMarquee = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return
    const track = trackRef.current
    if (!track) return

    const cards = track.querySelectorAll('.team-card')
    if (cards.length === 0) return

    const cardEl = cards[0] as HTMLElement
    const gap = 24
    const singleSetWidth = cardEl.offsetWidth * team.length + gap * (team.length - 1)

    gsap.set(track, { x: -(singleSetWidth + gap) })

    const tween = gsap.to(track, {
      x: `-=${singleSetWidth + gap}`,
      duration: 45,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x: number) => {
          const total = singleSetWidth + gap
          return ((parseFloat(String(x)) % total) + total) % total * -1
        }),
      },
    })

    animRef.current = tween
    return tween
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // gsap.context() scopes selectors to this section so multiple Team
    // mounts can't cross-fire animations, and revert() cleans up every
    // tween + ScrollTrigger created inside it.
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.fromTo('.team-header-line',
            { scaleX: 0 },
            { scaleX: 1, duration: 1, ease: 'power3.inOut' }
          )
          gsap.fromTo('.team-header-content > span, .team-header-content > p',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', delay: 0.2 }
          )
          gsap.fromTo('.team-split-left',
            { opacity: 0, x: -40, filter: 'blur(12px)' },
            { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out', delay: 0.3 }
          )
          gsap.fromTo('.team-split-right',
            { opacity: 0, x: 40, filter: 'blur(12px)' },
            { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out', delay: 0.45 }
          )
          gsap.fromTo('.team-card',
            { opacity: 0, y: 40, scale: 0.95 },
            {
              opacity: 1, y: 0, scale: 1,
              duration: 0.8, stagger: 0.06, ease: 'power3.out', delay: 0.4,
              onComplete: () => setupMarquee(),
            }
          )
        }
      })
    }, el)

    return () => {
      ctx.revert()
      if (animRef.current) animRef.current.kill()
      // The cooldown timer fires after modal close; clear it on unmount
      // so React doesn't get a setState call on an unmounted tree.
      if (cooldownTimer.current) {
        clearTimeout(cooldownTimer.current)
        cooldownTimer.current = null
      }
    }
  }, [setupMarquee])

  useEffect(() => {
    if (!animRef.current) return
    if (isPaused || selectedMember) {
      gsap.to(animRef.current, { timeScale: 0, duration: 0.5, ease: 'power2.out' })
    } else {
      gsap.to(animRef.current, { timeScale: 1, duration: 0.5, ease: 'power2.out' })
    }
  }, [isPaused, selectedMember])

  return (
    <section
      ref={containerRef}
      id="team"
      className="relative w-full py-16 md:py-40 select-none overflow-hidden z-10"
      style={{ background: '#050505' }}
    >
      {/* Subtle warm spotlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[10%]"
          style={{
            width: '60%',
            maxWidth: '800px',
            height: '350px',
            background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(255,250,235,0.025) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Noise grain */}
      <div className="absolute inset-0 opacity-[0.018] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      {/* Header */}
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-[120px] mb-16 md:mb-20">
        <div className="team-header-line h-px w-full mb-10 origin-left" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.06) 50%, transparent)' }} />

        <div className="team-header-content flex flex-col gap-6">
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/50">The Team</span>

          <h2 className="font-display font-bold text-[clamp(28px,5vw,68px)] tracking-[-0.04em] leading-[0.97]">
            <span className="team-split-left inline-block text-white/90">The people </span>
            <span className="team-split-right inline-block text-white/90">behind the work</span>
          </h2>

          <p className="font-body text-[15px] md:text-[17px] text-white/30 max-w-[520px] leading-[1.7]">
            We do not outsource. Your product is engineered directly by specialists with deep expertise in full-stack architecture, systems design, and growth strategy.
          </p>
        </div>
      </div>

      {/* Infinite carousel */}
      <div
        className="relative w-full"
        onMouseEnter={() => {
          setIsPaused(true)
          setCursorState('hover')
        }}
        onMouseLeave={handleCarouselLeave}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none" aria-hidden="true" />
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none" aria-hidden="true" />

        <div ref={trackRef} className="flex flex-col md:flex-row gap-6 w-full md:w-max py-4 items-center md:items-stretch">
          {tripled.map((member, i) => {
            // Only the first set is the real, focusable list. The other two
            // exist purely so the marquee can wrap visually; hide them from
            // assistive tech so screen readers don't read each member 3x.
            const isClone = i >= team.length
            return (
              <div
                key={`${member.id}-${i}`}
                className={`${isClone ? 'hidden md:block' : ''} w-full md:w-auto flex justify-center`}
                aria-hidden={isClone || undefined}
                inert={isClone}
              >
                <TeamCard
                  member={member}
                  index={team.findIndex(m => m.id === member.id)}
                  onClick={() => handleCardClick(member)}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Spacer */}
      <div className="mt-12 md:mt-16" />

      {/* Modal */}
      <AnimatePresence>
        {selectedMember && (
          <TeamModal
            member={selectedMember}
            index={team.findIndex(m => m.id === selectedMember.id)}
            onClose={handleModalClose}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
