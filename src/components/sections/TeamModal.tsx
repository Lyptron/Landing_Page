'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { m, AnimatePresence } from 'framer-motion'
import { TeamMember } from '@/types'
import { useCursor } from '../providers/CursorProvider'
import { X } from 'lucide-react'
import Image from 'next/image'

interface TeamModalProps {
  member: TeamMember
  // Caller may pass an index for animation purposes; kept optional so
  // the prop contract doesn't break, but unused inside the modal.
  index?: number
  onClose: () => void
}

export default function TeamModal({ member, onClose }: TeamModalProps) {
  const { setCursorState } = useCursor()
  const [mounted, setMounted] = useState(false)
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Defer portal mount until after hydration so createPortal targets
    // the real DOM, not the SSR shadow tree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    previouslyFocused.current = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    requestAnimationFrame(() => dialogRef.current?.focus())

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
      previouslyFocused.current?.focus?.()
    }
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      {/* backdrop-blur was a viewport-wide backdrop-filter blur — the
          browser reblurred everything behind it every animation frame,
          costing ~40ms/frame on integrated GPUs. Solid dark scrim reads
          essentially the same and is compositor-only. */}
      <m.div
        key="backdrop"
        className="fixed inset-0 z-100 bg-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal wrapper needs overflow-y-auto so tall content on mobile
          (or a small viewport) can scroll — body scroll is locked, so
          without this the user gets frozen. */}
      <div key="modal-content" className="fixed inset-0 z-101 flex items-center justify-center pointer-events-none p-3 sm:p-6 md:p-8 overflow-y-auto overscroll-contain">
        <m.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          // Sizing: width caps at max-w-225 (900px) on wide screens; on
          // shorter viewports (laptops with 600–800px height, landscape
          // phones), the fixed md:h-140 (560px) would overflow, so cap
          // height at the viewport minus the wrapper's padding.
          className="pointer-events-auto w-full max-w-225 max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] md:max-h-[calc(100dvh-4rem)] overflow-hidden flex flex-col md:flex-row md:h-140 rounded-2xl relative cursor-none focus:outline-none my-auto"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 48px 96px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
          initial={{ y: 24, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 16, opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={() => setCursorState('default')}
        >
          {/* Left — Portrait */}
          <div className="w-full md:w-[40%] h-65 md:h-full relative shrink-0 bg-[#0a0a0c]">
            {member.image ? (
              <Image 
                src={member.image} 
                alt={member.name} 
                fill 
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover opacity-80" 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-bold text-[100px] text-white/4 tracking-tight">{member.initials}</span>
              </div>
            )}
            {/* Grid texture */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
            {/* Fade to right panel */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-[#0c0c0e]/80 md:to-[#0c0c0e] pointer-events-none" />
          </div>

          {/* Right — Content (scrollable if it overflows on desktop) */}
          <div className="w-full md:w-[60%] p-8 md:p-12 flex flex-col justify-center relative bg-[#0c0c0e] md:overflow-y-auto">

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${member.name} profile`}
              className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center bg-white/2 hover:bg-white/5 border border-white/6 hover:border-white/12 transition-all duration-300 group z-10 cursor-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
              onMouseEnter={() => setCursorState('cta')}
              onMouseLeave={() => setCursorState('default')}
            >
              <X className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors" aria-hidden="true" />
            </button>

            {/* Name */}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
            >
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/35 mb-4 block">
                {member.role}
              </span>
              <h2 id={titleId} className="font-display font-bold text-3xl md:text-4xl text-white/90 tracking-[-0.03em] leading-none mb-8">
                {member.name}
              </h2>
            </m.div>

            {/* Bio */}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
              className="mb-10"
            >
              <p className="font-body text-[14px] text-white/30 leading-relaxed">
                {member.bio}
              </p>
            </m.div>

            {/* Skills */}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            >
              <div>
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/25 mb-4 block border-b border-white/5 pb-2">
                  Core Disciplines
                </span>
                <ul className="flex flex-col gap-3">
                  {member.skills.map((skill) => (
                    <li key={skill} className="font-body text-[13px] text-white/50 flex items-center gap-2">
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/25 mb-4 block border-b border-white/5 pb-2">
                  Specializations
                </span>
                <ul className="flex flex-col gap-3">
                  {member.expertise.map((exp) => (
                    <li key={exp} className="font-body text-[13px] text-white/50 flex items-center gap-2">
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      {exp}
                    </li>
                  ))}
                </ul>
              </div>
            </m.div>
          </div>
        </m.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}
