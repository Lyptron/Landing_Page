'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { X, CheckCircle2 } from 'lucide-react'
import { TeamMember } from '@/types'
import GlassCard from '../ui/GlassCard'
import GlassPill from '../ui/GlassPill'
import { useCursor } from '../providers/CursorProvider'

interface TeamDetailProps {
  member: TeamMember | null
  onClose: () => void
}

const memberBios: Record<string, string> = {
  sb: 'Srivathsa is the founder of Lyptron. He directs core technical strategy, designs cloud infrastructure, and oversees AI model deployments, ensuring every engineering deliverable is built for scalability and performance.',
  al: 'Arjun directs frontend engineering and mobile product architecture. He is a specialist in React Native and high-performance UI states, converting complex user requirements into clean, maintainable systems.',
  sk: 'Suryakanth steers growth planning and marketing operations. He combines web data analytics, conversion optimization, and technical SEO strategies to scale organic traffic and client reach.',
  lk: 'Lalith designs responsive frontend components and builds interactive animations. He is dedicated to creating tactile, performant user interfaces that elevate digital storytelling.',
}

const memberExpertise: Record<string, string[]> = {
  sb: ['Distributed Systems', 'LLM Fine-Tuning', 'Infrastructure as Code', 'Secure Database Clustering'],
  al: ['Cross-Platform Mobile', 'Complex State Machines', 'UI Optimization', 'Custom Native Modules'],
  sk: ['Search Engine Strategy', 'Conversion Optimization', 'Performance Analytics', 'B2B Client Strategy'],
  lk: ['Kinetic Animations', 'Semantic DOM Layouts', 'CSS Design Systems', 'Component Lifecycle Opt'],
}

export default function TeamDetail({ member, onClose }: TeamDetailProps) {
  const { setCursorState } = useCursor()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!member) return

    // Lock scroll on open
    document.body.style.overflow = 'hidden'
    const lenis = (window as any).lenis
    if (lenis) lenis.stop()

    // Escape listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      if (lenis) lenis.start()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [member, onClose])

  if (!member || !mounted) return null

  const bio = memberBios[member.id] || 'Core engineering unit specialist.'
  const expertise = memberExpertise[member.id] || member.skills

  return createPortal(
    <>
      {/* Background Backdrop */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[4px] pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Slide-in Details Sidebar */}
      <motion.div
        className="fixed top-0 right-0 h-full w-full sm:w-[460px] z-50 bg-transparent flex select-none pointer-events-auto"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <GlassCard 
          className="w-full h-full p-8 md:p-10 flex flex-col justify-between overflow-y-auto no-scrollbar rounded-none border-l border-white/[0.08]"
          variant="strong"
          strength={0}
          tilt={false}
        >
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <span className="font-mono text-[10px] text-blue">// UNIT PROFILE SPEC</span>
              <button
                onClick={onClose}
                className="p-2 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 text-white transition-colors cursor-none"
                onMouseEnter={() => setCursorState('hover')}
                onMouseLeave={() => setCursorState('default')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar / Avatar ring */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue via-[#8b5cf6] to-[#ec4899] p-[3px] mb-4 shadow-blue-glow overflow-hidden">
                <div className="w-full h-full rounded-full bg-[#111114] overflow-hidden flex items-center justify-center relative">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center font-display font-extrabold text-2xl text-white bg-[#111114]"
                    style={{ display: member.image ? 'none' : 'flex' }}
                  >
                    {member.initials}
                  </div>
                </div>
              </div>
              <h2 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight mb-1">
                {member.name}
              </h2>
              <span className="font-mono text-[10px] text-blue tracking-wider uppercase">
                {member.role}
              </span>
            </div>

            {/* Biography */}
            <div className="mb-6">
              <h4 className="font-mono text-[9px] text-[--text-muted] uppercase tracking-wider block mb-2.5">Mission Bio</h4>
              <p className="font-body text-xs text-[--text-secondary] leading-relaxed">
                {bio}
              </p>
            </div>

            {/* Area of Expertise */}
            <div className="mb-6">
              <h4 className="font-mono text-[9px] text-[--text-muted] uppercase tracking-wider block mb-3">Key Expertise</h4>
              <div className="flex flex-col gap-2.5">
                {expertise.map((exp, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green mt-0.5 shrink-0" />
                    <span className="font-body text-[11px] text-[--text-secondary] leading-normal">{exp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Skills & Tools */}
            <div className="mb-8">
              <h4 className="font-mono text-[9px] text-[--text-muted] uppercase tracking-wider block mb-3">Core Stack</h4>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill, idx) => (
                  <GlassPill key={idx} className="bg-blue/5 border-blue/20 text-blue font-semibold text-[8px]">
                    {skill}
                  </GlassPill>
                ))}
              </div>
            </div>
          </div>

          {/* Socials & Interaction */}
          <div className="border-t border-white/5 pt-6 flex justify-between items-center">
            <div className="flex gap-3">
              <a 
                href="#"
                className="p-2 rounded-full border border-white/5 hover:border-white/20 hover:bg-white/5 text-[--text-secondary] hover:text-white transition-colors cursor-none"
                onMouseEnter={() => setCursorState('hover')}
                onMouseLeave={() => setCursorState('default')}
                aria-label="GitHub profile"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a 
                href="#"
                className="p-2 rounded-full border border-white/5 hover:border-white/20 hover:bg-white/5 text-[--text-secondary] hover:text-white transition-colors cursor-none"
                onMouseEnter={() => setCursorState('hover')}
                onMouseLeave={() => setCursorState('default')}
                aria-label="LinkedIn profile"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" rx="1" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a 
                href="#"
                className="p-2 rounded-full border border-white/5 hover:border-white/20 hover:bg-white/5 text-[--text-secondary] hover:text-white transition-colors cursor-none"
                onMouseEnter={() => setCursorState('hover')}
                onMouseLeave={() => setCursorState('default')}
                aria-label="Twitter profile"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white hover:text-bg font-mono text-[10px] text-white uppercase tracking-wider transition-all duration-300 cursor-none"
              onMouseEnter={() => setCursorState('hover')}
              onMouseLeave={() => setCursorState('default')}
            >
              Close Profile
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </>,
    document.body
  )
}
