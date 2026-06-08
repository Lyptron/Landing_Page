'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock, FileText, Map } from 'lucide-react'
import { fetchProjectByAccessCode } from '@/lib/db'

export default function ClientTimelinePage() {
  const params = useParams()
  const code = params.code as string
  const [milestones, setMilestones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await fetchProjectByAccessCode(code)
      if (!error && data?.milestones?.length > 0) setMilestones(data.milestones)
      setLoading(false)
    }
    load()
  }, [code])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle2, color: 'text-emerald-400', lineColor: 'bg-emerald-500/30', dotBg: 'bg-emerald-500/10 border-emerald-500/30' }
      case 'in-progress':
        return { icon: Clock, color: 'text-blue-400', lineColor: 'bg-blue-500/30', dotBg: 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]' }
      default:
        return { icon: Circle, color: 'text-white/15', lineColor: 'bg-white/[0.04]', dotBg: 'bg-white/[0.03] border-white/[0.06]' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white/90 mb-1">Project Timeline</h1>
        <p className="text-white/25 text-[13px]">Track your project journey across all phases.</p>
      </div>

      {milestones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Map className="w-12 h-12 text-white/[0.05] mb-4" />
          <h3 className="text-base font-semibold text-white/30 mb-1">No milestones yet</h3>
          <p className="text-[13px] text-white/15">Your project timeline will appear here once milestones are added.</p>
        </div>
      ) : (
        <div className="relative pt-2">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-8 bottom-8 w-px bg-gradient-to-b from-emerald-500/20 via-blue-500/20 to-white/[0.03]" />

          <div className="flex flex-col gap-8">
            {milestones.map((milestone, idx) => {
              const config = getStatusConfig(milestone.status)
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  key={milestone.id}
                  className="relative flex gap-5"
                >
                  {/* Dot */}
                  <div className={`relative z-10 w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-[#0a0a0a] border ${config.dotBg} transition-colors`}>
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                  </div>

                  {/* Card */}
                  <div
                    className={`flex-1 p-5 rounded-2xl transition-all ${
                      milestone.status === 'in-progress' ? 'border border-blue-500/10' : ''
                    }`}
                    style={{
                      background: milestone.status === 'in-progress' ? 'rgba(59,130,246,0.025)' : 'rgba(255,255,255,0.02)',
                      border: milestone.status === 'in-progress' ? undefined : '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        {milestone.phase && (
                          <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20">{milestone.phase} Phase</span>
                        )}
                        <h3 className={`text-[16px] font-bold ${milestone.status === 'upcoming' ? 'text-white/40' : 'text-white/85'}`}>
                          {milestone.name || milestone.title}
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-white/25 shrink-0">
                        {milestone.date_range || milestone.date || ''}
                      </span>
                    </div>

                    {milestone.description && (
                      <p className="text-[13px] text-white/30 leading-relaxed mb-4">{milestone.description}</p>
                    )}

                    {milestone.deliverables && milestone.deliverables.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {milestone.deliverables.map((item: string, i: number) => (
                          <div
                            key={i}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border ${
                              milestone.status === 'completed'
                                ? 'bg-emerald-500/[0.05] text-emerald-400/70 border-emerald-500/10'
                                : 'bg-white/[0.02] text-white/35 border-white/[0.04]'
                            }`}
                          >
                            {milestone.status === 'completed' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <FileText className="w-2.5 h-2.5" />}
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
