'use client'
import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { team } from '@/data/team'
import { TeamMember } from '@/types'
import TeamCard from './TeamCard'
import TeamModal from './TeamModal'

export default function Team() {
  const [hoveredId,      setHoveredId]      = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  const handleHoverStart = useCallback((id: string)  => setHoveredId(id),   [])
  const handleHoverEnd   = useCallback(()            => setHoveredId(null), [])
  const handleCardClick  = useCallback((m: TeamMember) => setSelectedMember(m), [])
  const handleModalClose = useCallback(() => setSelectedMember(null), [])

  return (
    <section
      className="relative w-full py-20 md:py-36 select-none overflow-hidden z-10"
      style={{ background: '#050505' }}
    >
      {/* Ambient top light */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(255,250,240,0.025) 0%, transparent 60%)',
        }}
      />

      {/* ── Header ── */}
      <div className="relative z-10 px-6 md:px-12 lg:px-20 xl:px-28 mb-16 md:mb-20">
        <div
          className="h-px w-full mb-10"
          style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04) 60%, transparent)' }}
        />
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/42 block mb-5">
              The Team
            </span>
            <h2
              className="font-display font-bold text-white/90 tracking-[-0.04em] leading-[0.95]"
              style={{ fontSize: 'clamp(32px, 5.5vw, 72px)' }}
            >
              The people behind<br className="hidden md:block" /> the work
            </h2>
          </div>
          <p className="font-body text-[15px] text-white/28 max-w-xs leading-[1.8] md:text-right">
            We do not outsource. Your product is built directly by the people you see here.
          </p>
        </div>
      </div>

      {/* ── 5-card spotlight grid ── */}
      <div className="relative z-10 px-6 md:px-12 lg:px-20 xl:px-28">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5">
          {team.map((member, i) => (
            <TeamCard
              key={member.id}
              member={member}
              index={i}
              dimmed={hoveredId !== null && hoveredId !== member.id}
              onHoverStart={() => handleHoverStart(member.id)}
              onHoverEnd={handleHoverEnd}
              onClick={() => handleCardClick(member)}
            />
          ))}
        </div>

        {/* Hover hint — fades out once anyone has hovered */}
        <p
          className="font-mono text-[10px] text-white/18 tracking-[0.18em] uppercase text-center mt-8"
          style={{
            opacity: hoveredId !== null ? 0 : 1,
            transition: 'opacity 0.4s ease',
          }}
        >
          Hover to focus
        </p>
      </div>

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
