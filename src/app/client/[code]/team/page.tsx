'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Phone, UsersRound } from 'lucide-react'
import { fetchProjectTeam, fetchProjectByAccessCode } from '@/lib/db'

const COLORS = ['from-blue-500 to-purple-600', 'from-pink-500 to-rose-600', 'from-emerald-500 to-teal-600', 'from-orange-500 to-red-600']

export default function TeamPage() {
  const params = useParams()
  const code = params.code as string
  const [team, setTeam] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: project } = await fetchProjectByAccessCode(code)
      if (project) {
        const { data } = await fetchProjectTeam(project.id)
        if (data && data.length > 0) setTeam(data.map((pt: any) => pt.team_members))
      }
      setLoading(false)
    }
    load()
  }, [code])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white/90 mb-1">Your Team</h1>
        <p className="text-white/25 text-[13px]">Meet the people building your project.</p>
      </div>

      {team.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UsersRound className="w-12 h-12 text-white/[0.05] mb-4" />
          <h3 className="text-base font-semibold text-white/30 mb-1">Team not assigned yet</h3>
          <p className="text-[13px] text-white/15">Your dedicated team members will appear here once assigned.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {team.map((member, idx) => {
            const color = COLORS[idx % COLORS.length]
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
                key={member.id}
                className="p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-[0.025] rounded-full blur-3xl`} />

                <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} p-[1px] shrink-0`}>
                    <div className="w-full h-full bg-[#0a0a0a] rounded-[10px] flex items-center justify-center text-[15px] font-display font-bold text-white/70">
                      {member.initials || member.name?.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white/80">{member.name}</h3>
                    <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20">{member.role}</p>
                  </div>
                </div>

                {(member.bio || member.description) && (
                  <p className="text-[12px] text-white/30 leading-relaxed relative z-10">{member.bio || member.description}</p>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04] relative z-10">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-medium text-white/30 hover:text-white/60 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <Mail className="w-3.5 h-3.5" /> Email
                    </a>
                  )}
                  {member.role === 'Project Manager' && (
                    <button
                      className="flex-1 py-2 bg-white text-[#050505] rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all hover:bg-white/90"
                      style={{ boxShadow: '0 0 12px rgba(255,255,255,0.05)' }}
                    >
                      <Phone className="w-3.5 h-3.5" /> Book Call
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
