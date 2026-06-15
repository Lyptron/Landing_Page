'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Phone, UsersRound } from 'lucide-react'
import { fetchProjectTeam, fetchProjectByAccessCode } from '@/lib/db'
import { PageHeader, EmptyState, Loading } from '@/components/portal/PortalUI'

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

  if (loading) return <Loading />

  return (
    <div className="flex flex-col gap-10 max-w-4xl">
      <PageHeader title="Your Team" description="Meet the people working on your project." />

      {team.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="Team not assigned yet"
          description="Your dedicated team members will appear here once they're assigned to your project."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: 'var(--cp-border-soft)' }}>
          {team.map((member, idx) => {
            const tone = idx % 2 === 0 ? 'cyan' : 'emerald'
            const color = tone === 'cyan' ? 'var(--cp-cyan)' : 'var(--cp-emerald)'
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
                key={member.id}
                className="flex flex-col gap-5 p-6 h-full"
                style={{ background: 'var(--cp-bg)' }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 flex items-center justify-center text-[15px] font-display font-bold shrink-0"
                    style={{ border: `1px solid ${color}`, color }}
                  >
                    {member.initials || member.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold" style={{ color: 'var(--cp-text)' }}>{member.name}</h3>
                    <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--cp-text-muted)' }}>{member.role}</p>
                  </div>
                </div>

                {(member.bio || member.description) && (
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--cp-text-secondary)' }}>{member.bio || member.description}</p>
                )}

                <div className="flex items-center gap-2 pt-4 mt-auto border-t" style={{ borderColor: 'var(--cp-border-soft)' }}>
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="cp-btn-secondary flex-1 py-2 flex items-center justify-center gap-1.5 text-[12px]"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email
                    </a>
                  )}
                  {member.role === 'Project Manager' && (
                    <button className="cp-btn-primary flex-1 py-2 flex items-center justify-center gap-1.5 text-[12px]">
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
