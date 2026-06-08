'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TeamMember } from '@/types'
import { useCursor } from '../providers/CursorProvider'
import { X } from 'lucide-react'
import Image from 'next/image'

interface TeamModalProps {
  member: TeamMember
  index: number
  onClose: () => void
}

export default function TeamModal({ member, index, onClose }: TeamModalProps) {
  const { setCursorState } = useCursor()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    const lenis = (window as any).lenis
    if (lenis) lenis.stop()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = ''
      if (lenis) lenis.start()
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-[12px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClose}
      />

      {/* Modal */}
      <div key="modal-content" className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none p-4 sm:p-8">
        <motion.div
          className="pointer-events-auto w-full max-w-[900px] overflow-hidden flex flex-col md:flex-row h-auto md:h-[560px] rounded-[16px] relative cursor-none"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 48px 96px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
          initial={{ y: 24, opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ y: 16, opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={() => setCursorState('default')}
        >
          {/* Left — Portrait */}
          <div className="w-full md:w-[40%] h-[260px] md:h-full relative shrink-0 bg-[#0a0a0c]">
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
                <span className="font-display font-bold text-[100px] text-white/[0.04] tracking-tight">{member.initials}</span>
              </div>
            )}
            {/* Grid texture */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />
            {/* Fade to right panel */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0c0c0e]/80 md:to-[#0c0c0e] pointer-events-none" />
          </div>

          {/* Right — Content */}
          <div className="w-full md:w-[60%] p-8 md:p-12 flex flex-col justify-center relative bg-[#0c0c0e]">

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group z-10 cursor-none"
              onMouseEnter={() => setCursorState('cta')}
              onMouseLeave={() => setCursorState('default')}
            >
              <X className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors" />
            </button>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
            >
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/35 mb-4 block">
                {member.role}
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white/90 tracking-[-0.03em] leading-none mb-8">
                {member.name}
              </h2>
            </motion.div>

            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
              className="mb-10"
            >
              <p className="font-body text-[14px] text-white/30 leading-relaxed">
                {member.bio}
              </p>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            >
              <div>
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/25 mb-4 block border-b border-white/[0.05] pb-2">
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
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/25 mb-4 block border-b border-white/[0.05] pb-2">
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
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}
